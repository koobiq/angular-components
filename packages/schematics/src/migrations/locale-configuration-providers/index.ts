import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import {
    BEHAVIOUR_NOTE,
    COMPONENT_MENTIONS,
    leftoverTokenMessage,
    memberWarnPatterns,
    MIGRATED_PROVIDER_TOKENS,
    MigratedProviderToken,
    nonArrayProviderMessage,
    PROVIDE_PROPERTY,
    UNSUPPORTED_PROPERTIES,
    unsupportedShapeMessage,
    VALUE_PROPERTY,
    WarnPattern
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[locale-configuration-providers]';

/** A replacement of the `[start, end)` range of the file content. */
interface Rewrite {
    start: number;
    end: number;
    text: string;
    entry: MigratedProviderToken;
}

/** A provider the schematic refused to rewrite, reported once per occurrence. */
interface ProviderWarning {
    token: string;
    message: string;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const createSourceFile = (fileName: string, content: string): ts.SourceFile =>
    ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/** The name of a `{ key: value }` property, covering both `provide:` and `'provide':`. */
function assignedPropertyName(property: ts.ObjectLiteralElementLike): string | null {
    if (!ts.isPropertyAssignment(property)) return null;
    if (!ts.isIdentifier(property.name) && !ts.isStringLiteralLike(property.name)) return null;

    return property.name.text;
}

function findProperty(literal: ts.ObjectLiteralExpression, name: string): ts.PropertyAssignment | undefined {
    return literal.properties.find((property) => assignedPropertyName(property) === name) as
        ts.PropertyAssignment | undefined;
}

/** The migrated token a `{ provide: … }` object literal names, if it names one at all. */
function providedToken(node: ts.Node): MigratedProviderToken | null {
    if (!ts.isObjectLiteralExpression(node)) return null;

    const initializer = findProperty(node, PROVIDE_PROPERTY)?.initializer;

    if (!initializer || !ts.isIdentifier(initializer)) return null;

    return MIGRATED_PROVIDER_TOKENS.find(({ token }) => token === initializer.text) ?? null;
}

/**
 * Collects the `{ provide: KBQ_<X>_CONFIGURATION, useValue: … }` entries to rewrite, and the
 * provider objects that need a human instead.
 */
function scanProviders(sourceFile: ts.SourceFile): { rewrites: Rewrite[]; warnings: ProviderWarning[] } {
    const rewrites: Rewrite[] = [];
    const warnings: ProviderWarning[] = [];

    const visit = (node: ts.Node) => {
        const entry = providedToken(node);

        if (entry) {
            const literal = node as ts.ObjectLiteralExpression;
            const unsupported = UNSUPPORTED_PROPERTIES.find((name) => findProperty(literal, name));
            const value = findProperty(literal, VALUE_PROPERTY);

            if (unsupported) {
                warnings.push({ token: entry.token, message: unsupportedShapeMessage(entry, unsupported) });
            } else if (!ts.isArrayLiteralExpression(literal.parent)) {
                // Being an array element is what makes the entry safe to replace. A provider object bound
                // to a name (`export const P = { provide: KBQ_…, useValue: … };`) is not an element of
                // anything, and the helper returns a `Provider` rather than an object literal — swapping it
                // in would silently change what that name means to everything that reads it.
                warnings.push({ token: entry.token, message: nonArrayProviderMessage(entry) });
            } else if (value && literal.properties.every((property) => isKnownProperty(property))) {
                rewrites.push({
                    start: literal.getStart(sourceFile),
                    end: literal.getEnd(),
                    text: `${entry.helper}(${sourceFile.text.slice(
                        value.initializer.getStart(sourceFile),
                        value.initializer.getEnd()
                    )})`,
                    entry
                });
            }
            // Anything left — no `useValue` at all, a spread, or an extra property such as `multi` that
            // the single-argument helper has nowhere to put — keeps the token, so the leftover-reference
            // warning reports it.
        }

        ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);

    return { rewrites, warnings };
}

function isKnownProperty(property: ts.ObjectLiteralElementLike): boolean {
    const name = assignedPropertyName(property);

    return name === PROVIDE_PROPERTY || name === VALUE_PROPERTY;
}

/** Splices the replacements in right-to-left, so earlier offsets stay valid. */
function applyRewrites(content: string, rewrites: Rewrite[]): string {
    let result = content;

    for (const { start, end, text } of [...rewrites].sort((a, b) => b.start - a.start)) {
        result = result.slice(0, start) + text + result.slice(end);
    }

    return result;
}

/**
 * Whether `name` is still used outside an import statement. The import clause itself does not count —
 * it is exactly what gets dropped once nothing else refers to the token.
 */
function hasNonImportReference(sourceFile: ts.SourceFile, name: string): boolean {
    let found = false;

    const visit = (node: ts.Node) => {
        if (found || ts.isImportDeclaration(node)) return;

        if (ts.isIdentifier(node) && node.text === name) {
            found = true;

            return;
        }

        ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);

    return found;
}

/**
 * Idempotently strips `symbol` from any `import { … } from 'from'` clause.
 * - Multi-symbol clause: drop just that symbol, keep the others.
 * - Single-symbol clause: drop the whole import line.
 */
function removeImport(content: string, symbol: string, from: string): string {
    // The trailing part deliberately stops after a single newline (`[ \t]*\r?\n?` rather than `\s*\n?`):
    // dropping the whole import line must not also swallow the blank line that separates the import
    // block from the code below it.
    const moduleRe = new RegExp(
        `(import\\s*(?:type\\s*)?\\{)([^}]*)(\\}\\s*from\\s*['"]${escapeRegExp(from)}['"];?[ \\t]*\\r?\\n?)`,
        'g'
    );

    return content.replace(moduleRe, (full, open: string, body: string, close: string) => {
        const items = body
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        // An already-empty clause is somebody else's import — leave it alone.
        if (items.length === 0) return full;

        // Handle `<name> as <alias>` — match on the source name, not the alias.
        const kept = items.filter((spec) => spec.split(/\s+as\s+/)[0].trim() !== symbol);

        if (kept.length === items.length) return full;
        if (kept.length === 0) return '';

        return `${open} ${kept.join(', ')} ${close}`;
    });
}

/**
 * Idempotently adds `import { symbol } from 'from'`: into an existing clause of the same module when
 * there is one, otherwise as a new line after the leading comments.
 */
function ensureImport(content: string, symbol: string, from: string): string {
    // Already imported from anywhere — a re-export or an alias — so leave it alone.
    const alreadyImported = new RegExp(
        `import\\s*(?:type\\s*)?\\{[^}]*\\b${escapeRegExp(symbol)}\\b[^}]*\\}\\s*from\\s*['"][^'"]+['"]`
    );

    if (alreadyImported.test(content)) return content;

    const sameModule = new RegExp(`(import\\s*(?:type\\s*)?\\{)([^}]*)(\\}\\s*from\\s*['"]${escapeRegExp(from)}['"])`);

    if (sameModule.test(content)) {
        return content.replace(sameModule, (_full, open: string, body: string, close: string) => {
            const trimmed = body.trim().replace(/,$/, '');
            const next = trimmed.length === 0 ? ` ${symbol} ` : `${body.replace(/\s*$/, '')}, ${symbol} `;

            return `${open}${next}${close}`;
        });
    }

    const lines = content.split('\n');
    let insertAt = 0;
    let inBlockComment = false;

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (inBlockComment) {
            if (trimmed.endsWith('*/')) inBlockComment = false;

            insertAt = i + 1;
            continue;
        }

        if (trimmed.startsWith('/*')) {
            inBlockComment = !trimmed.includes('*/');
            insertAt = i + 1;
            continue;
        }

        if (trimmed.startsWith('//') || trimmed.length === 0) {
            insertAt = i + 1;
            continue;
        }

        break;
    }

    lines.splice(insertAt, 0, `import { ${symbol} } from '${from}';`);

    return lines.join('\n');
}

/** The migrated tokens the rewrite pass touched, in declaration order. */
function rewrittenTokens(rewrites: Rewrite[]): MigratedProviderToken[] {
    return MIGRATED_PROVIDER_TOKENS.filter((entry) => rewrites.some(({ entry: touched }) => touched === entry));
}

function logWarnings(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]) {
    const mentionsComponent = COMPONENT_MENTIONS.some((mention) => content.includes(mention));

    for (const { pattern, message, needsComponentMention } of patterns) {
        if (needsComponentMention && !mentionsComponent) continue;

        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

/**
 * Reports the tokens still referenced after the rewrite pass — an `inject()` call, a provider shape the
 * helper could not take over, a re-export. `alreadyWarned` holds the tokens a more specific message
 * already covered, so a single provider is never reported twice.
 */
function logLeftoverTokens(
    context: SchematicContext,
    filePath: string,
    content: string,
    alreadyWarned: Set<string>
): void {
    const candidates = MIGRATED_PROVIDER_TOKENS.filter(
        ({ token }) => !alreadyWarned.has(token) && content.includes(token)
    );

    if (candidates.length === 0) return;

    const sourceFile = createSourceFile(filePath, content);

    for (const entry of candidates) {
        if (!hasNonImportReference(sourceFile, entry.token)) continue;

        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${leftoverTokenMessage(entry)}`]);
    }
}

export default function localeConfigurationProviders(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema,
        // so the schema default never reaches us — applying the fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        const filePaths: Path[] = [];

        rootDir.visit((filePath: Path) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!filePath.endsWith(TS_EXT) && !filePath.endsWith(HTML_EXT)) return;

            filePaths.push(filePath);
        });

        let touched = 0;

        for (const filePath of filePaths) {
            const originalContent = tree.read(filePath)?.toString();

            if (!originalContent) continue;

            let content = originalContent;
            const providerWarnings: ProviderWarning[] = [];
            const isTs = filePath.endsWith(TS_EXT);

            // Parsing every `.ts` of the project is not free, and nothing can change in a file that
            // mentions none of the tokens.
            if (isTs && MIGRATED_PROVIDER_TOKENS.some(({ token }) => content.includes(token))) {
                const { rewrites, warnings } = scanProviders(createSourceFile(filePath, content));

                providerWarnings.push(...warnings);
                content = applyRewrites(content, rewrites);

                if (content !== originalContent) {
                    // Those edits moved every offset that followed them, and the leftover check has to see
                    // the rewritten file rather than the positions it started with.
                    const rewritten = createSourceFile(filePath, content);

                    for (const entry of rewrittenTokens(rewrites)) {
                        // The helper joins an existing clause of the module before the token leaves it, so
                        // the import keeps its place in the file even when the token was its only symbol.
                        content = ensureImport(content, entry.helper, entry.from);

                        if (!hasNonImportReference(rewritten, entry.token)) {
                            content = removeImport(content, entry.token, entry.from);
                        }
                    }
                }
            }

            // Warn on what is left over, so an auto-fixed usage does not also produce a "manual migration
            // required" note. In dry-run mode the fix is not written, so report against the original.
            const reported = fix ? content : originalContent;

            logWarnings(context, filePath, reported, memberWarnPatterns);

            if (isTs) {
                for (const { message } of providerWarnings) {
                    logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
                }

                logLeftoverTokens(context, filePath, reported, new Set(providerWarnings.map(({ token }) => token)));
            }

            if (content === originalContent) continue;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        }

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            '',
            ...BEHAVIOUR_NOTE
        ]);
    };
}

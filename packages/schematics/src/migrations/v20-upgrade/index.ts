import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { listItemPattern } from '../../utils/list-item-pattern';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { Replacement, WarnPattern, scssReplacements, templateReplacements, tsReplacements, warnPatterns } from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const SCSS_EXT = '.scss';
const CSS_EXT = '.css';

/**
 * Applies an ordered list of regex replacements to a string, returns the new
 * string, whether anything changed, and any imports the replacements introduced
 * that the file must contain (e.g. `booleanAttribute` from `@angular/core` after
 * a `toBoolean(` → `booleanAttribute(` rewrite).
 */
function applyReplacements(
    content: string,
    replacements: Replacement[]
): {
    content: string;
    changed: boolean;
    importsToEnsure: { symbol: string; from: string }[];
    importsToRemove: { symbol: string; from: string }[];
} {
    let result = content;
    const importsToEnsure: { symbol: string; from: string }[] = [];
    const importsToRemove: { symbol: string; from: string }[] = [];

    for (const { from, to, ensureImport, removeImport } of replacements) {
        const before = result;

        result = result.replace(new RegExp(from, 'g'), to);

        if (ensureImport && before !== result) {
            importsToEnsure.push(ensureImport);
        }

        if (removeImport && before !== result) {
            importsToRemove.push(removeImport);
        }
    }

    return { content: result, changed: result !== content, importsToEnsure, importsToRemove };
}

/** A named import declaration: the `type` of a type-only one, its specifiers, its module. */
const NAMED_IMPORT = /\bimport\s*(type\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;

/** An import specifier: an inline `type`, the imported name, its alias. */
const IMPORT_SPECIFIER = /^\s*(type\s+)?([\w$]+)(?:\s+as\s+([\w$]+))?\s*$/;

const COMMENT = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

/** The import specifiers that bind the name `local`: whether each is type-only, the name it imports, its module. */
function importBindings(content: string, local: string): { typeOnly: boolean; name: string; from: string }[] {
    return [...content.matchAll(NAMED_IMPORT)].flatMap(([, typeClause, specifiers, from]) =>
        specifiers
            .replace(COMMENT, '')
            .split(',')
            .flatMap((specifier) => {
                const [, typeSpecifier, name, alias] = IMPORT_SPECIFIER.exec(specifier) ?? [];

                return name && (alias ?? name) === local
                    ? [{ typeOnly: !!(typeClause || typeSpecifier), name, from }]
                    : [];
            })
    );
}

/** Removes the type-only specifier of `symbol` from the named imports of `from`, and an import it empties. */
function removeTypeOnlyImport(content: string, symbol: string, from: string): string {
    const declaration = new RegExp(
        `(\\bimport\\s*(?:type\\s*)?)(\\{[^}]*\\})(\\s*from\\s*['"]${escapeRegExp(from)}['"];?[ \\t]*\\r?\\n?)`,
        'g'
    );
    const specifier = new RegExp(listItemPattern(`\\b${symbol}\\b(?!\\s+as\\b)`));

    return content.replace(declaration, (statement, open: string, clause: string, close: string) => {
        const rest = clause.replace(specifier, '');

        if (rest === clause) return statement;

        return /^\{\s*\}$/.test(rest) ? '' : `${open}${rest}${close}`;
    });
}

/**
 * Idempotently makes `symbol` of `from` a value import of a TypeScript source string, as the rewrites use it as a
 * value. A value import of the name from any module, or an import of another symbol under the name, is left alone.
 * A type-only import of it gives way to a value one: the symbol is added to the value import clause of `from`, or
 * in a new import line at the top of the file (after any leading block / leading comments).
 */
function ensureImport(content: string, symbol: string, from: string): string {
    const bindings = importBindings(content, symbol);

    // A second binding of the name would clash with it.
    if (bindings.some((binding) => !binding.typeOnly || binding.name !== symbol || binding.from !== from)) {
        return content;
    }

    // Under a type-only import, a value use of the symbol does not compile (TS1361).
    if (bindings.length > 0) content = removeTypeOnlyImport(content, symbol, from);

    const eol = content.includes('\r\n') ? '\r\n' : '\n';

    // Existing value import line from the same module — extend its clause.
    const sameModule = new RegExp(`(\\bimport\\s*\\{)([^}]*)(\\}\\s*from\\s*['"]${escapeRegExp(from)}['"])`);

    if (sameModule.test(content)) {
        return content.replace(
            sameModule,
            (_match, open: string, body: string, close: string) =>
                `${open}${appendSpecifier(body, symbol, eol)}${close}`
        );
    }

    // Otherwise, prepend a new import. Insert after any leading comment block
    // / shebang. The simple heuristic finds the first non-comment, non-blank
    // line and inserts right before it.
    const newImport = `import { ${symbol} } from '${from}';`;
    const lines = content.split(eol);
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

    lines.splice(insertAt, 0, newImport);

    return lines.join(eol);
}

/**
 * Appends `symbol` to `body`, the specifiers of a named import clause. After a line comment that ends the clause, it
 * goes on a line of its own, ended by `eol`: on the line of the comment it would be commented out.
 */
function appendSpecifier(body: string, symbol: string, eol: string): string {
    const end = body.trimEnd();
    // Where the last specifier ends, with the comments blanked out.
    const split = end.replace(COMMENT, (comment: string) => ' '.repeat(comment.length)).trimEnd().length;
    const [code, comments] = [end.slice(0, split), end.slice(split)];
    const specifiers = `${code}${code && !code.endsWith(',') ? ',' : ''}${comments}`;

    if (![...comments.matchAll(COMMENT)].pop()?.[0].startsWith('//')) return `${specifiers} ${symbol} `;

    const [indent] = /^[ \t]*/.exec(end.slice(end.lastIndexOf('\n') + 1))!;

    return `${specifiers}${eol}${indent}${symbol}${body.slice(end.length)}`;
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Idempotently strip `symbol` from any `import { … } from 'from'` clause.
 * - Multi-symbol clause: drop just that symbol, keep the others.
 * - Single-symbol clause: drop the entire import line (including its trailing newline).
 * - `export { … } from 'from'`: drop it once the rewrites emptied it, otherwise leave it to them.
 * Returns content unchanged if no matching clause is found.
 *
 * Used to clean up dangling references after rewrites that delete or rename a
 * symbol (e.g. `toBoolean(` → `booleanAttribute(` must also remove the now-
 * non-existent `toBoolean` import from `@koobiq/components/core`).
 */
function removeImport(content: string, symbol: string, from: string): string {
    const moduleRe = new RegExp(
        `\\b(import|export)(\\s*(?:type\\s*)?\\{)([^}]*)(\\}\\s*from\\s*['"]${escapeRegExp(from)}['"];?\\s*\\n?)`,
        'g'
    );

    return content.replace(moduleRe, (full, keyword: string, open: string, body: string, close: string) => {
        const items = body
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        // Empty clause means an earlier regex rewrite already stripped the only
        // specifier (e.g. `KbqValidationOptions` → `''` left `import {  } from …`).
        // Since this caller asked us to remove `symbol` from this module, the line
        // is dead either way — drop it.
        if (items.length === 0) return '';

        if (keyword === 'export') return full;

        const kept = items.filter((spec) => {
            // Handle `<name> as <alias>` — match on the source name, not the alias.
            const source = spec.split(/\s+as\s+/)[0].trim();

            return source !== symbol;
        });

        if (kept.length === items.length) return full; // no change
        if (kept.length === 0) return ''; // drop whole line

        return `${keyword}${open} ${kept.join(', ')} ${close}`;
    });
}

function logWarnings(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]) {
    for (const { pattern, message } of patterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`[v20-upgrade] ${filePath}`, `  ${message}`]);
        }
    }
}

function pickReplacements(filePath: string): Replacement[] | null {
    if (filePath.endsWith(TS_EXT)) {
        // .ts files: apply both ts-source and template replacements (covers inline templates)
        return [...tsReplacements, ...templateReplacements];
    }

    if (filePath.endsWith(HTML_EXT)) {
        return templateReplacements;
    }

    if (filePath.endsWith(SCSS_EXT) || filePath.endsWith(CSS_EXT)) {
        return scssReplacements;
    }

    return null;
}

export default function v20Upgrade(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema, so the
        // schema default never reaches us — applying the fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        let touched = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;

            const replacements = pickReplacements(filePath);

            if (!replacements) return;

            const originalContent = entry?.content.toString();

            if (!originalContent) return;

            // Always surface warn-only patterns regardless of fix mode.
            logWarnings(context, filePath, originalContent, warnPatterns);

            const {
                content: replaced,
                changed,
                importsToEnsure,
                importsToRemove
            } = applyReplacements(originalContent, replacements);

            if (!changed) return;

            let content = replaced;

            if (filePath.endsWith(TS_EXT)) {
                // Deduplicate by symbol+module since one replacement may match
                // many call sites in the same file.
                if (importsToRemove.length > 0) {
                    const seenRemove = new Set<string>();

                    for (const { symbol, from } of importsToRemove) {
                        const key = `${symbol}|${from}`;

                        if (seenRemove.has(key)) continue;

                        seenRemove.add(key);
                        content = removeImport(content, symbol, from);
                    }
                }

                if (importsToEnsure.length > 0) {
                    const seenEnsure = new Set<string>();

                    for (const { symbol, from } of importsToEnsure) {
                        const key = `${symbol}|${from}`;

                        if (seenEnsure.has(key)) continue;

                        seenEnsure.add(key);
                        content = ensureImport(content, symbol, from);
                    }
                }
            }

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [
                    `[v20-upgrade] would update ${filePath} (run with --fix to apply)`
                ]);
            }
        });

        logMessage(context.logger, [
            `[v20-upgrade] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

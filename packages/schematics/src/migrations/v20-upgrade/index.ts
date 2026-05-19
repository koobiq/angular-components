import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
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
): { content: string; changed: boolean; importsToEnsure: { symbol: string; from: string }[] } {
    let result = content;
    const importsToEnsure: { symbol: string; from: string }[] = [];

    for (const { from, to, ensureImport } of replacements) {
        const before = result;

        result = result.replace(new RegExp(from, 'g'), to);

        // Tidy up double commas / empty-element commas left over from identifier
        // deletions like `{ A, KbqValidationOptions, B }` → `{ A, , B }`.
        if (to === '' && before !== result) {
            result = result.replace(/,\s*,/g, ',').replace(/{\s*,/g, '{').replace(/,\s*}/g, ' }');
        }

        if (ensureImport && before !== result) {
            importsToEnsure.push(ensureImport);
        }
    }

    return { content: result, changed: result !== content, importsToEnsure };
}

/**
 * Idempotently add `import { symbol } from 'module'` to a TypeScript source
 * string. If the module is already imported, the symbol is added to the
 * existing import clause. If the symbol is already imported (from any
 * module), this is a no-op. Otherwise a new import line is inserted at the
 * top of the file (after any leading block / leading comments).
 */
function ensureImport(content: string, symbol: string, from: string): string {
    // Already imported (anywhere) — leave alone. The regex looks for the
    // identifier inside an `import { ... }` clause; deliberately permissive
    // so re-exports and renamed imports still skip the injection.
    const alreadyImported = new RegExp(
        `import\\s*(?:type\\s*)?\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from\\s*['"][^'"]+['"]`
    );

    if (alreadyImported.test(content)) return content;

    // Existing import line from the same module — extend its clause.
    const sameModule = new RegExp(`(import\\s*(?:type\\s*)?\\{)([^}]*)(\\}\\s*from\\s*['"]${escapeRegExp(from)}['"])`);

    if (sameModule.test(content)) {
        return content.replace(sameModule, (_match, open: string, body: string, close: string) => {
            const trimmed = body.trim().replace(/,$/, '');
            const next = trimmed.length === 0 ? ` ${symbol} ` : `${body.replace(/\s*$/, '')}, ${symbol} `;

            return `${open}${next}${close}`;
        });
    }

    // Otherwise, prepend a new import. Insert after any leading comment block
    // / shebang. The simple heuristic finds the first non-comment, non-blank
    // line and inserts right before it.
    const newImport = `import { ${symbol} } from '${from}';\n`;
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

    lines.splice(insertAt, 0, newImport.replace(/\n$/, ''));

    return lines.join('\n');
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        const { project, fix } = options;
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

            const { content: replaced, changed, importsToEnsure } = applyReplacements(originalContent, replacements);

            if (!changed) return;

            let content = replaced;

            if (filePath.endsWith(TS_EXT) && importsToEnsure.length > 0) {
                // Deduplicate by symbol+module since one replacement may match
                // many call sites in the same file.
                const seen = new Set<string>();

                for (const { symbol, from } of importsToEnsure) {
                    const key = `${symbol}|${from}`;

                    if (seen.has(key)) continue;

                    seen.add(key);
                    content = ensureImport(content, symbol, from);
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

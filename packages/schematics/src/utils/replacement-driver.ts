import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { listItemPattern } from './list-item-pattern';
import { logMessage } from './messages';
import { setupOptions } from './package-config';
import { visitProjectFiles } from './project-files';
import type { WarnPattern } from './warn-only-migration';

export type { WarnPattern };

/** A named import: `symbol`, imported from the module `from`. */
export interface ImportSpecifier {
    symbol: string;
    from: string;
}

/** One rewrite of a migration that rewrites the text of the project files. */
export interface Replacement {
    /**
     * The source of the RegExp to replace, compiled with the `g` flag. One that deletes an element of a list takes
     * one of its commas with it (`listItemPattern`): nothing tidies the file afterwards.
     */
    from: string;
    /** The replacement string; `$1` refers to a group of `from`. */
    to: string;
    /** The source of a RegExp that, while it matches the text, skips this replacement. */
    unless?: string;
    /** Why the rewrite is made, for the maintainers. It is not logged. */
    note?: string;
    /** Made a value import of a `.ts` file this replacement changed, as the rewrite introduces the symbol. */
    ensureImport?: ImportSpecifier;
    /** Stripped from the named imports of a `.ts` file this replacement changed, as the symbol no longer exists. */
    removeImport?: ImportSpecifier;
}

/** A replacement with its RegExp compiled, to be reused across files. */
export interface CompiledReplacement extends Omit<Replacement, 'from' | 'unless'> {
    /** Global: `String.prototype.replace` runs it from index 0 and leaves its `lastIndex` at 0. */
    from: RegExp;
    /** Not global, so `test` keeps no state. */
    unless?: RegExp;
}

/** What `applyReplacements` made of a text. */
export interface ReplacementResult {
    content: string;
    changed: boolean;
    /** The `ensureImport` of each replacement that changed the text, in order. */
    importsToEnsure: ImportSpecifier[];
    /** The `removeImport` of each replacement that changed the text, in order. */
    importsToRemove: ImportSpecifier[];
}

/** What a migration built on `replacementMigrationRule` rewrites and reports. */
export interface ReplacementMigration {
    /** Prefix of every log line, e.g. `[v21-upgrade]`. */
    label: string;
    /** Applied to `.ts` files, before `templateReplacements`, which cover their inline templates. */
    tsReplacements: readonly Replacement[];
    /** Applied to `.html` and `.ts` files. */
    templateReplacements: readonly Replacement[];
    /** Applied to `.scss` and `.css` files. */
    scssReplacements: readonly Replacement[];
    /** Reported for each of those files that matches, whether or not the fix is applied. */
    warnPatterns: readonly WarnPattern[];
}

/** Options every migration built on `replacementMigrationRule` accepts. */
export interface ReplacementMigrationOptions {
    /** Name of the project to migrate. If omitted, the whole tree is migrated. */
    project?: string;
    /** When false, only logs what would change. Defaults to true. */
    fix?: boolean;
}

/**
 * Migrates what lies outside the project files, such as `angular.json`, writing only when `fix` is set. Resolves
 * whether it changed, or would change, a file.
 */
export type MigrateOutsideFiles = (tree: Tree, context: SchematicContext, fix: boolean) => Promise<boolean>;

/** A named import declaration: the `type` of a type-only one, its specifiers, its module. */
const NAMED_IMPORT = /\bimport\s*(type\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;

/** An import specifier: an inline `type`, the imported name, its alias. */
const IMPORT_SPECIFIER = /^\s*(type\s+)?([\w$]+)(?:\s+as\s+([\w$]+))?\s*$/;

const COMMENT = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

export function compileReplacements(replacements: readonly Replacement[]): CompiledReplacement[] {
    return replacements.map(({ from, unless, ...replacement }) => ({
        ...replacement,
        from: new RegExp(from, 'g'),
        unless: unless ? new RegExp(unless) : undefined
    }));
}

/**
 * Applies `replacements` to `content` in order, and collects the imports of those that changed it, which the file
 * must gain or lose (e.g. `booleanAttribute` from `@angular/core` after a `toBoolean(` → `booleanAttribute(`
 * rewrite).
 */
export function applyReplacements(content: string, replacements: readonly CompiledReplacement[]): ReplacementResult {
    let result = content;
    const importsToEnsure: ImportSpecifier[] = [];
    const importsToRemove: ImportSpecifier[] = [];

    for (const { from, to, unless, ensureImport, removeImport } of replacements) {
        if (unless?.test(result)) continue;

        const before = result;

        result = result.replace(from, to);

        if (result === before) continue;

        if (ensureImport) importsToEnsure.push(ensureImport);

        if (removeImport) importsToRemove.push(removeImport);
    }

    return { content: result, changed: result !== content, importsToEnsure, importsToRemove };
}

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
export function ensureImport(content: string, symbol: string, from: string): string {
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

/** The length of the match of the sticky `pattern` at `index` of `content`. */
function matchedLength(pattern: RegExp, content: string, index: number): number {
    pattern.lastIndex = index;

    return pattern.exec(content)?.[0].length ?? 0;
}

const INDENT = /[ \t]*/y;
const LINE_BREAK = /\r?\n/y;
const BLANK_LINES = /(?:[ \t]*\r?\n)*/y;

/**
 * Idempotently strips `symbol` (under any alias) from the named imports of `from`, with one of its commas, and keeps
 * the layout of the rest of the clause. An import it empties is dropped. A re-export of `from` is left to the
 * rewrites, and dropped once they emptied it.
 *
 * A dropped statement takes its line with it, and the blank lines after it only when nothing but blank lines is
 * above it: the file neither starts with a blank line nor gains two in a row.
 *
 * Cleans up after rewrites that delete or rename a symbol (e.g. `toBoolean(` → `booleanAttribute(` must also remove
 * the import of `toBoolean`, which `@koobiq/components/core` no longer exports).
 */
export function removeImport(content: string, symbol: string, from: string): string {
    const declaration = new RegExp(
        `\\b(import|export)(\\s*(?:type\\s*)?)(\\{[^}]*\\})(\\s*from\\s*['"]${escapeRegExp(from)}['"];?)`,
        'g'
    );
    const specifier = new RegExp(
        listItemPattern(`(?<!\\bas\\s+)\\b${escapeRegExp(symbol)}\\b(?:\\s+as\\s+[\\w$]+)?`),
        'g'
    );
    let result = '';
    let end = 0;

    for (const match of content.matchAll(declaration)) {
        const [statement, keyword, modifier, clause, close] = match;
        const rest = keyword === 'import' ? clause.replace(specifier, '') : clause;

        result += content.slice(end, match.index);
        end = match.index + statement.length;

        if (!/^\{[\s,]*\}$/.test(rest.replace(COMMENT, ''))) {
            result += rest === clause ? statement : `${keyword}${modifier}${rest}${close}`;
            continue;
        }

        // The blanks around the statement go with it, and its line break when nothing else is on its line.
        result = result.replace(/[ \t]*$/, '');
        end += matchedLength(INDENT, content, end);

        if (result && !result.endsWith('\n')) continue;

        const lineBreak = matchedLength(LINE_BREAK, content, end);

        end += lineBreak;

        if (lineBreak && (!result.trim() || /\n[ \t]*\r?\n$/.test(result))) {
            end += matchedLength(BLANK_LINES, content, end);
        }
    }

    return result + content.slice(end);
}

/** A named import or re-export: its keyword, an optional `type`, its specifiers in braces, its module. */
const NAMED_CLAUSE = /\b(import|export)(\s*(?:type\s*)?)(\{[^}]*\})(\s*from\s*['"][^'"]+['"])/g;

/**
 * Drops each repeated specifier of a named import or re-export, which TypeScript rejects (TS2300): a rename makes
 * one when the file imported the new name as well. Of the specifiers that import a name under the same local name,
 * the first value one stays, or else the first one; the others go with one of their commas. A clause that stands in
 * `original` as well, so the rewrites did not change it, is left alone.
 */
export function dedupeImportSpecifiers(content: string, original = ''): string {
    return content.replace(
        NAMED_CLAUSE,
        (statement, keyword: string, modifier: string, clause: string, rest: string) => {
            if (original.includes(statement)) return statement;

            const deduped = dedupeClause(clause);

            return deduped === clause ? statement : `${keyword}${modifier}${deduped}${rest}`;
        }
    );
}

/** `clause`, the specifiers of a named import in braces, without the repeated ones. */
function dedupeClause(clause: string): string {
    // Blanked out, the comments neither split the clause nor read as specifiers.
    const code = clause.replace(COMMENT, (comment: string) => ' '.repeat(comment.length));
    const specifiers: { comma: number; start: number; end: number; key: string | null; typeOnly: boolean }[] = [];
    let comma = 0;

    for (let index = 1; index < code.length; index++) {
        if (code[index] !== ',' && index < code.length - 1) continue;

        const text = code.slice(comma + 1, index);
        const [, typeSpecifier, name, alias] = IMPORT_SPECIFIER.exec(text) ?? [];

        specifiers.push({
            // The comma before it, or the opening brace of the first one.
            comma,
            start: comma + 1 + text.length - text.trimStart().length,
            end: comma + 1 + text.trimEnd().length,
            key: name ? `${name} as ${alias ?? name}` : null,
            typeOnly: !!typeSpecifier
        });
        comma = index;
    }

    const kept = new Map<string, number>();

    specifiers.forEach(({ key, typeOnly }, index) => {
        if (key === null) return;

        const first = kept.get(key);

        if (first === undefined || (specifiers[first].typeOnly && !typeOnly)) kept.set(key, index);
    });

    const dropped = specifiers.map(({ key }, index) => key !== null && kept.get(key) !== index);
    let result = clause;

    // From the last, so that the positions of the others hold.
    for (let index = specifiers.length - 1; index >= 0; index--) {
        if (!dropped[index]) continue;

        const { comma: before, start, end } = specifiers[index];
        // With the comma before it after a specifier that stays, else with the comma after it.
        const [from, to] = dropped.slice(0, index).includes(false)
            ? [before, end]
            : [start, specifiers[index + 1].start];

        result = result.slice(0, from) + result.slice(to);
    }

    return result;
}

/**
 * Builds the rule of a migration that rewrites the text of the project files: each `.ts`, `.html`, `.scss` and
 * `.css` file is reported against the warn patterns, then rewritten with the replacements of its kind, and a `.ts`
 * file loses the import specifiers the rewrites repeated and gains and loses the imports they call for. With `fix: false`, the files that would change are logged
 * instead of written. `migrateOutsideFiles` runs after the walk; a file it changes counts in the summary.
 *
 * The patterns are compiled once per run rather than per file.
 */
export function replacementMigrationRule(
    migration: ReplacementMigration,
    options: ReplacementMigrationOptions,
    migrateOutsideFiles?: MigrateOutsideFiles
): Rule {
    const { label } = migration;
    const templateReplacements = compileReplacements(migration.templateReplacements);
    const tsReplacements = [...compileReplacements(migration.tsReplacements), ...templateReplacements];
    const scssReplacements = compileReplacements(migration.scssReplacements);
    const warnPatterns = migration.warnPatterns.map(({ anchor, pattern, message }) => ({
        anchor: anchor ? new RegExp(anchor) : null,
        pattern: new RegExp(pattern),
        message
    }));

    const pickReplacements = (filePath: string): CompiledReplacement[] | null => {
        if (filePath.endsWith('.ts')) return tsReplacements;

        if (filePath.endsWith('.html')) return templateReplacements;

        if (filePath.endsWith('.scss') || filePath.endsWith('.css')) return scssReplacements;

        return null;
    };

    return async (tree: Tree, context: SchematicContext) => {
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema, so the
        // schema default never reaches us — applying the fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(options.project, tree);
        const root = projectDefinition?.root ?? '';
        let touched = 0;

        visitProjectFiles(root ? tree.getDir(root) : tree.root, (filePath, entry) => {
            const replacements = pickReplacements(filePath);

            if (!replacements) return;

            const originalContent = entry.content.toString();

            if (!originalContent) return;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (anchor && !anchor.test(originalContent)) continue;

                if (pattern.test(originalContent)) logMessage(context.logger, [`${label} ${filePath}`, `  ${message}`]);
            }

            const result = applyReplacements(originalContent, replacements);

            if (!result.changed) return;

            const content = filePath.endsWith('.ts') ? fixImports(result, originalContent) : result.content;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${label} would update ${filePath} (run with --fix to apply)`]);
            }
        });

        if (await migrateOutsideFiles?.(tree, context, fix)) touched++;

        logMessage(context.logger, [
            `${label} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

/**
 * The content of `result`, rewritten from `original`, with the specifiers the rewrites repeated dropped, then each of
 * its imports removed, then ensured, once.
 */
function fixImports({ content, importsToEnsure, importsToRemove }: ReplacementResult, original: string): string {
    content = dedupeImportSpecifiers(content, original);

    for (const { symbol, from } of unique(importsToRemove)) content = removeImport(content, symbol, from);

    for (const { symbol, from } of unique(importsToEnsure)) content = ensureImport(content, symbol, from);

    return content;
}

function unique(specifiers: ImportSpecifier[]): ImportSpecifier[] {
    const keys = new Set<string>();

    return specifiers.filter(({ symbol, from }) => {
        const key = `${symbol}|${from}`;

        if (keys.has(key)) return false;

        keys.add(key);

        return true;
    });
}

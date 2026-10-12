import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import {
    BEHAVIOUR_NOTE,
    FINGERPRINT_KEYS,
    MIN_FINGERPRINT_MATCHES,
    REMOVED_KEYS,
    REMOVED_MEMBER_PATTERN,
    shorthandMessage,
    SPLIT_KEYS,
    SPLIT_MEMBER_PATTERN,
    templateWarnPatterns,
    tsWarnPatterns,
    WarnPattern
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[filter-bar-rename-action]';

/** A replacement of the half-open `[start, end)` range of the file content; `null` deletes the property. */
interface Edit {
    start: number;
    end: number;
    text: string | null;
}

const createSourceFile = (fileName: string, content: string): ts.SourceFile =>
    ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/** Property name of an object-literal member, for the forms a locale literal can use. */
function propertyName(property: ts.ObjectLiteralElementLike): string | null {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) return null;
    if (!ts.isIdentifier(property.name) && !ts.isStringLiteralLike(property.name)) return null;

    return property.name.text;
}

/** What the AST pass found in one file. */
interface Findings {
    /** Deletions of removed keys and rewrites of split keys. */
    edits: Edit[];
    /** Removed keys a matched literal carries as a shorthand, which the fix leaves alone. */
    shorthand: Set<string>;
}

/**
 * Whether an object literal is recognisably a filter-bar `filters` locale section — one carrying
 * enough of the sibling keys listed in {@link FINGERPRINT_KEYS}.
 */
function isFiltersSection(node: ts.ObjectLiteralExpression): boolean {
    const fingerprint = node.properties.filter((property) => {
        const name = propertyName(property);

        return name !== null && FINGERPRINT_KEYS.includes(name);
    });

    return fingerprint.length >= MIN_FINGERPRINT_MATCHES;
}

/**
 * Rewrites a split key into its `…Header` / `…Button` pair, both carrying the old value, so every
 * string keeps showing where it did. A half the literal already has is not repeated; with both
 * present the old property is just deleted. A shorthand expands into two references to its variable.
 */
function splitProperty(
    property: ts.PropertyAssignment | ts.ShorthandPropertyAssignment,
    name: string,
    targets: readonly string[],
    existing: Set<string | null>,
    sourceFile: ts.SourceFile
): Edit {
    const start = property.getStart(sourceFile);
    const end = property.getEnd();
    const missing = targets.filter((target) => !existing.has(target));

    if (!missing.length) return { start, end, text: null };

    const text = sourceFile.text;
    const key = text.slice(property.name.getStart(sourceFile), property.name.getEnd());
    const value = ts.isPropertyAssignment(property)
        ? text.slice(property.initializer.getStart(sourceFile), property.initializer.getEnd())
        : name;
    const indent = text.slice(text.lastIndexOf('\n', start - 1) + 1, start);
    const separator = /^[ \t]*$/.test(indent) ? `,${text.includes('\r\n') ? '\r\n' : '\n'}${indent}` : ', ';

    return { start, end, text: missing.map((target) => `${key.replace(name, target)}: ${value}`).join(separator) };
}

/** Every edit across the file, plus the shorthand removed keys left behind. */
function collectFindings(sourceFile: ts.SourceFile): Findings {
    const findings: Findings = { edits: [], shorthand: new Set() };

    const visit = (node: ts.Node) => {
        if (ts.isObjectLiteralExpression(node) && isFiltersSection(node)) {
            const existing = new Set(node.properties.map(propertyName));

            for (const property of node.properties) {
                if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue;

                const name = propertyName(property);

                if (name === null) continue;

                const targets = SPLIT_KEYS.get(name);

                if (targets) {
                    findings.edits.push(splitProperty(property, name, targets, existing, sourceFile));
                } else if (REMOVED_KEYS.includes(name) && ts.isPropertyAssignment(property)) {
                    findings.edits.push({ start: property.getStart(sourceFile), end: property.getEnd(), text: null });
                } else if (REMOVED_KEYS.includes(name)) {
                    // A shorthand: deleting it would also drop a reference to a variable the file
                    // still declares, which is a different edit from removing a dead string.
                    findings.shorthand.add(name);
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);

    return findings;
}

/** A comma and the whitespace — at most one line break — that separates two members. */
const SEPARATOR_BEFORE = /,[ \t]*\r?\n?[ \t]*$/;
const SEPARATOR_AFTER = /^,[ \t]*\r?\n?[ \t]*/;

/**
 * Applies the edits right-to-left, so earlier offsets stay valid. A deleted property takes exactly
 * one adjacent separator with it — the preceding one when it has one — so the literal keeps its shape
 * and nothing around it is reformatted. A sole property leaves an empty literal rather than a stray
 * comma.
 */
function applyEdits(content: string, edits: Edit[]): string {
    let result = content;

    for (const { start, end, text } of [...edits].sort((a, b) => b.start - a.start)) {
        if (text !== null) {
            result = result.slice(0, start) + text + result.slice(end);

            continue;
        }

        const before = SEPARATOR_BEFORE.exec(result.slice(0, start));
        const after = before ? null : SEPARATOR_AFTER.exec(result.slice(end));

        result = result.slice(0, before ? before.index : start) + result.slice(end + (after ? after[0].length : 0));
    }

    return result;
}

function logWarnings(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]) {
    for (const { pattern, message } of patterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

function pickWarnPatterns(filePath: string): WarnPattern[] {
    // A .ts file can hold an inline template, so it is checked against both sets.
    return filePath.endsWith(TS_EXT) ? [...tsWarnPatterns, ...templateWarnPatterns] : templateWarnPatterns;
}

function isMigratableFile(filePath: string): boolean {
    return filePath.endsWith(TS_EXT) || filePath.endsWith(HTML_EXT);
}

export default function filterBarRenameAction(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // ng update invokes migrations with no options at all, and migrations.json declares no
        // schema, so the schema default never reaches us — applying the fix is the intended
        // behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        const filePaths: Path[] = [];

        rootDir.visit((filePath: Path) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!isMigratableFile(filePath)) return;

            filePaths.push(filePath);
        });

        let touched = 0;

        for (const filePath of filePaths) {
            const originalContent = tree.read(filePath)?.toString();

            if (!originalContent) continue;

            let content = originalContent;

            // Parsing every .ts of the project is not free, and a file that carries no `name`, `error`,
            // `saveChanges` or `saveAsNew` member at all cannot hold a literal to fix.
            if (
                filePath.endsWith(TS_EXT) &&
                (REMOVED_MEMBER_PATTERN.test(content) || SPLIT_MEMBER_PATTERN.test(content))
            ) {
                const { edits, shorthand } = collectFindings(createSourceFile(filePath, content));

                content = applyEdits(content, edits);

                for (const key of shorthand) {
                    logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${shorthandMessage(key)}`]);
                }
            }

            // Warn on what is left over, so an auto-fixed literal does not also produce a
            // "manual migration required" note. In dry-run mode the fix is not written, so report
            // against the original content.
            logWarnings(context, filePath, fix ? content : originalContent, pickWarnPatterns(filePath));

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

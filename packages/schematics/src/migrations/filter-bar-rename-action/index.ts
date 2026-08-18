import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import {
    BEHAVIOUR_NOTE,
    FINGERPRINT_KEYS,
    MIN_FINGERPRINT_MATCHES,
    NAME_MEMBER_PATTERN,
    REMOVED_KEY,
    SHORTHAND_MESSAGE,
    templateWarnPatterns,
    tsWarnPatterns,
    WarnPattern
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[filter-bar-rename-action]';

/** A half-open `[start, end)` range of the file content. */
interface Span {
    start: number;
    end: number;
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
    /** Spans of the `name` properties to delete. */
    spans: Span[];
    /** Whether a matched literal carries `name` as a shorthand, which the fix leaves alone. */
    shorthand: boolean;
}

/**
 * The `name` member of an object literal that is recognisably a filter-bar `filters` locale
 * section — one carrying enough of the sibling keys listed in {@link FINGERPRINT_KEYS}.
 *
 * A shorthand `name` is reported rather than deleted: dropping it would also drop a reference to a
 * variable the file still declares, which is a different edit from removing a dead string.
 */
function findNameMember(node: ts.ObjectLiteralExpression): ts.ObjectLiteralElementLike | null {
    let member: ts.ObjectLiteralElementLike | null = null;
    let fingerprint = 0;

    for (const property of node.properties) {
        const name = propertyName(property);

        if (name === null) continue;

        if (name === REMOVED_KEY) member = property;
        else if (FINGERPRINT_KEYS.includes(name)) fingerprint++;
    }

    return fingerprint >= MIN_FINGERPRINT_MATCHES ? member : null;
}

/** Every removable `name` property across the file, plus whether a shorthand one was left behind. */
function collectFindings(sourceFile: ts.SourceFile): Findings {
    const findings: Findings = { spans: [], shorthand: false };

    const visit = (node: ts.Node) => {
        if (ts.isObjectLiteralExpression(node)) {
            const member = findNameMember(node);

            if (member && ts.isPropertyAssignment(member)) {
                findings.spans.push({ start: member.getStart(sourceFile), end: member.getEnd() });
            } else if (member) {
                findings.shorthand = true;
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
 * Deletes the given properties, each together with exactly one adjacent separator — the preceding
 * one when the property has one — so the literal keeps its shape and nothing around it is
 * reformatted. A sole property leaves an empty literal rather than a stray comma.
 */
function removeProperties(content: string, spans: Span[]): string {
    let result = content;

    // Right-to-left, so earlier offsets stay valid.
    for (const { start, end } of [...spans].sort((a, b) => b.start - a.start)) {
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

            // Parsing every .ts of the project is not free, and a file that carries no `name` member
            // at all cannot hold a literal to fix.
            if (filePath.endsWith(TS_EXT) && NAME_MEMBER_PATTERN.test(content)) {
                const { spans, shorthand } = collectFindings(createSourceFile(filePath, content));

                content = removeProperties(content, spans);

                if (shorthand) logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${SHORTHAND_MESSAGE}`]);
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

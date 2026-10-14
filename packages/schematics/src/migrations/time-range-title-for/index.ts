import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import {
    BEHAVIOUR_NOTE,
    FOR_MEMBER_PATTERN,
    PROVIDER_NAME,
    REMOVED_KEY,
    SIBLING_KEYS,
    TIME_RANGE_KEY,
    TITLE_KEY,
    warnPatterns
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[time-range-title-for]';

/** A half-open `[start, end)` range of the file content. */
interface Span {
    start: number;
    end: number;
}

const createSourceFile = (fileName: string, content: string): ts.SourceFile =>
    ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/** Property name of an object-literal member, for the forms a locale literal can use. */
function propertyName(property: ts.Node): string | null {
    if (!ts.isPropertyAssignment(property)) return null;
    if (!ts.isIdentifier(property.name) && !ts.isStringLiteralLike(property.name)) return null;

    return property.name.text;
}

function calleeName(call: ts.CallExpression): string | null {
    const callee = call.expression;

    if (ts.isIdentifier(callee)) return callee.text;
    if (ts.isPropertyAccessExpression(callee)) return callee.name.text;

    return null;
}

/**
 * Whether an object literal is the `title` section of a time-range locale configuration: the `title` of
 * a `timeRange` section, of a `kbqTimeRangeLocaleConfigurationProvider()` argument, or of a literal that
 * also carries a time-range-only sibling ({@link SIBLING_KEYS}). No type resolution is involved: the
 * schematic's virtual tree has no `@koobiq` types to resolve against.
 */
function isTimeRangeTitle(node: ts.ObjectLiteralExpression): boolean {
    const assignment = node.parent;

    if (propertyName(assignment) !== TITLE_KEY) return false;

    const section = assignment.parent;

    if (!ts.isObjectLiteralExpression(section)) return false;

    const owner = section.parent;

    if (propertyName(owner) === TIME_RANGE_KEY) return true;
    if (ts.isCallExpression(owner) && calleeName(owner) === PROVIDER_NAME) return true;

    return section.properties.some((property) => SIBLING_KEYS.includes(propertyName(property) ?? ''));
}

/** Spans of every removable `for` property across the file. */
function collectSpans(sourceFile: ts.SourceFile): Span[] {
    const spans: Span[] = [];

    const visit = (node: ts.Node) => {
        if (ts.isObjectLiteralExpression(node) && isTimeRangeTitle(node)) {
            for (const property of node.properties) {
                if (propertyName(property) === REMOVED_KEY) {
                    spans.push({ start: property.getStart(sourceFile), end: property.getEnd() });
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);

    return spans;
}

/** A comma and the whitespace — at most one line break — that separates two members. */
const SEPARATOR_BEFORE = /,[ \t]*\r?\n?[ \t]*$/;
const SEPARATOR_AFTER = /^,[ \t]*\r?\n?[ \t]*/;

/**
 * Deletes the given properties right-to-left, so earlier offsets stay valid, each together with exactly
 * one adjacent separator — the preceding one when the property has one — so the literal keeps its shape
 * and nothing around it is reformatted. A sole property leaves an empty literal rather than a stray comma.
 */
function removeProperties(content: string, spans: Span[]): string {
    let result = content;

    for (const { start, end } of [...spans].sort((a, b) => b.start - a.start)) {
        const before = SEPARATOR_BEFORE.exec(result.slice(0, start));
        const after = before ? null : SEPARATOR_AFTER.exec(result.slice(end));

        result = result.slice(0, before ? before.index : start) + result.slice(end + (after ? after[0].length : 0));
    }

    return result;
}

function logWarnings(context: SchematicContext, filePath: string, content: string) {
    for (const { pattern, message } of warnPatterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

function isMigratableFile(filePath: string): boolean {
    return filePath.endsWith(TS_EXT) || filePath.endsWith(HTML_EXT);
}

export default function timeRangeTitleFor(options: Schema): Rule {
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

            // Parsing every .ts of the project is not free, and a file with no `for` member at all
            // cannot hold a literal to fix.
            if (filePath.endsWith(TS_EXT) && FOR_MEMBER_PATTERN.test(content)) {
                content = removeProperties(content, collectSpans(createSourceFile(filePath, content)));
            }

            // Warn on what is left over, so an auto-fixed literal does not also produce a "manual
            // migration required" note. In dry-run mode the fix is not written, so report against the
            // original content.
            logWarnings(context, filePath, fix ? content : originalContent);

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

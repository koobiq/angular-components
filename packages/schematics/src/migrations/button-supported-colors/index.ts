import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { getSimpleAttributeName, visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    BEHAVIOUR_NOTE,
    COLOR_ATTRIBUTE,
    COLOR_HOST_ATTRIBUTES,
    COLOR_HOST_ELEMENTS,
    removedColorMessage,
    styleWarnPatterns,
    tsWarnPatterns,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    UNSUPPORTED_COLORS,
    UNSUPPORTED_MEMBERS,
    unsupportedMemberMessage,
    WarnPattern
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const SCSS_EXT = '.scss';
const CSS_EXT = '.css';

const LABEL = '[button-supported-colors]';

/** A half-open `[start, end)` range of the file content. */
interface Span {
    start: number;
    end: number;
}

/** `color`, `[color]` and `bind-color` all name the same input. */
function attributeName(name: string): string {
    return getSimpleAttributeName(name).replace(/^bind-/, '');
}

function hasAttribute(element: any, name: string): boolean {
    return (element.attrs ?? []).some(
        (attr: any) => typeof attr.name === 'string' && attributeName(attr.name) === name
    );
}

/** Whether the element is one whose `color` input this release narrowed. */
function isColorHost(element: any): boolean {
    return (
        COLOR_HOST_ELEMENTS.includes(element.name) || COLOR_HOST_ATTRIBUTES.some((name) => hasAttribute(element, name))
    );
}

/**
 * The color a binding resolves to, when that can be read off the source alone.
 *
 * Covers the two unambiguous forms: a plain attribute (`color="error"`) and a bound
 * string literal (`[color]="'error'"`). Anything else — an enum member, a field, a
 * ternary — returns `null` and is warned about instead of rewritten.
 */
function literalColor(attr: any): string | null {
    const raw = typeof attr.value === 'string' ? attr.value.trim() : '';

    if (!raw) return null;

    // A plain attribute carries the value verbatim; only a binding is an expression.
    if (attributeName(attr.name) === attr.name) return raw;

    const quoted = /^'([^']*)'$|^"([^"]*)"$/.exec(raw);

    return quoted ? (quoted[1] ?? quoted[2]) : null;
}

/** The trailing enum member of a property access, e.g. `colors.Error` → `Error`. */
function memberName(attr: any): string | null {
    const raw = typeof attr.value === 'string' ? attr.value.trim() : '';
    const match = /^[\w$.]*\.(\w+)$/.exec(raw);

    return match && UNSUPPORTED_MEMBERS.includes(match[1]) ? raw : null;
}

interface RemovedColor extends Span {
    value: string;
}

/**
 * Collects `color` bindings on button hosts: the removable ones by span, the ones
 * that only look unsupported by line.
 */
class ColorCollector implements Visitor {
    readonly removals: RemovedColor[] = [];
    readonly warnings: { line: number; expression: string }[] = [];

    visitElement(element: any): void {
        if (isColorHost(element)) {
            for (const attr of element.attrs ?? []) {
                if (typeof attr.name !== 'string' || attributeName(attr.name) !== COLOR_ATTRIBUTE) continue;

                const value = literalColor(attr);

                if (value !== null) {
                    if (UNSUPPORTED_COLORS.includes(value)) {
                        this.removals.push({
                            start: attr.sourceSpan.start.offset,
                            end: attr.sourceSpan.end.offset,
                            value
                        });
                    }

                    continue;
                }

                const expression = memberName(attr);

                if (expression) {
                    this.warnings.push({ line: attr.sourceSpan.start.line + 1, expression });
                }
            }
        }

        this.visitChildren(element);
    }

    visitBlock(block: any): void {
        this.visitChildren(block);
    }

    private visitChildren(node: any): void {
        for (const child of node.children ?? []) {
            child.visit(this);
        }
    }

    visitAttribute(): void {}
    visitText(): void {}
    visitComment(): void {}
    visitExpansion(): void {}
    visitExpansionCase(): void {}
    visitBlockParameter(): void {}
    visitLetDeclaration(): void {}
}

/**
 * Deletes the given spans, each together with the whitespace that separated it from
 * the previous attribute: an inline attribute takes its leading spaces, one written
 * on its own line takes the line break and the indent as well, so the tag is not left
 * with a blank line.
 */
function removeSpans(content: string, spans: Span[]): string {
    let result = content;

    // Right-to-left, so earlier offsets stay valid.
    for (const { start, end } of [...spans].sort((a, b) => b.start - a.start)) {
        let from = start;

        while (from > 0 && (result[from - 1] === ' ' || result[from - 1] === '\t')) from--;

        if (result[from - 1] === '\n') {
            from--;

            if (result[from - 1] === '\r') from--;
        }

        result = result.slice(0, from) + result.slice(end);
    }

    return result;
}

interface TemplateResult {
    content: string;
    removed: RemovedColor[];
    warnings: { line: number; expression: string }[];
}

/**
 * Drops unsupported `color` values from every button host in a template. Returns
 * `null` when the template could not be parsed — editing it blind is how a
 * regex-based migration corrupts binding expressions, so the caller warns instead.
 */
async function migrateTemplate(template: string): Promise<TemplateResult | null> {
    // Parsing every template of the project is not free, and a template with no
    // colored host in it cannot produce a finding.
    if (!template.includes(COLOR_ATTRIBUTE)) return { content: template, removed: [], warnings: [] };

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return null;

    const collector = new ColorCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    return {
        content: removeSpans(template, collector.removals),
        removed: collector.removals,
        warnings: collector.warnings
    };
}

/**
 * Applies the template migration to every inline `@Component({ template })` literal
 * of a `.ts` source. Line numbers are reported relative to the file, which is what a
 * reader of an inline template needs.
 */
async function migrateInlineTemplates(
    content: string,
    sourceFile: ts.SourceFile,
    onParseError: () => void
): Promise<TemplateResult> {
    let result = content;
    const removed: RemovedColor[] = [];
    const warnings: { line: number; expression: string }[] = [];

    // Right-to-left, so the ranges of the literals still to be processed stay valid.
    for (const { start, end } of [...collectInlineTemplateRanges(sourceFile)].sort((a, b) => b.start - a.start)) {
        const migrated = await migrateTemplate(result.slice(start, end));

        if (migrated === null) {
            onParseError();
            continue;
        }

        const lineOffset = result.slice(0, start).split('\n').length - 1;

        removed.push(...migrated.removed);
        warnings.push(...migrated.warnings.map(({ line, expression }) => ({ line: line + lineOffset, expression })));

        result = result.slice(0, start) + migrated.content + result.slice(end);
    }

    return { content: result, removed, warnings };
}

const createSourceFile = (fileName: string, content: string): ts.SourceFile =>
    ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

function logWarnings(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]) {
    for (const { pattern, message } of patterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

function pickWarnPatterns(filePath: string): WarnPattern[] {
    if (filePath.endsWith(TS_EXT)) return tsWarnPatterns;
    if (filePath.endsWith(HTML_EXT)) return [];

    return styleWarnPatterns;
}

function isMigratableFile(filePath: string): boolean {
    return (
        filePath.endsWith(TS_EXT) ||
        filePath.endsWith(HTML_EXT) ||
        filePath.endsWith(SCSS_EXT) ||
        filePath.endsWith(CSS_EXT)
    );
}

export default function buttonSupportedColors(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json
        // declares no schema, so the schema default never reaches us — applying the
        // fix is the intended behaviour there.
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
            let unparseable = false;
            const reportParseError = () => (unparseable = true);
            let result: TemplateResult = { content, removed: [], warnings: [] };

            if (filePath.endsWith(TS_EXT)) {
                result = await migrateInlineTemplates(content, createSourceFile(filePath, content), reportParseError);
            } else if (filePath.endsWith(HTML_EXT)) {
                const migrated = await migrateTemplate(content);

                if (migrated === null) reportParseError();
                else result = migrated;
            }

            content = result.content;

            for (const { value } of result.removed) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${removedColorMessage(value)}`]);
            }

            for (const { line, expression } of result.warnings) {
                logMessage(context.logger, [
                    `${LABEL} ${filePath}:${line}`,
                    `  ${unsupportedMemberMessage(expression)}`
                ]);
            }

            // Warn on what is left over, so an auto-fixed usage does not also produce
            // a "manual migration required" note. In dry-run mode the fix is not
            // written, so report against the original content.
            logWarnings(context, filePath, fix ? content : originalContent, pickWarnPatterns(filePath));

            if (unparseable) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);
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

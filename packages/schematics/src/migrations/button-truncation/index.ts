import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { forEachClass, parseTemplate } from '../../utils/typescript';
import {
    BUTTON_ATTR,
    ICON_ATTRS,
    MANUAL_TEMPLATE_NOTE,
    MAX_WIDTH_NOTE,
    PREFIX_ATTR,
    stylePatterns,
    SUFFIX_ATTR,
    TOGGLE_ELEMENT
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const STYLE_EXTS = ['.scss', '.css', '.less'];

/** A text-span edit on the original content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/**
 * The subset of the Angular HTML AST this migration reads. `utils/ast` copies the node interfaces without
 * their source spans, and blocks (`@if`, `@for`) are not elements at all, so both are re-declared here.
 */
interface Attr {
    name: string;
    keySpan?: { start: { offset: number } };
}

interface Node {
    name?: string;
    /** Present on elements only — a block carries `parameters` instead, and both carry a start span. */
    attrs?: Attr[];
    children?: Node[];
    /** Present on text nodes only; a comment has a `value` but no tokens. */
    tokens?: unknown[];
    value?: string;
    startSourceSpan?: { start: { offset: number } };
}

function applyEdits(content: string, edits: Edit[]): string {
    const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
    let result = content;

    for (const { start, end, text } of sorted) {
        result = result.slice(0, start) + text + result.slice(end);
    }

    return result;
}

/** An attribute name as written, with the binding brackets stripped: `[disabled]` → `disabled`. */
const attrName = (attr: Attr): string => attr.name.replace(/[[\]()]/g, '');

const hasAttr = (node: Node, name: string): boolean => !!node.attrs?.some((attr) => attrName(attr) === name);

/**
 * Node kinds are told apart by the field each one carries, not by the start span: a block (`@if`, `@for`)
 * has a name and a start span just like an element does, and would otherwise be mistaken for one.
 */
const isElement = (node: Node): boolean => Array.isArray(node.attrs);
const isBlock = (node: Node): boolean => !isElement(node) && Array.isArray(node.children);
const isText = (node: Node): boolean => !isElement(node) && Array.isArray(node.tokens);

/** A node that projects nothing: a comment, or text that is only the template's own indentation. */
const isInsignificant = (node: Node): boolean => {
    if (isElement(node) || isBlock(node)) return false;

    // a comment has a `value` but no tokens, unlike a text node
    return isText(node) ? (node.value ?? '').trim() === '' : typeof node.value === 'string';
};

const isIcon = (node: Node): boolean => isElement(node) && ICON_ATTRS.some((name) => hasAttr(node, name));

const isButtonHost = (node: Node): boolean =>
    isElement(node) && (hasAttr(node, BUTTON_ATTR) || node.name === TOGGLE_ELEMENT);

/**
 * The nodes a button actually projects, with a single-element block unwrapped to the element it renders.
 *
 * `@if (showIcon()) { <i kbq-icon></i> }` is the ordinary way to make an icon conditional, and the block's
 * position among the children still tells which side of the label it is on — so it can be marked. A block
 * holding more than one element cannot: which of them ends up at the edge is a runtime question.
 */
function projectedNodes(host: Node): { nodes: Node[]; ambiguous: boolean } {
    const nodes: Node[] = [];
    let ambiguous = false;

    for (const child of host.children ?? []) {
        if (isInsignificant(child)) continue;

        if (isBlock(child)) {
            const inner = (child.children ?? []).filter((node) => !isInsignificant(node));

            if (inner.length === 1 && isElement(inner[0])) {
                nodes.push(inner[0]);
            } else if (inner.length > 0) {
                nodes.push(child);
                ambiguous = true;
            }

            continue;
        }

        nodes.push(child);
    }

    return { nodes, ambiguous };
}

/** Offset just after the tag name, i.e. where a new attribute is inserted. */
function attributeInsertOffset(element: Node): number | undefined {
    const firstAttr = element.attrs?.find((attr) => attr.keySpan?.start.offset !== undefined);

    if (firstAttr) return firstAttr.keySpan!.start.offset;

    const start = element.startSourceSpan?.start.offset;

    return start === undefined ? undefined : start + 1 + (element.name?.length ?? 0);
}

/** Collects every button host in a template, blocks included. */
class ButtonHostCollector implements Visitor {
    readonly hosts: Node[] = [];

    visitElement(el: Node): void {
        if (isButtonHost(el)) this.hosts.push(el);

        this.visitChildren(el);
    }

    visitChildren(el: Node): void {
        for (const child of el.children ?? []) {
            (child as unknown as { visit: (visitor: Visitor) => void }).visit(this);
        }
    }

    visitBlock(block: Node): void {
        this.visitChildren(block);
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
 * Marks the outermost icons of every button in a template with the slot they belong to.
 *
 * Only an icon that sits next to a label is marked: a button whose whole content is icons has nothing to
 * truncate, and the markers would only add noise.
 */
async function migrateTemplate(template: string): Promise<{ content: string; changed: boolean; manual: boolean }> {
    if (!template.includes(BUTTON_ATTR) && !template.includes(TOGGLE_ELEMENT)) {
        return { content: template, changed: false, manual: false };
    }

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { content: template, changed: false, manual: false };

    const collector = new ButtonHostCollector();

    visitAll(collector, (parsed.tree as { rootNodes: Node[] }).rootNodes);

    const edits: Edit[] = [];
    let manual = false;

    for (const host of collector.hosts) {
        const { nodes, ambiguous } = projectedNodes(host);

        manual ||= ambiguous;

        // nothing beside the icons, so nothing to keep them out of
        if (nodes.length < 2 || nodes.every(isIcon)) continue;

        for (const [node, marker] of [
            [nodes[0], PREFIX_ATTR],
            [nodes[nodes.length - 1], SUFFIX_ATTR]
        ] as const) {
            if (!isIcon(node) || hasAttr(node, PREFIX_ATTR) || hasAttr(node, SUFFIX_ATTR)) continue;

            const offset = attributeInsertOffset(node);

            if (offset === undefined) continue;

            edits.push({ start: offset, end: offset, text: `${marker} ` });
        }
    }

    return { content: applyEdits(template, edits), changed: edits.length > 0, manual };
}

/** Interior `[start, end]` ranges of inline `@Component({ template: '…' })` string literals. */
function collectInlineTemplateRanges(sourceFile: ts.SourceFile): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];

    forEachClass(sourceFile, (node) => {
        const decorator = ts
            .getDecorators(node)
            ?.find(
                (dec) =>
                    ts.isCallExpression(dec.expression) &&
                    ts.isIdentifier(dec.expression.expression) &&
                    dec.expression.expression.text === 'Component'
            );

        if (!decorator || !ts.isCallExpression(decorator.expression)) return;

        const [arg] = decorator.expression.arguments;

        if (!arg || !ts.isObjectLiteralExpression(arg)) return;

        for (const prop of arg.properties) {
            if (
                ts.isPropertyAssignment(prop) &&
                (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name)) &&
                prop.name.text === 'template' &&
                ts.isStringLiteralLike(prop.initializer) &&
                prop.initializer.text
            ) {
                // +1 / -1 to exclude the opening/closing quote characters.
                ranges.push({ start: prop.initializer.getStart(sourceFile) + 1, end: prop.initializer.getEnd() - 1 });
            }
        }
    });

    return ranges;
}

async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; manual: boolean }> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    let result = content;
    let manual = false;

    for (const { start, end } of ranges) {
        const migrated = await migrateTemplate(result.slice(start, end));

        manual ||= migrated.manual;

        if (migrated.changed) {
            result = result.slice(0, start) + migrated.content + result.slice(end);
        }
    }

    return { content: result, manual };
}

/** Reports stylesheet overrides that the layout change affects. Never rewrites them. */
function warnStyles(context: SchematicContext, filePath: string, content: string): boolean {
    let found = false;

    for (const { selector, pattern, message } of stylePatterns) {
        if (new RegExp(pattern).test(content)) {
            found = true;
            logMessage(context.logger, [`[button-truncation] ${filePath} overrides ${selector}`, `  ${message}`]);
        }
    }

    return found;
}

export default function buttonTruncation(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        const tsPaths: string[] = [];
        const htmlPaths: string[] = [];
        const stylePaths: string[] = [];

        rootDir.visit((filePath) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;

            if (filePath.endsWith(TS_EXT)) tsPaths.push(filePath);
            else if (filePath.endsWith(HTML_EXT)) htmlPaths.push(filePath);
            else if (STYLE_EXTS.some((ext) => filePath.endsWith(ext))) stylePaths.push(filePath);
        });

        let touched = 0;
        let manual = false;
        let styleFindings = 0;

        const commit = (filePath: string, original: string, updated: string) => {
            if (updated === original) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, updated);
            } else {
                logMessage(context.logger, [
                    `[button-truncation] would update ${filePath} (run with --fix to apply)`
                ]);
            }
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const migrated = await migrateInlineTemplates(original, filePath);

            manual ||= migrated.manual;

            // a `styles: [...]` block lives in the same file, so stylesheets are looked for here too
            if (warnStyles(context, filePath, original)) styleFindings++;

            commit(filePath, original, migrated.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const migrated = await migrateTemplate(original);

            manual ||= migrated.manual;

            if (migrated.changed) commit(filePath, original, migrated.content);
        }

        for (const filePath of stylePaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            if (warnStyles(context, filePath, original)) styleFindings++;
        }

        if (manual) logMessage(context.logger, [`[button-truncation] ${MANUAL_TEMPLATE_NOTE}`]);

        logMessage(
            context.logger,
            MAX_WIDTH_NOTE.map((line) => `[button-truncation] ${line}`)
        );

        logMessage(context.logger, [
            `[button-truncation] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s), ` +
                `${styleFindings} stylesheet(s) need a manual review.`
        ]);
    };
}

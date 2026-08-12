import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { forEachClass, parseTemplate } from '../../utils/typescript';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const PREFIX_ATTR = 'kbqTagPrefix';
const TAG_ELEMENTS = new Set(['kbq-tag', 'kbq-basic-tag']);
const TAG_ATTRS = ['kbq-tag', 'kbq-basic-tag'];
const LEGACY_ICON_ATTR = 'kbq-icon';
const SPECIAL_ICON_ATTRS = [PREFIX_ATTR, 'kbqTagSuffix', 'kbqTagRemove', 'kbqTagEditSubmit'];

/** A text-span edit on the original content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** Minimal Angular HTML AST surface used by this migration. */
interface Attr {
    name: string;
    keySpan?: { start: { offset: number } };
}

interface Node {
    name?: string;
    attrs?: Attr[];
    children?: Node[];
    startSourceSpan?: { start: { offset: number } };
}

const attrName = (attr: Attr): string => attr.name.replace(/[[\]()]/g, '');
const hasAttr = (node: Node, name: string): boolean => !!node.attrs?.some((attr) => attrName(attr) === name);
const isElement = (node: Node): boolean => Array.isArray(node.attrs);
const isBlock = (node: Node): boolean => !isElement(node) && Array.isArray(node.children);
const isTagHost = (node: Node): boolean =>
    isElement(node) && ((!!node.name && TAG_ELEMENTS.has(node.name)) || TAG_ATTRS.some((name) => hasAttr(node, name)));
const isIcon = (node: Node): boolean => isElement(node) && hasAttr(node, LEGACY_ICON_ATTR);
const isSpecialIcon = (node: Node): boolean => SPECIAL_ICON_ATTRS.some((name) => hasAttr(node, name));

function applyEdits(content: string, edits: Edit[]): string {
    let result = content;

    for (const { start, end, text } of [...edits].sort((a, b) => b.start - a.start || b.end - a.end)) {
        result = result.slice(0, start) + text + result.slice(end);
    }

    return result;
}

/** Offset just after the element name, or immediately before its first existing attribute. */
function attributeInsertOffset(element: Node): number | undefined {
    const firstAttr = element.attrs?.find((attr) => attr.keySpan?.start.offset !== undefined);

    if (firstAttr) return firstAttr.keySpan!.start.offset;

    const start = element.startSourceSpan?.start.offset;

    return start === undefined ? undefined : start + 1 + (element.name?.length ?? 0);
}

/**
 * Finds icons that participated in the old implicit leading slot.
 *
 * Control-flow blocks and `ng-container` are transparent for this purpose. Regular consumer wrappers are
 * not traversed because their nested icons did not match the tag's direct projection selector either.
 */
function collectLegacyIcons(children: Node[] = [], result: Node[] = []): Node[] {
    for (const child of children) {
        if (isBlock(child) || child.name === 'ng-container') {
            collectLegacyIcons(child.children, result);
        } else if (isIcon(child) && !isSpecialIcon(child) && !hasAttr(child, 'ngProjectAs')) {
            result.push(child);
        }
    }

    return result;
}

class TagHostCollector implements Visitor {
    readonly hosts: Node[] = [];

    visitElement(element: Node): void {
        if (isTagHost(element)) this.hosts.push(element);

        this.visitChildren(element);
    }

    visitChildren(node: Node): void {
        for (const child of node.children ?? []) {
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

async function migrateTemplate(template: string): Promise<{ content: string; changed: boolean }> {
    if (![...TAG_ELEMENTS, ...TAG_ATTRS].some((selector) => template.includes(selector))) {
        return { content: template, changed: false };
    }

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { content: template, changed: false };

    const collector = new TagHostCollector();

    visitAll(collector, (parsed.tree as { rootNodes: Node[] }).rootNodes);

    const edits: Edit[] = [];

    for (const host of collector.hosts) {
        for (const icon of collectLegacyIcons(host.children)) {
            const offset = attributeInsertOffset(icon);

            if (offset !== undefined) edits.push({ start: offset, end: offset, text: `${PREFIX_ATTR} ` });
        }
    }

    return { content: applyEdits(template, edits), changed: edits.length > 0 };
}

/** Interior ranges of static inline `@Component({ template: '…' })` string literals. */
function collectInlineTemplateRanges(sourceFile: ts.SourceFile): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];

    forEachClass(sourceFile, (node) => {
        const decorator = ts
            .getDecorators(node)
            ?.find(
                (current) =>
                    ts.isCallExpression(current.expression) &&
                    ts.isIdentifier(current.expression.expression) &&
                    current.expression.expression.text === 'Component'
            );

        if (!decorator || !ts.isCallExpression(decorator.expression)) return;

        const [metadata] = decorator.expression.arguments;

        if (!metadata || !ts.isObjectLiteralExpression(metadata)) return;

        for (const property of metadata.properties) {
            if (
                ts.isPropertyAssignment(property) &&
                (ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)) &&
                property.name.text === 'template' &&
                ts.isStringLiteralLike(property.initializer) &&
                property.initializer.text
            ) {
                ranges.push({
                    start: property.initializer.getStart(sourceFile) + 1,
                    end: property.initializer.getEnd() - 1
                });
            }
        }
    });

    return ranges;
}

async function migrateInlineTemplates(content: string, fileName: string): Promise<string> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    let result = content;

    for (const { start, end } of ranges) {
        const migrated = await migrateTemplate(result.slice(start, end));

        if (migrated.changed) result = result.slice(0, start) + migrated.content + result.slice(end);
    }

    return result;
}

export default function tagSlots(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        const tsPaths: string[] = [];
        const htmlPaths: string[] = [];

        rootDir.visit((filePath) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;

            if (filePath.endsWith(TS_EXT)) tsPaths.push(filePath);
            else if (filePath.endsWith(HTML_EXT)) htmlPaths.push(filePath);
        });

        let touched = 0;

        const commit = (filePath: string, original: string, updated: string) => {
            if (updated === original) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, updated);
            } else {
                logMessage(context.logger, [`[tag-slots] would update ${filePath} (run with --fix to apply)`]);
            }
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (original) commit(filePath, original, await migrateInlineTemplates(original, filePath));
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const migrated = await migrateTemplate(original);

            if (migrated.changed) commit(filePath, original, migrated.content);
        }

        logMessage(context.logger, [
            `[tag-slots] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

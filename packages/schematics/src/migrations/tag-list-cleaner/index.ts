import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    BEHAVIOUR_NOTE,
    CLEANER_ELEMENT,
    CLICK_ATTRIBUTES,
    keptHandlerMessage,
    NO_REMOVED_BINDING_REASON,
    REFUSES_REMOVAL_REASON,
    REMOVABLE_ATTRIBUTES,
    REMOVED_ATTRIBUTES,
    removedHandlerMessage,
    TAG_LIST_ELEMENT,
    UNPARSEABLE_TEMPLATE_MESSAGE
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[tag-list-cleaner]';

/** A half-open `[start, end)` range of the file content to delete. */
interface Edit {
    start: number;
    end: number;
}

/** One handler found on a cleaner, and what to tell the developer about it. */
interface Finding {
    edit: Edit;
    attribute: string;
    expression: string;
    /** Why the built-in clearing cannot take this handler's place, so it has to stay. */
    keptReason?: string;
}

/** Whether any element in the subtree reports `removed`, the output the built-in clearing goes through. */
function hasRemovedBinding(node: any): boolean {
    for (const attr of node.attrs ?? []) {
        if (typeof attr.name === 'string' && REMOVED_ATTRIBUTES.includes(attr.name)) return true;
    }

    return (node.children ?? []).some((child: any) => hasRemovedBinding(child));
}

/** Whether the list is written as `removable="false"`, which now hides the cleaner outright. */
function refusesRemoval(element: any): boolean {
    return (element.attrs ?? []).some(
        (attr: any) =>
            typeof attr.name === 'string' &&
            REMOVABLE_ATTRIBUTES.includes(attr.name) &&
            String(attr.value).trim() === 'false'
    );
}

/** Collects the click handler of every cleaner projected into a tag list. */
class CleanerHandlerCollector implements Visitor {
    readonly findings: Finding[] = [];

    /** One entry per enclosing tag list, carrying why its cleaner's handler may or may not go. */
    private readonly tagLists: { keptReason?: string }[] = [];

    visitElement(element: any): void {
        const isTagList = element.name === TAG_LIST_ELEMENT;

        if (isTagList) {
            this.tagLists.push({
                keptReason: refusesRemoval(element)
                    ? REFUSES_REMOVAL_REASON
                    : hasRemovedBinding(element)
                      ? undefined
                      : NO_REMOVED_BINDING_REASON
            });
        }

        const tagList = this.tagLists.at(-1);

        if (tagList && element.name === CLEANER_ELEMENT) {
            for (const attr of element.attrs ?? []) {
                if (typeof attr.name !== 'string' || !CLICK_ATTRIBUTES.includes(attr.name)) continue;

                this.findings.push({
                    edit: { start: attr.sourceSpan.start.offset, end: attr.sourceSpan.end.offset },
                    attribute: attr.name,
                    expression: String(attr.value).trim(),
                    keptReason: tagList.keptReason
                });
            }
        }

        this.visitChildren(element);

        if (isTagList) this.tagLists.pop();
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
 * Deletes the ranges. A deletion also takes the whitespace that separated the attribute from the previous
 * one: an inline attribute takes its leading spaces, one written on its own line takes the line break and
 * the indent as well, so the tag is not left with a blank line.
 */
function applyEdits(content: string, edits: Edit[]): string {
    let result = content;

    // Right-to-left, so earlier offsets stay valid.
    for (const { start, end } of [...edits].sort((a, b) => b.start - a.start)) {
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

/**
 * Migrates one template. Returns `null` when it could not be parsed — editing it blind is how a
 * regex-based migration corrupts binding expressions, so the caller warns instead.
 */
async function migrateTemplate(template: string, onFinding: (finding: Finding) => void): Promise<string | null> {
    if (!template.includes(CLEANER_ELEMENT)) return template;

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return null;

    const collector = new CleanerHandlerCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    collector.findings.forEach(onFinding);

    return applyEdits(
        template,
        collector.findings.filter(({ keptReason }) => !keptReason).map(({ edit }) => edit)
    );
}

/** Applies the template migration to every inline `@Component({ template })` literal of a `.ts` source. */
async function migrateInlineTemplates(
    content: string,
    sourceFile: ts.SourceFile,
    onFinding: (finding: Finding) => void,
    onParseError: () => void
): Promise<string> {
    let result = content;

    // Splice right-to-left so earlier offsets stay valid.
    for (const { start, end } of collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start)) {
        const migrated = await migrateTemplate(result.slice(start, end), onFinding);

        if (migrated === null) {
            onParseError();
            continue;
        }

        result = result.slice(0, start) + migrated + result.slice(end);
    }

    return result;
}

export default function tagListCleaner(options: Schema): Rule {
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

            // Parsing every `.ts` of the project is not free, and nothing can change in a file that holds
            // no cleaner at all.
            if (!originalContent || !originalContent.includes(CLEANER_ELEMENT)) continue;

            let content = originalContent;
            let unparseable = false;
            const reports: string[][] = [];
            const onFinding = ({ attribute, expression, keptReason }: Finding) =>
                reports.push(
                    keptReason
                        ? keptHandlerMessage(filePath, attribute, expression, keptReason)
                        : removedHandlerMessage(filePath, attribute, expression, fix)
                );

            if (filePath.endsWith(TS_EXT)) {
                const sourceFile = ts.createSourceFile(
                    filePath,
                    content,
                    ts.ScriptTarget.Latest,
                    true,
                    ts.ScriptKind.TS
                );

                content = await migrateInlineTemplates(content, sourceFile, onFinding, () => (unparseable = true));
            } else {
                const migrated = await migrateTemplate(content, onFinding);

                if (migrated === null) unparseable = true;
                else content = migrated;
            }

            for (const report of reports) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, ...report]);
            }

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

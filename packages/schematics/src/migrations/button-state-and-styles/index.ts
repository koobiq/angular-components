import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { getSimpleAttributeName, visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    BEHAVIOUR_NOTE,
    BUTTON_ATTRIBUTE,
    GROUP_ATTRIBUTES,
    GROUP_ELEMENT,
    groupOverrideMessage,
    MIXIN_INCLUDE_PATTERN,
    OWNED_INPUTS,
    REMOVED_MIXINS,
    styleWarnPatterns,
    tsWarnPatterns,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    WarnPattern
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const SCSS_EXT = '.scss';
const CSS_EXT = '.css';

const LABEL = '[button-state-and-styles]';

/** `kbqStyle`, `[kbqStyle]` and `bind-kbqStyle` all name the same input. */
function attributeName(name: string): string {
    return getSimpleAttributeName(name).replace(/^bind-/, '');
}

function hasAttribute(element: any, name: string): boolean {
    return (element.attrs ?? []).some(
        (attr: any) => typeof attr.name === 'string' && attributeName(attr.name) === name
    );
}

function isGroup(element: any): boolean {
    return element.name === GROUP_ELEMENT || GROUP_ATTRIBUTES.some((name) => hasAttribute(element, name));
}

/** The owned inputs a `[kbq-button]` element declares, in template order. */
function ownedInputs(element: any): string[] {
    if (!hasAttribute(element, BUTTON_ATTRIBUTE)) return [];

    return OWNED_INPUTS.filter((input) => hasAttribute(element, input));
}

/** A button that now owns one of its group-propagated inputs, with the line it sits on. */
interface GroupOverride {
    line: number;
    inputs: string[];
}

/**
 * Collects nested buttons that declare a `kbqStyle` / `color` / `disabled` of
 * their own.
 *
 * Only buttons *inside* a group are reported: the ownership rule exists solely
 * to decide who wins between a group and its child, so a standalone button is
 * unaffected and reporting it would be noise. Nesting is tracked through the
 * traversal rather than by matching the whole subtree at once, so a group nested
 * in another group still reports its children once.
 */
class GroupOverrideCollector implements Visitor {
    readonly overrides: GroupOverride[] = [];

    private groupDepth = 0;

    visitElement(element: any): void {
        const entered = isGroup(element);

        if (entered) this.groupDepth++;

        if (this.groupDepth > 0) {
            const inputs = ownedInputs(element);

            if (inputs.length) {
                this.overrides.push({ line: element.sourceSpan.start.line + 1, inputs });
            }
        }

        this.visitChildren(element);

        if (entered) this.groupDepth--;
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
 * Reports nested buttons owning a group-propagated input.
 *
 * Returns `null` when the template could not be parsed — guessing at the
 * structure with a regex would report buttons that are not in a group at all.
 */
async function inspectTemplate(template: string): Promise<GroupOverride[] | null> {
    // Parsing every template of the project is not free, and a template with no
    // group in it cannot produce a finding.
    if (!GROUP_ATTRIBUTES.some((name) => template.includes(name))) return [];

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return null;

    const collector = new GroupOverrideCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    return collector.overrides;
}

/**
 * Applies the template inspection to every inline `@Component({ template })`
 * literal of a `.ts` source. Line numbers are reported relative to the template,
 * which is what a reader of an inline template needs.
 */
async function inspectInlineTemplates(
    content: string,
    sourceFile: ts.SourceFile,
    onParseError: () => void
): Promise<GroupOverride[]> {
    const overrides: GroupOverride[] = [];

    for (const { start, end } of collectInlineTemplateRanges(sourceFile)) {
        const found = await inspectTemplate(content.slice(start, end));

        if (found === null) {
            onParseError();
            continue;
        }

        // Offset by where the literal starts, so the number points into the file.
        const lineOffset = content.slice(0, start).split('\n').length - 1;

        overrides.push(...found.map(({ line, inputs }) => ({ line: line + lineOffset, inputs })));
    }

    return overrides;
}

const createSourceFile = (fileName: string, content: string): ts.SourceFile =>
    ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/**
 * Rewrites `@include border-<side>-radius(…)` to its logical counterpart.
 *
 * The mixins were removed outright, so an unmigrated stylesheet fails to compile
 * — this is the one change in the release that is both mechanical and mandatory.
 */
function migrateMixinIncludes(content: string): string {
    return content.replace(MIXIN_INCLUDE_PATTERN, (full, prefix: string, name: string) => {
        const replacement = REMOVED_MIXINS[name];

        return replacement ? `${prefix}${replacement}` : full;
    });
}

function logWarnings(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]) {
    for (const { pattern, message } of patterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

function logGroupOverrides(context: SchematicContext, filePath: string, overrides: GroupOverride[]) {
    for (const { line, inputs } of overrides) {
        logMessage(context.logger, [`${LABEL} ${filePath}:${line}`, `  ${groupOverrideMessage(inputs)}`]);
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

export default function buttonStateAndStyles(options: Schema): Rule {
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
            let overrides: GroupOverride[] = [];

            if (filePath.endsWith(TS_EXT)) {
                overrides = await inspectInlineTemplates(
                    content,
                    createSourceFile(filePath, content),
                    reportParseError
                );
            } else if (filePath.endsWith(HTML_EXT)) {
                const found = await inspectTemplate(content);

                if (found === null) reportParseError();
                else overrides = found;
            } else {
                content = migrateMixinIncludes(content);
            }

            // Warn on what is left over, so an auto-fixed usage does not also produce
            // a "manual migration required" note. In dry-run mode the fix is not
            // written, so report against the original content.
            logWarnings(context, filePath, fix ? content : originalContent, pickWarnPatterns(filePath));
            logGroupOverrides(context, filePath, overrides);

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

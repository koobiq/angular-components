import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { getSimpleAttributeName, visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    BEHAVIOUR_NOTE,
    CHECKBOX_MODE,
    dynamicBindingMessage,
    MULTIPLE_ATTRIBUTE,
    removedAttributeMessage,
    rewrittenAttributeMessage,
    SAFE_BINDING_LITERALS,
    SINGLE_INTENT_VALUES,
    TARGET_ELEMENTS,
    tsWarnPatterns,
    UNCHANGED_VALUES,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    WarnPattern
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[list-tree-multiple-input]';

/** A half-open `[start, end)` range of the file content, and what replaces it. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** What the migration decided to do with one `multiple` attribute. */
interface Finding {
    edit: Edit | null;
    report: (filePath: string) => string[];
}

/** `multiple`, `[multiple]` and `bind-multiple` all name the same input. */
function attributeName(name: string): string {
    return getSimpleAttributeName(name).replace(/^bind-/, '');
}

/**
 * The value an attribute carries, when it is knowable without running the app.
 *
 * A plain attribute holds its value verbatim. A binding holds an expression, which is only resolvable
 * here when it is a quoted string literal; anything else is a genuine runtime value.
 */
function resolveValue(attr: any): { value: string; binding: boolean } | null {
    const raw = typeof attr.value === 'string' ? attr.value : '';
    const binding = attributeName(attr.name) !== attr.name;

    if (!binding) return { value: raw, binding };

    const quoted = /^\s*'([^']*)'\s*$/.exec(raw) ?? /^\s*"([^"]*)"\s*$/.exec(raw);

    return quoted ? { value: quoted[1], binding } : null;
}

/** Renders the attribute back, keeping the binding syntax the author used. */
function render(binding: boolean, value: string): string {
    return binding ? `[${MULTIPLE_ATTRIBUTE}]="'${value}'"` : `${MULTIPLE_ATTRIBUTE}="${value}"`;
}

function decide(attr: any): Finding | null {
    const span = { start: attr.sourceSpan.start.offset, end: attr.sourceSpan.end.offset };
    const resolved = resolveValue(attr);

    if (!resolved) {
        // An unresolvable expression. The literals below are unambiguous under the new API and cannot
        // predate it, so reporting them would be noise.
        if (SAFE_BINDING_LITERALS.includes(String(attr.value).trim())) return null;

        return { edit: null, report: (filePath) => dynamicBindingMessage(filePath, String(attr.value).trim()) };
    }

    const { value, binding } = resolved;

    if (UNCHANGED_VALUES.includes(value)) return null;

    if (SINGLE_INTENT_VALUES.includes(value)) {
        return { edit: { ...span, text: '' }, report: (filePath) => removedAttributeMessage(filePath, value) };
    }

    return {
        edit: { ...span, text: render(binding, CHECKBOX_MODE) },
        report: (filePath) => rewrittenAttributeMessage(filePath, value)
    };
}

/** Collects a finding for every `multiple` attribute on a target element. */
class MultipleAttributeCollector implements Visitor {
    readonly findings: Finding[] = [];

    visitElement(element: any): void {
        if (TARGET_ELEMENTS.includes(element.name)) {
            for (const attr of element.attrs ?? []) {
                if (typeof attr.name !== 'string' || attributeName(attr.name) !== MULTIPLE_ATTRIBUTE) continue;

                const finding = decide(attr);

                if (finding) this.findings.push(finding);
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
 * Applies the edits. A deletion also takes the whitespace that separated the attribute from the previous
 * one: an inline attribute takes its leading spaces, one written on its own line takes the line break and
 * the indent as well, so the tag is not left with a blank line.
 */
function applyEdits(content: string, edits: Edit[]): string {
    let result = content;

    // Right-to-left, so earlier offsets stay valid.
    for (const { start, end, text } of [...edits].sort((a, b) => b.start - a.start)) {
        let from = start;

        if (text === '') {
            while (from > 0 && (result[from - 1] === ' ' || result[from - 1] === '\t')) from--;

            if (result[from - 1] === '\n') {
                from--;

                if (result[from - 1] === '\r') from--;
            }
        }

        result = result.slice(0, from) + text + result.slice(end);
    }

    return result;
}

/**
 * Migrates every `multiple` attribute of a template. Returns `null` when the template could not be
 * parsed — editing it blind is how a regex-based migration corrupts binding expressions, so the caller
 * warns instead.
 */
async function migrateTemplate(template: string, onFinding: (finding: Finding) => void): Promise<string | null> {
    if (!template.includes(MULTIPLE_ATTRIBUTE)) return template;

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return null;

    const collector = new MultipleAttributeCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    collector.findings.forEach(onFinding);

    return applyEdits(
        template,
        collector.findings.map(({ edit }) => edit).filter((edit): edit is Edit => edit !== null)
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

function logWarnings(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]) {
    for (const { pattern, message } of patterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

export default function listTreeMultipleInput(options: Schema): Rule {
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

            if (!originalContent) continue;

            let content = originalContent;
            let unparseable = false;
            const reports: string[][] = [];
            const onFinding = (finding: Finding) => reports.push(finding.report(filePath));

            // Parsing every `.ts` of the project is not free, and nothing can change in a file that
            // mentions neither of the two elements.
            const mentionsTarget = TARGET_ELEMENTS.some((element) => content.includes(element));

            if (filePath.endsWith(TS_EXT) && mentionsTarget) {
                const sourceFile = ts.createSourceFile(
                    filePath,
                    content,
                    ts.ScriptTarget.Latest,
                    true,
                    ts.ScriptKind.TS
                );

                content = await migrateInlineTemplates(content, sourceFile, onFinding, () => (unparseable = true));
            } else if (filePath.endsWith(HTML_EXT) && mentionsTarget) {
                const migrated = await migrateTemplate(content, onFinding);

                if (migrated === null) unparseable = true;
                else content = migrated;
            }

            for (const report of reports) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, ...report]);
            }

            // Warn on what is left over, so an auto-fixed usage does not also produce a "manual migration
            // required" note. In dry-run mode the fix is not written, so report against the original.
            if (filePath.endsWith(TS_EXT)) {
                logWarnings(context, filePath, fix ? content : originalContent, tsWarnPatterns);
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

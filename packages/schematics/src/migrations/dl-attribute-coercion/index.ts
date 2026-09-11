import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    BOOLEAN_ATTRIBUTES,
    boundAttributeMessage,
    DL_ELEMENT,
    DL_PACKAGE,
    falsyBooleanMessage,
    NUMERIC_ATTRIBUTES,
    numericAttributeMessage,
    SUMMARY,
    truthyBooleanMessage,
    UNPARSEABLE_TEMPLATE_MESSAGE
} from './data';
import { Schema } from './schema';

const LABEL = '[dl-attribute-coercion]';
const TS_EXT = '.ts';
const HTML_EXT = '.html';

/** A file is a description list consumer if it renders the element or imports the package. */
function referencesDl(content: string): boolean {
    return content.includes(`<${DL_ELEMENT}`) || content.includes(DL_PACKAGE);
}

/** Attribute-name prefixes that mark the value as an Angular expression rather than a literal. */
const BINDING_PREFIX = /^(?:\[|bind-)/;

/**
 * Walks a template's HTML AST collecting what changed meaning on every `<kbq-dl>`.
 *
 * An AST rather than a regular expression over the markup: the previous pattern matched the attribute
 * names anywhere inside the opening tag, so `class="my-list vertical"` and `title="Very wide list"`
 * were reported, `<kbq-dl-other wide>` matched on the unanchored element name, and an attribute value
 * containing `>` cut the tag short and hid everything after it.
 */
class DlCollector implements Visitor {
    readonly findings: string[] = [];

    visitElement(element: any): void {
        if (element.name === DL_ELEMENT) this.inspect(element);

        this.visitChildren(element);
    }

    visitBlock(block: any): void {
        this.visitChildren(block);
    }

    visitChildren(node: any): void {
        visitAll(this, node.children ?? []);
    }

    visitAttribute(): void {}
    visitText(): void {}
    visitComment(): void {}
    visitExpansion(): void {}
    visitExpansionCase(): void {}
    visitBlockParameter(): void {}
    visitLetDeclaration(): void {}

    private inspect(element: any): void {
        const line = (element.startSourceSpan?.start.line ?? 0) + 1;
        const bound = new Set<string>();

        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string') continue;

            const name = attr.name.replace(BINDING_PREFIX, '').replace(/\]$/, '');
            const isBinding = BINDING_PREFIX.test(attr.name);
            const value = typeof attr.value === 'string' ? attr.value : '';

            if (!BOOLEAN_ATTRIBUTES.includes(name) && !NUMERIC_ATTRIBUTES.includes(name)) continue;

            if (isBinding) {
                bound.add(name);
                continue;
            }

            if (BOOLEAN_ATTRIBUTES.includes(name)) {
                // The empty string covers both `wide` and `wide=""`: they are the same value, and the
                // previous pattern reported the first while excluding the second.
                this.findings.push(
                    value === '' ? falsyBooleanMessage(name, line) : truthyBooleanMessage(name, value, line)
                );

                continue;
            }

            // A numeric literal reached the arithmetic as a string and coerced there, so it behaves
            // exactly as before; only a value that is not a finite number changed meaning.
            if (!Number.isFinite(Number(value === '' ? NaN : value))) {
                this.findings.push(numericAttributeMessage(name, line));
            }
        }

        if (bound.size > 0) this.findings.push(boundAttributeMessage(bound, line));
    }
}

/** Collects the findings of one template, or reports that it could not be parsed. */
async function inspectTemplate(template: string): Promise<{ findings: string[]; unparseable: boolean }> {
    if (!template.includes(`<${DL_ELEMENT}`)) return { findings: [], unparseable: false };

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { findings: [], unparseable: true };

    const collector = new DlCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    return { findings: collector.findings, unparseable: false };
}

/** The same, over every inline template in a `.ts` file. */
async function inspectInlineTemplates(
    content: string,
    fileName: string
): Promise<{ findings: string[]; unparseable: boolean }> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const findings: string[] = [];
    let unparseable = false;

    for (const { start, end } of collectInlineTemplateRanges(sourceFile)) {
        const inspected = await inspectTemplate(content.slice(start, end));

        findings.push(...inspected.findings);
        unparseable ||= inspected.unparseable;
    }

    return { findings, unparseable };
}

/**
 * Reports the `<kbq-dl>` attributes whose coercion changed. Never writes: whether markup relied on a
 * valueless `wide` being ignored is a decision the call site owns, and so is what a non-numeric width
 * was meant to say.
 *
 * Both `.ts` and `.html` are visited, because the element is written in templates of either kind.
 */
export default function dlAttributeCoercion(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        const paths: string[] = [];

        rootDir.visit((filePath: Path) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (filePath.endsWith(TS_EXT) || filePath.endsWith(HTML_EXT)) paths.push(filePath);
        });

        let consumers = 0;
        let reported = 0;

        for (const filePath of paths) {
            const content = tree.read(filePath)?.toString();

            if (!content || !referencesDl(content)) continue;

            consumers++;

            const { findings, unparseable } = filePath.endsWith(HTML_EXT)
                ? await inspectTemplate(content)
                : await inspectInlineTemplates(content, filePath);

            if (unparseable) logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);

            for (const finding of findings) {
                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${finding}`]);
            }
        }

        // Nothing here uses the description list, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-dl under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} attribute(s) reported.`,
            ...SUMMARY
        ]);
    };
}

import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { FORM_FIELD_CONTROL_MEMBER_PATTERN, INPUT_PACKAGE, INPUT_TYPE, SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

const LABEL = '[input-number-surface]';
const EXTENSIONS = ['.ts', '.html'];
const TS_EXT = '.ts';

/** A file is an input consumer if it imports the package or names the number-input directive. */
function referencesInput(content: string): boolean {
    return content.includes(INPUT_PACKAGE) || new RegExp(INPUT_TYPE).test(content);
}

const createSourceFile = (fileName: string, content: string): ts.SourceFile =>
    ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/**
 * Identifiers in the file explicitly typed as `KbqInput` — through a type annotation, or a
 * `viewChild(KbqInput)` / `viewChild.required(KbqInput)` initializer. A member access on one of these can
 * never be the `KbqFormFieldControl` surface this migration warns about: `KbqInput` still owns it.
 */
function collectKbqInputTypedNames(sourceFile: ts.SourceFile): Set<string> {
    const names = new Set<string>();

    const isKbqInputTypeNode = (node: ts.TypeNode | undefined): boolean =>
        !!node && ts.isTypeReferenceNode(node) && node.typeName.getText(sourceFile) === 'KbqInput';

    const referencesKbqInput = (call: ts.CallExpression): boolean =>
        call.arguments.some((argument) => ts.isIdentifier(argument) && argument.text === 'KbqInput');

    const visit = (node: ts.Node) => {
        if (
            (ts.isPropertyDeclaration(node) || ts.isVariableDeclaration(node) || ts.isParameter(node)) &&
            ts.isIdentifier(node.name) &&
            isKbqInputTypeNode(node.type)
        ) {
            names.add(node.name.text);
        }

        if (
            ts.isCallExpression(node) &&
            /^viewChild(\.required)?$/.test(node.expression.getText(sourceFile)) &&
            referencesKbqInput(node)
        ) {
            const owner = node.parent;

            if ((ts.isPropertyDeclaration(owner) || ts.isVariableDeclaration(owner)) && ts.isIdentifier(owner.name)) {
                names.add(owner.name.text);
            }
        }

        ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);

    return names;
}

/** The receiver name (capture group 1) of every `FORM_FIELD_CONTROL_MEMBER_PATTERN` match in `content`. */
function collectFormFieldControlReceivers(content: string): string[] {
    const regex = new RegExp(FORM_FIELD_CONTROL_MEMBER_PATTERN.pattern, 'g');
    const receivers: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content))) {
        receivers.push(match[1]);
    }

    return receivers;
}

/**
 * Whether `content` reads a removed `KbqFormFieldControl` member off something other than a provably
 * `KbqInput`-typed reference. `KbqInput` keeps every one of these members, so a match whose receiver
 * resolves to a `KbqInput`-typed identifier is a false positive, not a call site the rename broke.
 * `.html` templates fall back to the plain existence check: a template-reference receiver (`#ref="kbqInput"`)
 * is not resolved here.
 */
function reportsFormFieldControlMember(filePath: string, content: string): boolean {
    const receivers = collectFormFieldControlReceivers(content);

    if (receivers.length === 0) return false;
    if (!filePath.endsWith(TS_EXT)) return true;

    const kbqInputTypedNames = collectKbqInputTypedNames(createSourceFile(filePath, content));

    return receivers.some((receiver) => !kbqInputTypedNames.has(receiver));
}

/**
 * Reports the `KbqNumberInput` members that disappeared with the unimplemented `KbqFormFieldControl`
 * surface, the validator classes that gained a `Kbq` prefix, and the two behaviors that changed
 * without a call site to point at — the `type="number"` reset and the removed `valueAsNumber`
 * prototype patch. Never writes: a member that was always `undefined` has no replacement expression.
 *
 * `.html` is visited as well as `.ts`, because `type="number"` is markup.
 */
export default function inputNumberSurface(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let consumers = 0;
        let reported = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!EXTENSIONS.some((extension) => filePath.endsWith(extension))) return;

            const content = entry?.content.toString();

            if (!content || !referencesInput(content)) return;

            consumers++;

            for (const { anchor, pattern, message } of warnPatterns) {
                if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
            }

            if (
                new RegExp(FORM_FIELD_CONTROL_MEMBER_PATTERN.anchor).test(content) &&
                reportsFormFieldControlMember(filePath, content)
            ) {
                reported++;

                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${FORM_FIELD_CONTROL_MEMBER_PATTERN.message}`]);
            }
        });

        // Nothing here uses the input, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbqInput under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the package, ${reported} call site(s) reported.`,
            ...SUMMARY
        ]);
    };
}

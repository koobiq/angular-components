import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import {
    FORM_FIELD_CONTROL_MEMBER_PATTERN,
    INPUT_PACKAGE,
    INPUT_TYPE,
    NUMBER_INPUT_EXPORT_AS,
    NUMBER_INPUT_TYPE,
    PASSWORD_TYPE,
    SIGNAL_MEMBERS,
    SUMMARY,
    warnPatterns
} from './data';
import { Schema } from './schema';

const LABEL = '[input-number-surface]';
const EXTENSIONS = ['.ts', '.html'];
const TS_EXT = '.ts';

/** A file is an input consumer if it imports the package or names one of the directives. */
function referencesInput(content: string): boolean {
    return (
        content.includes(INPUT_PACKAGE) ||
        new RegExp(INPUT_TYPE).test(content) ||
        new RegExp(PASSWORD_TYPE).test(content)
    );
}

const createSourceFile = (fileName: string, content: string): ts.SourceFile =>
    ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/**
 * Identifiers in the file explicitly typed as `typeName` — through a type annotation, or a
 * `viewChild(<typeName>)` / `viewChild.required(<typeName>)` initializer.
 *
 * Used for two opposite purposes. For `KbqInput` it suppresses a false positive: a member access on one
 * of these can never be the `KbqFormFieldControl` surface this migration warns about, because `KbqInput`
 * still owns it. For `KbqNumberInput` it is what scopes the signal-read rewrite, since `min`/`max`/`step`
 * are far too common to match on the member name alone.
 *
 * Only this file's annotations are consulted — there is no cross-package type resolution — so a receiver
 * whose type is inferred rather than written down is left alone.
 */
function collectTypedNames(sourceFile: ts.SourceFile, typeName: string): Set<string> {
    const names = new Set<string>();

    const isKbqInputTypeNode = (node: ts.TypeNode | undefined): boolean =>
        !!node && ts.isTypeReferenceNode(node) && node.typeName.getText(sourceFile) === typeName;

    const referencesKbqInput = (call: ts.CallExpression): boolean =>
        call.arguments.some((argument) => ts.isIdentifier(argument) && argument.text === typeName);

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

    const kbqInputTypedNames = collectTypedNames(createSourceFile(filePath, content), 'KbqInput');

    return receivers.some((receiver) => !kbqInputTypedNames.has(receiver));
}

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** Applies text-span edits to `content`, right-to-left, so earlier edits don't shift later offsets. */
function applyEdits(content: string, edits: Edit[]): string {
    return [...edits]
        .sort((a, b) => b.start - a.start || b.end - a.end)
        .reduce((result, { start, end, text }) => result.slice(0, start) + text + result.slice(end), content);
}

/**
 * Trailing identifier of a receiver expression: `input` for `input`, `numberInput` for
 * `this.numberInput`. Anything else (a call, an index read) has no stable name and is skipped.
 */
function receiverName(expression: ts.Expression): string | null {
    if (ts.isIdentifier(expression)) return expression.text;
    if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) return expression.name.text;

    return null;
}

/**
 * Rewrites `numberInput.min` to `numberInput.min()` on every receiver this file annotates as a
 * `KbqNumberInput`. A write (`numberInput.min = 5`) is left alone and reported instead: the members are
 * read-only `input()`s, so there is no `.set()` to rewrite to, and the binding is the replacement.
 *
 * Returns the rewritten content plus the distinct member names written to, for the caller to report.
 */
function migrateSignalReads(content: string, filePath: string): { content: string; written: Set<string> } {
    const written = new Set<string>();

    if (!SIGNAL_MEMBERS.some((member) => content.includes(member))) return { content, written };

    const sourceFile = createSourceFile(filePath, content);
    const receivers = collectTypedNames(sourceFile, NUMBER_INPUT_TYPE);

    if (receivers.size === 0) return { content, written };

    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            SIGNAL_MEMBERS.includes(node.name.text)
        ) {
            const name = receiverName(node.expression);

            if (name && receivers.has(name)) {
                const parent = node.parent;
                const isWrite =
                    ts.isBinaryExpression(parent) &&
                    parent.left === node &&
                    parent.operatorToken.kind === ts.SyntaxKind.EqualsToken;
                // Already a call — `min()` — so the rewrite stays idempotent across repeated runs.
                const isCalled = ts.isCallExpression(parent) && parent.expression === node;

                if (isWrite) written.add(node.name.text);
                else if (!isCalled) edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { content: edits.length > 0 ? applyEdits(content, edits) : content, written };
}

/**
 * Template reference variables bound to the number input by `exportAs` — `#ref="kbqNumberInput"` and the
 * `kbqNumericalInput` alias. Matched textually: the templates this runs over are the consumer's, and a
 * full template parse would still not tell us the directive's type.
 */
function collectTemplateRefs(template: string): string[] {
    const pattern = new RegExp(`#([A-Za-z_$][\\w$]*)\\s*=\\s*["'](?:${NUMBER_INPUT_EXPORT_AS.join('|')})["']`, 'g');

    return [...template.matchAll(pattern)].map((match) => match[1]);
}

/** Rewrites `ref.min` to `ref.min()` for template refs bound to the number input. */
function migrateTemplate(template: string): { content: string; changed: boolean } {
    const refs = collectTemplateRefs(template);

    if (refs.length === 0) return { content: template, changed: false };

    const members = SIGNAL_MEMBERS.join('|');
    let content = template;

    for (const ref of refs) {
        // `(?!\s*\()` skips anything already invoked, so a second run is a no-op.
        content = content.replace(new RegExp(`\\b(${ref})\\.(${members})\\b(?!\\s*\\()`, 'g'), '$1.$2()');
    }

    return { content, changed: content !== template };
}

/**
 * Rewrites reads of the `KbqNumberInput` members that became `input()` signals — `min`, `max`, `step`,
 * `bigStep` — on a receiver this file annotates as a `KbqNumberInput`, and on a template reference bound
 * through the directive's `exportAs`.
 *
 * Reports the rest: the members that disappeared with the unimplemented `KbqFormFieldControl` surface,
 * the validator classes that gained a `Kbq` prefix, the `EventEmitter` → `Subject` change, and the two
 * behaviors that changed without a call site to point at — the `type="number"` reset and the removed
 * `valueAsNumber` prototype patch. A removed member that was always `undefined` has no replacement
 * expression, so none of that half can be written.
 *
 * `.html` is visited as well as `.ts`, because `type="number"` is markup.
 */
export default function inputNumberSurface(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `migrations.json` registers this without a schema, so the schema default never reaches us;
        // applying the fix is the intended behavior of `ng update`.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let consumers = 0;
        let reported = 0;
        let touched = 0;

        const pending: Array<{ filePath: Path; content: string }> = [];

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

            const isTs = filePath.endsWith(TS_EXT);
            // A `.ts` file carries both programmatic reads and any inline template; an `.html` file only
            // the latter. Both passes run on a `.ts` file, so `#ref="kbqNumberInput"` in an inline
            // template is reached too.
            const { content: afterReads, written } = isTs
                ? migrateSignalReads(content, filePath)
                : { content, written: new Set<string>() };
            const { content: updated } = migrateTemplate(afterReads);

            if (written.size > 0) {
                reported++;

                logMessage(context.logger, [
                    `${LABEL} ${filePath}`,
                    `  ${[...written].join(', ')} on KbqNumberInput ${written.size === 1 ? 'is' : 'are'} a ` +
                        'read-only input() and cannot be assigned. Bind the value in the template instead ' +
                        '([min]="…"); a programmatic write has no .set() to migrate to.'
                ]);
            }

            if (updated === content) return;

            touched++;

            if (fix) pending.push({ filePath, content: updated });
            else logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
        });

        // Written after the walk: overwriting during `visit` re-enters the visitor on some Tree backends.
        for (const { filePath, content } of pending) {
            tree.overwrite(filePath, content);
        }

        // Nothing here uses the input, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbqInput under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the package, ${reported} call site(s) reported, ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { forEachClass, parseTemplate } from '../../utils/typescript';
import {
    attributeRewrites,
    NULLABILITY_CHANGED_MEMBERS,
    PROTECTED_MEMBERS,
    QUERY_LIST_MEMBERS,
    QUERY_LIST_ONLY_API,
    READ_ONLY_MEMBERS,
    styleRewrites,
    Target,
    TARGETS,
    warnPatterns
} from './data';
import { Schema } from './schema';

const MIGRATION = 'form-field-signals';
const TS_EXT = '.ts';
const HTML_EXT = '.html';
const STYLE_EXTS = ['.scss', '.css'];

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A receiver whose static type is one of a target's types, valid within `[start, end]` of the source. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `formField` or `this.formField`. */
    text: string;
    start: number;
    end: number;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Applies text-span edits to `content`, right-to-left, so earlier edits don't shift later offsets. */
function applyEdits(content: string, edits: Edit[]): string {
    const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
    let result = content;

    for (const { start, end, text } of sorted) {
        result = result.slice(0, start) + text + result.slice(end);
    }

    return result;
}

const isFunctionLike = (node: ts.Node): boolean =>
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node);

/** Walks up from `node` to the nearest ancestor matching `predicate`. */
function findAncestor(node: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node | undefined {
    let current = node.parent;

    while (current) {
        if (predicate(current)) return current;
        current = current.parent;
    }

    return undefined;
}

/** Whether a type annotation refers to one of the target's types. */
function isTargetType(type: ts.TypeNode | undefined, target: Target): boolean {
    return (
        !!type &&
        ts.isTypeReferenceNode(type) &&
        ts.isIdentifier(type.typeName) &&
        target.types.includes(type.typeName.text)
    );
}

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/**
 * Collects the receivers whose static type belongs to `target`, by explicit annotation only (no cross-package
 * type resolution): method/function params, class fields (incl. `@ContentChild(KbqHint) x: KbqHint` and
 * constructor parameter-properties) and typed locals.
 */
function collectReceivers(sourceFile: ts.SourceFile, target: Target): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, scope: ts.Node) =>
        receivers.push({ text, start: scope.getStart(sourceFile), end: scope.getEnd() });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name) && isTargetType(node.type, target)) {
            add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile);

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, owner);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name) && isTargetType(node.type, target)) {
            const owner = findAncestor(node, ts.isClassDeclaration);

            if (owner) add(`this.${node.name.text}`, owner);
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && isTargetType(node.type, target)) {
            add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return receivers;
}

/** Whether a property access on a receiver is within one of the receiver's scopes. */
function inReceiverScope(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, receivers: Receiver[]): boolean {
    const receiverText = node.expression.getText(sourceFile);
    const start = node.getStart(sourceFile);
    const end = node.getEnd();

    return receivers.some((r) => r.text === receiverText && start >= r.start && end <= r.end);
}

/** Classifies a matched property access and appends the resulting edit(s). */
function classifyAccess(
    node: ts.PropertyAccessExpression,
    sourceFile: ts.SourceFile,
    target: Target,
    edits: Edit[]
): void {
    const parent = node.parent;

    // Already migrated: `x.hint()` (call) or `x.regex.set(...)` — leave alone (idempotent).
    if (ts.isCallExpression(parent) && parent.expression === node) return;
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && parent.name.text === 'set') return;

    // Write target: `x.regex = RHS`.
    if (
        ts.isBinaryExpression(parent) &&
        parent.left === node &&
        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
        if (target.writableMembers.has(node.name.text)) {
            const rhs = parent.right;

            edits.push({ start: node.getEnd(), end: rhs.getStart(sourceFile), text: '.set(' });
            edits.push({ start: rhs.getEnd(), end: rhs.getEnd(), text: ')' });
        }

        // A read-only member keeps its assignment: it becomes a compile error the consumer fixes by hand,
        // and the warning below explains why.
        return;
    }

    // Read (incl. optional chain `x?.hint`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/** Collects edits for every read/write of a migrated member on a known receiver of `target`. */
function collectAccessEdits(sourceFile: ts.SourceFile, target: Target, receivers: Receiver[]): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            target.signalMembers.includes(node.name.text) &&
            inReceiverScope(node, sourceFile, receivers)
        ) {
            classifyAccess(node, sourceFile, target, edits);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** Distinct members accessed on a receiver that need manual attention. */
interface ReceiverWarnings {
    queryListApi: Set<string>;
    nullability: Set<string>;
    protectedAccess: Set<string>;
    readOnlyWrites: Set<string>;
}

const emptyWarnings = (): ReceiverWarnings => ({
    queryListApi: new Set<string>(),
    nullability: new Set<string>(),
    protectedAccess: new Set<string>(),
    readOnlyWrites: new Set<string>()
});

/** Collects the members that the auto-fix can't fully migrate for one target. */
function collectReceiverWarnings(sourceFile: ts.SourceFile, target: Target, receivers: Receiver[]): ReceiverWarnings {
    const warnings = emptyWarnings();

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
            const name = node.name.text;
            const onReceiver = inReceiverScope(node, sourceFile, receivers);

            if (onReceiver && PROTECTED_MEMBERS.includes(name)) {
                warnings.protectedAccess.add(name);
            }

            if (onReceiver && NULLABILITY_CHANGED_MEMBERS.includes(name)) {
                warnings.nullability.add(name);
            }

            if (
                onReceiver &&
                READ_ONLY_MEMBERS.includes(name) &&
                !target.writableMembers.has(name) &&
                ts.isBinaryExpression(node.parent) &&
                node.parent.left === node &&
                node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
            ) {
                warnings.readOnlyWrites.add(name);
            }

            // `formField.hint.changes` — the query member is migrated, the QueryList API below it is not.
            if (
                QUERY_LIST_ONLY_API.includes(name) &&
                ts.isPropertyAccessExpression(node.expression) &&
                ts.isIdentifier(node.expression.name) &&
                QUERY_LIST_MEMBERS.includes(node.expression.name.text) &&
                inReceiverScope(node.expression, sourceFile, receivers)
            ) {
                warnings.queryListApi.add(`${node.expression.name.text}.${name}`);
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return warnings;
}

/** Emits precise, receiver-scoped warnings for the members that can't be auto-fixed. */
function warnReceiverMembers(context: SchematicContext, filePath: string, content: string): void {
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const merged = emptyWarnings();

    for (const target of TARGETS) {
        const receivers = collectReceivers(sourceFile, target);

        if (receivers.length === 0) continue;

        const warnings = collectReceiverWarnings(sourceFile, target, receivers);

        warnings.queryListApi.forEach((value) => merged.queryListApi.add(value));
        warnings.nullability.forEach((value) => merged.nullability.add(value));
        warnings.protectedAccess.forEach((value) => merged.protectedAccess.add(value));
        warnings.readOnlyWrites.forEach((value) => merged.readOnlyWrites.add(value));
    }

    if (merged.queryListApi.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  These KbqFormField members are now a readonly array instead of a QueryList, so the QueryList API is`,
            `  gone: ${[...merged.queryListApi].join(', ')}. The queries are signals — react to them with`,
            `  \`computed()\`/\`effect()\` instead of \`.changes\`, and use \`[0]\`/\`.at(-1)\`/the array itself instead`,
            `  of \`.first\`/\`.last\`/\`.toArray()\`.`
        ]);
    }

    if (merged.nullability.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  \`${[...merged.nullability].join('`, `')}\` now returns \`undefined\` instead of \`null\` when absent.`,
            `  Strict comparisons against \`null\` no longer match — use a truthiness check or \`== null\`.`
        ]);
    }

    if (merged.protectedAccess.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  These members are now \`protected\` and can't be read from outside the component: ` +
                `${[...merged.protectedAccess].join(', ')}. Refactor to avoid reading them.`
        ]);
    }

    if (merged.readOnlyWrites.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  \`${[...merged.readOnlyWrites].join('`, `')}\` can no longer be assigned: they are read-only signals`,
            `  now. Drive them with a template binding (e.g. \`[fillTextOff]="…"\`) instead of an assignment.`
        ]);
    }
}

/** Pass A — rewrite value-safe programmatic reads of migrated members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    let result = content;

    // One target at a time, re-parsing in between, so the edit offsets of each pass stay valid.
    for (const target of TARGETS) {
        const sourceFile = ts.createSourceFile(fileName, result, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const receivers = collectReceivers(sourceFile, target);

        if (receivers.length === 0) continue;

        const edits = collectAccessEdits(sourceFile, target, receivers);

        if (edits.length > 0) result = applyEdits(result, edits);
    }

    return result;
}

/** Collects template reference variable names bound to one of the target's elements. */
class RefCollector implements Visitor {
    readonly refs = new Set<string>();

    constructor(private readonly elements: readonly string[]) {}

    visitElement(element: any): void {
        if (this.elements.includes(element.name)) {
            for (const attr of element.attrs ?? []) {
                if (typeof attr.name !== 'string') continue;

                if (attr.name.startsWith('#')) this.refs.add(attr.name.slice(1));
                else if (attr.name.startsWith('ref-')) this.refs.add(attr.name.slice(4));
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

/** Rewrites `ref.member` reads to `ref.member()` for the given refs, scoped to those exact identifiers. */
function rewriteRefReads(template: string, refs: string[], members: readonly string[]): string {
    const joined = members.join('|');
    let content = template;

    for (const ref of refs) {
        // `\bref\.(member)\b(?!\s*\()` — skip anything already invoked, so the rewrite is idempotent.
        const pattern = new RegExp(`\\b(${escapeRegExp(ref)})\\.(${joined})\\b(?!\\s*\\()`, 'g');

        content = content.replace(pattern, '$1.$2()');
    }

    return content;
}

/** Rewrites renamed attributes inside the opening tag of the elements that own them. */
function rewriteAttributes(template: string): string {
    let content = template;

    for (const { element, from, to } of attributeRewrites) {
        const tagPattern = new RegExp(`<${escapeRegExp(element)}\\b[^>]*>`, 'g');

        content = content.replace(tagPattern, (tag) => {
            const attrPattern = new RegExp(`(\\s)${escapeRegExp(from)}(\\s*=)`, 'g');

            return tag.replace(attrPattern, `$1${to}$2`);
        });
    }

    return content;
}

/** Pass B (core) — parse a template, discover target refs, rewrite their reads and renamed attributes. */
async function migrateTemplate(template: string): Promise<{ content: string; changed: boolean }> {
    let content = rewriteAttributes(template);

    const relevant = TARGETS.filter((target) => target.elements.some((element) => template.includes(element)));

    if (relevant.length > 0) {
        const parsed = await parseTemplate(content);

        if (parsed.tree) {
            for (const target of relevant) {
                const collector = new RefCollector(target.elements);

                visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

                if (collector.refs.size > 0) {
                    content = rewriteRefReads(content, [...collector.refs], target.signalMembers);
                }
            }
        }
    }

    return { content, changed: content !== template };
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

/** Pass B (inline) — rewrite target ref reads inside inline component templates. */
async function migrateInlineTemplates(content: string, fileName: string): Promise<string> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    let result = content;

    for (const { start, end } of ranges) {
        const { content: rewritten, changed } = await migrateTemplate(result.slice(start, end));

        if (changed) {
            result = result.slice(0, start) + rewritten + result.slice(end);
        }
    }

    return result;
}

/** Pass C — the misspelled `_fiedset-theme.scss` was renamed. */
function migrateStyles(content: string): string {
    let result = content;

    for (const { from, to } of styleRewrites) {
        result = result.split(from).join(to);
    }

    return result;
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { pattern, message } of warnPatterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`[${MIGRATION}] ${filePath}`, `  ${message}`]);
        }
    }
}

/** A file is a form-field consumer if it names one of the migrated symbols or imports the package. */
function referencesFormField(content: string): boolean {
    return (
        /\bKbq(FormField|Hint|Error|PasswordHint|ReactivePasswordHint|Cleaner|PasswordToggle|Stepper|Trim|A11yLocaleConfiguration)\b/.test(
            content
        ) ||
        /\b(mixinColor|CanColorCtor|PasswordRules|KBQ_FORM_FIELD_REF|regExpPasswordValidator|hasPasswordStrengthError|kbqA11yLocaleConfigurationProvider)\b/.test(
            content
        ) ||
        content.includes('@koobiq/components/form-field') ||
        content.includes('kbq-form-field') ||
        content.includes('kbq-cleaner')
    );
}

export default function formFieldSignals(options: Schema): Rule {
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

        const commit = (filePath: string, original: string, updated: string) => {
            if (updated === original) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, updated);
            } else {
                logMessage(context.logger, [`[${MIGRATION}] would update ${filePath} (run with --fix to apply)`]);
            }
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesFormField(original)) continue;

            logWarnings(context, filePath, original);
            warnReceiverMembers(context, filePath, original);

            let content = migrateTsExpressions(original, filePath);

            content = await migrateInlineTemplates(content, filePath);

            commit(filePath, original, content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            logWarnings(context, filePath, original);

            const { content, changed } = await migrateTemplate(original);

            if (changed) commit(filePath, original, content);
        }

        for (const filePath of stylePaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            commit(filePath, original, migrateStyles(original));
        }

        logMessage(context.logger, [
            `[${MIGRATION}] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

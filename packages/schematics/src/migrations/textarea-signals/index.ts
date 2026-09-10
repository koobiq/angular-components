import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    SIGNAL_API_METHODS,
    SIGNAL_MEMBERS,
    SUMMARY,
    templateManualMessage,
    TEXTAREA_EXPORT_AS,
    TEXTAREA_PACKAGE,
    TEXTAREA_TYPE,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    VALUE_CHANGED_MEMBERS,
    valueChangedMessage,
    warnPatterns
} from './data';
import { Schema } from './schema';

const LABEL = '[textarea-signals]';
const TS_EXT = '.ts';
const HTML_EXT = '.html';

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A receiver whose static type is a textarea, valid within `[start, end]` of the source. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `textarea` or `this.textarea`. */
    text: string;
    start: number;
    end: number;
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

/** Whether a type annotation refers to `typeName`. */
function isTypeReference(type: ts.TypeNode | undefined, typeName: string): boolean {
    return !!type && ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName) && type.typeName.text === typeName;
}

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/**
 * Collects the receivers annotated with `typeName`, by explicit annotation only (no cross-package type
 * resolution): method/function params, class fields (incl. `@ViewChild(KbqTextarea) x: KbqTextarea` and constructor
 * parameter-properties) and typed locals.
 */
function collectReceivers(sourceFile: ts.SourceFile, typeName: string): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, scope: ts.Node) =>
        receivers.push({ text, start: scope.getStart(sourceFile), end: scope.getEnd() });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name) && isTypeReference(node.type, typeName)) {
            add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile);

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, owner);
            }
        } else if (
            ts.isPropertyDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            isTypeReference(node.type, typeName)
        ) {
            const owner = findAncestor(node, ts.isClassDeclaration);

            if (owner) add(`this.${node.name.text}`, owner);
        } else if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            isTypeReference(node.type, typeName)
        ) {
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

/** Binary operators that make their left operand a write target rather than a read. */
const ASSIGNMENT_OPERATORS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.AsteriskAsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken,
    ts.SyntaxKind.BarBarEqualsToken,
    ts.SyntaxKind.AmpersandAmpersandEqualsToken,
    ts.SyntaxKind.QuestionQuestionEqualsToken
]);

/** Unary operators that write their operand back. Every other prefix operator is a plain read. */
const INCREMENT_OPERATORS = new Set<ts.SyntaxKind>([ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken]);

/** Whether `node` sits on the left of a destructuring assignment, where it is written rather than read. */
function isDestructuringTarget(node: ts.Node): boolean {
    let current: ts.Node = node;

    while (
        ts.isPropertyAssignment(current.parent) ||
        ts.isShorthandPropertyAssignment(current.parent) ||
        ts.isSpreadAssignment(current.parent) ||
        ts.isSpreadElement(current.parent) ||
        ts.isObjectLiteralExpression(current.parent) ||
        ts.isArrayLiteralExpression(current.parent)
    ) {
        current = current.parent;
    }

    return (
        ts.isBinaryExpression(current.parent) &&
        current.parent.left === current &&
        ASSIGNMENT_OPERATORS.has(current.parent.operatorToken.kind)
    );
}

/** Classifies a matched property access and appends the resulting edit(s). */
function classifyAccess(node: ts.PropertyAccessExpression, edits: Edit[]): void {
    const parent = node.parent;

    // Already migrated: `x.maxRows()` — leave alone (idempotent).
    if (ts.isCallExpression(parent) && parent.expression === node) return;

    // Write target, in every shape. Each migrated member is an `input()` or a read-only `computed`, so a
    // write has no mechanical translation: it is left untouched and becomes the read-only error the
    // consumer fixes by hand. Appending `()` to it would produce unparseable TypeScript instead.
    if (ts.isBinaryExpression(parent) && parent.left === node && ASSIGNMENT_OPERATORS.has(parent.operatorToken.kind))
        return;

    // `x.maxRows++` / `--x.maxRows` and `delete x.maxRows` are writes too. Only the increment operators
    // count: a `PrefixUnaryExpression` is also how `!x.maxRowLimitReached` is spelled, and that is a read.
    if (ts.isPostfixUnaryExpression(parent) && parent.operand === node) return;
    if (ts.isPrefixUnaryExpression(parent) && parent.operand === node && INCREMENT_OPERATORS.has(parent.operator))
        return;
    if (ts.isDeleteExpression(parent)) return;
    if (isDestructuringTarget(node)) return;

    // Read (incl. optional chain `x?.maxRows`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/** Collects edits for every read/write of a value-safe signal member on a known textarea receiver. */
function collectAccessEdits(sourceFile: ts.SourceFile, receivers: Receiver[]): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            SIGNAL_MEMBERS.includes(node.name.text) &&
            inReceiverScope(node, sourceFile, receivers)
        ) {
            classifyAccess(node, edits);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** Collects the members read on a textarea receiver that need manual migration. */
function collectValueChangedAccess(sourceFile: ts.SourceFile, receivers: Receiver[]): Set<string> {
    const valueChanged = new Set<string>();

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            VALUE_CHANGED_MEMBERS.includes(node.name.text) &&
            inReceiverScope(node, sourceFile, receivers)
        ) {
            valueChanged.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return valueChanged;
}

/** Pass A — rewrite value-safe programmatic reads of textarea signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile, TEXTAREA_TYPE);

    if (receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, receivers);

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** Emits precise, receiver-scoped warnings for the members that can't be auto-fixed. */
function warnReceiverMembers(context: SchematicContext, filePath: string, content: string): void {
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile, TEXTAREA_TYPE);

    if (receivers.length === 0) return;

    const valueChanged = collectValueChangedAccess(sourceFile, receivers);

    if (valueChanged.size > 0) {
        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${valueChangedMessage(valueChanged)}`]);
    }
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { anchor, pattern, message } of warnPatterns) {
        if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
    }
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches `<ref>.<member>` where the access is neither already a call nor a signal-API call. A template can
 * only read these, so an assignment never needs excluding. The dot is matched with the whitespace around it
 * - Angular's expression grammar allows `t . maxRows` and a binding wrapped over two lines - and that
 * whitespace is captured so the rewrite keeps the layout.
 */
function memberAccessPattern(ref: string, members: readonly string[]): RegExp {
    const methods = [...SIGNAL_API_METHODS].join('|');

    return new RegExp(
        `\\b(${escapeRegExp(ref)})(\\s*\\.\\s*)(${members.join('|')})\\b(?!\\s*\\()(?!\\s*\\.\\s*(?:${methods})\\b)`,
        'g'
    );
}

/** Reference variables bound to the textarea: `#t="kbqTextarea"` on any element. */
class TemplateCollector implements Visitor {
    readonly refs = new Set<string>();

    visitElement(element: any): void {
        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string' || attr.value !== TEXTAREA_EXPORT_AS) continue;

            if (attr.name.startsWith('#')) this.refs.add(attr.name.slice(1));
            else if (attr.name.startsWith('ref-')) this.refs.add(attr.name.slice(4));
        }

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
}

interface TemplateResult {
    content: string;
    changed: boolean;
    /** Members read through a ref that the rewrite deliberately leaves alone. */
    manual: Set<string>;
    unparseable: boolean;
}

/** Pass B - rewrite reads through a textarea reference variable and report the ones that changed value. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    const untouched: TemplateResult = { content: template, changed: false, manual: new Set(), unparseable: false };

    if (!template.includes(TEXTAREA_EXPORT_AS)) return untouched;

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched, unparseable: true };

    const collector = new TemplateCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    const refs = [...collector.refs];

    if (refs.length === 0) return untouched;

    const manual = new Set<string>();
    let content = template;
    let changed = false;

    for (const ref of refs) {
        for (const match of template.matchAll(memberAccessPattern(ref, VALUE_CHANGED_MEMBERS))) {
            manual.add(match[3]);
        }

        const next = content.replace(memberAccessPattern(ref, SIGNAL_MEMBERS), '$1$2$3()');

        if (next !== content) {
            content = next;
            changed = true;
        }
    }

    return { content, changed, manual, unparseable: false };
}

/** Pass B (inline) - the same, inside inline component templates. */
async function migrateInlineTemplates(content: string, fileName: string): Promise<TemplateResult> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const manual = new Set<string>();
    let result = content;
    let changed = false;
    let unparseable = false;

    // Splice right-to-left so earlier offsets stay valid.
    for (const { start, end } of collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start)) {
        const migrated = await migrateTemplate(result.slice(start, end));

        migrated.manual.forEach((member) => manual.add(member));
        unparseable ||= migrated.unparseable;

        if (migrated.changed) {
            result = result.slice(0, start) + migrated.content + result.slice(end);
            changed = true;
        }
    }

    return { content: result, changed, manual, unparseable };
}

/**
 * A `.ts` file is a textarea consumer if it names any of the exported symbols or imports the package. There
 * is no element to look for: `kbqTextarea` is an attribute on a native `<textarea>`.
 */
function referencesTextarea(content: string): boolean {
    return /\bKbqTextarea\w*\b/.test(content) || content.includes(TEXTAREA_PACKAGE);
}

export default function textareaSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` runs a migration with no options at all, and `migrations.json` declares no schema, so
        // the schema default never reaches the rule: without this the migration would only ever report.
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
        let consumers = 0;

        const commit = (filePath: string, original: string, updated: string) => {
            if (updated === original) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, updated);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        };

        const report = (filePath: string, message: string) =>
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesTextarea(original)) continue;

            consumers++;

            logWarnings(context, filePath, original);
            warnReceiverMembers(context, filePath, original);

            const inline = await migrateInlineTemplates(migrateTsExpressions(original, filePath), filePath);

            if (inline.manual.size > 0) report(filePath, templateManualMessage(inline.manual));
            if (inline.unparseable) report(filePath, UNPARSEABLE_TEMPLATE_MESSAGE);

            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const migrated = await migrateTemplate(original);

            if (!migrated.changed && migrated.manual.size === 0 && !migrated.unparseable) continue;

            consumers++;

            if (migrated.manual.size > 0) report(filePath, templateManualMessage(migrated.manual));
            if (migrated.unparseable) report(filePath, UNPARSEABLE_TEMPLATE_MESSAGE);

            commit(filePath, original, migrated.content);
        }

        // Nothing here uses the textarea, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

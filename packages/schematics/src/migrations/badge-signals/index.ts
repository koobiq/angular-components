import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    BADGE_ELEMENT,
    BADGE_PACKAGE,
    BADGE_TYPE,
    PROTECTED_MEMBERS,
    SIGNAL_MEMBERS,
    STYLER_PRIVATE_MEMBERS,
    STYLER_TYPE,
    SUMMARY,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    UNRESOLVED_RECEIVER_MESSAGE,
    VALUE_CHANGED_MEMBERS,
    warnPatterns,
    WRITABLE_MEMBERS
} from './data';
import { Schema } from './schema';

const LABEL = '[badge-signals]';
const TS_EXT = '.ts';
const HTML_EXT = '.html';

/** A half-open `[start, end)` span of the source being rewritten. */
interface Range {
    start: number;
    end: number;
}

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit extends Range {
    text: string;
}

/** A receiver whose static type is a badge, valid within `scope`. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `badge` or `this.badge`. */
    text: string;
    /** The node whose subtree the receiver name is visible in. */
    scope: ts.Node;
    /** The declaration `text` resolves to. A nested redeclaration of the same name resolves elsewhere. */
    declaration: ts.Node;
}

/** A name introduced by a declaration, together with the scope it is visible in. */
interface Binding {
    name: string;
    declaration: ts.Node;
    scope: ts.Node;
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

/** Walks up from `node` to the nearest ancestor matching `predicate`. */
function findAncestor(node: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node | undefined {
    let current = node.parent;

    while (current) {
        if (predicate(current)) return current;
        current = current.parent;
    }

    return undefined;
}

/**
 * Nodes that open a new binding scope. `ts.isFunctionLike` rather than a hand-rolled list, so a
 * `MethodSignature` or a `FunctionTypeNode` bounds a parameter's scope too instead of leaking it to the
 * whole file. Blocks and loops are included because `let`/`const` are block-scoped.
 */
const opensScope = (node: ts.Node): boolean =>
    ts.isFunctionLike(node) ||
    ts.isBlock(node) ||
    ts.isCaseBlock(node) ||
    ts.isModuleBlock(node) ||
    ts.isForStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isCatchClause(node) ||
    ts.isClassLike(node) ||
    ts.isSourceFile(node);

/** Nodes that rebind `this`, so `this.badge` inside them is a different object. Arrows and methods don't. */
const rebindsThis = (node: ts.Node): boolean =>
    ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isClassLike(node);

/** Whether `node` sits inside `scope` without crossing a `barrier` node on the way up. */
function reachesScope(node: ts.Node, scope: ts.Node, barrier: (node: ts.Node) => boolean): boolean {
    let current: ts.Node | undefined = node.parent;

    while (current && current !== scope) {
        if (barrier(current)) return false;
        current = current.parent;
    }

    return current === scope;
}

/** Whether a type annotation refers to `typeName` directly (not through a union, array or type argument). */
function isTypeReference(type: ts.TypeNode | undefined, typeName: string): boolean {
    return !!type && ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName) && type.typeName.text === typeName;
}

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/** Every value declaration that introduces a plain identifier, with the scope it is visible in. */
function collectBindings(sourceFile: ts.SourceFile): Binding[] {
    const bindings: Binding[] = [];
    const add = (name: string, declaration: ts.Node, scope: ts.Node | undefined) =>
        bindings.push({ name, declaration, scope: scope ?? sourceFile });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
            add(node.name.text, node, findAncestor(node, ts.isFunctionLike));
        } else if ((ts.isVariableDeclaration(node) || ts.isBindingElement(node)) && ts.isIdentifier(node.name)) {
            add(node.name.text, node, findAncestor(node, opensScope));
        } else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
            add(node.name.text, node, findAncestor(node, opensScope));
        } else if ((ts.isImportSpecifier(node) || ts.isImportClause(node)) && node.name) {
            add(node.name.text, node, sourceFile);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return bindings;
}

/** The declaration `name` binds to at `pos`: the innermost enclosing scope that declares it. */
function resolveBinding(bindings: Binding[], name: string, pos: number): ts.Node | undefined {
    let best: Binding | undefined;
    let bestWidth = Number.POSITIVE_INFINITY;

    for (const binding of bindings) {
        if (binding.name !== name) continue;

        const start = binding.scope.getStart();
        const end = binding.scope.getEnd();

        if (pos < start || pos > end) continue;

        const width = end - start;

        if (width < bestWidth) {
            best = binding;
            bestWidth = width;
        }
    }

    return best?.declaration;
}

/**
 * Collects the receivers annotated with `typeName`, by explicit annotation only (no cross-package type
 * resolution): method/function params, class fields (incl. `@ViewChild(KbqBadge) x: KbqBadge` and constructor
 * parameter-properties) and typed locals. Annotations that resolve are recorded in `resolved`, so the caller
 * can report the `KbqBadge` mentions this pass could not turn into a receiver.
 */
function collectReceivers(sourceFile: ts.SourceFile, typeName: string, resolved?: Set<ts.Node>): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, declaration: ts.Node, scope: ts.Node | undefined) =>
        receivers.push({ text, declaration, scope: scope ?? sourceFile });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name) && isTypeReference(node.type, typeName)) {
            resolved?.add(node.type!);
            add(node.name.text, node, findAncestor(node, ts.isFunctionLike));

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, node, owner);
            }
        } else if (
            ts.isPropertyDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            isTypeReference(node.type, typeName)
        ) {
            const owner = findAncestor(node, ts.isClassDeclaration);

            if (owner) {
                resolved?.add(node.type!);
                add(`this.${node.name.text}`, node, owner);
            }
        } else if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            isTypeReference(node.type, typeName)
        ) {
            resolved?.add(node.type!);
            add(node.name.text, node, findAncestor(node, opensScope));
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return receivers;
}

/**
 * 1-based lines where `KbqBadge` is named in a type position `collectReceivers` could not resolve: a union,
 * an array, a type argument (`QueryList<KbqBadge>`), a cast or a return type.
 */
function collectUnresolvedMentions(sourceFile: ts.SourceFile, resolved: Set<ts.Node>): number[] {
    const lines = new Set<number>();

    const visit = (node: ts.Node): void => {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            node.typeName.text === BADGE_TYPE &&
            !resolved.has(node)
        ) {
            lines.add(sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return [...lines].sort((a, b) => a - b);
}

/** Whether a property access on a receiver resolves to that receiver at this exact position. */
function inReceiverScope(
    node: ts.PropertyAccessExpression,
    sourceFile: ts.SourceFile,
    receivers: Receiver[],
    bindings: Binding[]
): boolean {
    const receiverText = node.expression.getText(sourceFile);
    const start = node.getStart(sourceFile);

    return receivers.some((receiver) => {
        if (receiver.text !== receiverText) return false;

        // For `this.badge`, a nested `function` or class changes what `this` is; a method or arrow does not.
        // For a bare `badge`, a nested redeclaration of the same name shadows the receiver.
        if (receiver.text.startsWith('this.')) return reachesScope(node, receiver.scope, rebindsThis);

        return (
            reachesScope(node, receiver.scope, () => false) &&
            resolveBinding(bindings, receiver.text, start) === receiver.declaration
        );
    });
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
function classifyAccess(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, edits: Edit[]): void {
    const parent = node.parent;

    // Already migrated: `x.compact()` (call) or `x.compact.set(...)` — leave alone (idempotent).
    if (ts.isCallExpression(parent) && parent.expression === node) return;
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && parent.name.text === 'set') return;

    // Write target: `x.compact = RHS` and every compound form (`+=`, `||=`, …). Every KbqBadge signal member
    // is `input()` (read-only), so there is no writable member — the write is left untouched and becomes a
    // compile error the consumer fixes by hand. Appending `()` here would produce unparseable TypeScript.
    if (ts.isBinaryExpression(parent) && parent.left === node && ASSIGNMENT_OPERATORS.has(parent.operatorToken.kind)) {
        if (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && WRITABLE_MEMBERS.has(node.name.text)) {
            const rhs = parent.right;

            edits.push({ start: node.getEnd(), end: rhs.getStart(sourceFile), text: '.set(' });
            edits.push({ start: rhs.getEnd(), end: rhs.getEnd(), text: ')' });
        }

        return;
    }

    // `x.compact++` / `--x.compact` and `delete x.compact` are writes too, for the same reason.
    if ((ts.isPostfixUnaryExpression(parent) || ts.isPrefixUnaryExpression(parent)) && parent.operand === node) return;
    if (ts.isDeleteExpression(parent)) return;

    // A destructuring assignment target: `({ a: x.compact } = source)`, `[x.compact] = source`.
    if (isDestructuringTarget(node)) return;

    // Read (incl. optional chain `x?.compact`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/** Collects edits for every read/write of a value-safe signal member on a known badge receiver. */
function collectAccessEdits(sourceFile: ts.SourceFile, receivers: Receiver[], bindings: Binding[]): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            SIGNAL_MEMBERS.includes(node.name.text) &&
            inReceiverScope(node, sourceFile, receivers, bindings)
        ) {
            classifyAccess(node, sourceFile, edits);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** Distinct member names accessed on a badge receiver that need manual migration. */
interface ReceiverWarnings {
    valueChanged: Set<string>;
    protectedAccess: Set<string>;
    stylerAccess: Set<string>;
    /** Lines naming `KbqBadge` in a type position no receiver could be scoped to. */
    unresolved: number[];
}

/** Collects the members read on a badge or styler receiver that no consumer can keep reading as-is. */
function collectReceiverWarnings(sourceFile: ts.SourceFile): ReceiverWarnings {
    const valueChanged = new Set<string>();
    const protectedAccess = new Set<string>();
    const stylerAccess = new Set<string>();

    const resolved = new Set<ts.Node>();
    const bindings = collectBindings(sourceFile);
    const badgeReceivers = collectReceivers(sourceFile, BADGE_TYPE, resolved);
    const stylerReceivers = collectReceivers(sourceFile, STYLER_TYPE);

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
            const name = node.name.text;

            if (inReceiverScope(node, sourceFile, badgeReceivers, bindings)) {
                if (VALUE_CHANGED_MEMBERS.includes(name)) valueChanged.add(name);
                else if (PROTECTED_MEMBERS.includes(name)) protectedAccess.add(name);
            }

            if (STYLER_PRIVATE_MEMBERS.includes(name) && inReceiverScope(node, sourceFile, stylerReceivers, bindings)) {
                stylerAccess.add(name);
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { valueChanged, protectedAccess, stylerAccess, unresolved: collectUnresolvedMentions(sourceFile, resolved) };
}

/** Pass A — rewrite value-safe programmatic reads of badge signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile, BADGE_TYPE);

    if (receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, receivers, collectBindings(sourceFile));

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

const VALUE_CHANGED_MESSAGE = [
    '`badgeColor` is now a read-only InputSignal — read it as `badge.badgeColor()`. Its value also',
    'changed: the getter used to return the CSS class `kbq-badge_<color>`, it now reports the raw color',
    '(e.g. `error`). Programmatic writes (`badge.badgeColor = …`) are no longer possible — bind',
    '`[badgeColor]` in the template instead. Migrate this by hand.'
];

const protectedMessage = (members: Iterable<string>) =>
    `These KbqBadge members are gone: ${[...members].join(', ')}. \`iconItem\` was a content query the badge ` +
    `itself never read, so there is nothing behind it to reach for.`;

/** Emits precise, receiver-scoped warnings for the members that can't be auto-fixed. */
function warnReceiverMembers(context: SchematicContext, filePath: string, content: string): void {
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const { valueChanged, protectedAccess, stylerAccess, unresolved } = collectReceiverWarnings(sourceFile);

    if (valueChanged.size > 0) {
        logMessage(context.logger, [`${LABEL} ${filePath}`, ...VALUE_CHANGED_MESSAGE.map((line) => `  ${line}`)]);
    }

    if (protectedAccess.size > 0) {
        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${protectedMessage(protectedAccess)}`]);
    }

    if (stylerAccess.size > 0) {
        logMessage(context.logger, [
            `${LABEL} ${filePath}`,
            `  These KbqBadgeCssStyler members are now \`private\`: ${[...stylerAccess].join(', ')}. The directive ` +
                `applies the icon spacing classes on its own — there is nothing left to drive from outside.`
        ]);
    }

    if (unresolved.length > 0) {
        logMessage(context.logger, [
            `${LABEL} ${filePath}`,
            `  ${UNRESOLVED_RECEIVER_MESSAGE} ${unresolved.join(', ')}.`
        ]);
    }
}

/** Attribute-name prefixes that mark the value as an Angular expression rather than a literal. */
const BINDING_PREFIX = /^(?:\[|\(|\*|bind-|bind(?:on)?-|on-)/;

/**
 * Walks a template's HTML AST, collecting what the rewrite needs: the reference variables bound to a
 * `<kbq-badge>`, the source ranges that actually hold Angular expressions, and every other name the
 * template introduces (so a `@for` variable or a foreign `#ref` sharing a badge ref's name is not rewritten).
 */
class TemplateScanner implements Visitor {
    readonly badgeRefs = new Set<string>();
    readonly otherNames = new Set<string>();
    readonly expressions: Range[] = [];

    constructor(private readonly template: string) {}

    visitElement(element: any): void {
        const isBadge = element.name === BADGE_ELEMENT;

        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string') continue;

            const reference = this.referenceName(attr.name);

            if (reference !== undefined) {
                (isBadge ? this.badgeRefs : this.otherNames).add(reference);
                continue;
            }

            // `let-item` on an <ng-template> introduces a name the badge refs must not collide with.
            if (attr.name.startsWith('let-')) {
                this.otherNames.add(attr.name.slice(4));
                continue;
            }

            this.collectAttributeExpression(attr);
        }

        this.visitChildren(element);
    }

    visitBlock(block: any): void {
        for (const parameter of block.parameters ?? []) {
            const span = parameter.sourceSpan;

            if (!span) continue;

            this.expressions.push({ start: span.start.offset, end: span.end.offset });

            // `@for (badge of badges; track badge)` and `@if (x; as y)` introduce names of their own.
            for (const match of String(parameter.expression ?? '').matchAll(
                /(?:^\s*|\b(?:as|let)\s+)([A-Za-z_$][\w$]*)\s*(?:\bof\b|\bin\b|=|$)/g
            )) {
                this.otherNames.add(match[1]);
            }
        }

        this.visitChildren(block);
    }

    visitText(text: any): void {
        const span = text.sourceSpan;

        if (span) this.collectInterpolations(span.start.offset, span.end.offset);
    }

    visitLetDeclaration(decl: any): void {
        if (decl.name) this.otherNames.add(decl.name);

        const span = decl.valueSpan ?? decl.sourceSpan;

        if (span) this.expressions.push({ start: span.start.offset, end: span.end.offset });
    }

    /** `#ref` / `ref-ref`, or `undefined` when the attribute is not a reference variable. */
    private referenceName(name: string): string | undefined {
        if (name.startsWith('#')) return name.slice(1);
        if (name.startsWith('ref-')) return name.slice(4);

        return undefined;
    }

    private collectAttributeExpression(attr: any): void {
        const span = attr.valueSpan;

        if (!span) return;

        const start = span.start.offset;
        const end = span.end.offset;

        // A binding's whole value is an expression; a plain attribute only holds interpolations.
        if (BINDING_PREFIX.test(attr.name)) this.expressions.push({ start, end });
        else this.collectInterpolations(start, end);
    }

    private collectInterpolations(start: number, end: number): void {
        for (const match of this.template.slice(start, end).matchAll(/\{\{([\s\S]*?)\}\}/g)) {
            const from = start + match.index + 2;

            this.expressions.push({ start: from, end: from + match[1].length });
        }
    }

    private visitChildren(node: any): void {
        for (const child of node.children ?? []) {
            child.visit(this);
        }
    }

    visitAttribute(): void {}
    visitComment(): void {}
    visitExpansion(): void {}
    visitExpansionCase(): void {}
    visitBlockParameter(): void {}
}

/**
 * Matches `<ref>.<member>` inside an expression. The lookbehind rejects `item.badge.compact`, where `\b`
 * alone would happily match `badge` after the dot; the two lookahead groups skip an already-migrated call
 * and an assignment target, whose left side must not gain a `()`.
 */
function memberAccessPattern(ref: string): RegExp {
    return new RegExp(
        `(?<![\\w$.])(${escapeRegExp(ref)})(\\??\\.)(${SIGNAL_MEMBERS.join('|')})\\b(?!\\s*\\()(?!\\s*=(?!=))`,
        'g'
    );
}

/**
 * Rewrites `ref.member` reads to `ref.member()`, only inside the given expression ranges. Restricting the
 * rewrite to expressions is what keeps prose, comments and attribute names out of it.
 */
function rewriteRefReads(
    template: string,
    refs: string[],
    expressions: Range[]
): { content: string; changed: boolean } {
    const edits: Edit[] = [];

    for (const { start, end } of expressions) {
        const source = template.slice(start, end);

        for (const ref of refs) {
            for (const match of source.matchAll(memberAccessPattern(ref))) {
                const at = start + match.index + match[0].length;

                edits.push({ start: at, end: at, text: '()' });
            }
        }
    }

    return edits.length > 0
        ? { content: applyEdits(template, edits), changed: true }
        : { content: template, changed: false };
}

/** Members read through a badge reference variable that no template can keep reading as-is. */
function collectRefManualMembers(template: string, refs: string[], expressions: Range[]): Set<string> {
    const members = [...VALUE_CHANGED_MEMBERS, ...PROTECTED_MEMBERS];
    const found = new Set<string>();

    for (const { start, end } of expressions) {
        const source = template.slice(start, end);

        for (const ref of refs) {
            const pattern = new RegExp(`(?<![\\w$.])${escapeRegExp(ref)}\\??\\.(${members.join('|')})\\b`, 'g');

            for (const match of source.matchAll(pattern)) {
                found.add(match[1]);
            }
        }
    }

    return found;
}

interface TemplateResult {
    content: string;
    changed: boolean;
    /** Members read through a badge ref that need a hand migration. */
    manual: Set<string>;
    /** The template renders the badge but could not be parsed, so nothing in it was inspected. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({
    content: template,
    changed: false,
    manual: new Set(),
    unparseable: false
});

/** Pass B (core) — parse a template, discover badge refs, rewrite their value-safe signal reads. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    if (!template.includes(BADGE_ELEMENT)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const scanner = new TemplateScanner(template);

    visitAll(scanner, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    // A ref whose name is also introduced by a `@for`, an `@let` or a foreign `#ref` is ambiguous: the
    // reads could belong to either, so neither is rewritten.
    const refs = [...scanner.badgeRefs].filter((ref) => !scanner.otherNames.has(ref));

    if (refs.length === 0) return untouched(template);

    return {
        ...rewriteRefReads(template, refs, scanner.expressions),
        manual: collectRefManualMembers(template, refs, scanner.expressions),
        unparseable: false
    };
}

/** Pass B (inline) — rewrite badge ref reads inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; manual: Set<string>; unparseable: boolean }> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    const manual = new Set<string>();
    let result = content;
    let unparseable = false;

    for (const { start, end } of ranges) {
        const outcome = await migrateTemplate(result.slice(start, end));

        for (const member of outcome.manual) manual.add(member);

        unparseable ||= outcome.unparseable;

        if (outcome.changed) {
            result = result.slice(0, start) + outcome.content + result.slice(end);
        }
    }

    return { content: result, manual, unparseable };
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { anchor, pattern, message } of warnPatterns) {
        if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
    }
}

/** Reports the members a template reads through a badge ref that the rewrite deliberately left alone. */
function warnTemplateMembers(context: SchematicContext, filePath: string, manual: Set<string>): void {
    if (manual.size === 0) return;

    const messages = [`${LABEL} ${filePath}`];

    if (VALUE_CHANGED_MEMBERS.some((member) => manual.has(member))) {
        messages.push(...VALUE_CHANGED_MESSAGE.map((line) => `  ${line}`));
    }

    const gone = PROTECTED_MEMBERS.filter((member) => manual.has(member));

    if (gone.length > 0) messages.push(`  ${protectedMessage(gone)}`);

    logMessage(context.logger, messages);
}

/**
 * A `.ts` file is a badge consumer if it names any of the exported symbols, imports the package, or renders
 * the element in an inline template — a component that only imports `KbqBadgeModule` names none of the types.
 */
function referencesBadge(content: string): boolean {
    return /\bKbqBadge\w*\b/.test(content) || content.includes(BADGE_PACKAGE) || content.includes(`<${BADGE_ELEMENT}`);
}

export default function badgeSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` runs the migration without a schema, so `fix` arrives undefined: default it to on,
        // otherwise the update would report what it would change and write nothing.
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

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesBadge(original)) continue;

            consumers++;

            logWarnings(context, filePath, original);
            warnReceiverMembers(context, filePath, original);

            const content = migrateTsExpressions(original, filePath);
            const inline = await migrateInlineTemplates(content, filePath);

            warnTemplateMembers(context, filePath, inline.manual);

            if (inline.unparseable) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);
            }

            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !original.includes(`<${BADGE_ELEMENT}`)) continue;

            consumers++;

            const outcome = await migrateTemplate(original);

            warnTemplateMembers(context, filePath, outcome.manual);

            if (outcome.unparseable) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);
            }

            commit(filePath, original, outcome.content);
        }

        // Nothing here uses the badge, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

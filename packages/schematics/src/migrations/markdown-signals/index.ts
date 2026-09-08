import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    MARKDOWN_ELEMENT,
    MARKDOWN_PACKAGE,
    MARKDOWN_TYPE,
    SIGNAL_API_METHODS,
    SIGNAL_MEMBERS,
    signalQueryMessage,
    SUMMARY,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    UNRESOLVED_RECEIVER_MESSAGE,
    warnPatterns
} from './data';
import { Schema } from './schema';

const LABEL = '[markdown-signals]';
const TS_EXT = '.ts';
const HTML_EXT = '.html';

/** Factories whose single argument gives the type of the declaration they set up. */
const TYPING_FACTORIES: ReadonlySet<string> = new Set(['inject', 'viewChild', 'contentChild']);

/** A half-open `[start, end)` span of the source being rewritten. */
interface Range {
    start: number;
    end: number;
}

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit extends Range {
    text: string;
}

/** A receiver whose static type is a markdown component, valid within `scope`. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `markdown` or `this.markdown`. */
    text: string;
    /** The node whose subtree the receiver name is visible in. */
    scope: ts.Node;
    /** The declaration `text` resolves to. A nested redeclaration of the same name resolves elsewhere. */
    declaration: ts.Node;
    /** Whether the receiver is a signal query, so reads through it need two calls rather than one. */
    signalQuery: boolean;
    /** Whether that query is `.required`, which decides whether the safe read needs a `?.`. */
    required: boolean;
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
 * Nodes that open a new binding scope. `ts.isFunctionLike` rather than a hand-rolled list of declarations,
 * so a parameter of a `FunctionTypeNode` or a `MethodSignature` is bounded by its type instead of falling
 * back to the whole file. Blocks and loops are included because `let`/`const` are block-scoped.
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

/** Nodes that rebind `this`, so `this.markdown` inside them is a different object. Arrows don't. */
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

/** Whether a type annotation names one of `typeNames` directly (not through a union or type argument). */
function isTypeReference(type: ts.TypeNode | undefined, typeNames: string[]): boolean {
    return (
        !!type &&
        ts.isTypeReferenceNode(type) &&
        ts.isIdentifier(type.typeName) &&
        typeNames.includes(type.typeName.text)
    );
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

/** Local names `KbqMarkdown` is bound to in this file, including aliased imports. */
function localTypeNames(sourceFile: ts.SourceFile): string[] {
    const names = new Set<string>([MARKDOWN_TYPE]);

    const visit = (node: ts.Node): void => {
        if (ts.isImportSpecifier(node) && (node.propertyName?.text ?? node.name.text) === MARKDOWN_TYPE) {
            names.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return [...names];
}

/**
 * The markdown-ness of an initializer, for the shapes a modern Angular consumer writes:
 * `inject(KbqMarkdown)`, `viewChild(KbqMarkdown)`, `viewChild.required(…)`, `contentChild(…)`.
 */
function initializerTypeOf(
    initializer: ts.Expression | undefined,
    typeNames: string[]
): { markdown: boolean; signalQuery: boolean; required: boolean } {
    const none = { markdown: false, signalQuery: false, required: false };

    if (!initializer || !ts.isCallExpression(initializer)) return none;

    const callee = initializer.expression;
    const qualified = ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression);
    const name = ts.isIdentifier(callee) ? callee.text : qualified ? callee.expression.text : undefined;

    if (!name || !TYPING_FACTORIES.has(name)) return none;

    const [arg] = initializer.arguments;

    if (!arg || !ts.isIdentifier(arg) || !typeNames.includes(arg.text)) return none;

    // `viewChild.required(...)` is `Signal<KbqMarkdown>`; the bare form is `Signal<KbqMarkdown | undefined>`.
    const required = qualified && (callee as ts.PropertyAccessExpression).name.text === 'required';

    return { markdown: true, signalQuery: name !== 'inject', required };
}

/**
 * Collects the markdown receivers: method/function params, class fields (incl.
 * `@ViewChild(KbqMarkdown) x: KbqMarkdown`, constructor parameter-properties and the `inject()` /
 * `viewChild()` initializer forms) and typed locals. Annotations that resolve are recorded in `resolved`,
 * so the caller can report the mentions this pass could not turn into a receiver.
 */
function collectReceivers(sourceFile: ts.SourceFile, typeNames: string[], resolved?: Set<ts.Node>): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (
        text: string,
        declaration: ts.Node,
        scope: ts.Node | undefined,
        signalQuery = false,
        required = false
    ) => receivers.push({ text, declaration, scope: scope ?? sourceFile, signalQuery, required });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name) && isTypeReference(node.type, typeNames)) {
            resolved?.add(node.type!);
            add(node.name.text, node, findAncestor(node, ts.isFunctionLike));

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, node, owner);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
            const owner = findAncestor(node, ts.isClassDeclaration);
            const annotated = isTypeReference(node.type, typeNames);
            const { markdown, signalQuery, required } = initializerTypeOf(node.initializer, typeNames);

            if (owner && (annotated || markdown)) {
                if (annotated) resolved?.add(node.type!);
                add(`this.${node.name.text}`, node, owner, signalQuery, required);
            }
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const annotated = isTypeReference(node.type, typeNames);
            const { markdown, signalQuery, required } = initializerTypeOf(node.initializer, typeNames);

            if (annotated || markdown) {
                if (annotated) resolved?.add(node.type!);
                add(node.name.text, node, findAncestor(node, opensScope), signalQuery, required);
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return receivers;
}

/** Strips the wrappers that do not change which object an access reads from. */
function unwrapReceiver(node: ts.Expression): ts.Expression {
    let current = node;

    while (ts.isNonNullExpression(current) || ts.isParenthesizedExpression(current)) {
        current = current.expression;
    }

    return current;
}

/** The receiver a property access resolves to at this exact position, if any. */
function resolveReceiver(
    expression: ts.Expression,
    at: ts.Node,
    sourceFile: ts.SourceFile,
    receivers: Receiver[],
    bindings: Binding[]
): Receiver | undefined {
    const inner = unwrapReceiver(expression);
    // `this . markdown` and `this /* x */ . markdown` spell the same receiver as `this.markdown`.
    const text = ts.isPropertyAccessExpression(inner)
        ? `${inner.expression.getText(sourceFile).replace(/\s+/g, '')}.${inner.name.text}`
        : inner.getText(sourceFile);

    return receivers.find((receiver) => {
        if (receiver.text !== text) return false;

        // For `this.markdown`, a nested `function` or class changes what `this` is; an arrow does not.
        // For a bare `markdown`, a nested redeclaration of the same name shadows the receiver.
        if (receiver.text.startsWith('this.')) return reachesScope(at, receiver.scope, rebindsThis);

        return (
            reachesScope(at, receiver.scope, () => false) &&
            resolveBinding(bindings, receiver.text, at.getStart(sourceFile)) === receiver.declaration
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
function classifyAccess(node: ts.PropertyAccessExpression, edits: Edit[]): void {
    const parent = node.parent;

    // Already migrated: `x.markdownText()` (call) or the signal API on it.
    if (ts.isCallExpression(parent) && parent.expression === node) return;
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && SIGNAL_API_METHODS.has(parent.name.text))
        return;

    // Write target: `x.markdownText = RHS` and every compound form (`+=`, `??=`, …). `markdownText` is an
    // `input()`, so there is no writable half: the write is left untouched and becomes the compile error the
    // consumer fixes by hand. Appending `()` would produce unparseable TypeScript instead.
    if (ts.isBinaryExpression(parent) && parent.left === node && ASSIGNMENT_OPERATORS.has(parent.operatorToken.kind))
        return;

    // `x.markdownText++` / `--x.markdownText` and `delete x.markdownText` are writes too.
    if ((ts.isPostfixUnaryExpression(parent) || ts.isPrefixUnaryExpression(parent)) && parent.operand === node) return;
    if (ts.isDeleteExpression(parent)) return;
    if (isDestructuringTarget(node)) return;

    // Read (incl. optional chain `x?.markdownText`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/** A read through a signal query, which the rewrite leaves alone and the caller reports instead. */
interface SignalQueryRead {
    member: string;
    required: boolean;
}

/** Collects edits for every read of a signal member on a known markdown receiver. */
function collectAccessEdits(
    sourceFile: ts.SourceFile,
    receivers: Receiver[],
    bindings: Binding[]
): { edits: Edit[]; signalQueryReads: SignalQueryRead[] } {
    const edits: Edit[] = [];
    const signalQueryReads: SignalQueryRead[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            SIGNAL_MEMBERS.includes(node.name.text)
        ) {
            const receiver = resolveReceiver(node.expression, node, sourceFile, receivers, bindings);

            if (receiver) {
                // A signal query holds the component behind a call of its own, so the read is
                // `query().markdownText()`. Appending one `()` would be wrong in both halves, so the read is
                // reported instead - from here rather than a regex, so an aliased import is covered too.
                if (receiver.signalQuery) {
                    signalQueryReads.push({ member: node.name.text, required: receiver.required });
                } else {
                    classifyAccess(node, edits);
                }
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { edits, signalQueryReads };
}

/**
 * 1-based lines where `KbqMarkdown` is named in a position `collectReceivers` cannot resolve - a union, an
 * array, a `QueryList<…>`, a cast, a return type - plus the reads the access pass structurally cannot
 * reach: `markdown['markdownText']` and `const { markdownText } = markdown`.
 */
function collectUnresolvedMentions(
    sourceFile: ts.SourceFile,
    resolved: Set<ts.Node>,
    typeNames: string[],
    receivers: Receiver[],
    bindings: Binding[]
): number[] {
    const lines = new Set<number>();
    const report = (node: ts.Node) =>
        lines.add(sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1);
    const isReceiver = (expression: ts.Expression, at: ts.Node) =>
        !!resolveReceiver(expression, at, sourceFile, receivers, bindings);

    const visit = (node: ts.Node): void => {
        if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && typeNames.includes(node.typeName.text)) {
            if (!resolved.has(node)) report(node);
        } else if (
            ts.isElementAccessExpression(node) &&
            ts.isStringLiteralLike(node.argumentExpression) &&
            SIGNAL_MEMBERS.includes(node.argumentExpression.text) &&
            isReceiver(node.expression, node)
        ) {
            report(node);
        } else if (
            ts.isVariableDeclaration(node) &&
            ts.isObjectBindingPattern(node.name) &&
            node.initializer &&
            isReceiver(node.initializer, node) &&
            node.name.elements.some((element) =>
                SIGNAL_MEMBERS.includes((element.propertyName ?? element.name).getText(sourceFile))
            )
        ) {
            report(node);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return [...lines].sort((a, b) => a - b);
}

/** Pass A — rewrite programmatic reads of markdown signal members in TypeScript code. */
function migrateTsExpressions(
    content: string,
    fileName: string
): { content: string; unresolved: number[]; signalQueryReads: SignalQueryRead[] } {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const typeNames = localTypeNames(sourceFile);
    const resolved = new Set<ts.Node>();
    const receivers = collectReceivers(sourceFile, typeNames, resolved);
    const bindings = collectBindings(sourceFile);
    const unresolved = collectUnresolvedMentions(sourceFile, resolved, typeNames, receivers, bindings);

    if (receivers.length === 0) return { content, unresolved, signalQueryReads: [] };

    const { edits, signalQueryReads } = collectAccessEdits(sourceFile, receivers, bindings);

    return { content: edits.length > 0 ? applyEdits(content, edits) : content, unresolved, signalQueryReads };
}

/** Attribute-name prefixes that mark the value as an Angular expression rather than a literal. */
const BINDING_PREFIX = /^(?:\[|\(|\*|bind-|bind(?:on)?-|on-)/;

/** A markdown reference variable, valid only within the embedded view that declares it. */
interface TemplateRef extends Range {
    name: string;
}

/**
 * Walks a template's HTML AST, collecting what the rewrite needs: the reference variables bound to a
 * `<kbq-markdown>`, the source ranges that actually hold Angular expressions, and every other name the
 * template introduces (so a `@for` variable sharing a ref's name is not rewritten).
 *
 * Confining the rewrite to expression ranges matters more here than in the sibling migrations: the
 * component renders its own projected text, so a raw-text rewrite would edit the prose the user reads.
 */
class TemplateScanner implements Visitor {
    readonly markdownRefs: TemplateRef[] = [];
    readonly otherNames = new Set<string>();
    readonly expressions: Range[] = [];

    /** The embedded view currently being walked; a ref declared in it is invisible outside. */
    private view: Range;

    constructor(private readonly template: string) {
        this.view = { start: 0, end: template.length };
    }

    visitElement(element: any): void {
        const isMarkdown = element.name === MARKDOWN_ELEMENT;

        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string') continue;

            const reference = this.referenceName(attr.name);

            if (reference !== undefined) {
                // `#md="cdkOverlayOrigin"` names a directive on the element, not the component itself.
                const exportsMarkdown = !attr.value || attr.value === 'kbqMarkdown';

                if (isMarkdown && exportsMarkdown) this.markdownRefs.push({ name: reference, ...this.view });
                else this.otherNames.add(reference);

                continue;
            }

            // `let-item` on an <ng-template> introduces a name the refs must not collide with.
            if (attr.name.startsWith('let-')) {
                this.otherNames.add(attr.name.slice(4));
                continue;
            }

            this.collectAttributeExpression(attr);
        }

        this.inView(element.name === 'ng-template' ? element.sourceSpan : undefined, () => this.visitChildren(element));
    }

    visitBlock(block: any): void {
        for (const parameter of block.parameters ?? []) {
            const span = parameter.sourceSpan;

            if (!span) continue;

            this.expressions.push({ start: span.start.offset, end: span.end.offset });

            // `@for (note of notes; track note)` and `@if (x; as y)` introduce names of their own.
            for (const match of String(parameter.expression ?? '').matchAll(
                /(?:^\s*|\b(?:as|let)\s+)([A-Za-z_$][\w$]*)\s*(?:\bof\b|\bin\b|=|$)/g
            )) {
                this.otherNames.add(match[1]);
            }
        }

        this.inView(block.sourceSpan, () => this.visitChildren(block));
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

    /** Runs `walk` with the embedded view narrowed to `span`, if the node opens one. */
    private inView(span: any, walk: () => void): void {
        if (!span) {
            walk();

            return;
        }

        const outer = this.view;

        this.view = { start: span.start.offset, end: span.end.offset };
        walk();
        this.view = outer;
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
 * Matches `<ref>.<member>` inside a template expression. The lookbehind rejects `state.md.markdownText`,
 * where `\b` alone matches after the dot, and admits a `$`-prefixed ref that `\b` never could. Angular's
 * grammar allows whitespace around the dot, so a binding wrapped over two lines is matched too. The
 * three groups skip an already-migrated read, a signal-API call, and an assignment target.
 */
function memberAccessPattern(ref: string): RegExp {
    const methods = [...SIGNAL_API_METHODS].join('|');
    const members = SIGNAL_MEMBERS.map(escapeRegExp).join('|');

    return new RegExp(
        `(?<![\\w$.])(${escapeRegExp(ref)})\\s*\\??\\.\\s*(${members})\\b` +
            `(?!\\s*\\()(?!\\s*\\.\\s*(?:${methods})\\b)(?!\\s*=(?!=))`,
        'g'
    );
}

/**
 * Rewrites `ref.markdownText` reads to calls, only inside the given expression ranges. Restricting the
 * rewrite to expressions is what keeps the projected prose, comments and attribute strings out of it.
 */
function rewriteRefReads(
    template: string,
    refs: TemplateRef[],
    expressions: Range[]
): { content: string; changed: boolean } {
    const edits: Edit[] = [];

    for (const { start, end } of expressions) {
        const source = template.slice(start, end);

        for (const ref of refs) {
            if (start < ref.start || end > ref.end) continue;

            for (const match of source.matchAll(memberAccessPattern(ref.name))) {
                const at = start + match.index + match[0].length;

                edits.push({ start: at, end: at, text: '()' });
            }
        }
    }

    return edits.length > 0
        ? { content: applyEdits(template, edits), changed: true }
        : { content: template, changed: false };
}

interface TemplateResult {
    content: string;
    changed: boolean;
    /** The template renders the component but could not be parsed, so nothing in it was inspected. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({ content: template, changed: false, unparseable: false });

/** Pass B (core) — parse a template, discover markdown refs, rewrite their signal reads. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    if (!template.includes(MARKDOWN_ELEMENT)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const scanner = new TemplateScanner(template);

    visitAll(scanner, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    // A ref whose name is also introduced by a `@for`, an `@let` or a foreign `#ref` is ambiguous: the
    // reads could belong to either, so neither is rewritten.
    const refs = scanner.markdownRefs.filter((ref) => !scanner.otherNames.has(ref.name));

    if (refs.length === 0) return untouched(template);

    return { ...rewriteRefReads(template, refs, scanner.expressions), unparseable: false };
}

/** Pass B (inline) — rewrite markdown ref reads inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; unparseable: boolean }> {
    // Parsing the file to find inline templates is the expensive half, and most consumers have none.
    if (!content.includes(MARKDOWN_ELEMENT)) return { content, unparseable: false };

    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    let result = content;
    let unparseable = false;

    for (const { start, end } of ranges) {
        const outcome = await migrateTemplate(result.slice(start, end));

        unparseable ||= outcome.unparseable;

        if (outcome.changed) {
            result = result.slice(0, start) + outcome.content + result.slice(end);
        }
    }

    return { content: result, unparseable };
}

/** One report per distinct member and query kind, however many reads a file holds. */
function dedupe(reads: SignalQueryRead[]): SignalQueryRead[] {
    const seen = new Map<string, SignalQueryRead>();

    for (const read of reads) {
        seen.set(`${read.member}:${read.required}`, read);
    }

    return [...seen.values()];
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { anchor, pattern, message } of warnPatterns) {
        if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
    }
}

/**
 * A `.ts` file is a markdown consumer if it names the exported symbol, imports the package, or renders the
 * element in an inline template — a component that only imports `KbqMarkdownModule` names no type.
 */
function referencesMarkdown(content: string): boolean {
    return (
        /\bKbqMarkdown\w*\b/.test(content) ||
        content.includes(MARKDOWN_PACKAGE) ||
        content.includes(`<${MARKDOWN_ELEMENT}`)
    );
}

export default function markdownSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema,
        // so the schema default never reaches us — applying the fix is the intended behaviour there.
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

        const reportUnparseable = (filePath: string) =>
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesMarkdown(original)) continue;

            consumers++;

            logWarnings(context, filePath, original);

            const pass = migrateTsExpressions(original, filePath);

            for (const { member, required } of dedupe(pass.signalQueryReads)) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${signalQueryMessage(member, required)}`]);
            }

            if (pass.unresolved.length > 0) {
                logMessage(context.logger, [
                    `${LABEL} ${filePath}`,
                    `  ${UNRESOLVED_RECEIVER_MESSAGE} ${pass.unresolved.join(', ')}.`
                ]);
            }

            const inline = await migrateInlineTemplates(pass.content, filePath);

            if (inline.unparseable) reportUnparseable(filePath);

            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            // Counted on "renders the component", matching the `.ts` loop: a project whose only usage is a
            // plain `[markdownText]` binding in an external template still needs the summary.
            if (!original || !original.includes(`<${MARKDOWN_ELEMENT}`)) continue;

            consumers++;

            const outcome = await migrateTemplate(original);

            if (outcome.unparseable) reportUnparseable(filePath);

            commit(filePath, original, outcome.content);
        }

        // Nothing here uses the markdown component, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

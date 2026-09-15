import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    HIDDEN_MEMBERS,
    OVERLAY_ELEMENT,
    OVERLAY_PACKAGE,
    OVERLAY_TYPE,
    PRIVATE_MEMBERS,
    privateMessage,
    PROTECTED_MEMBERS,
    protectedMessage,
    SIGNAL_API_METHODS,
    SIGNAL_MEMBERS,
    signalQueryMessage,
    SUMMARY,
    TRANSPARENT_ATTRIBUTE_MESSAGE,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    UNRESOLVED_RECEIVER_MESSAGE,
    writeMessage
} from './data';
import { Schema } from './schema';

const LABEL = '[loader-overlay-signals]';
const TS_EXT = '.ts';
const HTML_EXT = '.html';

/** The attribute whose meaning flipped without producing a compile error anywhere. */
const TRANSPARENT_ATTRIBUTE = 'transparent';

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

/** A receiver whose static type is a loader overlay, valid within `scope`. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `overlay` or `this.overlay`. */
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

/** Nodes that rebind `this`, so `this.overlay` inside them is a different object. Arrows don't. */
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

/** Local names `KbqLoaderOverlay` is bound to in this file, including aliased imports. */
function localTypeNames(sourceFile: ts.SourceFile): string[] {
    const names = new Set<string>([OVERLAY_TYPE]);

    const visit = (node: ts.Node): void => {
        if (ts.isImportSpecifier(node) && (node.propertyName?.text ?? node.name.text) === OVERLAY_TYPE) {
            names.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return [...names];
}

/**
 * The overlay-ness of an initializer, for the shapes a modern Angular consumer writes:
 * `inject(KbqLoaderOverlay)`, `viewChild(KbqLoaderOverlay)`, `viewChild.required(…)`, `contentChild(…)`.
 */
function initializerTypeOf(
    initializer: ts.Expression | undefined,
    typeNames: string[]
): { overlay: boolean; signalQuery: boolean; required: boolean } {
    const none = { overlay: false, signalQuery: false, required: false };

    if (!initializer || !ts.isCallExpression(initializer)) return none;

    const callee = initializer.expression;
    const qualified = ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression);
    const name = ts.isIdentifier(callee) ? callee.text : qualified ? callee.expression.text : undefined;

    if (!name || !TYPING_FACTORIES.has(name)) return none;

    const [arg] = initializer.arguments;

    if (!arg || !ts.isIdentifier(arg) || !typeNames.includes(arg.text)) return none;

    // `viewChild.required(...)` is `Signal<KbqLoaderOverlay>`; the bare form adds `| undefined`.
    const required = qualified && (callee as ts.PropertyAccessExpression).name.text === 'required';

    return { overlay: true, signalQuery: name !== 'inject', required };
}

/**
 * Collects the overlay receivers: method/function params, class fields (incl.
 * `@ViewChild(KbqLoaderOverlay) x: KbqLoaderOverlay`, constructor parameter-properties and the `inject()` /
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
            const { overlay, signalQuery, required } = initializerTypeOf(node.initializer, typeNames);

            if (owner && (annotated || overlay)) {
                if (annotated) resolved?.add(node.type!);
                add(`this.${node.name.text}`, node, owner, signalQuery, required);
            }
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const annotated = isTypeReference(node.type, typeNames);
            const { overlay, signalQuery, required } = initializerTypeOf(node.initializer, typeNames);

            if (annotated || overlay) {
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
    // `this . overlay` and `this /* x */ . overlay` spell the same receiver as `this.overlay`.
    const text = ts.isPropertyAccessExpression(inner)
        ? `${inner.expression.getText(sourceFile).replace(/\s+/g, '')}.${inner.name.text}`
        : inner.getText(sourceFile);

    return receivers.find((receiver) => {
        if (receiver.text !== text) return false;

        // For `this.overlay`, a nested `function` or class changes what `this` is; an arrow does not.
        // For a bare `overlay`, a nested redeclaration of the same name shadows the receiver.
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

/** What a matched property access turned out to be. */
type AccessKind = 'read' | 'write' | 'migrated';

/** Classifies a matched property access and appends the resulting edit, if any. */
function classifyAccess(node: ts.PropertyAccessExpression, edits: Edit[]): AccessKind {
    const parent = node.parent;

    // Already migrated: `x.text()` (call) or the signal API on it.
    if (ts.isCallExpression(parent) && parent.expression === node) return 'migrated';
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && SIGNAL_API_METHODS.has(parent.name.text))
        return 'migrated';

    // Write target: `x.text = RHS` and every compound form (`+=`, `??=`, …). Every member is an `input()`,
    // so there is no writable half: the write is left untouched and reported, and appending `()` to it
    // would produce unparseable TypeScript instead of the read-only error the consumer should see.
    if (ts.isBinaryExpression(parent) && parent.left === node && ASSIGNMENT_OPERATORS.has(parent.operatorToken.kind))
        return 'write';

    // `x.text++` / `--x.text` and `delete x.text` are writes too. Only the increment operators
    // count: a `PrefixUnaryExpression` is also how `!x.text` is spelled, and that is a read.
    if (ts.isPostfixUnaryExpression(parent) && parent.operand === node) return 'write';
    if (ts.isPrefixUnaryExpression(parent) && parent.operand === node && INCREMENT_OPERATORS.has(parent.operator))
        return 'write';
    if (ts.isDeleteExpression(parent)) return 'write';
    if (isDestructuringTarget(node)) return 'write';

    // Read (incl. optional chain `x?.text`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });

    return 'read';
}

/** A read through a signal query, which the rewrite leaves alone and the caller reports instead. */
interface SignalQueryRead {
    member: string;
    required: boolean;
}

/** What one TypeScript file needs rewritten and reported. */
interface TsFindings {
    edits: Edit[];
    /** Members written programmatically, which have no mechanical translation. */
    writes: Set<string>;
    /** Members hidden behind `protected` / `private` that the file still reads. */
    hidden: Set<string>;
    signalQueryReads: SignalQueryRead[];
}

/** Collects the edits and the findings for every access on a known overlay receiver. */
function collectAccesses(sourceFile: ts.SourceFile, receivers: Receiver[], bindings: Binding[]): TsFindings {
    const edits: Edit[] = [];
    const writes = new Set<string>();
    const hidden = new Set<string>();
    const signalQueryReads: SignalQueryRead[] = [];

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
            const member = node.name.text;
            const known = SIGNAL_MEMBERS.includes(member) || HIDDEN_MEMBERS.includes(member);
            const receiver = known
                ? resolveReceiver(node.expression, node, sourceFile, receivers, bindings)
                : undefined;

            if (receiver) {
                if (HIDDEN_MEMBERS.includes(member)) {
                    hidden.add(member);
                } else if (receiver.signalQuery) {
                    // A signal query holds the component behind a call of its own, so the read is
                    // `query().text()`. Appending one `()` would be wrong in both halves.
                    signalQueryReads.push({ member, required: receiver.required });
                } else if (classifyAccess(node, edits) === 'write') {
                    writes.add(member);
                }
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { edits, writes, hidden, signalQueryReads };
}

/**
 * 1-based lines where `KbqLoaderOverlay` is named in a position `collectReceivers` cannot resolve, plus the
 * reads the access pass structurally cannot reach: `overlay['text']` and `const { text } = overlay`.
 */
function collectUnresolvedMentions(
    sourceFile: ts.SourceFile,
    resolved: Set<ts.Node>,
    typeNames: string[],
    receivers: Receiver[],
    bindings: Binding[]
): number[] {
    const lines = new Set<number>();
    const members = [...SIGNAL_MEMBERS, ...HIDDEN_MEMBERS];
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
            members.includes(node.argumentExpression.text) &&
            isReceiver(node.expression, node)
        ) {
            report(node);
        } else if (
            ts.isVariableDeclaration(node) &&
            ts.isObjectBindingPattern(node.name) &&
            node.initializer &&
            isReceiver(node.initializer, node) &&
            node.name.elements.some((element) =>
                members.includes((element.propertyName ?? element.name).getText(sourceFile))
            )
        ) {
            report(node);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return [...lines].sort((a, b) => a - b);
}

/** Pass A — rewrite programmatic reads of overlay signal members in TypeScript code. */
function migrateTsExpressions(
    content: string,
    fileName: string
): TsFindings & { content: string; unresolved: number[] } {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const typeNames = localTypeNames(sourceFile);
    const resolved = new Set<ts.Node>();
    const receivers = collectReceivers(sourceFile, typeNames, resolved);
    const bindings = collectBindings(sourceFile);
    const unresolved = collectUnresolvedMentions(sourceFile, resolved, typeNames, receivers, bindings);
    const empty: TsFindings = { edits: [], writes: new Set(), hidden: new Set(), signalQueryReads: [] };

    if (receivers.length === 0) return { ...empty, content, unresolved };

    const findings = collectAccesses(sourceFile, receivers, bindings);

    return {
        ...findings,
        content: findings.edits.length > 0 ? applyEdits(content, findings.edits) : content,
        unresolved
    };
}

/** Attribute-name prefixes that mark the value as an Angular expression rather than a literal. */
const BINDING_PREFIX = /^(?:\[|\(|\*|bind-|bind(?:on)?-|on-)/;

/** An overlay reference variable, valid only within the embedded view that declares it. */
interface TemplateRef extends Range {
    name: string;
}

/**
 * Walks a template's HTML AST, collecting what the rewrite needs: the reference variables bound to a
 * `<kbq-loader-overlay>`, the source ranges that actually hold Angular expressions, every other name the
 * template introduces, and whether the element carries a valueless `transparent` attribute.
 */
class TemplateScanner implements Visitor {
    readonly overlayRefs: TemplateRef[] = [];
    readonly otherNames = new Set<string>();
    readonly expressions: Range[] = [];
    /** Whether a `<kbq-loader-overlay transparent>` without a bound value is rendered here. */
    transparentAttribute = false;

    /** The embedded view currently being walked; a ref declared in it is invisible outside. */
    private view: Range;

    constructor(private readonly template: string) {
        this.view = { start: 0, end: template.length };
    }

    visitElement(element: any): void {
        const isOverlay = element.name === OVERLAY_ELEMENT;

        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string') continue;

            // A valueless `transparent` is the one change that produces no compile error anywhere.
            if (isOverlay && attr.name === TRANSPARENT_ATTRIBUTE && !attr.value) this.transparentAttribute = true;

            const reference = this.referenceName(attr.name);

            if (reference !== undefined) {
                // `#o="cdkOverlayOrigin"` names a directive on the element, not the component itself.
                const exportsOverlay = !attr.value || attr.value === 'kbqLoaderOverlay';

                if (isOverlay && exportsOverlay) this.overlayRefs.push({ name: reference, ...this.view });
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

            // `@for (overlay of overlays; track overlay)` and `@if (x; as y)` introduce names of their own.
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
 * Matches `<ref>.<member>` inside a template expression. The lookbehind rejects `vm.overlay.text`, where
 * `\b` alone matches after the dot, and admits a `$`-prefixed ref that `\b` never could. `\??\.` accepts
 * the optional chain, which the TypeScript pass already handles. Angular's grammar allows whitespace around
 * the dot. The three groups skip an already-migrated read, a signal-API call, and an assignment target.
 */
function memberAccessPattern(ref: string, members: readonly string[]): RegExp {
    const methods = [...SIGNAL_API_METHODS].join('|');
    const names = members.map(escapeRegExp).join('|');

    return new RegExp(
        `(?<![\\w$.])(${escapeRegExp(ref)})\\s*\\??\\.\\s*(${names})\\b` +
            `(?!\\s*\\()(?!\\s*\\.\\s*(?:${methods})\\b)(?!\\s*=(?!=))`,
        'g'
    );
}

/**
 * Rewrites `ref.text` reads to calls, only inside the given expression ranges. Restricting the rewrite to
 * expressions is what keeps prose, comments, `href` values and static attributes out of it - `text` and
 * `caption` are common enough words that a raw-text pass would hit all of them.
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

            for (const match of source.matchAll(memberAccessPattern(ref.name, SIGNAL_MEMBERS))) {
                const at = start + match.index + match[0].length;

                edits.push({ start: at, end: at, text: '()' });
            }
        }
    }

    return edits.length > 0
        ? { content: applyEdits(template, edits), changed: true }
        : { content: template, changed: false };
}

/** Hidden members read through an overlay reference variable, which no template can keep reading. */
function collectRefHiddenMembers(template: string, refs: TemplateRef[], expressions: Range[]): Set<string> {
    const found = new Set<string>();

    for (const { start, end } of expressions) {
        const source = template.slice(start, end);

        for (const ref of refs) {
            if (start < ref.start || end > ref.end) continue;

            const pattern = new RegExp(
                `(?<![\\w$.])${escapeRegExp(ref.name)}\\s*\\??\\.\\s*(${HIDDEN_MEMBERS.map(escapeRegExp).join('|')})\\b`,
                'g'
            );

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
    /** Hidden members read through a ref that need a hand migration. */
    hidden: Set<string>;
    /** Whether the template carries a valueless `transparent` attribute. */
    transparentAttribute: boolean;
    /** The template renders the overlay but could not be parsed, so nothing in it was inspected. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({
    content: template,
    changed: false,
    hidden: new Set(),
    transparentAttribute: false,
    unparseable: false
});

/** Pass B (core) — parse a template, discover overlay refs, rewrite their signal reads. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    if (!template.includes(OVERLAY_ELEMENT)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const scanner = new TemplateScanner(template);

    visitAll(scanner, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    // A ref whose name is also introduced by a `@for`, an `@let` or a foreign `#ref` is ambiguous: the
    // reads could belong to either, so neither is rewritten.
    const refs = scanner.overlayRefs.filter((ref) => !scanner.otherNames.has(ref.name));

    return {
        ...rewriteRefReads(template, refs, scanner.expressions),
        hidden: collectRefHiddenMembers(template, refs, scanner.expressions),
        transparentAttribute: scanner.transparentAttribute,
        unparseable: false
    };
}

/** Pass B (inline) — rewrite overlay ref reads inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; hidden: Set<string>; transparentAttribute: boolean; unparseable: boolean }> {
    const hidden = new Set<string>();

    // Parsing the file to find inline templates is the expensive half, and most consumers have none.
    if (!content.includes(OVERLAY_ELEMENT)) {
        return { content, hidden, transparentAttribute: false, unparseable: false };
    }

    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    let result = content;
    let transparentAttribute = false;
    let unparseable = false;

    for (const { start, end } of ranges) {
        const outcome = await migrateTemplate(result.slice(start, end));

        for (const member of outcome.hidden) hidden.add(member);

        transparentAttribute ||= outcome.transparentAttribute;
        unparseable ||= outcome.unparseable;

        if (outcome.changed) {
            result = result.slice(0, start) + outcome.content + result.slice(end);
        }
    }

    return { content: result, hidden, transparentAttribute, unparseable };
}

/** Reports the members a file reads that no longer exist on its surface. */
function warnHiddenMembers(context: SchematicContext, filePath: string, hidden: Set<string>): void {
    const messages: string[] = [];
    const nowProtected = PROTECTED_MEMBERS.filter((member) => hidden.has(member));
    const nowPrivate = PRIVATE_MEMBERS.filter((member) => hidden.has(member));

    if (nowProtected.length > 0) messages.push(`  ${protectedMessage(nowProtected)}`);
    if (nowPrivate.length > 0) messages.push(`  ${privateMessage(nowPrivate)}`);

    if (messages.length > 0) logMessage(context.logger, [`${LABEL} ${filePath}`, ...messages]);
}

/** One report per distinct member and query kind, however many reads a file holds. */
function dedupe(reads: SignalQueryRead[]): SignalQueryRead[] {
    const seen = new Map<string, SignalQueryRead>();

    for (const read of reads) {
        seen.set(`${read.member}:${read.required}`, read);
    }

    return [...seen.values()];
}

/**
 * A `.ts` file is an overlay consumer if it names the exported symbol, imports the package, or renders the
 * element in an inline template — a component that only imports `KbqLoaderOverlayModule` names no type.
 */
function referencesLoaderOverlay(content: string): boolean {
    return (
        /\bKbqLoaderOverlay\w*\b/.test(content) ||
        content.includes(OVERLAY_PACKAGE) ||
        content.includes(`<${OVERLAY_ELEMENT}`)
    );
}

export default function loaderOverlaySignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema, so
        // the schema default never reaches us — applying the fix is the intended behaviour there.
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

            if (!original || !referencesLoaderOverlay(original)) continue;

            consumers++;

            const pass = migrateTsExpressions(original, filePath);

            warnHiddenMembers(context, filePath, pass.hidden);

            if (pass.writes.size > 0) report(filePath, writeMessage(pass.writes));

            for (const { member, required } of dedupe(pass.signalQueryReads)) {
                report(filePath, signalQueryMessage(member, required));
            }

            if (pass.unresolved.length > 0) {
                report(filePath, `${UNRESOLVED_RECEIVER_MESSAGE} ${pass.unresolved.join(', ')}.`);
            }

            const inline = await migrateInlineTemplates(pass.content, filePath);

            warnHiddenMembers(context, filePath, inline.hidden);

            if (inline.transparentAttribute) report(filePath, TRANSPARENT_ATTRIBUTE_MESSAGE);
            if (inline.unparseable) report(filePath, UNPARSEABLE_TEMPLATE_MESSAGE);

            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            // Counted on "renders the overlay", matching the `.ts` loop: a project whose only usage is a
            // valueless `transparent` in an external template still needs the report and the summary.
            if (!original || !original.includes(`<${OVERLAY_ELEMENT}`)) continue;

            consumers++;

            const outcome = await migrateTemplate(original);

            warnHiddenMembers(context, filePath, outcome.hidden);

            if (outcome.transparentAttribute) report(filePath, TRANSPARENT_ATTRIBUTE_MESSAGE);
            if (outcome.unparseable) report(filePath, UNPARSEABLE_TEMPLATE_MESSAGE);

            commit(filePath, original, outcome.content);
        }

        // Nothing here uses the loader overlay, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

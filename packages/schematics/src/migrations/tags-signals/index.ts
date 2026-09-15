import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    MigrationTarget,
    SIGNAL_API_METHODS,
    signalQueryMessage,
    SUMMARY,
    TAGS_PACKAGE,
    TARGETS,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    UNRESOLVED_RECEIVER_MESSAGE,
    writeMessage
} from './data';
import { Schema } from './schema';

const LABEL = '[tags-signals]';
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

/** Every member name any target migrates - a cheap filter before a property access is resolved at all. */
const KNOWN_MEMBERS: ReadonlySet<string> = new Set(TARGETS.flatMap((t) => [...t.signalMembers, ...t.readOnlyMembers]));

/** Local type names bound to each target in one file, including aliased imports. */
type TypeNames = ReadonlyMap<string, MigrationTarget>;

/** A receiver whose static type is one of the targets, valid within `scope`. */
interface Receiver {
    /** The class the receiver holds an instance of, which decides which members moved. */
    target: MigrationTarget;
    /** Source text of the receiver expression, e.g. `tagInput` or `this.tagInput`. */
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

/** Nodes that rebind `this`, so `this.tagInput` inside them is a different object. Arrows don't. */
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

/** The target a type annotation names directly (not through a union or type argument), if any. */
function targetOfType(type: ts.TypeNode | undefined, names: TypeNames): MigrationTarget | undefined {
    return type && ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)
        ? names.get(type.typeName.text)
        : undefined;
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
            add(node.name.text, node, ts.findAncestor(node.parent, ts.isFunctionLike));
        } else if ((ts.isVariableDeclaration(node) || ts.isBindingElement(node)) && ts.isIdentifier(node.name)) {
            add(node.name.text, node, ts.findAncestor(node.parent, opensScope));
        } else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
            add(node.name.text, node, ts.findAncestor(node.parent, opensScope));
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

/** Local names each target is bound to in this file, including aliased imports. */
function localTypeNames(sourceFile: ts.SourceFile): TypeNames {
    const names = new Map<string, MigrationTarget>(TARGETS.map((target) => [target.type, target]));

    const visit = (node: ts.Node): void => {
        if (ts.isImportSpecifier(node)) {
            const target = TARGETS.find(({ type }) => type === (node.propertyName?.text ?? node.name.text));

            if (target) names.set(node.name.text, target);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return names;
}

/**
 * The target an initializer sets up, for the shapes a modern Angular consumer writes:
 * `inject(KbqTag)`, `viewChild(KbqTag)`, `viewChild.required(…)`, `contentChild(…)`.
 */
function initializerTypeOf(
    initializer: ts.Expression | undefined,
    names: TypeNames
): { target: MigrationTarget | undefined; signalQuery: boolean; required: boolean } {
    const none = { target: undefined, signalQuery: false, required: false };

    if (!initializer || !ts.isCallExpression(initializer)) return none;

    const callee = initializer.expression;
    const qualified = ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression);
    const name = ts.isIdentifier(callee) ? callee.text : qualified ? callee.expression.text : undefined;

    if (!name || !TYPING_FACTORIES.has(name)) return none;

    const [arg] = initializer.arguments;

    const target = arg && ts.isIdentifier(arg) ? names.get(arg.text) : undefined;

    if (!target) return none;

    // `viewChild.required(...)` is `Signal<KbqTag>`; the bare form adds `| undefined`.
    const required = qualified && (callee as ts.PropertyAccessExpression).name.text === 'required';

    return { target, signalQuery: name !== 'inject', required };
}

/**
 * Collects the receivers of every target: method/function params, class fields (incl.
 * `@ViewChild(KbqTag) x: KbqTag`, constructor parameter-properties and the `inject()` / `viewChild()`
 * initializer forms) and typed locals. Annotations that resolve are recorded in `resolved`, so the caller can
 * report the mentions this pass could not turn into a receiver.
 */
function collectReceivers(sourceFile: ts.SourceFile, names: TypeNames, resolved: Set<ts.Node>): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (
        target: MigrationTarget,
        text: string,
        declaration: ts.Node,
        scope: ts.Node | undefined,
        signalQuery = false,
        required = false
    ) => receivers.push({ target, text, declaration, scope: scope ?? sourceFile, signalQuery, required });

    const visit = (node: ts.Node): void => {
        const annotatedTarget =
            ts.isParameter(node) || ts.isPropertyDeclaration(node) || ts.isVariableDeclaration(node)
                ? targetOfType(node.type, names)
                : undefined;

        if (ts.isParameter(node) && ts.isIdentifier(node.name) && annotatedTarget) {
            resolved.add(node.type!);
            add(annotatedTarget, node.name.text, node, ts.findAncestor(node.parent, ts.isFunctionLike));

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = ts.findAncestor(node.parent, ts.isClassDeclaration);

                if (owner) add(annotatedTarget, `this.${node.name.text}`, node, owner);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
            const owner = ts.findAncestor(node.parent, ts.isClassDeclaration);
            const { target, signalQuery, required } = initializerTypeOf(node.initializer, names);
            const resolvedTarget = annotatedTarget ?? target;

            if (owner && resolvedTarget) {
                if (annotatedTarget) resolved.add(node.type!);
                add(resolvedTarget, `this.${node.name.text}`, node, owner, signalQuery, required);
            }
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const { target, signalQuery, required } = initializerTypeOf(node.initializer, names);
            const resolvedTarget = annotatedTarget ?? target;

            if (resolvedTarget) {
                if (annotatedTarget) resolved.add(node.type!);
                add(
                    resolvedTarget,
                    node.name.text,
                    node,
                    ts.findAncestor(node.parent, opensScope),
                    signalQuery,
                    required
                );
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return receivers;
}

/** Expression wrappers that carry a type but do not change which object an access reads from. */
const isTypeWrapper = (node: ts.Node): node is ts.AsExpression | ts.TypeAssertion | ts.SatisfiesExpression =>
    ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node);

/** Strips `!`, parentheses and type assertions, none of which change which object an access reads from. */
function unwrapReceiver(node: ts.Expression): ts.Expression {
    let current = node;

    while (ts.isNonNullExpression(current) || ts.isParenthesizedExpression(current) || isTypeWrapper(current)) {
        current = current.expression;
    }

    return current;
}

/** The target one of the wrappers around a receiver asserts it to be: `(x as KbqTag)`. */
function assertedTarget(node: ts.Expression, names: TypeNames): MigrationTarget | undefined {
    let current = node;

    while (ts.isNonNullExpression(current) || ts.isParenthesizedExpression(current) || isTypeWrapper(current)) {
        const target = isTypeWrapper(current) ? targetOfType(current.type, names) : undefined;

        if (target) return target;
        current = current.expression;
    }

    return undefined;
}

/**
 * A receiver synthesized where the expression itself holds the instance: `(x as KbqTag).member`, whose
 * assertion is the typing, and `this.tag().member`, whose signal query has already been called.
 */
const directReceiver = (target: MigrationTarget): Receiver =>
    ({ target, signalQuery: false, required: false }) as Receiver;

/** The receiver a property access resolves to at this exact position, if any. */
function resolveReceiver(
    expression: ts.Expression,
    at: ts.Node,
    sourceFile: ts.SourceFile,
    receivers: Receiver[],
    bindings: Binding[],
    names: TypeNames
): Receiver | undefined {
    const asserted = assertedTarget(expression, names);

    if (asserted) return directReceiver(asserted);

    const inner = unwrapReceiver(expression);

    // `this.tag()?.selected` is how a signal query is read in practice: the call already unwraps the signal,
    // so the member read on its result is an ordinary one and takes a single `()`.
    if (ts.isCallExpression(inner) && inner.arguments.length === 0) {
        const query = resolveReceiver(inner.expression, at, sourceFile, receivers, bindings, names);

        return query?.signalQuery ? directReceiver(query.target) : undefined;
    }

    // `this . tagInput` and `this /* x */ . tagInput` spell the same receiver as `this.tagInput`.
    const text = ts.isPropertyAccessExpression(inner)
        ? `${unwrapReceiver(inner.expression).getText(sourceFile).replace(/\s+/g, '')}.${inner.name.text}`
        : inner.getText(sourceFile);

    return receivers.find((receiver) => {
        if (receiver.text !== text) return false;

        // For `this.tagInput`, a nested `function` or class changes what `this` is; an arrow does not.
        // For a bare `tagInput`, a nested redeclaration of the same name shadows the receiver.
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

/**
 * Classifies a matched property access without touching it. Every write form counts - a plain `=`, a
 * compound assignment, an increment, `delete` and a destructuring target - because appending `()` to any of
 * them produces source that no longer parses.
 */
function accessKind(node: ts.PropertyAccessExpression): AccessKind {
    const parent = node.parent;

    // Already migrated: `x.addOnBlur()` (call) or the signal API on it.
    if (ts.isCallExpression(parent) && parent.expression === node) return 'migrated';
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && SIGNAL_API_METHODS.has(parent.name.text))
        return 'migrated';

    if (ts.isBinaryExpression(parent) && parent.left === node && ASSIGNMENT_OPERATORS.has(parent.operatorToken.kind))
        return 'write';
    // Only the increment operators count: a `PrefixUnaryExpression` is also how `!x.addOnBlur` is spelled.
    if (ts.isPostfixUnaryExpression(parent) && parent.operand === node) return 'write';
    if (ts.isPrefixUnaryExpression(parent) && parent.operand === node && INCREMENT_OPERATORS.has(parent.operator))
        return 'write';
    if (ts.isDeleteExpression(parent)) return 'write';
    if (isDestructuringTarget(node)) return 'write';

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
    /** Read-only members written programmatically, per target, which have no mechanical translation. */
    writes: Map<MigrationTarget, Set<string>>;
    signalQueryReads: SignalQueryRead[];
}

/** Collects the edits and the findings for every access on a known receiver. */
function collectAccesses(
    sourceFile: ts.SourceFile,
    receivers: Receiver[],
    bindings: Binding[],
    names: TypeNames
): TsFindings {
    const edits: Edit[] = [];
    const writes = new Map<MigrationTarget, Set<string>>();
    const signalQueryReads: SignalQueryRead[] = [];

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name) && KNOWN_MEMBERS.has(node.name.text)) {
            const member = node.name.text;
            const receiver = resolveReceiver(node.expression, node, sourceFile, receivers, bindings, names);
            // The member sets are per class: `KbqTagList` has a `selected` of its own - an array - that did not
            // move, so a name matched without its receiver's class would corrupt it.
            const signalMembers: readonly string[] = receiver?.target.signalMembers ?? [];
            const readOnlyMembers: readonly string[] = receiver?.target.readOnlyMembers ?? [];

            if (receiver && (signalMembers.includes(member) || readOnlyMembers.includes(member))) {
                const kind = accessKind(node);

                if (kind === 'write' && readOnlyMembers.includes(member)) {
                    const members = writes.get(receiver.target) ?? new Set<string>();

                    writes.set(receiver.target, members.add(member));
                } else if (kind === 'read' && signalMembers.includes(member)) {
                    // A signal query holds the instance behind a call of its own, so the read is
                    // `query().selected()`. Appending one `()` would be wrong in both halves.
                    if (receiver.signalQuery) signalQueryReads.push({ member, required: receiver.required });
                    else edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
                }
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { edits, writes, signalQueryReads };
}

/**
 * 1-based lines where a target is named in a position `collectReceivers` cannot resolve, plus the reads the
 * access pass structurally cannot reach: `tag['selected']` and `const { selected } = tag`.
 */
function collectUnresolvedMentions(
    sourceFile: ts.SourceFile,
    resolved: Set<ts.Node>,
    names: TypeNames,
    receivers: Receiver[],
    bindings: Binding[]
): number[] {
    const lines = new Set<number>();
    const report = (node: ts.Node) =>
        lines.add(sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1);
    const signalMembersOf = (expression: ts.Expression, at: ts.Node): readonly string[] =>
        resolveReceiver(expression, at, sourceFile, receivers, bindings, names)?.target.signalMembers ?? [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            names.has(node.typeName.text) &&
            // `x as KbqTag` is the typing of that one access, which `resolveReceiver` already honours.
            !isTypeWrapper(node.parent)
        ) {
            if (!resolved.has(node)) report(node);
        } else if (
            ts.isElementAccessExpression(node) &&
            ts.isStringLiteralLike(node.argumentExpression) &&
            signalMembersOf(node.expression, node).includes(node.argumentExpression.text)
        ) {
            report(node);
        } else if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer) {
            const members = signalMembersOf(node.initializer, node);

            if (
                node.name.elements.some((element) =>
                    members.includes((element.propertyName ?? element.name).getText(sourceFile))
                )
            ) {
                report(node);
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return [...lines].sort((a, b) => a - b);
}

/**
 * Pass A — rewrite programmatic reads of the targets' signal members in TypeScript code. One
 * `createSourceFile` and one `collectReceivers` walk per file: the rewrite and every report come out of the
 * same traversal.
 */
function migrateTsExpressions(
    content: string,
    fileName: string
): TsFindings & { content: string; unresolved: number[] } {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const names = localTypeNames(sourceFile);
    const resolved = new Set<ts.Node>();
    const receivers = collectReceivers(sourceFile, names, resolved);
    const bindings = collectBindings(sourceFile);
    const unresolved = collectUnresolvedMentions(sourceFile, resolved, names, receivers, bindings);
    const findings = collectAccesses(sourceFile, receivers, bindings, names);

    return {
        ...findings,
        content: findings.edits.length > 0 ? applyEdits(content, findings.edits) : content,
        unresolved
    };
}

/** Attribute-name prefixes that mark the value as an Angular expression rather than a literal. */
const BINDING_PREFIX = /^(?:\[|\(|\*|bind-|bind(?:on)?-|on-)/;

/** A reference variable holding a target instance, valid only within the embedded view that declares it. */
interface TemplateRef extends Range {
    name: string;
    target: MigrationTarget;
}

/**
 * The target a `#ref` on this element holds. A ref naming an `exportAs` holds that target; a bare ref holds the
 * component whose element or attribute selector the element matches. A bare ref on a native element - where
 * `KbqTagInput` sits - is the element itself, so it matches nothing.
 */
function refTarget(element: any, value: string): MigrationTarget | undefined {
    if (value) return TARGETS.find(({ exportAs }) => exportAs.includes(value));

    const attributeNames = new Set<string>(
        (element.attrs ?? []).map((attr: any) => attr.name).filter((name: unknown) => typeof name === 'string')
    );

    return TARGETS.find(({ elements }) =>
        elements.some((selector) => element.name === selector || attributeNames.has(selector))
    );
}

/**
 * Walks a template's HTML AST, collecting what the rewrite needs: the reference variables that hold a tag, a
 * tag list or a tag input, the source ranges that actually hold Angular expressions, and every other name the
 * template introduces.
 */
class TemplateScanner implements Visitor {
    readonly targetRefs: TemplateRef[] = [];
    readonly otherNames = new Set<string>();
    readonly expressions: Range[] = [];

    /** The embedded view currently being walked; a ref declared in it is invisible outside. */
    private view: Range;

    constructor(private readonly template: string) {
        this.view = { start: 0, end: template.length };
    }

    visitElement(element: any): void {
        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string') continue;

            const reference = this.referenceName(attr.name);

            if (reference !== undefined) {
                const target = refTarget(element, attr.value);

                if (target) this.targetRefs.push({ name: reference, target, ...this.view });
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

            // `@for (item of items; track item)` and `@if (x; as y)` introduce names of their own.
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
 * Matches `<ref>.<member>` inside a template expression. The lookbehind rejects `form.ti.addOnBlur`, where
 * `\b` alone matches after the dot, and admits a `$`-prefixed ref that `\b` never could. `\??\.` accepts the
 * optional chain, and Angular's grammar allows whitespace around the dot. The three groups skip an
 * already-migrated read, a signal-API call, and an assignment target.
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

/** Rewrites `ref.addOnBlur` reads to calls, only inside the given expression ranges. */
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

            for (const match of source.matchAll(memberAccessPattern(ref.name, ref.target.signalMembers))) {
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
    /** The template names the tag input but could not be parsed, so nothing in it was inspected. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({ content: template, changed: false, unparseable: false });

/**
 * Whether a template can hold a reference to a target: every `exportAs` starts with `kbqTag`, and every element
 * and attribute selector contains `kbq-tag` or `kbq-basic-tag`.
 */
const mentionsTags = (template: string): boolean =>
    template.includes('kbqTag') || template.includes('kbq-tag') || template.includes('kbq-basic-tag');

/** Pass B (core) — parse a template, discover tag input refs, rewrite their signal reads. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    if (!mentionsTags(template)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const scanner = new TemplateScanner(template);

    visitAll(scanner, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    // A ref whose name is also introduced by a `@for`, an `@let` or a foreign `#ref` is ambiguous: the
    // reads could belong to either, so neither is rewritten.
    const refs = scanner.targetRefs.filter((ref) => !scanner.otherNames.has(ref.name));

    if (refs.length === 0) return untouched(template);

    return { ...rewriteRefReads(template, refs, scanner.expressions), unparseable: false };
}

/** Pass B (inline) — rewrite tag input ref reads inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; unparseable: boolean }> {
    // Parsing the file to find inline templates is the expensive half, and most consumers have none.
    if (!mentionsTags(content)) return { content, unparseable: false };

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

/**
 * A `.ts` file is a tags consumer if it names any of the exported symbols, imports the package, or reaches
 * the tag input through its `exportAs` in an inline template.
 */
function referencesTags(content: string): boolean {
    return /\bKbqTag\w*\b/.test(content) || content.includes(TAGS_PACKAGE) || mentionsTags(content);
}

export default function tagInputSignals(options: Schema): Rule {
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

            if (!original || !referencesTags(original)) continue;

            consumers++;

            const pass = migrateTsExpressions(original, filePath);

            for (const [target, members] of pass.writes) {
                report(filePath, writeMessage(target.type, members, target.writeAdvice));
            }

            for (const { member, required } of dedupe(pass.signalQueryReads)) {
                report(filePath, signalQueryMessage(member, required));
            }

            if (pass.unresolved.length > 0) {
                report(filePath, `${UNRESOLVED_RECEIVER_MESSAGE} ${pass.unresolved.join(', ')}.`);
            }

            const inline = await migrateInlineTemplates(pass.content, filePath);

            if (inline.unparseable) report(filePath, UNPARSEABLE_TEMPLATE_MESSAGE);

            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !mentionsTags(original)) continue;

            consumers++;

            const outcome = await migrateTemplate(original);

            if (outcome.unparseable) report(filePath, UNPARSEABLE_TEMPLATE_MESSAGE);

            commit(filePath, original, outcome.content);
        }

        // Nothing here uses the tag input, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

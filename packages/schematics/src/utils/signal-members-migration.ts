import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from './ast';
import { logMessage } from './messages';
import { setupOptions } from './package-config';
import { collectInlineTemplateRanges, parseTemplate } from './typescript';

/**
 * Shared engine for the `<component>-signals` migrations: rewrites property reads of members that became
 * signals into calls, in TypeScript code and in templates, and reports what it cannot rewrite.
 *
 * A migration supplies the policy — which types, which members, which of them stay writable — and this
 * module supplies the mechanism: resolving which expressions actually denote one of those types, and
 * editing only the reads that belong to them.
 */

const TS_EXT = '.ts';
const HTML_EXT = '.html';

/** Signal-API methods reachable on a signal; a read followed by one is already migrated. */
const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** Factories whose single argument gives the type of the declaration they set up. */
const TYPING_FACTORIES: ReadonlySet<string> = new Set(['inject', 'viewChild', 'contentChild']);

/** A regex pair that reports a pattern this migration cannot rewrite. */
export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

/** Options every migration built on this engine accepts. */
export interface SignalMembersOptions {
    /** Name of the project to migrate. */
    project?: string;
    /** When true, applies replacements; when false, only logs what would change. Defaults to true. */
    fix?: boolean;
}

/** The per-component policy this engine is driven by. */
export interface SignalMembersConfig {
    /** Prefix on every log line, e.g. `[dropdown-signals]`. */
    label: string;
    /** Import specifier that marks a file as a consumer of the component. */
    package: string;
    /**
     * Which members each type owns. A receiver resolves to exactly one type, so the rewrite has to know
     * which members that receiver can carry. The keys are the types this migration rewrites.
     */
    membersByType: Readonly<Record<string, readonly string[]>>;
    /** `exportAs` name → type, for the `#ref="kbqDropdownTrigger"` form a template names a directive by. */
    exportAsToType: Readonly<Record<string, string>>;
    /** Element selector → type, for the bare `#ref` form on a component's own element. */
    elementToType: Readonly<Record<string, string>>;
    /** Members that stay writable, so `x.member = v` becomes `x.member.set(v)` rather than being warned about. */
    writableMembers: ReadonlySet<string>;
    /** Members that moved to `protected` and can no longer be read from outside the component. */
    protectedMembers?: readonly string[];
    warnPatterns: readonly WarnPattern[];
    messages: {
        /** Reported when a template renders the component but cannot be parsed. */
        unparseableTemplate: string;
        /** Reported when a type is named in a position no receiver can be scoped to. Lines are appended. */
        unresolvedReceiver: string;
        /** Appended to the protected-members report, in both the TypeScript and the template pass. */
        protectedHint?: string;
        /** Printed once per project, after the per-file reports. */
        summary: readonly string[];
    };
}

/** A half-open `[start, end)` span of the source being rewritten. */
interface Range {
    start: number;
    end: number;
}

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit extends Range {
    text: string;
}

/** A receiver whose static type is one of the migrated types, valid within `scope`. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `dropdown` or `this.dropdown`. */
    text: string;
    /** The node whose subtree the receiver name is visible in. */
    scope: ts.Node;
    /** The declaration `text` resolves to. A nested redeclaration of the same name resolves elsewhere. */
    declaration: ts.Node;
    /** Which of the migrated types this receiver holds. */
    type: string;
    /** Whether the receiver is a signal query, so reads through it need two calls rather than one. */
    signalQuery: boolean;
}

/** A name introduced by a declaration, together with the scope it is visible in. */
interface Binding {
    name: string;
    declaration: ts.Node;
    scope: ts.Node;
}

/** A reference variable bound to one of the migrated types, valid only within the view that declares it. */
interface TemplateRef extends Range {
    name: string;
    type: string;
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

/** Nodes that rebind `this`, so `this.panel` inside them is a different object. Arrows don't. */
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

/** Whether a type annotation names `typeName` directly (not through a union, array or type argument). */
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

/** Local names `exported` is bound to in this file, including aliased imports. */
function localTypeNames(sourceFile: ts.SourceFile, exported: string): string[] {
    const names = new Set<string>([exported]);

    const visit = (node: ts.Node): void => {
        if (ts.isImportSpecifier(node) && (node.propertyName?.text ?? node.name.text) === exported) {
            names.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return [...names];
}

/**
 * Whether an initializer types its declaration as `typeName`, for the shapes a modern Angular consumer
 * writes: `inject(KbqDropdown)`, `viewChild(KbqDropdown)`, `viewChild.required(…)`, `contentChild(…)`.
 * Also reports whether the declaration is a signal query, whose instance sits behind a call of its own.
 */
function initializerTypeOf(
    initializer: ts.Expression | undefined,
    typeName: string
): { matches: boolean; signalQuery: boolean } {
    const none = { matches: false, signalQuery: false };

    if (!initializer || !ts.isCallExpression(initializer)) return none;

    const callee = initializer.expression;
    const name = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)
          ? callee.expression.text
          : undefined;

    if (!name || !TYPING_FACTORIES.has(name)) return none;

    const [arg] = initializer.arguments;

    if (!arg || !ts.isIdentifier(arg) || arg.text !== typeName) return none;

    return { matches: true, signalQuery: name !== 'inject' };
}

/**
 * Collects the receivers of one type: method/function params, class fields (incl.
 * `@ViewChild(KbqDropdown) x: KbqDropdown`, constructor parameter-properties and the `inject()` /
 * `viewChild()` initializer forms) and typed locals. Annotations that resolve are recorded in `resolved`,
 * so the caller can report the mentions this pass could not turn into a receiver.
 */
function collectReceivers(
    sourceFile: ts.SourceFile,
    typeName: string,
    ownerType: string,
    resolved?: Set<ts.Node>
): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, declaration: ts.Node, scope: ts.Node | undefined, signalQuery = false) =>
        receivers.push({ text, declaration, scope: scope ?? sourceFile, type: ownerType, signalQuery });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name) && isTypeReference(node.type, typeName)) {
            resolved?.add(node.type!);
            add(node.name.text, node, findAncestor(node, ts.isFunctionLike));

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, node, owner);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
            const owner = findAncestor(node, ts.isClassDeclaration);
            const annotated = isTypeReference(node.type, typeName);
            const { matches, signalQuery } = initializerTypeOf(node.initializer, typeName);

            if (owner && (annotated || matches)) {
                if (annotated) resolved?.add(node.type!);
                add(`this.${node.name.text}`, node, owner, signalQuery);
            }
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const annotated = isTypeReference(node.type, typeName);
            const { matches, signalQuery } = initializerTypeOf(node.initializer, typeName);

            if (annotated || matches) {
                if (annotated) resolved?.add(node.type!);
                add(node.name.text, node, findAncestor(node, opensScope), signalQuery);
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return receivers;
}

/** Every receiver in the file, across every migrated type and every local alias of it. */
function collectAllReceivers(sourceFile: ts.SourceFile, types: readonly string[], resolved?: Set<ts.Node>): Receiver[] {
    return types.flatMap((type) =>
        localTypeNames(sourceFile, type).flatMap((name) => collectReceivers(sourceFile, name, type, resolved))
    );
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
    // `this . panel` and `this /* x */ . panel` spell the same receiver as `this.panel`.
    const text = ts.isPropertyAccessExpression(inner)
        ? `${inner.expression.getText(sourceFile).replace(/\s+/g, '')}.${inner.name.text}`
        : inner.getText(sourceFile);

    return receivers.find((receiver) => {
        if (receiver.text !== text) return false;

        // For `this.panel`, a nested `function` or class changes what `this` is; an arrow does not.
        // For a bare `panel`, a nested redeclaration of the same name shadows the receiver.
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
function classifyAccess(
    node: ts.PropertyAccessExpression,
    sourceFile: ts.SourceFile,
    writableMembers: ReadonlySet<string>,
    edits: Edit[]
): void {
    const parent = node.parent;

    // Already migrated: `x.member()` (call) or `x.member.set(...)` and the rest of the signal API.
    if (ts.isCallExpression(parent) && parent.expression === node) return;
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && SIGNAL_API_METHODS.has(parent.name.text))
        return;

    // Write target: `x.member = RHS` and every compound form (`+=`, `||=`, …). A writable member has a
    // mechanical translation to `.set(...)`; a read-only `input()` does not, so the write is left untouched
    // and becomes a compile error the consumer fixes by hand. Appending `()` would produce unparseable
    // TypeScript instead. Only a plain `=` translates: `x.member += 1` would need to read and write at once.
    if (ts.isBinaryExpression(parent) && parent.left === node && ASSIGNMENT_OPERATORS.has(parent.operatorToken.kind)) {
        if (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && writableMembers.has(node.name.text)) {
            const rhs = parent.right;

            edits.push({ start: node.getEnd(), end: rhs.getStart(sourceFile), text: '.set(' });
            edits.push({ start: rhs.getEnd(), end: rhs.getEnd(), text: ')' });
        }

        return;
    }

    // `x.member++` / `--x.member` and `delete x.member` are writes too, for the same reason.
    if ((ts.isPostfixUnaryExpression(parent) || ts.isPrefixUnaryExpression(parent)) && parent.operand === node) return;
    if (ts.isDeleteExpression(parent)) return;
    if (isDestructuringTarget(node)) return;

    // Read (incl. optional chain `x?.member`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/** Collects edits for every read of a signal member on a known receiver. */
function collectAccessEdits(
    sourceFile: ts.SourceFile,
    config: SignalMembersConfig,
    receivers: Receiver[],
    bindings: Binding[]
): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
            const receiver = resolveReceiver(node.expression, node, sourceFile, receivers, bindings);

            // Each type owns its own members, so a read only counts on the type that declares it. A signal
            // query holds the instance behind a call of its own, making the read `query().member()`;
            // appending one `()` would be wrong in both halves, so it is left to the warning.
            if (receiver && !receiver.signalQuery && config.membersByType[receiver.type]?.includes(node.name.text)) {
                classifyAccess(node, sourceFile, config.writableMembers, edits);
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** What a file's receivers need reported rather than rewritten. */
interface ReceiverWarnings {
    protectedAccess: Set<string>;
    /** Lines naming a migrated type in a position no receiver could be scoped to. */
    unresolved: number[];
}

/**
 * 1-based lines where a migrated type is named in a position `collectReceivers` cannot resolve — a union,
 * an array, a `QueryList<…>`, a cast, a return type — plus the reads the access pass structurally cannot
 * reach: `panel['items']` and `const { items } = panel`.
 */
function collectUnresolvedMentions(
    sourceFile: ts.SourceFile,
    config: SignalMembersConfig,
    resolved: Set<ts.Node>,
    typeNames: string[],
    receivers: Receiver[],
    bindings: Binding[]
): number[] {
    const lines = new Set<number>();
    const members = [...Object.values(config.membersByType).flat(), ...(config.protectedMembers ?? [])];
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

/** Collects the members read on a receiver that no consumer can keep reading as-is. */
function collectReceiverWarnings(sourceFile: ts.SourceFile, config: SignalMembersConfig): ReceiverWarnings {
    const protectedAccess = new Set<string>();
    const resolved = new Set<ts.Node>();
    const types = Object.keys(config.membersByType);
    const bindings = collectBindings(sourceFile);
    const receivers = collectAllReceivers(sourceFile, types, resolved);
    const typeNames = types.flatMap((type) => localTypeNames(sourceFile, type));
    const protectedMembers = config.protectedMembers ?? [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            protectedMembers.includes(node.name.text) &&
            resolveReceiver(node.expression, node, sourceFile, receivers, bindings)
        ) {
            protectedAccess.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return {
        protectedAccess,
        unresolved: collectUnresolvedMentions(sourceFile, config, resolved, typeNames, receivers, bindings)
    };
}

/** Pass A — rewrite programmatic reads of signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string, config: SignalMembersConfig): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectAllReceivers(sourceFile, Object.keys(config.membersByType));

    if (receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, config, receivers, collectBindings(sourceFile));

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** Attribute-name prefixes that mark the value as an Angular expression rather than a literal. */
const BINDING_PREFIX = /^(?:\[|\(|\*|bind-|bind(?:on)?-|on-)/;

/**
 * Walks a template's HTML AST, collecting what the rewrite needs: the reference variables bound to one of
 * the migrated types, the source ranges that actually hold Angular expressions, and every other name the
 * template introduces (so a `@for` variable sharing a ref's name is not rewritten).
 */
class TemplateScanner implements Visitor {
    readonly refs: TemplateRef[] = [];
    readonly otherNames = new Set<string>();
    readonly expressions: Range[] = [];

    /** The embedded view currently being walked; a ref declared in it is invisible outside. */
    private view: Range;

    constructor(
        private readonly template: string,
        private readonly config: SignalMembersConfig
    ) {
        this.view = { start: 0, end: template.length };
    }

    visitElement(element: any): void {
        const references: Array<{ name: string; value: string }> = [];

        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string') continue;

            const reference = this.referenceName(attr.name);

            if (reference !== undefined) {
                references.push({ name: reference, value: String(attr.value ?? '') });
                continue;
            }

            // `let-item` on an <ng-template> introduces a name the refs must not collide with.
            if (attr.name.startsWith('let-')) {
                this.otherNames.add(attr.name.slice(4));
                continue;
            }

            this.collectAttributeExpression(attr);
        }

        for (const { name, value } of references) {
            // `#t="kbqDropdownTrigger"` names a directive on the element; a bare `#d` on the element is the
            // component itself. `#d="cdkOverlayOrigin"` names something else entirely and must be ignored.
            const type = value ? this.config.exportAsToType[value] : this.config.elementToType[element.name];

            if (type) this.refs.push({ name, type, ...this.view });
            else this.otherNames.add(name);
        }

        this.inView(element.name === 'ng-template' ? element.sourceSpan : undefined, () => this.visitChildren(element));
    }

    visitBlock(block: any): void {
        for (const parameter of block.parameters ?? []) {
            const span = parameter.sourceSpan;

            if (!span) continue;

            this.expressions.push({ start: span.start.offset, end: span.end.offset });

            // `@for (item of rows; track item)` and `@if (x; as y)` introduce names of their own.
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
 * Matches `<ref>.<member>` inside a template expression. The lookbehind rejects `state.panel.items`, where
 * `\b` alone matches after the dot, and admits a `$`-prefixed ref that `\b` never could. Angular's grammar
 * allows whitespace around the dot, so a binding wrapped over two lines is matched too. The three groups skip
 * an already-migrated read, a signal-API call, and an assignment target that must not gain a `()`.
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
 * Rewrites `ref.member` reads to `ref.member()`, only inside the given expression ranges. Restricting the
 * rewrite to expressions is what keeps prose, comments and attribute names out of it.
 */
function rewriteRefReads(
    template: string,
    config: SignalMembersConfig,
    refs: TemplateRef[],
    expressions: Range[]
): { content: string; changed: boolean } {
    const edits: Edit[] = [];

    for (const { start, end } of expressions) {
        const source = template.slice(start, end);

        for (const ref of refs) {
            if (start < ref.start || end > ref.end) continue;

            const members = config.membersByType[ref.type] ?? [];

            if (members.length === 0) continue;

            for (const match of source.matchAll(memberAccessPattern(ref.name, members))) {
                const at = start + match.index + match[0].length;

                edits.push({ start: at, end: at, text: '()' });
            }
        }
    }

    return edits.length > 0
        ? { content: applyEdits(template, edits), changed: true }
        : { content: template, changed: false };
}

/** Protected members read through a reference variable, which no template can keep reading. */
function collectRefManualMembers(
    template: string,
    config: SignalMembersConfig,
    refs: TemplateRef[],
    expressions: Range[]
): Set<string> {
    const found = new Set<string>();
    const manual = config.protectedMembers ?? [];

    if (manual.length === 0) return found;

    for (const { start, end } of expressions) {
        const source = template.slice(start, end);

        for (const ref of refs) {
            if (start < ref.start || end > ref.end) continue;

            const pattern = new RegExp(
                `(?<![\\w$.])${escapeRegExp(ref.name)}\\s*\\??\\.\\s*(${manual.map(escapeRegExp).join('|')})\\b`,
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
    /** Protected members read through a ref that need a hand migration. */
    manual: Set<string>;
    /** The template renders the component but could not be parsed, so nothing in it was inspected. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({
    content: template,
    changed: false,
    manual: new Set(),
    unparseable: false
});

/** Whether a template renders any of the migrated elements, or names any of their `exportAs` values. */
function rendersComponent(template: string, config: SignalMembersConfig): boolean {
    return (
        Object.keys(config.elementToType).some((element) => template.includes(`<${element}`)) ||
        Object.keys(config.exportAsToType).some((exportAs) => template.includes(exportAs))
    );
}

/** Pass B (core) — parse a template, discover refs, rewrite their signal reads. */
async function migrateTemplate(template: string, config: SignalMembersConfig): Promise<TemplateResult> {
    if (!rendersComponent(template, config)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const scanner = new TemplateScanner(template, config);

    visitAll(scanner, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    // A ref whose name is also introduced by a `@for`, an `@let` or a foreign `#ref` is ambiguous: the
    // reads could belong to either, so neither is rewritten.
    const refs = scanner.refs.filter((ref) => !scanner.otherNames.has(ref.name));

    if (refs.length === 0) return untouched(template);

    return {
        ...rewriteRefReads(template, config, refs, scanner.expressions),
        manual: collectRefManualMembers(template, config, refs, scanner.expressions),
        unparseable: false
    };
}

/** Pass B (inline) — rewrite ref reads inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string,
    config: SignalMembersConfig
): Promise<{ content: string; manual: Set<string>; unparseable: boolean }> {
    const manual = new Set<string>();

    // Parsing the file to find inline templates is the expensive half, and most consumers have none.
    if (!rendersComponent(content, config)) return { content, manual, unparseable: false };

    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    let result = content;
    let unparseable = false;

    for (const { start, end } of ranges) {
        const outcome = await migrateTemplate(result.slice(start, end), config);

        for (const member of outcome.manual) manual.add(member);

        unparseable ||= outcome.unparseable;

        if (outcome.changed) {
            result = result.slice(0, start) + outcome.content + result.slice(end);
        }
    }

    return { content: result, manual, unparseable };
}

/**
 * Builds the rule for a `<component>-signals` migration from its policy.
 *
 * Compiled state — the warn patterns and the consumer test — is derived once here rather than per file:
 * the consumer test runs against every file of the project, and the warn patterns against every file that
 * passes it. None carries the `g` flag, so a shared instance holds no `lastIndex`.
 */
export function signalMembersRule(config: SignalMembersConfig, options: SignalMembersOptions): Rule {
    const { label } = config;
    const types = Object.keys(config.membersByType);
    const typeAnchor = new RegExp(`\\b(?:${types.map(escapeRegExp).join('|')})\\w*\\b`);
    const compiledWarnPatterns = config.warnPatterns.map(({ anchor, pattern, message }) => ({
        anchor: new RegExp(anchor),
        pattern: new RegExp(pattern),
        message
    }));

    const protectedMessage = (members: Iterable<string>) =>
        `These ${types[0]} members are \`protected\` now and can't be read from outside the component: ` +
        `${[...members].join(', ')}.${config.messages.protectedHint ? ` ${config.messages.protectedHint}` : ''}`;

    /**
     * A `.ts` file is a consumer if it names one of the migrated types, imports the package, or renders the
     * component in an inline template — a component that only imports the NgModule names no type.
     */
    const referencesComponent = (content: string): boolean =>
        typeAnchor.test(content) || content.includes(config.package) || rendersComponent(content, config);

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
                logMessage(context.logger, [`${label} would update ${filePath} (run with --fix to apply)`]);
            }
        };

        const reportUnparseable = (filePath: string) =>
            logMessage(context.logger, [`${label} ${filePath}`, `  ${config.messages.unparseableTemplate}`]);

        const warnTemplateMembers = (filePath: string, manual: Set<string>) => {
            if (manual.size === 0) return;

            logMessage(context.logger, [`${label} ${filePath}`, `  ${protectedMessage(manual)}`]);
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesComponent(original)) continue;

            consumers++;

            for (const { anchor, pattern, message } of compiledWarnPatterns) {
                if (!anchor.test(original) || !pattern.test(original)) continue;

                logMessage(context.logger, [`${label} ${filePath}`, `  ${message}`]);
            }

            const sourceFile = ts.createSourceFile(filePath, original, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
            const { protectedAccess, unresolved } = collectReceiverWarnings(sourceFile, config);

            if (protectedAccess.size > 0) {
                logMessage(context.logger, [`${label} ${filePath}`, `  ${protectedMessage(protectedAccess)}`]);
            }

            if (unresolved.length > 0) {
                logMessage(context.logger, [
                    `${label} ${filePath}`,
                    `  ${config.messages.unresolvedReceiver} ${unresolved.join(', ')}.`
                ]);
            }

            const content = migrateTsExpressions(original, filePath, config);
            const inline = await migrateInlineTemplates(content, filePath, config);

            warnTemplateMembers(filePath, inline.manual);

            if (inline.unparseable) reportUnparseable(filePath);

            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            // Counted on "renders the component", matching the `.ts` loop: a project whose only usage is a
            // plain binding in an external template still needs the summary.
            if (!original || !rendersComponent(original, config)) continue;

            consumers++;

            const outcome = await migrateTemplate(original, config);

            warnTemplateMembers(filePath, outcome.manual);

            if (outcome.unparseable) reportUnparseable(filePath);

            commit(filePath, original, outcome.content);
        }

        // Nothing here uses the component, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${label} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...config.messages.summary
        ]);
    };
}

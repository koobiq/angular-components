import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    AUTOCOMPLETE_ELEMENT,
    AUTOCOMPLETE_PACKAGE,
    EXPORT_AS_TO_TYPE,
    FUNCTION_VALUED_MEMBERS,
    MEMBERS_BY_TYPE,
    PROTECTED_HINT,
    PROTECTED_MEMBERS,
    RECEIVER_TYPES,
    SIGNAL_API_METHODS,
    SIGNAL_MEMBERS,
    SUMMARY,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    UNRESOLVED_RECEIVER_MESSAGE,
    warnPatterns,
    WRITABLE_MEMBERS
} from './data';
import { Schema } from './schema';

const LABEL = '[autocomplete-signals]';
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

/** A receiver whose static type is an autocomplete panel or trigger, valid within `scope`. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `autocomplete` or `this.autocomplete`. */
    text: string;
    /** The node whose subtree the receiver name is visible in. */
    scope: ts.Node;
    /** The declaration `text` resolves to. A nested redeclaration of the same name resolves elsewhere. */
    declaration: ts.Node;
    /** The type the annotation named, so only the members that type owns are rewritten. */
    type: string;
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

/** Nodes that rebind `this`, so `this.autocomplete` inside them is a different object. Arrows don't. */
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
 * Collects the receivers annotated with `typeName`, by explicit annotation only (no cross-package type
 * resolution): method/function params, class fields (incl. `@ViewChild(KbqAutocomplete) x: KbqAutocomplete`
 * and constructor parameter-properties) and typed locals. Annotations that resolve are recorded in
 * `resolved`, so the caller can report the mentions this pass could not turn into a receiver.
 */
function collectReceivers(
    sourceFile: ts.SourceFile,
    typeName: string,
    ownerType: string,
    resolved?: Set<ts.Node>
): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, declaration: ts.Node, scope: ts.Node | undefined) =>
        receivers.push({ text, declaration, scope: scope ?? sourceFile, type: ownerType });

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

/** Every receiver in the file, across both migrated types and their aliased imports. */
function collectAllReceivers(sourceFile: ts.SourceFile, resolved?: Set<ts.Node>): Receiver[] {
    return RECEIVER_TYPES.flatMap((type) =>
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
    const text = unwrapReceiver(expression).getText(sourceFile);

    return receivers.find((receiver) => {
        if (receiver.text !== text) return false;

        // For `this.autocomplete`, a nested `function` or class changes what `this` is; an arrow does not.
        // For a bare `autocomplete`, a nested redeclaration of the same name shadows the receiver.
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
function classifyAccess(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, edits: Edit[]): void {
    const parent = node.parent;
    const member = node.name.text;
    const functionValued = FUNCTION_VALUED_MEMBERS.includes(member);

    if (ts.isCallExpression(parent) && parent.expression === node) {
        // `a.displayWith(value)` is an invocation of the function the input holds, not a migrated signal
        // read: the value is a function, so the two calls are separate. Insert the read call.
        if (functionValued) edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });

        // Anything else already reads as a call — leave it alone, so the rewrite stays idempotent.
        return;
    }

    // Already migrated: `a.showPanel.set(...)` and the rest of the signal API.
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && SIGNAL_API_METHODS.has(parent.name.text))
        return;

    // Write target: `a.member = RHS` and every compound form (`+=`, `||=`, …). Only `showPanel` has a
    // writable half; the others become a compile error the consumer fixes by binding in the template.
    // Appending `()` to any of them would produce unparseable TypeScript.
    if (ts.isBinaryExpression(parent) && parent.left === node && ASSIGNMENT_OPERATORS.has(parent.operatorToken.kind)) {
        if (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && WRITABLE_MEMBERS.has(member)) {
            const rhs = parent.right;

            edits.push({ start: node.getEnd(), end: rhs.getStart(sourceFile), text: '.set(' });
            edits.push({ start: rhs.getEnd(), end: rhs.getEnd(), text: ')' });
        }

        return;
    }

    // `a.showPanel++` / `--a.showPanel` and `delete a.showPanel` are writes too, for the same reason.
    if ((ts.isPostfixUnaryExpression(parent) || ts.isPrefixUnaryExpression(parent)) && parent.operand === node) return;
    if (ts.isDeleteExpression(parent)) return;
    if (isDestructuringTarget(node)) return;

    // Read (incl. optional chain `a?.isOpen`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/** Collects edits for every read/write of a signal member on a known receiver. */
function collectAccessEdits(sourceFile: ts.SourceFile, receivers: Receiver[], bindings: Binding[]): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            SIGNAL_MEMBERS.includes(node.name.text)
        ) {
            const receiver = resolveReceiver(node.expression, node, sourceFile, receivers, bindings);

            // Each type owns its own members: `autocompleteDisabled` on the trigger, the rest on the panel.
            if (receiver && MEMBERS_BY_TYPE[receiver.type]?.includes(node.name.text)) {
                classifyAccess(node, sourceFile, edits);
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
 * 1-based lines where a migrated type is named in a position `collectReceivers` cannot resolve - a union,
 * an array, a `QueryList<…>`, a cast, a return type - plus the reads the access pass structurally cannot
 * reach: `a['isOpen']` and `const { isOpen } = a`.
 */
function collectUnresolvedMentions(
    sourceFile: ts.SourceFile,
    resolved: Set<ts.Node>,
    typeNames: string[],
    receivers: Receiver[],
    bindings: Binding[]
): number[] {
    const lines = new Set<number>();
    const members = [...SIGNAL_MEMBERS, ...PROTECTED_MEMBERS];
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
function collectReceiverWarnings(sourceFile: ts.SourceFile): ReceiverWarnings {
    const protectedAccess = new Set<string>();
    const resolved = new Set<ts.Node>();
    const bindings = collectBindings(sourceFile);
    const receivers = collectAllReceivers(sourceFile, resolved);
    const typeNames = RECEIVER_TYPES.flatMap((type) => localTypeNames(sourceFile, type));

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            PROTECTED_MEMBERS.includes(node.name.text) &&
            resolveReceiver(node.expression, node, sourceFile, receivers, bindings)
        ) {
            protectedAccess.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return {
        protectedAccess,
        unresolved: collectUnresolvedMentions(sourceFile, resolved, typeNames, receivers, bindings)
    };
}

/** Pass A — rewrite programmatic reads of autocomplete signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectAllReceivers(sourceFile);

    if (receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, receivers, collectBindings(sourceFile));

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** Emits precise, receiver-scoped warnings for the members that can't be auto-fixed. */
function warnReceiverMembers(context: SchematicContext, filePath: string, content: string): void {
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const { protectedAccess, unresolved } = collectReceiverWarnings(sourceFile);

    if (protectedAccess.size > 0) {
        logMessage(context.logger, [
            `${LABEL} ${filePath}`,
            `  These KbqAutocomplete members are now \`protected\` and can't be read from outside the ` +
                `component: ${[...protectedAccess].join(', ')}. ${PROTECTED_HINT}`
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

/** A reference variable, its owning type, and the embedded view it is valid in. */
interface TemplateRef extends Range {
    name: string;
    type: string;
}

/**
 * Walks a template's HTML AST, collecting what the rewrite needs: the reference variables bound to a
 * panel or a trigger, the source ranges that actually hold Angular expressions, and every other name the
 * template introduces (so a `@for` variable sharing a ref's name is not rewritten).
 */
class TemplateScanner implements Visitor {
    readonly refs: TemplateRef[] = [];
    readonly otherNames = new Set<string>();
    readonly expressions: Range[] = [];

    /** The embedded view currently being walked; a ref declared in it is invisible outside. */
    private view: Range;

    constructor(private readonly template: string) {
        this.view = { start: 0, end: template.length };
    }

    visitElement(element: any): void {
        const attrs = element.attrs ?? [];
        const references: Array<{ name: string; value: string }> = [];

        for (const attr of attrs) {
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
            // `#t="kbqAutocompleteTrigger"` names the directive; a bare `#auto` on the element is the panel.
            const type = value
                ? EXPORT_AS_TO_TYPE[value]
                : element.name === AUTOCOMPLETE_ELEMENT
                  ? 'KbqAutocomplete'
                  : undefined;

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

            // `@for (auto of items; track auto)` and `@if (x; as y)` introduce names of their own.
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
 * Matches `<ref>.<member>` inside a template expression. The lookbehind rejects `item.auto.isOpen`, where
 * `\b` alone matches after the dot, and admits a `$`-prefixed ref that `\b` never could. Angular's grammar
 * allows whitespace around the dot, so a binding wrapped over two lines is matched too. The three groups
 * skip an already-migrated read, a signal-API call on a writable member, and an assignment target.
 */
function memberAccessPattern(ref: string, members: readonly string[]): RegExp {
    const methods = [...SIGNAL_API_METHODS].join('|');

    return new RegExp(
        `(?<![\\w$.])(${escapeRegExp(ref)})\\s*\\??\\.\\s*(${members.join('|')})\\b` +
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
    refs: TemplateRef[],
    expressions: Range[]
): { content: string; changed: boolean } {
    const edits: Edit[] = [];

    for (const { start, end } of expressions) {
        const source = template.slice(start, end);

        for (const ref of refs) {
            if (start < ref.start || end > ref.end) continue;

            const members = MEMBERS_BY_TYPE[ref.type] ?? [];

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

/** Members read through a reference variable that the rewrite deliberately left alone. */
function collectRefManualMembers(template: string, refs: TemplateRef[], expressions: Range[]): Set<string> {
    const found = new Set<string>();

    for (const { start, end } of expressions) {
        const source = template.slice(start, end);

        for (const ref of refs) {
            if (start < ref.start || end > ref.end) continue;

            const owned = MEMBERS_BY_TYPE[ref.type] ?? [];
            const manual = [...PROTECTED_MEMBERS, ...FUNCTION_VALUED_MEMBERS.filter((m) => owned.includes(m))];

            if (manual.length === 0) continue;

            const pattern = new RegExp(
                `(?<![\\w$.])${escapeRegExp(ref.name)}\\s*\\??\\.\\s*(${manual.join('|')})\\b`,
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
    /** Members read through a ref that need a hand migration. */
    manual: Set<string>;
    /** The template renders the panel but could not be parsed, so nothing in it was inspected. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({
    content: template,
    changed: false,
    manual: new Set(),
    unparseable: false
});

/** Pass B (core) — parse a template, discover refs, rewrite their signal reads. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    if (!referencesAutocompleteTemplate(template)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const scanner = new TemplateScanner(template);

    visitAll(scanner, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    // A ref whose name is also introduced by a `@for`, an `@let` or a foreign `#ref` is ambiguous: the
    // reads could belong to either, so neither is rewritten.
    const refs = scanner.refs.filter((ref) => !scanner.otherNames.has(ref.name));

    if (refs.length === 0) return untouched(template);

    return {
        ...rewriteRefReads(template, refs, scanner.expressions),
        manual: collectRefManualMembers(template, refs, scanner.expressions),
        unparseable: false
    };
}

/** Whether a template can hold a panel or a trigger reference at all — the guard before any parsing. */
function referencesAutocompleteTemplate(template: string): boolean {
    return (
        template.includes(AUTOCOMPLETE_ELEMENT) ||
        Object.keys(EXPORT_AS_TO_TYPE).some((name) => template.includes(name))
    );
}

/** Pass B (inline) — rewrite ref reads inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; manual: Set<string>; unparseable: boolean }> {
    const manual = new Set<string>();

    // Parsing the file to find inline templates is the expensive half, and most consumers have none.
    if (!referencesAutocompleteTemplate(content)) return { content, manual, unparseable: false };

    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
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

/** Reports the members a template reads through a ref that the rewrite deliberately left alone. */
function warnTemplateMembers(context: SchematicContext, filePath: string, manual: Set<string>): void {
    if (manual.size === 0) return;

    const messages = [`${LABEL} ${filePath}`];
    const gone = PROTECTED_MEMBERS.filter((member) => manual.has(member));

    if (gone.length > 0) {
        messages.push(
            `  These KbqAutocomplete members are now \`protected\` and can't be read from a template: ` +
                `${gone.join(', ')}. ${PROTECTED_HINT}`
        );
    }

    for (const member of FUNCTION_VALUED_MEMBERS) {
        if (!manual.has(member)) continue;

        messages.push(
            `  \`${member}\` is an \`input()\` holding a function, so the read and the invocation are ` +
                `separate calls now: \`ref.${member}()(value)\`. Left untouched here.`
        );
    }

    if (messages.length > 1) logMessage(context.logger, messages);
}

/**
 * A `.ts` file is an autocomplete consumer if it names any of the exported symbols, imports the package,
 * or renders the element in an inline template — a component that only imports `KbqAutocompleteModule`
 * names no type.
 */
function referencesAutocomplete(content: string): boolean {
    return (
        /\bKbqAutocomplete\w*\b/.test(content) ||
        content.includes(AUTOCOMPLETE_PACKAGE) ||
        content.includes(`<${AUTOCOMPLETE_ELEMENT}`)
    );
}

export default function autocompleteSignals(options: Schema): Rule {
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

        const reportUnparseable = (filePath: string) =>
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesAutocomplete(original)) continue;

            consumers++;

            logWarnings(context, filePath, original);
            warnReceiverMembers(context, filePath, original);

            const content = migrateTsExpressions(original, filePath);
            const inline = await migrateInlineTemplates(content, filePath);

            warnTemplateMembers(context, filePath, inline.manual);

            if (inline.unparseable) reportUnparseable(filePath);

            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesAutocompleteTemplate(original)) continue;

            consumers++;

            // The `.html` half gets the file-scoped warnings too: a template is where an `isOpen =` write
            // most plausibly lives, and it used to get no report at all.
            logWarnings(context, filePath, original);

            const outcome = await migrateTemplate(original);

            warnTemplateMembers(context, filePath, outcome.manual);

            if (outcome.unparseable) reportUnparseable(filePath);

            commit(filePath, original, outcome.content);
        }

        // Nothing here uses the autocomplete, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import {
    DISABLED_CAVEAT,
    HIDDEN_MEMBERS,
    KNOWN_MEMBERS,
    LINK_PACKAGE,
    LINK_TYPE,
    PRIVATE_MEMBERS,
    privateMessage,
    PROTECTED_MEMBERS,
    protectedMessage,
    REMOVED_MEMBERS,
    removedMessage,
    SIGNAL_API_METHODS,
    SIGNAL_MEMBERS,
    signalQueryMessage,
    SUMMARY,
    VALUE_CHANGED_MEMBERS,
    valueChangedMessage,
    writeMessage
} from './data';
import { Schema } from './schema';

const LABEL = '[link-signals]';
const TS_EXT = '.ts';

/** Factories whose single argument gives the type of the declaration they set up. */
const TYPING_FACTORIES: ReadonlySet<string> = new Set(['inject', 'viewChild', 'contentChild']);

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A receiver whose static type is a link, valid within `scope`. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `link` or `this.link`. */
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

/** Nodes that rebind `this`, so `this.link` inside them is a different object. Arrows don't. */
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

/** Local names `KbqLink` is bound to in this file, including aliased imports. */
function localTypeNames(sourceFile: ts.SourceFile): string[] {
    const names = new Set<string>([LINK_TYPE]);

    const visit = (node: ts.Node): void => {
        if (ts.isImportSpecifier(node) && (node.propertyName?.text ?? node.name.text) === LINK_TYPE) {
            names.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return [...names];
}

/**
 * The link-ness of an initializer, for the shapes a modern Angular consumer writes: `inject(KbqLink)`,
 * `viewChild(KbqLink)`, `viewChild.required(…)`, `contentChild(…)`.
 */
function initializerTypeOf(
    initializer: ts.Expression | undefined,
    typeNames: string[]
): { link: boolean; signalQuery: boolean; required: boolean } {
    const none = { link: false, signalQuery: false, required: false };

    if (!initializer || !ts.isCallExpression(initializer)) return none;

    const callee = initializer.expression;
    const qualified = ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression);
    const name = ts.isIdentifier(callee) ? callee.text : qualified ? callee.expression.text : undefined;

    if (!name || !TYPING_FACTORIES.has(name)) return none;

    const [arg] = initializer.arguments;

    if (!arg || !ts.isIdentifier(arg) || !typeNames.includes(arg.text)) return none;

    // `viewChild.required(...)` is `Signal<KbqLink>`; the bare form adds `| undefined`.
    const required = qualified && (callee as ts.PropertyAccessExpression).name.text === 'required';

    return { link: true, signalQuery: name !== 'inject', required };
}

/**
 * Collects the link receivers: method/function params, class fields (incl. `@ViewChild(KbqLink) x: KbqLink`,
 * constructor parameter-properties and the `inject()` / `viewChild()` initializer forms) and typed locals.
 */
function collectReceivers(sourceFile: ts.SourceFile, typeNames: string[]): Receiver[] {
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
            add(node.name.text, node, findAncestor(node, ts.isFunctionLike));

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, node, owner);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
            const owner = findAncestor(node, ts.isClassDeclaration);
            const { link, signalQuery, required } = initializerTypeOf(node.initializer, typeNames);

            if (owner && (isTypeReference(node.type, typeNames) || link)) {
                add(`this.${node.name.text}`, node, owner, signalQuery, required);
            }
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const { link, signalQuery, required } = initializerTypeOf(node.initializer, typeNames);

            if (isTypeReference(node.type, typeNames) || link) {
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

    while (
        ts.isNonNullExpression(current) ||
        ts.isParenthesizedExpression(current) ||
        ts.isAsExpression(current) ||
        ts.isTypeAssertionExpression(current)
    ) {
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
    // `this . link` and `this /* x */ . link` spell the same receiver as `this.link`.
    const text = ts.isPropertyAccessExpression(inner)
        ? `${unwrapReceiver(inner.expression).getText(sourceFile).replace(/\s+/g, '')}.${inner.name.text}`
        : inner.getText(sourceFile);

    return receivers.find((receiver) => {
        if (receiver.text !== text) return false;

        // For `this.link`, a nested `function` or class changes what `this` is; an arrow does not.
        // For a bare `link`, a nested redeclaration of the same name shadows the receiver.
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
 * Classifies a matched property access and appends the resulting edit, if any. Only a plain read is
 * rewritten: every `KbqLink` signal member is an `input()`, so a write has no mechanical translation, and
 * appending `()` to it would produce unparseable TypeScript instead of the read-only error to fix by hand.
 */
function classifyAccess(node: ts.PropertyAccessExpression, edits: Edit[], rewritable: boolean): AccessKind {
    const parent = node.parent;

    // Already migrated: `x.disabled()` (call) or the signal API on it.
    if (ts.isCallExpression(parent) && parent.expression === node) return 'migrated';
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && SIGNAL_API_METHODS.has(parent.name.text))
        return 'migrated';

    // Write target: `x.disabled = RHS` and every compound form (`+=`, `??=`, `||=`, …).
    if (ts.isBinaryExpression(parent) && parent.left === node && ASSIGNMENT_OPERATORS.has(parent.operatorToken.kind))
        return 'write';

    // `x.disabled++` / `--x.disabled` and `delete x.disabled` are writes too. Only the increment operators
    // count: a `PrefixUnaryExpression` is also how `!x.disabled` and `-x.tabIndex` are spelled, and those
    // are reads.
    if (ts.isPostfixUnaryExpression(parent) && parent.operand === node) return 'write';
    if (ts.isPrefixUnaryExpression(parent) && parent.operand === node && INCREMENT_OPERATORS.has(parent.operator))
        return 'write';
    if (ts.isDeleteExpression(parent)) return 'write';
    if (isDestructuringTarget(node)) return 'write';

    // Read (incl. optional chain `x?.disabled`): append `()`.
    if (rewritable) edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });

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
    /** Members that left the public surface and are still read here. */
    hidden: Set<string>;
    /** Members whose read compiles but reports a different value. */
    valueChanged: Set<string>;
    signalQueryReads: SignalQueryRead[];
}

/** Collects the edits and the findings for every access on a known link receiver. */
function collectAccesses(sourceFile: ts.SourceFile, receivers: Receiver[], bindings: Binding[]): TsFindings {
    const edits: Edit[] = [];
    const writes = new Set<string>();
    const hidden = new Set<string>();
    const valueChanged = new Set<string>();
    const signalQueryReads: SignalQueryRead[] = [];

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
            const member = node.name.text;
            const receiver = KNOWN_MEMBERS.includes(member)
                ? resolveReceiver(node.expression, node, sourceFile, receivers, bindings)
                : undefined;

            if (receiver) {
                // A hidden member has no reachable spelling left, so classification would have nothing to
                // offer: report it whether it is read or written.
                if (HIDDEN_MEMBERS.includes(member)) {
                    hidden.add(member);
                } else if (receiver.signalQuery) {
                    // A signal query holds the directive behind a call of its own, so the read is
                    // `query().disabled()`. Appending one `()` would be wrong in both halves.
                    signalQueryReads.push({ member, required: receiver.required });
                } else if (classifyAccess(node, edits, SIGNAL_MEMBERS.includes(member)) === 'write') {
                    writes.add(member);
                } else if (VALUE_CHANGED_MEMBERS.includes(member)) {
                    valueChanged.add(member);
                }
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { edits, writes, hidden, valueChanged, signalQueryReads };
}

/** Rewrites the value-safe programmatic reads in one TypeScript file and reports the rest. */
function migrateTsExpressions(content: string, fileName: string): TsFindings & { content: string } {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const typeNames = localTypeNames(sourceFile);
    const receivers = collectReceivers(sourceFile, typeNames);
    const empty: TsFindings = {
        edits: [],
        writes: new Set(),
        hidden: new Set(),
        valueChanged: new Set(),
        signalQueryReads: []
    };

    if (receivers.length === 0) return { ...empty, content };

    const bindings = collectBindings(sourceFile);
    const findings = collectAccesses(sourceFile, receivers, bindings);

    return { ...findings, content: findings.edits.length > 0 ? applyEdits(content, findings.edits) : content };
}

/** Emits the per-file report for everything the rewrite could not do on its own. */
function report(context: SchematicContext, filePath: string, findings: TsFindings): void {
    const lines: string[] = [];
    const subset = (members: readonly string[]) => members.filter((member) => findings.hidden.has(member));

    const protectedMembers = subset(PROTECTED_MEMBERS);
    const privateMembers = subset(PRIVATE_MEMBERS);
    const removedMembers = subset(REMOVED_MEMBERS);

    if (protectedMembers.length > 0) lines.push(`  ${protectedMessage(protectedMembers)}`);
    if (privateMembers.length > 0) lines.push(`  ${privateMessage(privateMembers)}`);
    if (removedMembers.length > 0) lines.push(`  ${removedMessage(removedMembers)}`);
    if (findings.valueChanged.size > 0) lines.push(`  ${valueChangedMessage(findings.valueChanged)}`);
    if (findings.writes.size > 0) lines.push(`  ${writeMessage(findings.writes)}`);

    // The rewrite this file just got is correct but not value-identical, so the caveat belongs next to the
    // file it was applied to rather than in a summary printed once, after every edit has landed.
    if (findings.edits.length > 0) lines.push(DISABLED_CAVEAT);

    for (const { member, required } of findings.signalQueryReads) {
        lines.push(`  ${signalQueryMessage(member, required)}`);
    }

    if (lines.length === 0) return;

    logMessage(context.logger, [`${LABEL} ${filePath}`, ...lines]);
}

/**
 * A `.ts` file is a link consumer if it names any of the exported symbols or imports the package. There is
 * no element to look for: `kbq-link` is an attribute on an anchor.
 */
function referencesLink(content: string): boolean {
    return /\bKbqLink\w*\b/.test(content) || content.includes(LINK_PACKAGE);
}

export default function linkSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` runs a migration with no options at all, and `migrations.json` declares no schema, so
        // the schema default never reaches the rule: without this the migration would only ever report.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        const tsPaths: string[] = [];

        rootDir.visit((filePath) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;

            if (filePath.endsWith(TS_EXT)) tsPaths.push(filePath);
        });

        let touched = 0;
        let consumers = 0;

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesLink(original)) continue;

            consumers++;

            const findings = migrateTsExpressions(original, filePath);

            report(context, filePath, findings);

            if (findings.content === original) continue;

            touched++;

            if (fix) {
                tree.overwrite(filePath, findings.content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath}`]);
            }
        }

        // Nothing here uses the link, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

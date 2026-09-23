import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import {
    DIVIDER_PACKAGE,
    DIVIDER_TYPE,
    DIVIDER_TYPE_NAME,
    READ_MESSAGE,
    SIGNAL_INPUTS,
    SUMMARY,
    templateWarnPatterns,
    WarnPattern,
    WRITE_MESSAGE
} from './data';
import { Schema } from './schema';

const LABEL = '[divider-signals-and-aria]';
const TS_EXT = '.ts';
const HTML_EXT = '.html';

/** A declaration reachable as `text` within `[start, end]` of the source. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `divider` or `this.divider`. */
    text: string;
    start: number;
    end: number;
    /**
     * Whether the declaration was annotated `KbqDivider`. Declarations of any other type are collected
     * too, with `false`: an inner declaration shadows an outer one, so the migration has to see it to
     * know the name no longer refers to a divider at that point.
     */
    isDivider: boolean;
}

/** A file is worth parsing if it imports the package, names the component, or renders one. */
function referencesDivider(content: string): boolean {
    return content.includes(DIVIDER_PACKAGE) || new RegExp(DIVIDER_TYPE).test(content);
}

const isFunctionLike = (node: ts.Node): boolean =>
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node);

/** Nodes that confine a `let`/`const` declared inside them. */
const isBlockScopeContainer = (node: ts.Node): boolean =>
    ts.isBlock(node) ||
    ts.isSourceFile(node) ||
    ts.isModuleBlock(node) ||
    ts.isCaseBlock(node) ||
    ts.isForStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isForOfStatement(node);

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/** Walks up from `node` to the nearest ancestor matching `predicate`. */
function findAncestor(node: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node | undefined {
    let current = node.parent;

    while (current) {
        if (predicate(current)) return current;
        current = current.parent;
    }

    return undefined;
}

/** Whether a type annotation names `KbqDivider`. Explicit annotations only — no cross-package resolution. */
const isDividerType = (type: ts.TypeNode | undefined): boolean =>
    !!type &&
    ts.isTypeReferenceNode(type) &&
    ts.isIdentifier(type.typeName) &&
    type.typeName.text === DIVIDER_TYPE_NAME;

/**
 * Scope a local is visible in: a `let`/`const` is confined to its nearest block, a `var` to the whole
 * function. Giving a block-scoped local the whole function would let an access elsewhere match it even
 * where the name refers to a different, shadowing declaration.
 */
function variableScope(node: ts.VariableDeclaration, sourceFile: ts.SourceFile): ts.Node {
    const blockScoped = !!(node.parent.flags & ts.NodeFlags.BlockScoped);

    return findAncestor(node, blockScoped ? isBlockScopeContainer : isFunctionLike) ?? sourceFile;
}

/**
 * Collects the receivers annotated `KbqDivider` — method/function params, class fields (including
 * `@ViewChild(KbqDivider) x!: KbqDivider` and constructor parameter-properties) and typed locals.
 *
 * `vertical` and `paddings` are ordinary property names that plenty of unrelated objects carry, so the
 * receiver is what makes an access the divider's. Params and locals of any other type are collected as
 * well, so that a nested declaration reusing the name is seen to shadow the divider one.
 */
function collectReceivers(sourceFile: ts.SourceFile): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, scope: ts.Node, isDivider: boolean) =>
        receivers.push({ text, start: scope.getStart(sourceFile), end: scope.getEnd(), isDivider });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
            const isDivider = isDividerType(node.type);

            add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile, isDivider);

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (isDivider && node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, owner, true);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
            const owner = isDividerType(node.type) && findAncestor(node, ts.isClassDeclaration);

            if (owner) add(`this.${node.name.text}`, owner, true);
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            add(node.name.text, variableScope(node, sourceFile), isDividerType(node.type));
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return receivers;
}

/**
 * Whether a property access resolves to a divider receiver. The innermost enclosing declaration wins: a
 * nested param or local shadows an outer one of the same name.
 */
function isDividerAccess(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, receivers: Receiver[]): boolean {
    const receiverText = node.expression.getText(sourceFile);
    const start = node.getStart(sourceFile);
    const end = node.getEnd();

    let innermost: Receiver | undefined;

    for (const receiver of receivers) {
        if (receiver.text !== receiverText || start < receiver.start || end > receiver.end) continue;

        if (!innermost || receiver.start > innermost.start) innermost = receiver;
    }

    return !!innermost?.isDivider;
}

/**
 * Whether the access is the target of an assignment — plain (`=`) or compound (`+=`, `||=`, `??=`, ...).
 * Asking the AST rather than the operator's spelling is what keeps a comparison (`===`) on the read side,
 * where it belongs: it stays legal after the migration and silently compares against the signal itself.
 */
function isAssignmentTarget(node: ts.PropertyAccessExpression): boolean {
    const parent = node.parent;

    if (ts.isBinaryExpression(parent) && parent.left === node) {
        // The assignment operators are contiguous in `SyntaxKind` and the comparisons sit well below
        // them, so the range covers `=` through `??=` without catching `==` / `===` / `>=`.
        const operator = parent.operatorToken.kind;

        return operator >= ts.SyntaxKind.FirstAssignment && operator <= ts.SyntaxKind.LastAssignment;
    }

    return (
        (ts.isPostfixUnaryExpression(parent) || ts.isPrefixUnaryExpression(parent)) &&
        (parent.operator === ts.SyntaxKind.PlusPlusToken || parent.operator === ts.SyntaxKind.MinusMinusToken)
    );
}

/** The already-migrated shape — `divider.vertical()` needs no report. */
const isCallee = (node: ts.PropertyAccessExpression): boolean =>
    ts.isCallExpression(node.parent) && node.parent.expression === node;

/** Reports the member accesses that resolve to a `KbqDivider`, split into writes and reads. */
function reportMemberAccess(context: SchematicContext, filePath: string, content: string): number {
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
    const receivers = collectReceivers(sourceFile);

    let writes = false;
    let reads = false;

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            SIGNAL_INPUTS.includes(node.name.text) &&
            !isCallee(node) &&
            isDividerAccess(node, sourceFile, receivers)
        ) {
            if (isAssignmentTarget(node)) writes = true;
            else reads = true;
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    let reported = 0;

    for (const message of [writes ? WRITE_MESSAGE : undefined, reads ? READ_MESSAGE : undefined]) {
        if (!message) continue;

        reported++;

        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
    }

    return reported;
}

/** Reports every pattern that matches, one line per pattern. */
function reportPatterns(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]): number {
    let reported = 0;

    for (const { pattern, message } of patterns) {
        if (!new RegExp(pattern).test(content)) continue;

        reported++;

        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
    }

    return reported;
}

/**
 * Reports the `KbqDivider` inputs that became signals, the hand-rolled separator attributes the component
 * now renders itself. Never writes: a read becomes a call, a write becomes a binding, and whether a
 * duplicate attribute should be deleted or replaced by `decorative` is a decision.
 */
export default function dividerSignalsAndAria(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        let consumers = 0;
        let reported = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;

            const isTs = filePath.endsWith(TS_EXT);
            const isHtml = filePath.endsWith(HTML_EXT);

            if (!isTs && !isHtml) return;

            const content = entry?.content.toString();

            if (!content || !referencesDivider(content)) return;

            consumers++;

            // An inline template lives in the `.ts` file, so the element patterns apply to both.
            reported += reportPatterns(context, filePath, content, templateWarnPatterns);

            if (isTs) reported += reportMemberAccess(context, filePath, content);
        });

        // Nothing here renders a divider, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed kbq-divider under "${root || '<workspace root>'}", ` +
                `${consumers} file(s) reference the component, ${reported} report(s) emitted.`,
            ...SUMMARY
        ]);
    };
}

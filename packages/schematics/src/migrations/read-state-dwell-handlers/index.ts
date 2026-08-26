import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { DIRECTIVE_TYPE, RENAMES, TIMESTAMP_MESSAGE, WARN_MEMBERS, warnPatterns } from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const LABEL = '[read-state-dwell-handlers]';

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A receiver whose static type is the directive, valid within `[start, end]` of the source. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `readState` or `this.readState`. */
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

/** Whether a type annotation refers to the directive. */
function isDirectiveType(type: ts.TypeNode | undefined): boolean {
    return (
        !!type &&
        ts.isTypeReferenceNode(type) &&
        ts.isIdentifier(type.typeName) &&
        type.typeName.text === DIRECTIVE_TYPE
    );
}

/**
 * Whether an initializer is `inject(KbqReadStateDirective, …)` or `inject<KbqReadStateDirective>(…)`.
 * The directive has no selector, so a host reaches it through `inject()` and usually leaves the field
 * without a type annotation.
 */
function isDirectiveInject(initializer: ts.Expression | undefined): boolean {
    if (!initializer || !ts.isCallExpression(initializer)) return false;
    if (!ts.isIdentifier(initializer.expression) || initializer.expression.text !== 'inject') return false;

    const [first] = initializer.arguments;

    return (
        (!!first && ts.isIdentifier(first) && first.text === DIRECTIVE_TYPE) ||
        (initializer.typeArguments ?? []).some(isDirectiveType)
    );
}

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/**
 * Collects the receivers whose static type is the directive, by explicit annotation or by an
 * `inject()` initializer (no cross-package type resolution): method/function params, class fields
 * (incl. constructor parameter-properties) and typed locals.
 */
function collectReceivers(sourceFile: ts.SourceFile): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, scope: ts.Node) =>
        receivers.push({ text, start: scope.getStart(sourceFile), end: scope.getEnd() });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name) && isDirectiveType(node.type)) {
            add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile);

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, owner);
            }
        } else if (
            ts.isPropertyDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            (isDirectiveType(node.type) || isDirectiveInject(node.initializer))
        ) {
            const owner = findAncestor(node, ts.isClassDeclaration);

            if (owner) add(`this.${node.name.text}`, owner);
        } else if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            (isDirectiveType(node.type) || isDirectiveInject(node.initializer))
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

/** Walks every property access made on a known directive receiver. */
function forEachReceiverAccess(
    sourceFile: ts.SourceFile,
    receivers: Receiver[],
    visitor: (node: ts.PropertyAccessExpression, name: string) => void
): void {
    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            inReceiverScope(node, sourceFile, receivers)
        ) {
            visitor(node, node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);
}

function parse(content: string, fileName: string): ts.SourceFile {
    return ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/** Rewrites the renamed handlers on every receiver typed as the directive. */
function migrateTs(content: string, fileName: string): string {
    const sourceFile = parse(content, fileName);
    const receivers = collectReceivers(sourceFile);

    if (receivers.length === 0) return content;

    const edits: Edit[] = [];

    forEachReceiverAccess(sourceFile, receivers, (node, name) => {
        const renamed = RENAMES.get(name);

        if (renamed) {
            edits.push({ start: node.name.getStart(sourceFile), end: node.name.getEnd(), text: renamed });
        }
    });

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** Reports the members that changed shape rather than name. */
function warnReceiverMembers(context: SchematicContext, filePath: string, content: string): void {
    const sourceFile = parse(content, filePath);
    const receivers = collectReceivers(sourceFile);

    if (receivers.length === 0) return;

    let found = false;

    forEachReceiverAccess(sourceFile, receivers, (_node, name) => {
        if (WARN_MEMBERS.includes(name)) found = true;
    });

    if (found) {
        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${TIMESTAMP_MESSAGE}`]);
    }
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { pattern, message } of warnPatterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

export default function readStateDwellHandlers(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json declares no
        // schema, so the schema default never reaches us — applying the fix is the intended behaviour
        // there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        const filePaths: string[] = [];

        rootDir.visit((filePath: Path) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (filePath.endsWith(TS_EXT)) filePaths.push(filePath);
        });

        let touched = 0;

        for (const filePath of filePaths) {
            const original = tree.read(filePath)?.toString();

            // The directive has no selector — it is reachable through `hostDirectives` and `inject()`
            // only, so a consumer always names it.
            if (!original || !original.includes(DIRECTIVE_TYPE)) continue;

            logWarnings(context, filePath, original);
            warnReceiverMembers(context, filePath, original);

            const content = migrateTs(original, filePath);

            if (content === original) continue;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        }

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

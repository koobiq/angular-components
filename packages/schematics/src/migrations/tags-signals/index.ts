import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { SIGNAL_MEMBERS, SUMMARY, TAG_INPUT_TYPE, TAGS_PACKAGE, warnPatterns, WRITABLE_MEMBERS } from './data';
import { Schema } from './schema';

const LABEL = '[tags-signals]';
const TS_EXT = '.ts';

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A receiver whose static type is a tagInput, valid within `[start, end]` of the source. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `tagInput` or `this.tagInput`. */
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
 * resolution): method/function params, class fields (incl. `@ViewChild(KbqTagInput) x: KbqTagInput` and constructor
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

/** Classifies a matched property access and appends the resulting edit(s). */
function classifyAccess(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, edits: Edit[]): void {
    const parent = node.parent;

    // Already migrated: a call, or a `.set(...)` write — leave alone (idempotent).
    if (ts.isCallExpression(parent) && parent.expression === node) return;
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && parent.name.text === 'set') return;

    // Write target: `x.member = RHS`. Every KbqTagInput signal member is `input()` (read-only), so there is no
    // writable member — leave the write untouched (it becomes a compile error the consumer fixes by hand).
    if (
        ts.isBinaryExpression(parent) &&
        parent.left === node &&
        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
        if (WRITABLE_MEMBERS.has(node.name.text)) {
            const rhs = parent.right;

            edits.push({ start: node.getEnd(), end: rhs.getStart(sourceFile), text: '.set(' });
            edits.push({ start: rhs.getEnd(), end: rhs.getEnd(), text: ')' });
        }

        return;
    }

    // Read (incl. optional chain `x?.compact`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/** Collects edits for every read/write of a value-safe signal member on a known tagInput receiver. */
function collectAccessEdits(sourceFile: ts.SourceFile, receivers: Receiver[]): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            SIGNAL_MEMBERS.includes(node.name.text) &&
            inReceiverScope(node, sourceFile, receivers)
        ) {
            classifyAccess(node, sourceFile, edits);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** Pass A — rewrite value-safe programmatic reads of tagInput signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile, TAG_INPUT_TYPE);

    if (receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, receivers);

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { anchor, pattern, message } of warnPatterns) {
        if (!new RegExp(anchor).test(content) || !new RegExp(pattern).test(content)) continue;

        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
    }
}

/**
 * A `.ts` file is a tags consumer if it names any of the exported symbols or imports the package. There is
 * no element pass: `kbqTagInputFor` is an attribute on a native `<input>`, and nothing on `<kbq-tag>` or
 * `<kbq-tag-list>` changed its read syntax.
 */
function referencesTags(content: string): boolean {
    return /\bKbqTag\w*\b/.test(content) || content.includes(TAGS_PACKAGE);
}

export default function tagInputSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix } = options;
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

            if (!original || !referencesTags(original)) continue;

            consumers++;

            logWarnings(context, filePath, original);

            commit(filePath, original, migrateTsExpressions(original, filePath));
        }

        // Nothing here uses the tagInput, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}

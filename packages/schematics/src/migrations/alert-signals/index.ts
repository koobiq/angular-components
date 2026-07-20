import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { forEachClass, parseTemplate } from '../../utils/typescript';
import {
    ALERT_ELEMENT,
    ALERT_TYPE,
    PROTECTED_MEMBERS,
    SIGNAL_MEMBERS,
    VALUE_CHANGED_MEMBERS,
    warnPatterns,
    WRITABLE_MEMBERS
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A receiver whose static type is an alert, valid within `[start, end]` of the source. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `alert` or `this.alert`. */
    text: string;
    start: number;
    end: number;
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

/** Whether a type annotation refers to the alert (`KbqAlert`). */
function isAlertType(type: ts.TypeNode | undefined): boolean {
    return (
        !!type && ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName) && type.typeName.text === ALERT_TYPE
    );
}

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/**
 * Collects the receivers whose static type is an alert, by explicit annotation only (no cross-package type
 * resolution): method/function params, class fields (incl. `@ViewChild(KbqAlert) x: KbqAlert` and constructor
 * parameter-properties) and typed locals.
 */
function collectReceivers(sourceFile: ts.SourceFile): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, scope: ts.Node) =>
        receivers.push({ text, start: scope.getStart(sourceFile), end: scope.getEnd() });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name) && isAlertType(node.type)) {
            add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile);

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, owner);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name) && isAlertType(node.type)) {
            const owner = findAncestor(node, ts.isClassDeclaration);

            if (owner) add(`this.${node.name.text}`, owner);
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && isAlertType(node.type)) {
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

    // Already migrated: `x.compact()` (call) or `x.compact.set(...)` — leave alone (idempotent).
    if (ts.isCallExpression(parent) && parent.expression === node) return;
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node && parent.name.text === 'set') return;

    // Write target: `x.compact = RHS`. `KbqAlert` signal members are `input()` (read-only), so there is no
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

/** Collects edits for every read/write of a value-safe signal member on a known alert receiver. */
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

/** Distinct member names accessed on an alert receiver that need manual migration. */
interface ReceiverWarnings {
    valueChanged: Set<string>;
    protectedAccess: Set<string>;
}

/** Collects the manual-migration members (`alertColor`, now-`protected` queries) read on an alert receiver. */
function collectReceiverWarnings(sourceFile: ts.SourceFile, receivers: Receiver[]): ReceiverWarnings {
    const valueChanged = new Set<string>();
    const protectedAccess = new Set<string>();

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            inReceiverScope(node, sourceFile, receivers)
        ) {
            const name = node.name.text;

            if (VALUE_CHANGED_MEMBERS.includes(name)) valueChanged.add(name);
            else if (PROTECTED_MEMBERS.includes(name)) protectedAccess.add(name);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { valueChanged, protectedAccess };
}

/** Pass A — rewrite value-safe programmatic reads of alert signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile);

    if (receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, receivers);

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** Emits precise, receiver-scoped warnings for the members that can't be auto-fixed. */
function warnReceiverMembers(context: SchematicContext, filePath: string, content: string): void {
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile);

    if (receivers.length === 0) return;

    const { valueChanged, protectedAccess } = collectReceiverWarnings(sourceFile, receivers);

    if (valueChanged.size > 0) {
        logMessage(context.logger, [
            `[alert-signals] ${filePath}`,
            `  \`alertColor\` is now a read-only InputSignal — read it as \`alert.alertColor()\`. Its value also`,
            `  changed: the getter used to return the CSS class \`kbq-alert_<color>\`, it now returns the raw color`,
            `  (e.g. \`error\`). Programmatic writes (\`alert.alertColor = …\`) are no longer possible — bind`,
            `  \`[alertColor]\` in the template instead. Migrate this by hand.`
        ]);
    }

    if (protectedAccess.size > 0) {
        logMessage(context.logger, [
            `[alert-signals] ${filePath}`,
            `  These KbqAlert members are now \`protected\` and can't be read from outside the component: ` +
                `${[...protectedAccess].join(', ')}. Refactor to avoid reading them.`
        ]);
    }
}

/** Collects template reference variable names bound to a `<kbq-alert>` element. */
class AlertRefCollector implements Visitor {
    readonly refs = new Set<string>();

    visitElement(element: any): void {
        if (element.name === ALERT_ELEMENT) {
            for (const attr of element.attrs ?? []) {
                if (typeof attr.name !== 'string') continue;

                if (attr.name.startsWith('#')) this.refs.add(attr.name.slice(1));
                else if (attr.name.startsWith('ref-')) this.refs.add(attr.name.slice(4));
            }
        }

        this.visitChildren(element);
    }

    visitBlock(block: any): void {
        this.visitChildren(block);
    }

    private visitChildren(node: any): void {
        for (const child of node.children ?? []) {
            child.visit(this);
        }
    }

    visitAttribute(): void {}
    visitText(): void {}
    visitComment(): void {}
    visitExpansion(): void {}
    visitExpansionCase(): void {}
    visitBlockParameter(): void {}
    visitLetDeclaration(): void {}
}

/** Rewrites `ref.member` reads to `ref.member()` for the given refs, scoped to those exact identifiers. */
function rewriteRefReads(template: string, refs: string[]): { content: string; changed: boolean } {
    const members = SIGNAL_MEMBERS.join('|');
    let content = template;
    let changed = false;

    for (const ref of refs) {
        // `\bref\.(member)\b(?!\s*\()` — skip anything already invoked, so the rewrite is idempotent.
        const pattern = new RegExp(`\\b(${escapeRegExp(ref)})\\.(${members})\\b(?!\\s*\\()`, 'g');
        const next = content.replace(pattern, '$1.$2()');

        if (next !== content) {
            content = next;
            changed = true;
        }
    }

    return { content, changed };
}

/** Pass B (core) — parse a template, discover alert refs, rewrite their value-safe signal reads. */
async function migrateTemplate(template: string): Promise<{ content: string; changed: boolean }> {
    if (!template.includes(ALERT_ELEMENT)) return { content: template, changed: false };

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { content: template, changed: false };

    const collector = new AlertRefCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    if (collector.refs.size === 0) return { content: template, changed: false };

    return rewriteRefReads(template, [...collector.refs]);
}

/** Interior `[start, end]` ranges of inline `@Component({ template: '…' })` string literals. */
function collectInlineTemplateRanges(sourceFile: ts.SourceFile): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];

    forEachClass(sourceFile, (node) => {
        const decorator = ts
            .getDecorators(node)
            ?.find(
                (dec) =>
                    ts.isCallExpression(dec.expression) &&
                    ts.isIdentifier(dec.expression.expression) &&
                    dec.expression.expression.text === 'Component'
            );

        if (!decorator || !ts.isCallExpression(decorator.expression)) return;

        const [arg] = decorator.expression.arguments;

        if (!arg || !ts.isObjectLiteralExpression(arg)) return;

        for (const prop of arg.properties) {
            if (
                ts.isPropertyAssignment(prop) &&
                (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name)) &&
                prop.name.text === 'template' &&
                ts.isStringLiteralLike(prop.initializer) &&
                prop.initializer.text
            ) {
                // +1 / -1 to exclude the opening/closing quote characters.
                ranges.push({ start: prop.initializer.getStart(sourceFile) + 1, end: prop.initializer.getEnd() - 1 });
            }
        }
    });

    return ranges;
}

/** Pass B (inline) — rewrite alert ref reads inside inline component templates. */
async function migrateInlineTemplates(content: string, fileName: string): Promise<string> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    let result = content;

    for (const { start, end } of ranges) {
        const { content: rewritten, changed } = await migrateTemplate(result.slice(start, end));

        if (changed) {
            result = result.slice(0, start) + rewritten + result.slice(end);
        }
    }

    return result;
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { pattern, message } of warnPatterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`[alert-signals] ${filePath}`, `  ${message}`]);
        }
    }
}

/** A `.ts` file is an alert consumer if it names the type/module or imports the package. */
function referencesAlert(content: string): boolean {
    return /\bKbqAlert\b/.test(content) || content.includes('@koobiq/components/alert');
}

export default function alertSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix } = options;
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

        const commit = (filePath: string, original: string, updated: string) => {
            if (updated === original) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, updated);
            } else {
                logMessage(context.logger, [`[alert-signals] would update ${filePath} (run with --fix to apply)`]);
            }
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesAlert(original)) continue;

            logWarnings(context, filePath, original);
            warnReceiverMembers(context, filePath, original);

            let content = migrateTsExpressions(original, filePath);

            content = await migrateInlineTemplates(content, filePath);

            commit(filePath, original, content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const { content, changed } = await migrateTemplate(original);

            if (changed) commit(filePath, original, content);
        }

        logMessage(context.logger, [
            `[alert-signals] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

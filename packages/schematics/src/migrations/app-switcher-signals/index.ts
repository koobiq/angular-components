import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    BEHAVIOUR_NOTE,
    MANUAL_MEMBERS,
    OUTPUT_TO_MODEL,
    SIGNAL_API_METHODS,
    SIGNAL_MEMBERS,
    TRIGGER_EXPORT_AS,
    TRIGGER_TYPE,
    tsWarnPatterns,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    WRITABLE_MEMBERS
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';

const LABEL = '[app-switcher-signals]';

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A receiver whose static type is the trigger, valid within `[start, end]` of the source. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `trigger` or `this.trigger`. */
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

/** Whether a type annotation refers to the trigger (`KbqAppSwitcherTrigger`). */
function isTriggerType(type: ts.TypeNode | undefined): boolean {
    return (
        !!type && ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName) && type.typeName.text === TRIGGER_TYPE
    );
}

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/**
 * Collects the receivers whose static type is the trigger, by explicit annotation only (no cross-package type
 * resolution): method/function params, class fields (incl. `@ViewChild(KbqAppSwitcherTrigger) x:
 * KbqAppSwitcherTrigger` and constructor parameter-properties) and typed locals.
 */
function collectReceivers(sourceFile: ts.SourceFile): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, scope: ts.Node) =>
        receivers.push({ text, start: scope.getStart(sourceFile), end: scope.getEnd() });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name) && isTriggerType(node.type)) {
            add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile);

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, owner);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name) && isTriggerType(node.type)) {
            const owner = findAncestor(node, ts.isClassDeclaration);

            if (owner) add(`this.${node.name.text}`, owner);
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && isTriggerType(node.type)) {
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

/** The signal/model method a member access is immediately followed by, if any (`x.selectedApp.set`). */
function followedByMethod(node: ts.PropertyAccessExpression): string | undefined {
    const parent = node.parent;

    return ts.isPropertyAccessExpression(parent) && parent.expression === node ? parent.name.text : undefined;
}

/** Classifies a matched property access of a value-safe signal member and appends the resulting edit(s). */
function classifySignalAccess(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, edits: Edit[]): void {
    const parent = node.parent;

    // Already migrated: `x.selectedApp()` (call) or `x.selectedApp.set(…)` / `.subscribe(…)` — leave alone.
    if (ts.isCallExpression(parent) && parent.expression === node) return;

    const method = followedByMethod(node);

    if (method && SIGNAL_API_METHODS.has(method)) return;

    // Write target: `x.selectedApp = RHS` → `x.selectedApp.set(RHS)`.
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

    // Read (incl. optional chain `x?.selectedApp`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/**
 * Renames an output that became the implicit output of a model, but only where the two are interchangeable:
 * `x.selectedAppChange.subscribe(fn)` → `x.selectedApp.subscribe(fn)`, because `ModelSignal` implements
 * `OutputRef`. Anything else (notably `.emit(v)`) is left for the warning.
 */
function classifyOutputAccess(node: ts.PropertyAccessExpression, edits: Edit[]): void {
    const model = OUTPUT_TO_MODEL.get(node.name.text);

    if (!model || followedByMethod(node) !== 'subscribe') return;

    edits.push({ start: node.name.getStart(node.getSourceFile()), end: node.name.getEnd(), text: model });
}

/** Collects edits for every access of a migratable member on a known trigger receiver. */
function collectAccessEdits(sourceFile: ts.SourceFile, receivers: Receiver[]): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            inReceiverScope(node, sourceFile, receivers)
        ) {
            if (SIGNAL_MEMBERS.includes(node.name.text)) classifySignalAccess(node, sourceFile, edits);
            else classifyOutputAccess(node, edits);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** Pass A — rewrite value-safe programmatic accesses of trigger signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile);

    if (receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, receivers);

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** Members needing manual migration, found on a trigger receiver in TypeScript code. */
function collectManualMembers(content: string, fileName: string): Set<string> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile);
    const found = new Set<string>();

    if (receivers.length === 0) return found;

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            MANUAL_MEMBERS.has(node.name.text) &&
            inReceiverScope(node, sourceFile, receivers)
        ) {
            found.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return found;
}

/** Collects template reference variable names exported as the trigger (`#ref="kbqAppSwitcher"`). */
class TriggerRefCollector implements Visitor {
    readonly refs = new Set<string>();

    visitElement(element: any): void {
        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string' || attr.value !== TRIGGER_EXPORT_AS) continue;

            if (attr.name.startsWith('#')) this.refs.add(attr.name.slice(1));
            else if (attr.name.startsWith('ref-')) this.refs.add(attr.name.slice(4));
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

/**
 * Matches `<ref>.<member>` where the access is neither already a call nor a signal-API call. `\b` after the
 * member keeps `selectedApp` from matching inside `selectedAppChange`.
 */
function memberAccessPattern(ref: string, members: readonly string[]): RegExp {
    const methods = [...SIGNAL_API_METHODS].join('|');

    return new RegExp(
        `\\b(${escapeRegExp(ref)})\\.(${members.join('|')})\\b(?!\\s*\\()(?!\\s*\\.\\s*(?:${methods})\\b)`,
        'g'
    );
}

/** Rewrites `ref.selectedApp` reads to `ref.selectedApp()` for the given refs. */
function rewriteRefReads(template: string, refs: string[]): { content: string; changed: boolean } {
    let content = template;
    let changed = false;

    for (const ref of refs) {
        const next = content.replace(memberAccessPattern(ref, SIGNAL_MEMBERS), '$1.$2()');

        if (next !== content) {
            content = next;
            changed = true;
        }
    }

    return { content, changed };
}

/** Members needing manual migration, read through a trigger reference variable in a template. */
function collectRefManualMembers(template: string, refs: string[]): Set<string> {
    const members = [...MANUAL_MEMBERS.keys()];
    const found = new Set<string>();

    for (const ref of refs) {
        // `\bref\.(member)\b` — a template can only read these, so no call/method exclusions are needed.
        const pattern = new RegExp(`\\b${escapeRegExp(ref)}\\.(${members.join('|')})\\b`, 'g');

        for (const match of template.matchAll(pattern)) {
            found.add(match[1]);
        }
    }

    return found;
}

interface TemplateResult {
    content: string;
    changed: boolean;
    manual: Set<string>;
    /** The template names the trigger but could not be parsed, so nothing was inspected or rewritten. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({
    content: template,
    changed: false,
    manual: new Set(),
    unparseable: false
});

/** Pass B (core) — parse a template, discover trigger refs, rewrite their value-safe reads. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    if (!template.includes(TRIGGER_EXPORT_AS)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const collector = new TriggerRefCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    if (collector.refs.size === 0) return untouched(template);

    const refs = [...collector.refs];

    return { ...rewriteRefReads(template, refs), manual: collectRefManualMembers(template, refs), unparseable: false };
}

/** Pass B (inline) — rewrite trigger ref reads inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; manual: Set<string>; unparseable: boolean }> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const manual = new Set<string>();
    let result = content;
    let unparseable = false;

    // Splice right-to-left so earlier offsets stay valid.
    for (const { start, end } of collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start)) {
        const migrated = await migrateTemplate(result.slice(start, end));

        migrated.manual.forEach((member) => manual.add(member));
        unparseable ||= migrated.unparseable;

        if (migrated.changed) {
            result = result.slice(0, start) + migrated.content + result.slice(end);
        }
    }

    return { content: result, manual, unparseable };
}

function logPatternWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { pattern, message } of tsWarnPatterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

function logManualMembers(context: SchematicContext, filePath: string, members: Set<string>): void {
    for (const member of members) {
        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${MANUAL_MEMBERS.get(member)}`]);
    }
}

/** A `.ts` file is an app-switcher consumer if it names one of its symbols or imports the package. */
function referencesAppSwitcher(content: string): boolean {
    return /\bKbqAppSwitcher\w*\b/.test(content) || content.includes('@koobiq/components/app-switcher');
}

export default function appSwitcherSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema, so the
        // schema default never reaches us — applying the fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        const tsPaths: Path[] = [];
        const htmlPaths: Path[] = [];

        rootDir.visit((filePath: Path) => {
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
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesAppSwitcher(original)) continue;

            const withExpressions = migrateTsExpressions(original, filePath);
            const inline = await migrateInlineTemplates(withExpressions, filePath);
            const content = inline.content;

            // Warn on what is left over, so an auto-fixed usage does not also produce a "manual migration
            // required" note. In dry-run mode the fix is not written, so report against the original.
            const reported = fix ? content : original;

            logPatternWarnings(context, filePath, reported);
            logManualMembers(context, filePath, collectManualMembers(reported, filePath));
            logManualMembers(context, filePath, inline.manual);

            if (inline.unparseable) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);
            }

            commit(filePath, original, content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const migrated = await migrateTemplate(original);

            logManualMembers(context, filePath, migrated.manual);

            if (migrated.unparseable) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);
            }

            if (migrated.changed) commit(filePath, original, migrated.content);
        }

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            '',
            ...BEHAVIOUR_NOTE
        ]);
    };
}

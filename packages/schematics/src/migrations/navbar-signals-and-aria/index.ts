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
    NavbarReceiverType,
    ORIENTATION_READS,
    ORIENTATION_WRITES,
    RECEIVER_TYPES,
    RECTANGLE_TYPE,
    SIGNAL_API_METHODS,
    styleWarnPatterns,
    tsWarnPatterns,
    UNPARSEABLE_TEMPLATE_MESSAGE
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const STYLE_EXTS = ['.scss', '.css'];

const LABEL = '[navbar-signals-and-aria]';

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A receiver whose static type is a navbar class, valid within `[start, end]` of the source. */
interface Receiver {
    /** Source text of the receiver expression, e.g. `navbar` or `this.navbar`. */
    text: string;
    start: number;
    end: number;
    /** The navbar class the receiver was annotated with. */
    typeName: string;
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

const RECEIVER_TYPE_NAMES = new Set([...RECEIVER_TYPES.map(({ type }) => type), RECTANGLE_TYPE]);

const receiverTypeOf = (typeName: string): NavbarReceiverType | undefined =>
    RECEIVER_TYPES.find(({ type }) => type === typeName);

/** The navbar class a type annotation refers to, if any. */
function navbarTypeName(type: ts.TypeNode | undefined): string | undefined {
    if (!type || !ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) return undefined;

    return RECEIVER_TYPE_NAMES.has(type.typeName.text) ? type.typeName.text : undefined;
}

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/**
 * Collects the receivers whose static type is one of the navbar classes, by explicit annotation only (no
 * cross-package type resolution): method/function params, class fields (incl. `@ViewChild(KbqVerticalNavbar) x:
 * KbqVerticalNavbar` and constructor parameter-properties) and typed locals.
 */
function collectReceivers(sourceFile: ts.SourceFile): Receiver[] {
    const receivers: Receiver[] = [];
    const add = (text: string, scope: ts.Node, typeName: string) =>
        receivers.push({ text, start: scope.getStart(sourceFile), end: scope.getEnd(), typeName });

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
            const typeName = navbarTypeName(node.type);

            if (typeName) {
                add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile, typeName);

                // A constructor parameter-property is also a class field, reachable as `this.<name>`.
                if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                    const owner = findAncestor(node, ts.isClassDeclaration);

                    if (owner) add(`this.${node.name.text}`, owner, typeName);
                }
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
            const typeName = navbarTypeName(node.type);
            const owner = typeName && findAncestor(node, ts.isClassDeclaration);

            if (typeName && owner) add(`this.${node.name.text}`, owner, typeName);
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const typeName = navbarTypeName(node.type);

            if (typeName) add(node.name.text, findAncestor(node, isFunctionLike) ?? sourceFile, typeName);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return receivers;
}

/** The receiver a property access belongs to, if the access sits inside that receiver's scope. */
function receiverOf(
    node: ts.PropertyAccessExpression,
    sourceFile: ts.SourceFile,
    receivers: Receiver[]
): Receiver | undefined {
    const receiverText = node.expression.getText(sourceFile);
    const start = node.getStart(sourceFile);
    const end = node.getEnd();

    return receivers.find((r) => r.text === receiverText && start >= r.start && end <= r.end);
}

/** The signal/model method a member access is immediately followed by, if any (`x.expanded.set`). */
function followedByMethod(node: ts.PropertyAccessExpression): string | undefined {
    const parent = node.parent;

    return ts.isPropertyAccessExpression(parent) && parent.expression === node ? parent.name.text : undefined;
}

/** Whether a property access is the left-hand side of a plain assignment. */
const assignmentOf = (node: ts.PropertyAccessExpression): ts.BinaryExpression | undefined => {
    const parent = node.parent;

    return ts.isBinaryExpression(parent) &&
        parent.left === node &&
        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
        ? parent
        : undefined;
};

/** Classifies a matched property access of a value-safe signal member and appends the resulting edit(s). */
function classifySignalAccess(
    node: ts.PropertyAccessExpression,
    sourceFile: ts.SourceFile,
    receiverType: NavbarReceiverType,
    edits: Edit[]
): void {
    // Already migrated: `x.expanded()` (call) or `x.expanded.set(…)` — leave alone.
    if (ts.isCallExpression(node.parent) && node.parent.expression === node) return;

    const method = followedByMethod(node);

    if (method && SIGNAL_API_METHODS.has(method)) return;

    const assignment = assignmentOf(node);

    if (assignment) {
        // Write target: `x.expanded = RHS` → `x.expanded.set(RHS)`. Only a `model()` can take a write; a plain
        // `input()` has to be driven by its binding, which the compiler will point out.
        if (receiverType.writableMembers.includes(node.name.text)) {
            const rhs = assignment.right;

            edits.push({ start: node.getEnd(), end: rhs.getStart(sourceFile), text: '.set(' });
            edits.push({ start: rhs.getEnd(), end: rhs.getEnd(), text: ')' });
        }

        return;
    }

    // Read (incl. optional chain `x?.expanded`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/**
 * Rewrites the two orientation booleans of `KbqNavbarRectangleElement`: `x.horizontal = true` becomes
 * `x.orientation = 'horizontal'` and a read becomes `x.isHorizontal()`.
 *
 * An assignment of anything other than the literal `true` is left alone — `x.horizontal = flag` has no
 * single-expression equivalent, and the compiler will point at it.
 */
function classifyOrientationAccess(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, edits: Edit[]): void {
    const member = node.name.text;
    const assignment = assignmentOf(node);

    if (assignment) {
        const orientation = ORIENTATION_WRITES.get(member);

        if (!orientation || assignment.right.kind !== ts.SyntaxKind.TrueKeyword) return;

        edits.push({ start: node.name.getStart(sourceFile), end: node.name.getEnd(), text: 'orientation' });
        edits.push({
            start: assignment.right.getStart(sourceFile),
            end: assignment.right.getEnd(),
            text: `'${orientation}'`
        });

        return;
    }

    if (ts.isCallExpression(node.parent) && node.parent.expression === node) return;

    const read = ORIENTATION_READS.get(member);

    if (!read) return;

    edits.push({ start: node.name.getStart(sourceFile), end: node.name.getEnd(), text: `${read}()` });
}

/** Collects edits for every access of a migratable member on a known navbar receiver. */
function collectAccessEdits(sourceFile: ts.SourceFile, receivers: Receiver[]): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
            const receiver = receiverOf(node, sourceFile, receivers);

            if (receiver?.typeName === RECTANGLE_TYPE) {
                classifyOrientationAccess(node, sourceFile, edits);
            } else if (receiver) {
                const receiverType = receiverTypeOf(receiver.typeName);

                if (receiverType?.signalMembers.includes(node.name.text)) {
                    classifySignalAccess(node, sourceFile, receiverType, edits);
                }
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** Pass A — rewrite value-safe programmatic accesses of navbar signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const receivers = collectReceivers(sourceFile);

    if (receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, receivers);

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** Members needing manual migration, found on a navbar receiver in TypeScript code. */
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
            receiverOf(node, sourceFile, receivers)
        ) {
            found.add(node.name.text);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return found;
}

/** All `exportAs` values a template reference variable can point a navbar at. */
const EXPORT_AS_TO_TYPE = new Map(
    RECEIVER_TYPES.filter(({ exportAs }) => !!exportAs).map(({ exportAs, type }) => [exportAs!, type])
);

/** Collects template reference variables exported as one of the navbar directives. */
class NavbarRefCollector implements Visitor {
    /** Reference variable name → the navbar class it points at. */
    readonly refs = new Map<string, string>();

    visitElement(element: any): void {
        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string') continue;

            const type = EXPORT_AS_TO_TYPE.get(attr.value);

            if (!type) continue;

            if (attr.name.startsWith('#')) this.refs.set(attr.name.slice(1), type);
            else if (attr.name.startsWith('ref-')) this.refs.set(attr.name.slice(4), type);
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
 * member keeps `expanded` from matching inside `expandedChange`.
 */
function memberAccessPattern(ref: string, members: readonly string[]): RegExp {
    const methods = [...SIGNAL_API_METHODS].join('|');

    return new RegExp(
        `\\b(${escapeRegExp(ref)})\\.(${members.join('|')})\\b(?!\\s*\\()(?!\\s*\\.\\s*(?:${methods})\\b)`,
        'g'
    );
}

/** Rewrites `ref.expanded` reads to `ref.expanded()` for every navbar reference variable. */
function rewriteRefReads(template: string, refs: ReadonlyMap<string, string>): { content: string; changed: boolean } {
    let content = template;
    let changed = false;

    for (const [ref, typeName] of refs) {
        const members = receiverTypeOf(typeName)?.signalMembers;

        if (!members?.length) continue;

        const next = content.replace(memberAccessPattern(ref, members), '$1.$2()');

        if (next !== content) {
            content = next;
            changed = true;
        }
    }

    return { content, changed };
}

/** Members needing manual migration, read through a navbar reference variable in a template. */
function collectRefManualMembers(template: string, refs: ReadonlyMap<string, string>): Set<string> {
    const members = [...MANUAL_MEMBERS.keys()];
    const found = new Set<string>();

    for (const ref of refs.keys()) {
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
    /** The template names a navbar but could not be parsed, so nothing was inspected or rewritten. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({
    content: template,
    changed: false,
    manual: new Set(),
    unparseable: false
});

const namesNavbarExportAs = (template: string): boolean =>
    [...EXPORT_AS_TO_TYPE.keys()].some((exportAs) => template.includes(exportAs));

/** Pass B (core) — parse a template, discover navbar refs, rewrite their value-safe reads. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    if (!namesNavbarExportAs(template)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const collector = new NavbarRefCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    if (collector.refs.size === 0) return untouched(template);

    return {
        ...rewriteRefReads(template, collector.refs),
        manual: collectRefManualMembers(template, collector.refs),
        unparseable: false
    };
}

/** Pass B (inline) — rewrite navbar ref reads inside inline component templates. */
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

function logPatternWarnings(
    context: SchematicContext,
    filePath: string,
    content: string,
    patterns: { pattern: string; message: string }[]
): void {
    for (const { pattern, message } of patterns) {
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

/** A `.ts` file is a navbar consumer if it names one of its symbols or imports the package. */
function referencesNavbar(content: string): boolean {
    return /\bKbq(?:Vertical)?Navbar\w*\b/.test(content) || content.includes('@koobiq/components/navbar');
}

export default function navbarSignalsAndAria(options: Schema): Rule {
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
        const stylePaths: Path[] = [];

        rootDir.visit((filePath: Path) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;

            if (filePath.endsWith(TS_EXT)) tsPaths.push(filePath);
            else if (filePath.endsWith(HTML_EXT)) htmlPaths.push(filePath);
            else if (STYLE_EXTS.some((ext) => filePath.endsWith(ext))) stylePaths.push(filePath);
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

            if (!original || !referencesNavbar(original)) continue;

            const withExpressions = migrateTsExpressions(original, filePath);
            const inline = await migrateInlineTemplates(withExpressions, filePath);
            const content = inline.content;

            // Warn on what is left over, so an auto-fixed usage does not also produce a "manual migration
            // required" note. In dry-run mode the fix is not written, so report against the original.
            const reported = fix ? content : original;

            logPatternWarnings(context, filePath, reported, tsWarnPatterns);
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

        for (const filePath of stylePaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            logPatternWarnings(context, filePath, original, styleWarnPatterns);
        }

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            '',
            ...BEHAVIOUR_NOTE
        ]);
    };
}

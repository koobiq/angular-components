import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    BEHAVIOUR_NOTE,
    GROUP_EXPORT_AS,
    GROUP_TYPE,
    ICON_ATTRS,
    MANUAL_MEMBERS,
    NAME_ATTRS,
    SIGNAL_API_METHODS,
    SIGNAL_MEMBERS,
    styleWarnPatterns,
    TOGGLE_ELEMENT,
    TOGGLE_TYPE,
    tsWarnPatterns,
    UNNAMED_ICON_TOGGLE_MESSAGE,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    UNRESOLVED_SIGNAL_READ_MESSAGE,
    WRITE_MESSAGES,
    WRITE_ONLY_MANUAL_MEMBERS
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const STYLE_EXTS = ['.scss', '.css', '.less'];

const LABEL = '[button-toggle-signals-and-aria]';

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A declaration a receiver expression can resolve to, in effect within `[start, end]` of the source. */
interface Declaration {
    /** Source text the declaration is reachable by, e.g. `group`, `this.group` or `this.group()`. */
    text: string;
    /** Button-toggle type it holds, or `undefined` for an unrelated declaration that merely shadows. */
    typeName?: string;
    start: number;
    end: number;
}

/** What a pass found in one file and could not rewrite. */
interface Findings {
    /** Members reported verbatim from `MANUAL_MEMBERS`. */
    manual: Set<string>;
    /** Signal members that were assigned to, reported from `WRITE_MESSAGES`. */
    writes: Set<string>;
    /** Ready-made messages, e.g. per-line reports about unnamed icon-only toggles. */
    notes: Set<string>;
}

const emptyFindings = (): Findings => ({ manual: new Set(), writes: new Set(), notes: new Set() });

function mergeFindings(target: Findings, source: Findings): void {
    source.manual.forEach((value) => target.manual.add(value));
    source.writes.forEach((value) => target.writes.add(value));
    source.notes.forEach((value) => target.notes.add(value));
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

/** Local names the button-toggle types are reachable by in this file, `import { X as Y }` included. */
function collectTypeAliases(sourceFile: ts.SourceFile): Map<string, string> {
    const aliases = new Map<string, string>([
        [GROUP_TYPE, GROUP_TYPE],
        [TOGGLE_TYPE, TOGGLE_TYPE]
    ]);

    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement)) continue;

        const bindings = statement.importClause?.namedBindings;

        if (!bindings || !ts.isNamedImports(bindings)) continue;

        for (const element of bindings.elements) {
            const imported = (element.propertyName ?? element.name).text;

            if (imported === GROUP_TYPE || imported === TOGGLE_TYPE) aliases.set(element.name.text, imported);
        }
    }

    return aliases;
}

/** The button-toggle type a type annotation refers to, if any. */
function toggleTypeOf(type: ts.TypeNode | undefined, aliases: ReadonlyMap<string, string>): string | undefined {
    if (!type || !ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) return undefined;

    return aliases.get(type.typeName.text);
}

const FIELD_MODIFIERS = new Set<ts.SyntaxKind>([
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.ReadonlyKeyword
]);

/** Factories that hand back a signal, so the declaration is read through a call: `this.group()`. */
const QUERY_FACTORIES = new Set(['viewChild', 'contentChild']);

/** Factories that hand back the instance itself. */
const INSTANCE_FACTORIES = new Set(['inject']);

/**
 * The button-toggle an initialiser holds, for the shapes that carry no type annotation to read —
 * `viewChild(X)`, `viewChild.required(X)`, `contentChild(X)` and `inject(X)`, which is how a modern
 * Angular consumer reaches a group.
 */
function initializerTypeOf(
    initializer: ts.Expression | undefined,
    aliases: ReadonlyMap<string, string>
): { typeName: string; isCall: boolean } | undefined {
    if (!initializer || !ts.isCallExpression(initializer)) return undefined;

    const callee = initializer.expression;
    let factory: string | undefined;

    if (ts.isIdentifier(callee)) {
        factory = callee.text;
    } else if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
        // `viewChild.required(X)` — the `.required` variant of the same factory.
        factory = callee.name.text === 'required' ? callee.expression.text : undefined;
    }

    const [argument] = initializer.arguments;
    const typeName = factory && argument && ts.isIdentifier(argument) ? aliases.get(argument.text) : undefined;

    if (!factory || !typeName) return undefined;
    if (QUERY_FACTORIES.has(factory)) return { typeName, isCall: true };
    if (INSTANCE_FACTORIES.has(factory)) return { typeName, isCall: false };

    return undefined;
}

/**
 * Collects every declaration a receiver can resolve to — not only the ones typed as a button-toggle.
 * An unrelated declaration of the same name has to be collected as well: it is what makes a nested
 * `const group = { vertical: 'north' }` shadow an outer group instead of being rewritten as one.
 *
 * Types are read from an explicit annotation or from a signal-query / `inject()` initialiser; there is
 * no cross-file type resolution, so a receiver whose type lives elsewhere resolves to nothing.
 */
function collectDeclarations(sourceFile: ts.SourceFile, aliases: ReadonlyMap<string, string>): Declaration[] {
    const declarations: Declaration[] = [];
    const add = (text: string, typeName: string | undefined, scope: ts.Node) =>
        declarations.push({ text, typeName, start: scope.getStart(sourceFile), end: scope.getEnd() });

    /** A declaration reached by its own name, plus the call form when it holds a signal. */
    const addWithInitializer = (
        name: string,
        node: ts.PropertyDeclaration | ts.VariableDeclaration,
        scope: ts.Node
    ) => {
        const annotated = toggleTypeOf(node.type, aliases);
        const initialized = annotated ? undefined : initializerTypeOf(node.initializer, aliases);

        add(name, annotated ?? (initialized?.isCall ? undefined : initialized?.typeName), scope);

        if (initialized?.isCall) add(`${name}()`, initialized.typeName, scope);
    };

    const visit = (node: ts.Node): void => {
        if (ts.isParameter(node) && ts.isIdentifier(node.name)) {
            const typeName = toggleTypeOf(node.type, aliases);

            add(node.name.text, typeName, findAncestor(node, isFunctionLike) ?? sourceFile);

            // A constructor parameter-property is also a class field, reachable as `this.<name>`.
            if (node.modifiers?.some((modifier) => FIELD_MODIFIERS.has(modifier.kind))) {
                const owner = findAncestor(node, ts.isClassDeclaration);

                if (owner) add(`this.${node.name.text}`, typeName, owner);
            }
        } else if (ts.isPropertyDeclaration(node) && ts.isIdentifier(node.name)) {
            const owner = findAncestor(node, ts.isClassDeclaration);

            if (owner) addWithInitializer(`this.${node.name.text}`, node, owner);
        } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            addWithInitializer(node.name.text, node, findAncestor(node, isFunctionLike) ?? sourceFile);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return declarations;
}

/**
 * The declaration a receiver resolves to: the innermost scope that still contains the access, which is
 * the one with the latest start. Matching the name alone is not enough — an unrelated local of the same
 * name has to win over an outer group, or the rewrite lands on code that is not a button-toggle at all.
 */
function resolveDeclaration(
    node: ts.PropertyAccessExpression,
    sourceFile: ts.SourceFile,
    declarations: readonly Declaration[]
): Declaration | undefined {
    const text = node.expression.getText(sourceFile);
    const start = node.getStart(sourceFile);
    const end = node.getEnd();
    let resolved: Declaration | undefined;

    for (const declaration of declarations) {
        if (declaration.text !== text || start < declaration.start || end > declaration.end) continue;

        if (!resolved || declaration.start > resolved.start) resolved = declaration;
    }

    return resolved;
}

/** The signal method a member access is immediately followed by, if any (`x.multiple.set`). */
function followedByMethod(node: ts.PropertyAccessExpression): string | undefined {
    const parent = node.parent;

    return ts.isPropertyAccessExpression(parent) && parent.expression === node ? parent.name.text : undefined;
}

/** Whether a property access is the left-hand side of an assignment. */
const isAssignmentTarget = (node: ts.PropertyAccessExpression): boolean =>
    ts.isBinaryExpression(node.parent) &&
    node.parent.left === node &&
    node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken;

/** Whether a member access is already a call, i.e. reads a signal the way the new API expects. */
const isCalled = (node: ts.PropertyAccessExpression): boolean =>
    ts.isCallExpression(node.parent) && node.parent.expression === node;

/**
 * Whether a member of a removed-or-narrowed receiver has to be reported. Most of them break on any
 * access, having become `private`/`protected` or gone altogether; the ones that only turned into a
 * read-only getter still read exactly as they did, so only an assignment is worth a line.
 */
const isBreakingManualAccess = (member: string, node: ts.PropertyAccessExpression): boolean =>
    MANUAL_MEMBERS.has(member) && (!WRITE_ONLY_MANUAL_MEMBERS.has(member) || isAssignmentTarget(node));

/**
 * Classifies a matched property access of a group signal member: a read becomes a call, a write is left to
 * the compiler and reported — an `input()` is read-only and has no `.set()` to rewrite to.
 */
function classifySignalAccess(node: ts.PropertyAccessExpression, edits: Edit[], findings: Findings): void {
    // Already migrated: `x.multiple()` — leave alone.
    if (ts.isCallExpression(node.parent) && node.parent.expression === node) return;

    const method = followedByMethod(node);

    if (method && SIGNAL_API_METHODS.has(method)) return;

    if (isAssignmentTarget(node)) {
        findings.writes.add(node.name.text);

        return;
    }

    // Read (incl. optional chain `x?.multiple`): append `()`.
    edits.push({ start: node.getEnd(), end: node.getEnd(), text: '()' });
}

/** Pass A — rewrite reads of the group's signal inputs and collect what cannot be rewritten. */
function migrateTs(content: string, fileName: string): { content: string; findings: Findings } {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const aliases = collectTypeAliases(sourceFile);
    const declarations = collectDeclarations(sourceFile, aliases);
    const findings = emptyFindings();
    const edits: Edit[] = [];

    // A receiver typed elsewhere resolves to nothing here, so a signal read on it is neither rewritten
    // nor reported by name. Worth one line per file, but only where a group is actually in play.
    const namesGroup = content.includes(GROUP_TYPE);

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
            const declaration = resolveDeclaration(node, sourceFile, declarations);
            const member = node.name.text;

            if (declaration?.typeName) {
                if (declaration.typeName === GROUP_TYPE && SIGNAL_MEMBERS.includes(member)) {
                    classifySignalAccess(node, edits, findings);
                } else if (isBreakingManualAccess(member, node)) {
                    findings.manual.add(member);
                }
            } else if (!declaration && namesGroup && SIGNAL_MEMBERS.includes(member) && !isCalled(node)) {
                findings.notes.add(UNRESOLVED_SIGNAL_READ_MESSAGE);
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { content: edits.length > 0 ? applyEdits(content, edits) : content, findings };
}

/**
 * The subset of the Angular HTML AST this migration reads. `utils/ast` copies the node interfaces without
 * their source spans, and blocks (`@if`, `@for`) are not elements at all, so both are re-declared here.
 */
interface Attr {
    name: string;
    value?: string;
}

interface Node {
    name?: string;
    /** Present on elements only — a block carries `parameters` instead, and both carry a start span. */
    attrs?: Attr[];
    children?: Node[];
    /** Present on text nodes only; a comment has a `value` but no tokens. */
    tokens?: unknown[];
    value?: string;
    startSourceSpan?: { start: { offset: number; line: number } };
}

/** An attribute name as written, with binding syntax stripped: `[attr.aria-label]` → `aria-label`. */
const attrName = (attr: Attr): string => attr.name.replace(/[[\]()]/g, '').replace(/^attr\./, '');

const hasAttr = (node: Node, names: readonly string[]): boolean =>
    !!node.attrs?.some((attr) => names.includes(attrName(attr)));

const isElement = (node: Node): boolean => Array.isArray(node.attrs);
const isText = (node: Node): boolean => !isElement(node) && Array.isArray(node.tokens);

/** Whether the subtree holds any text — a bare text node, an interpolation, or text inside an element. */
function hasTextContent(node: Node): boolean {
    for (const child of node.children ?? []) {
        if (isText(child)) {
            if ((child.value ?? '').trim() !== '') return true;
        } else if (hasTextContent(child)) {
            return true;
        }
    }

    return false;
}

/** Whether the subtree holds an icon, which is the content that carries no accessible name. */
function hasIcon(node: Node): boolean {
    for (const child of node.children ?? []) {
        if (isElement(child) && hasAttr(child, ICON_ATTRS)) return true;
        if (hasIcon(child)) return true;
    }

    return false;
}

/** Collects group reference variables and icon-only toggles that carry no accessible name. */
class TemplateCollector implements Visitor {
    readonly refs = new Set<string>();
    readonly unnamedToggleLines: number[] = [];

    visitElement(element: Node): void {
        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string' || attr.value !== GROUP_EXPORT_AS) continue;

            if (attr.name.startsWith('#')) this.refs.add(attr.name.slice(1));
            else if (attr.name.startsWith('ref-')) this.refs.add(attr.name.slice(4));
        }

        if (element.name === TOGGLE_ELEMENT && hasIcon(element) && !hasTextContent(element)) {
            // A `title` here does not count: it stays on the host, while the name is computed for the
            // inner button. `KbqButtonToggle` does not accept it either.
            if (!hasAttr(element, NAME_ATTRS)) {
                this.unnamedToggleLines.push((element.startSourceSpan?.start.line ?? 0) + 1);
            }
        }

        this.visitChildren(element);
    }

    visitBlock(block: Node): void {
        this.visitChildren(block);
    }

    private visitChildren(node: Node): void {
        for (const child of node.children ?? []) {
            (child as unknown as { visit: (visitor: Visitor) => void }).visit(this);
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
 * Matches `<ref>.<member>` where the access is neither already a call nor a signal-API call. A template can
 * only read these, so an assignment never needs excluding.
 *
 * The dot is matched with the whitespace around it — Angular's expression grammar allows `group . multiple`
 * and a binding wrapped over two lines — and that whitespace is captured so the rewrite keeps the layout.
 */
function memberAccessPattern(ref: string): RegExp {
    const methods = [...SIGNAL_API_METHODS].join('|');

    return new RegExp(
        `\\b(${escapeRegExp(ref)})(\\s*\\.\\s*)(${SIGNAL_MEMBERS.join('|')})\\b(?!\\s*\\()(?!\\s*\\.\\s*(?:${methods})\\b)`,
        'g'
    );
}

/** Rewrites `ref.multiple` reads to `ref.multiple()` for the given refs. */
function rewriteRefReads(template: string, refs: string[]): { content: string; changed: boolean } {
    let content = template;
    let changed = false;

    for (const ref of refs) {
        const next = content.replace(memberAccessPattern(ref), '$1$2$3()');

        if (next !== content) {
            content = next;
            changed = true;
        }
    }

    return { content, changed };
}

/**
 * Manual members read through a group reference variable in a template. A template cannot assign, so the
 * members that only broke for writers — the ones that became read-only getters — are left out.
 */
function collectRefManualMembers(template: string, refs: string[]): Set<string> {
    const members = [...MANUAL_MEMBERS.keys()].filter((member) => !WRITE_ONLY_MANUAL_MEMBERS.has(member));
    const found = new Set<string>();

    for (const ref of refs) {
        const pattern = new RegExp(`\\b${escapeRegExp(ref)}\\s*\\.\\s*(${members.join('|')})\\b`, 'g');

        for (const match of template.matchAll(pattern)) {
            found.add(match[1]);
        }
    }

    return found;
}

interface TemplateResult {
    content: string;
    changed: boolean;
    findings: Findings;
    /** The template names the button-toggle but could not be parsed, so nothing was inspected or rewritten. */
    unparseable: boolean;
}

const untouched = (template: string): TemplateResult => ({
    content: template,
    changed: false,
    findings: emptyFindings(),
    unparseable: false
});

/** Pass B — rewrite group ref reads and report icon-only toggles with no accessible name. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    if (!template.includes(TOGGLE_ELEMENT)) return untouched(template);

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return { ...untouched(template), unparseable: true };

    const collector = new TemplateCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    const refs = [...collector.refs];
    const findings = emptyFindings();

    for (const line of collector.unnamedToggleLines) {
        findings.notes.add(UNNAMED_ICON_TOGGLE_MESSAGE.replace('%s', String(line)));
    }

    if (refs.length === 0) return { ...untouched(template), findings };

    collectRefManualMembers(template, refs).forEach((member) => findings.manual.add(member));

    return { ...rewriteRefReads(template, refs), findings, unparseable: false };
}

/** Pass B (inline) — the same, inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; findings: Findings; unparseable: boolean }> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const findings = emptyFindings();
    let result = content;
    let unparseable = false;

    // Splice right-to-left so earlier offsets stay valid.
    for (const { start, end } of collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start)) {
        const migrated = await migrateTemplate(result.slice(start, end));

        mergeFindings(findings, migrated.findings);
        unparseable ||= migrated.unparseable;

        if (migrated.changed) {
            result = result.slice(0, start) + migrated.content + result.slice(end);
        }
    }

    return { content: result, findings, unparseable };
}

function logPatterns(
    context: SchematicContext,
    filePath: string,
    content: string,
    patterns: typeof tsWarnPatterns
): void {
    for (const { pattern, message } of patterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

function logFindings(context: SchematicContext, filePath: string, findings: Findings): void {
    for (const member of findings.manual) {
        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${MANUAL_MEMBERS.get(member)}`]);
    }

    for (const member of findings.writes) {
        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${WRITE_MESSAGES.get(member)}`]);
    }

    for (const note of findings.notes) {
        logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${note}`]);
    }
}

/** A `.ts` file is a button-toggle consumer if it names one of its symbols or imports the package. */
function referencesButtonToggle(content: string): boolean {
    return (
        /\bKbqButtonToggle\w*\b/.test(content) ||
        content.includes('@koobiq/components/button-toggle') ||
        content.includes(TOGGLE_ELEMENT)
    );
}

export default function buttonToggleSignalsAndAria(options: Schema): Rule {
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

            if (!original || !referencesButtonToggle(original)) continue;

            const expressions = migrateTs(original, filePath);
            const inline = await migrateInlineTemplates(expressions.content, filePath);
            const content = inline.content;

            // The pattern warnings are checked against the post-fix content, so an auto-fixed read does not
            // also produce a note. In dry-run mode the fix is not written, so report against the original.
            const reported = fix ? content : original;
            const findings = emptyFindings();

            // Both passes only ever collect what they could not rewrite, so there is nothing to re-check.
            mergeFindings(findings, expressions.findings);
            mergeFindings(findings, inline.findings);

            logPatterns(context, filePath, reported, tsWarnPatterns);
            logFindings(context, filePath, findings);

            if (inline.unparseable) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);
            }

            commit(filePath, original, content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const migrated = await migrateTemplate(original);

            logFindings(context, filePath, migrated.findings);

            if (migrated.unparseable) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);
            }

            if (migrated.changed) commit(filePath, original, migrated.content);
        }

        for (const filePath of stylePaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !original.includes(TOGGLE_ELEMENT)) continue;

            logPatterns(context, filePath, original, styleWarnPatterns);
        }

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            '',
            ...BEHAVIOUR_NOTE
        ]);
    };
}

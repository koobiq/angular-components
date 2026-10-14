import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { visitProjectFiles } from '../../utils/project-files';
import {
    Binding,
    classifyAccess,
    collectAllReceivers,
    collectBindings,
    isPlainAssignment,
    isWriteTarget,
    Receiver,
    resolveReceiver
} from '../../utils/signal-members-migration';
import { rewriteRefAccesses } from '../../utils/template-ref-access';
import { forEachClass, parseTemplate } from '../../utils/typescript';
import {
    FILTER_BAR_ELEMENT,
    FILTER_BAR_HOST_TYPE,
    FILTER_BAR_TYPE,
    SIGNAL_MEMBERS,
    tsRenameReplacements,
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

/** The filter-bar receivers of a file, and the bindings that decide which of them an access reaches. */
interface FileReceivers {
    receivers: Receiver[];
    bindings: Binding[];
}

/** Members written in code, which the rewrite leaves as they are. */
interface Writes {
    /** Read-only members, written in any form. */
    readOnlyWrites: Set<string>;
    /** `filter` written by a compound assignment, an increment, `delete` or destructuring. */
    compoundWrites: Set<string>;
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

/** The `KbqFilterBar` / `KbqFilterBarHost` receivers of a file, typed by annotation or `inject()`. */
function collectFileReceivers(sourceFile: ts.SourceFile): FileReceivers {
    return {
        receivers: collectAllReceivers(sourceFile, [FILTER_BAR_TYPE, FILTER_BAR_HOST_TYPE]),
        bindings: collectBindings(sourceFile)
    };
}

/**
 * Whether `node` accesses a signal member on a filter-bar receiver. The shared engine resolves the receiver at
 * this exact position, so a nested declaration that shadows its name or a `function` that rebinds `this` is
 * not followed. A signal query holds the instance behind a call of its own, which this pass does not reach.
 */
function isSignalMemberAccess(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    scope: FileReceivers
): node is ts.PropertyAccessExpression {
    if (
        !ts.isPropertyAccessExpression(node) ||
        !ts.isIdentifier(node.name) ||
        !SIGNAL_MEMBERS.includes(node.name.text)
    ) {
        return false;
    }

    const receiver = resolveReceiver(node.expression, node, sourceFile, scope.receivers, scope.bindings);

    return !!receiver && !receiver.signalQuery;
}

/** Collects edits for every read/write of a signal member on a known filter-bar receiver. */
function collectAccessEdits(sourceFile: ts.SourceFile, scope: FileReceivers): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (isSignalMemberAccess(node, sourceFile, scope)) classifyAccess(node, sourceFile, WRITABLE_MEMBERS, edits);

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** Signal members written on a filter-bar receiver in a form the rewrite leaves for the consumer. */
function collectWrites(sourceFile: ts.SourceFile, scope: FileReceivers): Writes {
    const writes: Writes = { readOnlyWrites: new Set<string>(), compoundWrites: new Set<string>() };

    const visit = (node: ts.Node): void => {
        if (isSignalMemberAccess(node, sourceFile, scope) && isWriteTarget(node)) {
            const name = node.name.text;

            if (!WRITABLE_MEMBERS.has(name)) writes.readOnlyWrites.add(name);
            else if (!isPlainAssignment(node)) writes.compoundWrites.add(name);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return writes;
}

/** Pass A — rewrite programmatic reads/writes of filter-bar signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const scope = collectFileReceivers(sourceFile);

    if (scope.receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, scope);

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** `#ref` / `ref-ref`, or `undefined` when the attribute is not a reference variable. */
function referenceName(name: string): string | undefined {
    if (name.startsWith('#')) return name.slice(1);
    if (name.startsWith('ref-')) return name.slice(4);

    return undefined;
}

/**
 * Collects template reference variable names bound to a `<kbq-filter-bar>` element. `KbqFilterBar` has no
 * `exportAs`, so only a bare `#ref` is the filter bar; `#ref="ngModel"` names another directive.
 */
class FilterBarRefCollector implements Visitor {
    readonly refs = new Set<string>();

    visitElement(element: any): void {
        if (element.name === FILTER_BAR_ELEMENT) {
            for (const attr of element.attrs ?? []) {
                if (typeof attr.name !== 'string') continue;

                const name = referenceName(attr.name);

                if (name !== undefined && !attr.value) this.refs.add(name);
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

/** Merges the writes in `from` into `into`. */
function mergeWrites(into: Writes, from: Writes): void {
    from.readOnlyWrites.forEach((member) => into.readOnlyWrites.add(member));
    from.compoundWrites.forEach((member) => into.compoundWrites.add(member));
}

/** The writes made through a reference variable are the ones a template leaves as they are. */
interface TemplateResult extends Writes {
    content: string;
    changed: boolean;
}

/** Pass B (core) — parse a template, discover filter-bar refs, rewrite their signal reads and `filter` writes. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    const untouched = {
        content: template,
        changed: false,
        readOnlyWrites: new Set<string>(),
        compoundWrites: new Set<string>()
    };

    if (!template.includes(FILTER_BAR_ELEMENT)) return untouched;

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return untouched;

    const { rootNodes } = parsed.tree as { rootNodes: unknown[] };
    const collector = new FilterBarRefCollector();

    visitAll(collector, rootNodes);

    if (collector.refs.size === 0) return untouched;

    const refs = [...collector.refs].map((name) => ({ name, members: SIGNAL_MEMBERS, writable: WRITABLE_MEMBERS }));
    const { content, readOnlyWrites, compoundWrites } = rewriteRefAccesses(template, rootNodes, refs);

    return { content, changed: content !== template, readOnlyWrites, compoundWrites };
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

/** Pass B (inline) — rewrite filter-bar ref reads inside inline component templates. */
async function migrateInlineTemplates(content: string, fileName: string): Promise<Writes & { content: string }> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    const writes: Writes = { readOnlyWrites: new Set<string>(), compoundWrites: new Set<string>() };
    let result = content;

    for (const { start, end } of ranges) {
        const outcome = await migrateTemplate(result.slice(start, end));

        mergeWrites(writes, outcome);

        if (outcome.changed) {
            result = result.slice(0, start) + outcome.content + result.slice(end);
        }
    }

    return { content: result, ...writes };
}

/** Pass C — safe identifier renames. */
function applyRenames(content: string): string {
    let result = content;

    for (const { from, to } of tsRenameReplacements) {
        result = result.replace(new RegExp(from, 'g'), to);
    }

    return result;
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { pattern, message } of warnPatterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`[filter-bar-signals] ${filePath}`, `  ${message}`]);
        }
    }
}

/** Reports writes to signal members that are read-only now, made in code or through a template reference. */
function warnReadOnlyWrites(context: SchematicContext, filePath: string, members: Set<string>): void {
    if (members.size === 0) return;

    logMessage(context.logger, [
        `[filter-bar-signals] ${filePath}`,
        `  \`${[...members].join('`, `')}\` can no longer be assigned: they are read-only signals now. Bind`,
        `  \`[pipeTemplates]\` in the template instead; the \`is*\` state follows \`filter\`.`
    ]);
}

/** Reports writes to `filter` that have no `.set()` form, made in code or through a template reference. */
function warnCompoundWrites(context: SchematicContext, filePath: string, members: Set<string>): void {
    if (members.size === 0) return;

    logMessage(context.logger, [
        `[filter-bar-signals] ${filePath}`,
        `  \`${[...members].join('`, `')}\` is a writable signal now, but only a plain \`=\` is rewritten to`,
        `  \`.set()\`: a compound assignment, an increment, \`delete\` or a destructuring target was left as it`,
        `  is. Write it with \`.set()\` or \`.update()\`.`
    ]);
}

/** A `.ts` file is a filter-bar consumer if it names the type or imports the package. */
function referencesFilterBar(content: string): boolean {
    return /\bKbqFilterBar\b/.test(content) || content.includes('@koobiq/components/filter-bar');
}

export default function filterBarSignals(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema, so the
        // schema default never reaches us — applying the fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;

        const tsPaths: string[] = [];
        const htmlPaths: string[] = [];

        visitProjectFiles(rootDir, (filePath) => {
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
                logMessage(context.logger, [`[filter-bar-signals] would update ${filePath} (run with --fix to apply)`]);
            }
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesFilterBar(original)) continue;

            logWarnings(context, filePath, original);

            const sourceFile = ts.createSourceFile(filePath, original, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
            const writes = collectWrites(sourceFile, collectFileReceivers(sourceFile));
            const inline = await migrateInlineTemplates(migrateTsExpressions(original, filePath), filePath);

            mergeWrites(writes, inline);
            warnReadOnlyWrites(context, filePath, writes.readOnlyWrites);
            warnCompoundWrites(context, filePath, writes.compoundWrites);
            commit(filePath, original, applyRenames(inline.content));
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const { content, changed, readOnlyWrites, compoundWrites } = await migrateTemplate(original);

            warnReadOnlyWrites(context, filePath, readOnlyWrites);
            warnCompoundWrites(context, filePath, compoundWrites);

            if (changed) commit(filePath, original, content);
        }

        logMessage(context.logger, [
            `[filter-bar-signals] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

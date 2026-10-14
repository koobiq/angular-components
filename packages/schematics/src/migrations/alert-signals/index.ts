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
    isWriteTarget,
    Receiver,
    resolveReceiver
} from '../../utils/signal-members-migration';
import { rewriteRefAccesses } from '../../utils/template-ref-access';
import { forEachClass, parseTemplate } from '../../utils/typescript';
import {
    ALERT_ELEMENT,
    ALERT_EXPORT_AS,
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

/** The alert receivers of a file, and the bindings that decide which of them an access reaches. */
interface FileReceivers {
    receivers: Receiver[];
    bindings: Binding[];
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

/** The `KbqAlert` receivers of a file, typed by annotation or `inject()`. */
function collectFileReceivers(sourceFile: ts.SourceFile): FileReceivers {
    return { receivers: collectAllReceivers(sourceFile, [ALERT_TYPE]), bindings: collectBindings(sourceFile) };
}

/**
 * Whether a property access reads from an alert receiver. The shared engine resolves the receiver at this
 * exact position, so a nested declaration that shadows its name or a `function` that rebinds `this` is not
 * followed. A signal query holds the instance behind a call of its own, which this pass does not reach.
 */
function onReceiver(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, scope: FileReceivers): boolean {
    const receiver = resolveReceiver(node.expression, node, sourceFile, scope.receivers, scope.bindings);

    return !!receiver && !receiver.signalQuery;
}

/** Collects edits for every read/write of a value-safe signal member on a known alert receiver. */
function collectAccessEdits(sourceFile: ts.SourceFile, scope: FileReceivers): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            SIGNAL_MEMBERS.includes(node.name.text) &&
            onReceiver(node, sourceFile, scope)
        ) {
            // `KbqAlert` signal members are `input()`, so every write is left for the consumer and reported.
            classifyAccess(node, sourceFile, WRITABLE_MEMBERS, edits);
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
    readOnlyWrites: Set<string>;
}

/** Whether a signal member is written rather than read, in any form: the migration leaves it for the consumer. */
function isReadOnlyWrite(node: ts.PropertyAccessExpression): boolean {
    return SIGNAL_MEMBERS.includes(node.name.text) && !WRITABLE_MEMBERS.has(node.name.text) && isWriteTarget(node);
}

/**
 * Collects the manual-migration members (`alertColor`, now-`protected` queries, writes to read-only signal
 * members) accessed on an alert receiver.
 */
function collectReceiverWarnings(sourceFile: ts.SourceFile, scope: FileReceivers): ReceiverWarnings {
    const valueChanged = new Set<string>();
    const protectedAccess = new Set<string>();
    const readOnlyWrites = new Set<string>();

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name) && onReceiver(node, sourceFile, scope)) {
            const name = node.name.text;

            if (VALUE_CHANGED_MEMBERS.includes(name)) valueChanged.add(name);
            else if (PROTECTED_MEMBERS.includes(name)) protectedAccess.add(name);
            else if (isReadOnlyWrite(node)) readOnlyWrites.add(name);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return { valueChanged, protectedAccess, readOnlyWrites };
}

/** Pass A — rewrite value-safe programmatic reads of alert signal members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const scope = collectFileReceivers(sourceFile);

    if (scope.receivers.length === 0) return content;

    const edits = collectAccessEdits(sourceFile, scope);

    return edits.length > 0 ? applyEdits(content, edits) : content;
}

/** Reports writes to signal members that are read-only now, made in code or through a template reference. */
function warnReadOnlyWrites(context: SchematicContext, filePath: string, members: Set<string>): void {
    if (members.size === 0) return;

    logMessage(context.logger, [
        `[alert-signals] ${filePath}`,
        `  \`${[...members].join('`, `')}\` can no longer be assigned: they are read-only signal inputs now. Bind`,
        `  them in the template (e.g. \`[compact]="…"\`) instead of assigning them.`
    ]);
}

/** Emits precise, receiver-scoped warnings for the members that can't be auto-fixed. */
function warnReceiverMembers(
    context: SchematicContext,
    filePath: string,
    content: string,
    templateWrites: Set<string>
): void {
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const { valueChanged, protectedAccess, readOnlyWrites } = collectReceiverWarnings(
        sourceFile,
        collectFileReceivers(sourceFile)
    );

    templateWrites.forEach((member) => readOnlyWrites.add(member));
    warnReadOnlyWrites(context, filePath, readOnlyWrites);

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

/** `#ref` / `ref-ref`, or `undefined` when the attribute is not a reference variable. */
function referenceName(name: string): string | undefined {
    if (name.startsWith('#')) return name.slice(1);
    if (name.startsWith('ref-')) return name.slice(4);

    return undefined;
}

/** Collects template reference variable names bound to a `<kbq-alert>` element. */
class AlertRefCollector implements Visitor {
    readonly refs = new Set<string>();

    visitElement(element: any): void {
        if (element.name === ALERT_ELEMENT) {
            for (const attr of element.attrs ?? []) {
                if (typeof attr.name !== 'string') continue;

                const name = referenceName(attr.name);
                const value = String(attr.value ?? '');

                if (name !== undefined && (!value || value === ALERT_EXPORT_AS)) this.refs.add(name);
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

interface TemplateResult {
    content: string;
    changed: boolean;
    /** Read-only members written through a reference variable, left as they are. */
    readOnlyWrites: Set<string>;
}

/** Pass B (core) — parse a template, discover alert refs, rewrite their value-safe signal reads. */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    const untouched = { content: template, changed: false, readOnlyWrites: new Set<string>() };

    if (!template.includes(ALERT_ELEMENT)) return untouched;

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return untouched;

    const { rootNodes } = parsed.tree as { rootNodes: unknown[] };
    const collector = new AlertRefCollector();

    visitAll(collector, rootNodes);

    if (collector.refs.size === 0) return untouched;

    const refs = [...collector.refs].map((name) => ({ name, members: SIGNAL_MEMBERS, writable: WRITABLE_MEMBERS }));
    const { content, readOnlyWrites } = rewriteRefAccesses(template, rootNodes, refs);

    return { content, changed: content !== template, readOnlyWrites };
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
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<{ content: string; readOnlyWrites: Set<string> }> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    const readOnlyWrites = new Set<string>();
    let result = content;

    for (const { start, end } of ranges) {
        const outcome = await migrateTemplate(result.slice(start, end));

        outcome.readOnlyWrites.forEach((member) => readOnlyWrites.add(member));

        if (outcome.changed) {
            result = result.slice(0, start) + outcome.content + result.slice(end);
        }
    }

    return { content: result, readOnlyWrites };
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
                logMessage(context.logger, [`[alert-signals] would update ${filePath} (run with --fix to apply)`]);
            }
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesAlert(original)) continue;

            logWarnings(context, filePath, original);

            const inline = await migrateInlineTemplates(migrateTsExpressions(original, filePath), filePath);

            warnReceiverMembers(context, filePath, original, inline.readOnlyWrites);
            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            const { content, changed, readOnlyWrites } = await migrateTemplate(original);

            warnReadOnlyWrites(context, filePath, readOnlyWrites);

            if (changed) commit(filePath, original, content);
        }

        logMessage(context.logger, [
            `[alert-signals] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

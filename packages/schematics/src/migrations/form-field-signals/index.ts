import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
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
import { RefAccessPolicy, rewriteRefAccesses } from '../../utils/template-ref-access';
import { collectInlineTemplateRanges, parseTemplate } from '../../utils/typescript';
import {
    attributeRewrites,
    NULLABILITY_CHANGED_MEMBERS,
    QUERY_LIST_MEMBERS,
    QUERY_LIST_ONLY_API,
    READ_ONLY_INPUT_MEMBERS,
    READ_ONLY_QUERY_MEMBERS,
    READ_ONLY_STATE_MEMBERS,
    READ_ONLY_STATE_MESSAGE,
    REMOVED_MEMBERS_MESSAGE,
    styleRewrites,
    Target,
    TARGETS,
    warnPatterns
} from './data';
import { Schema } from './schema';

const MIGRATION = 'form-field-signals';
const TS_EXT = '.ts';
const HTML_EXT = '.html';
const STYLE_EXTS = ['.scss', '.css'];

/** A text-span edit on the original file content. Applied right-to-left so offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** The receivers of one target in a file, and the bindings that decide which of them an access reaches. */
interface TargetReceivers {
    receivers: Receiver[];
    bindings: Binding[];
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

/**
 * Whether a property access reads from a receiver of the target. The shared engine resolves the receiver at
 * this exact position, so a nested declaration that shadows its name or a `function` that rebinds `this` is
 * not followed. A signal query (`viewChild(KbqSelect)`) holds the instance behind a call of its own, which
 * this pass does not reach.
 */
function onReceiver(node: ts.PropertyAccessExpression, sourceFile: ts.SourceFile, scope: TargetReceivers): boolean {
    const receiver = resolveReceiver(node.expression, node, sourceFile, scope.receivers, scope.bindings);

    return !!receiver && !receiver.signalQuery;
}

/** Collects edits for every read/write of a migrated member on a known receiver of `target`. */
function collectAccessEdits(sourceFile: ts.SourceFile, target: Target, scope: TargetReceivers): Edit[] {
    const edits: Edit[] = [];

    const visit = (node: ts.Node): void => {
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            target.signalMembers.includes(node.name.text) &&
            onReceiver(node, sourceFile, scope)
        ) {
            classifyAccess(node, sourceFile, target.writableMembers, edits);
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return edits;
}

/** Distinct members accessed on a receiver that need manual attention. */
interface ReceiverWarnings {
    queryListApi: Set<string>;
    nullability: Set<string>;
    readOnlyInputWrites: Set<string>;
    readOnlyQueryWrites: Set<string>;
    readOnlyStateWrites: Set<string>;
    /** Writable members written in a form other than a plain `=`, which has no `.set()` translation. */
    writableWrites: Set<string>;
    /** Removed members, reached in any form. */
    removed: Set<string>;
}

const emptyWarnings = (): ReceiverWarnings => ({
    queryListApi: new Set<string>(),
    nullability: new Set<string>(),
    readOnlyInputWrites: new Set<string>(),
    readOnlyQueryWrites: new Set<string>(),
    readOnlyStateWrites: new Set<string>(),
    writableWrites: new Set<string>(),
    removed: new Set<string>()
});

/** Collects the members that the auto-fix can't fully migrate for one target. */
function collectReceiverWarnings(sourceFile: ts.SourceFile, target: Target, scope: TargetReceivers): ReceiverWarnings {
    const warnings = emptyWarnings();

    const visit = (node: ts.Node): void => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
            const name = node.name.text;
            const reachesReceiver = onReceiver(node, sourceFile, scope);

            if (reachesReceiver && NULLABILITY_CHANGED_MEMBERS.includes(name)) {
                warnings.nullability.add(name);
            }

            if (reachesReceiver && target.removedMembers?.includes(name)) {
                warnings.removed.add(name);
            }

            // `target.signalMembers` scopes the flat name lists to the members this receiver actually owns.
            if (reachesReceiver && target.signalMembers.includes(name) && isWriteTarget(node)) {
                if (target.writableMembers.has(name)) {
                    if (!isPlainAssignment(node)) warnings.writableWrites.add(name);
                } else if (READ_ONLY_INPUT_MEMBERS.includes(name)) {
                    warnings.readOnlyInputWrites.add(name);
                } else if (READ_ONLY_QUERY_MEMBERS.includes(name)) {
                    warnings.readOnlyQueryWrites.add(name);
                } else if (READ_ONLY_STATE_MEMBERS.includes(name)) {
                    warnings.readOnlyStateWrites.add(name);
                }
            }

            // `formField.hint.changes` — the query member is migrated, the QueryList API below it is not.
            if (
                QUERY_LIST_ONLY_API.includes(name) &&
                ts.isPropertyAccessExpression(node.expression) &&
                ts.isIdentifier(node.expression.name) &&
                QUERY_LIST_MEMBERS.includes(node.expression.name.text) &&
                onReceiver(node.expression, sourceFile, scope)
            ) {
                warnings.queryListApi.add(`${node.expression.name.text}.${name}`);
            }
        }

        node.forEachChild(visit);
    };

    visit(sourceFile);

    return warnings;
}

/** The members of a file's receivers that can't be auto-fixed, across every target. */
function collectFileWarnings(filePath: string, content: string): ReceiverWarnings {
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const bindings = collectBindings(sourceFile);
    const merged = emptyWarnings();

    for (const target of TARGETS) {
        const receivers = collectAllReceivers(sourceFile, target.types);

        if (receivers.length === 0) continue;

        const warnings = collectReceiverWarnings(sourceFile, target, { receivers, bindings });

        warnings.queryListApi.forEach((value) => merged.queryListApi.add(value));
        warnings.nullability.forEach((value) => merged.nullability.add(value));
        warnings.readOnlyInputWrites.forEach((value) => merged.readOnlyInputWrites.add(value));
        warnings.readOnlyQueryWrites.forEach((value) => merged.readOnlyQueryWrites.add(value));
        warnings.readOnlyStateWrites.forEach((value) => merged.readOnlyStateWrites.add(value));
        warnings.writableWrites.forEach((value) => merged.writableWrites.add(value));
        warnings.removed.forEach((value) => merged.removed.add(value));
    }

    return merged;
}

/** Members a template reaches through a reference variable and the rewrite leaves as they are. */
interface TemplateFindings {
    /** Read-only members, written in any form. */
    readOnlyWrites: Set<string>;
    /** Writable members, written by a compound assignment or an increment. */
    compoundWrites: Set<string>;
    /** Removed members, reached in any form. */
    removed: Set<string>;
}

const emptyTemplateFindings = (): TemplateFindings => ({
    readOnlyWrites: new Set<string>(),
    compoundWrites: new Set<string>(),
    removed: new Set<string>()
});

/** Merges the findings of one template into `into`. */
function mergeTemplateFindings(into: TemplateFindings, from: TemplateFindings): void {
    from.readOnlyWrites.forEach((member) => into.readOnlyWrites.add(member));
    from.compoundWrites.forEach((member) => into.compoundWrites.add(member));
    from.removed.forEach((member) => into.removed.add(member));
}

/** Adds the members a template reaches through a reference variable to the warnings. */
function addTemplateFindings(warnings: ReceiverWarnings, findings: TemplateFindings): ReceiverWarnings {
    for (const name of findings.readOnlyWrites) {
        if (READ_ONLY_INPUT_MEMBERS.includes(name)) warnings.readOnlyInputWrites.add(name);
        else if (READ_ONLY_QUERY_MEMBERS.includes(name)) warnings.readOnlyQueryWrites.add(name);
        else if (READ_ONLY_STATE_MEMBERS.includes(name)) warnings.readOnlyStateWrites.add(name);
    }

    findings.compoundWrites.forEach((member) => warnings.writableWrites.add(member));
    findings.removed.forEach((member) => warnings.removed.add(member));

    return warnings;
}

/** Emits precise, receiver-scoped warnings for the members that can't be auto-fixed. */
function logReceiverWarnings(context: SchematicContext, filePath: string, merged: ReceiverWarnings): void {
    if (merged.queryListApi.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  These KbqFormField members are now a readonly array instead of a QueryList, so the QueryList API is`,
            `  gone: ${[...merged.queryListApi].join(', ')}. The queries are signals — react to them with`,
            `  \`computed()\`/\`effect()\` instead of \`.changes\`, and use \`[0]\`/\`.at(-1)\`/the array itself instead`,
            `  of \`.first\`/\`.last\`/\`.toArray()\`.`
        ]);
    }

    if (merged.nullability.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  \`${[...merged.nullability].join('`, `')}\` now returns \`undefined\` instead of \`null\` when absent.`,
            `  Strict comparisons against \`null\` no longer match — use a truthiness check or \`== null\`.`
        ]);
    }

    if (merged.readOnlyInputWrites.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  \`${[...merged.readOnlyInputWrites].join('`, `')}\` can no longer be assigned: they are read-only`,
            `  signal inputs now. Drive them with a template binding (e.g. \`[fillTextOff]="…"\`) instead of an`,
            `  assignment.`
        ]);
    }

    if (merged.readOnlyQueryWrites.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  \`${[...merged.readOnlyQueryWrites].join('`, `')}\` can no longer be assigned: they are read-only`,
            `  signal content queries now. Project the content into the form field instead — code that assigned a`,
            `  query result (usually a test faking the projected content) has to render the real component.`
        ]);
    }

    if (merged.readOnlyStateWrites.size > 0) {
        logMessage(context.logger, [`[${MIGRATION}] ${filePath}`, `  ${READ_ONLY_STATE_MESSAGE}`]);
    }

    if (merged.removed.size > 0) {
        logMessage(context.logger, [`[${MIGRATION}] ${filePath}`, `  ${REMOVED_MEMBERS_MESSAGE}`]);
    }

    if (merged.writableWrites.size > 0) {
        logMessage(context.logger, [
            `[${MIGRATION}] ${filePath}`,
            `  \`${[...merged.writableWrites].join('`, `')}\` are writable signals now, but only a plain \`=\` is`,
            `  rewritten to \`.set()\`: a compound assignment, an increment, \`delete\` or a destructuring target`,
            `  was left as it is. Write it with \`.set()\` or \`.update()\`.`
        ]);
    }
}

/** Pass A — rewrite value-safe programmatic reads of migrated members in TypeScript code. */
function migrateTsExpressions(content: string, fileName: string): string {
    let result = content;

    // One target at a time, re-parsing in between, so the edit offsets of each pass stay valid.
    for (const target of TARGETS) {
        const sourceFile = ts.createSourceFile(fileName, result, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const receivers = collectAllReceivers(sourceFile, target.types);

        if (receivers.length === 0) continue;

        const edits = collectAccessEdits(sourceFile, target, { receivers, bindings: collectBindings(sourceFile) });

        if (edits.length > 0) result = applyEdits(result, edits);
    }

    return result;
}

/** Rewrites renamed attributes inside the opening tag of the elements that own them. */
function rewriteAttributes(template: string): string {
    let content = template;

    for (const { element, from, to } of attributeRewrites) {
        const tagPattern = new RegExp(`<${escapeRegExp(element)}\\b[^>]*>`, 'g');

        content = content.replace(tagPattern, (tag) => {
            const attrPattern = new RegExp(`(\\s)${escapeRegExp(from)}(\\s*=)`, 'g');

            return tag.replace(attrPattern, `$1${to}$2`);
        });
    }

    return content;
}

/**
 * Whether a `#ref` with `value` on an `element` names `target`: bare or naming the `exportAs` on one of its elements,
 * or naming one of its directive `exportAs` names on any element.
 */
function refersTo({ elements, exportAs = [] }: Target, element: string, value: string): boolean {
    if (Object.hasOwn(elements, element) && (!value || value === elements[element])) return true;

    return !!value && exportAs.includes(value);
}

interface TemplateResult extends TemplateFindings {
    content: string;
    changed: boolean;
}

/**
 * Pass B (core) — parse a template, discover target refs, rewrite their reads, writes and renamed attributes, and
 * find the removed members they reach.
 */
async function migrateTemplate(template: string): Promise<TemplateResult> {
    let content = rewriteAttributes(template);
    const findings = emptyTemplateFindings();

    const relevant = TARGETS.filter(
        (target) =>
            Object.keys(target.elements).some((element) => template.includes(element)) ||
            target.exportAs?.some((exportAs) => template.includes(exportAs))
    );

    if (relevant.length > 0) {
        const parsed = await parseTemplate(content);

        if (parsed.tree) {
            const { rootNodes } = parsed.tree as { rootNodes: unknown[] };
            const policies = new Map<Target, RefAccessPolicy>(
                relevant.map((target) => [
                    target,
                    {
                        members: target.signalMembers,
                        writable: target.writableMembers,
                        reported: target.removedMembers
                    }
                ])
            );
            const result = rewriteRefAccesses(content, rootNodes, (element, value) => {
                const target = relevant.find((candidate) => refersTo(candidate, element.name, value));

                return target && policies.get(target);
            });

            content = result.content;
            result.readOnlyWrites.forEach((member) => findings.readOnlyWrites.add(member));
            result.compoundWrites.forEach((member) => findings.compoundWrites.add(member));
            result.reported.forEach((member) => findings.removed.add(member));
        }
    }

    return { content, changed: content !== template, ...findings };
}

/** Pass B (inline) — rewrite target ref reads and writes inside inline component templates. */
async function migrateInlineTemplates(
    content: string,
    fileName: string
): Promise<TemplateFindings & { content: string }> {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const ranges = collectInlineTemplateRanges(sourceFile).sort((a, b) => b.start - a.start);
    const findings = emptyTemplateFindings();
    let result = content;

    for (const { start, end } of ranges) {
        const outcome = await migrateTemplate(result.slice(start, end));

        mergeTemplateFindings(findings, outcome);

        if (outcome.changed) {
            result = result.slice(0, start) + outcome.content + result.slice(end);
        }
    }

    return { content: result, ...findings };
}

/** Pass C — the misspelled `_fiedset-theme.scss` was renamed. */
function migrateStyles(content: string): string {
    let result = content;

    for (const { from, to } of styleRewrites) {
        result = result.split(from).join(to);
    }

    return result;
}

function logWarnings(context: SchematicContext, filePath: string, content: string): void {
    for (const { pattern, message } of warnPatterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`[${MIGRATION}] ${filePath}`, `  ${message}`]);
        }
    }
}

/**
 * A file is a form-field consumer if it names one of the migrated symbols, imports the package, renders a
 * control or names the `exportAs` of a directive one: a component that imports only `KbqInputModule` names no type.
 */
function referencesFormField(content: string): boolean {
    return (
        TARGETS.some((target) => target.exportAs?.some((name) => content.includes(name))) ||
        /\bKbq(FormField|Hint|Error|ReactivePasswordHint|Cleaner|PasswordToggle|Stepper|Trim|A11yLocaleConfiguration)\b/.test(
            content
        ) ||
        /\b(mixinColor|CanColorCtor|KBQ_FORM_FIELD_REF|kbqA11yLocaleConfigurationProvider)\b/.test(content) ||
        /\bKbq(Select|TreeSelect|TimezoneSelect|TagList|TagInput|Input|InputPassword|Textarea|Timepicker|DatepickerInput|FormFieldControl|ErrorStateTracker|IconErrorStateContext)\b/.test(
            content
        ) ||
        /\b(mixinErrorState|CanUpdateErrorState|CanUpdateErrorStateCtor|kbqIconErrorStateContextFactoryProvider)\b/.test(
            content
        ) ||
        content.includes('@koobiq/components/form-field') ||
        content.includes('kbq-form-field') ||
        content.includes('kbq-cleaner') ||
        /<kbq-(select|tree-select|timezone-select|tag-list)\b/.test(content)
    );
}

export default function formFieldSignals(options: Schema): Rule {
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
        const stylePaths: string[] = [];

        visitProjectFiles(rootDir, (filePath) => {
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
                logMessage(context.logger, [`[${MIGRATION}] would update ${filePath} (run with --fix to apply)`]);
            }
        };

        for (const filePath of tsPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original || !referencesFormField(original)) continue;

            logWarnings(context, filePath, original);

            const warnings = collectFileWarnings(filePath, original);
            const inline = await migrateInlineTemplates(migrateTsExpressions(original, filePath), filePath);

            logReceiverWarnings(context, filePath, addTemplateFindings(warnings, inline));
            commit(filePath, original, inline.content);
        }

        for (const filePath of htmlPaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            logWarnings(context, filePath, original);

            const outcome = await migrateTemplate(original);

            logReceiverWarnings(context, filePath, addTemplateFindings(emptyWarnings(), outcome));

            if (outcome.changed) commit(filePath, original, outcome.content);
        }

        for (const filePath of stylePaths) {
            const original = tree.read(filePath)?.toString();

            if (!original) continue;

            commit(filePath, original, migrateStyles(original));
        }

        logMessage(context.logger, [
            `[${MIGRATION}] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

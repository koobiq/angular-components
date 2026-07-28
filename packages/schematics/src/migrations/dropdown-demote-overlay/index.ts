import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getSimpleAttributeName, visitAll, Visitor } from '../../utils/ast';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { parseTemplate } from '../../utils/typescript';
import {
    BEHAVIOUR_NOTE,
    PROVIDER_ENTRY,
    PROVIDER_IMPORT,
    REMOVED_ATTRIBUTE,
    styleWarnPatterns,
    templateWarnPatterns,
    tsWarnPatterns,
    UNPARSEABLE_TEMPLATE_MESSAGE,
    WarnPattern
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const SCSS_EXT = '.scss';
const CSS_EXT = '.css';

const LABEL = '[dropdown-demote-overlay]';

/** A half-open `[start, end)` range of the file content. */
interface Span {
    start: number;
    end: number;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** `demoteOverlay`, `[demoteOverlay]` and `bind-demoteOverlay` all name the same input. */
function attributeName(name: string): string {
    return getSimpleAttributeName(name).replace(/^bind-/, '');
}

/** Collects the source span of every `demoteOverlay` attribute in a parsed template. */
class RemovedAttributeCollector implements Visitor {
    readonly spans: Span[] = [];

    visitElement(element: any): void {
        for (const attr of element.attrs ?? []) {
            if (typeof attr.name !== 'string' || attributeName(attr.name) !== REMOVED_ATTRIBUTE) continue;

            this.spans.push({ start: attr.sourceSpan.start.offset, end: attr.sourceSpan.end.offset });
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
 * Deletes the given spans, each together with the whitespace that separated it
 * from the previous attribute: an inline attribute takes its leading spaces, one
 * written on its own line takes the line break and the indent as well, so the tag
 * is not left with a blank line.
 */
function removeSpans(content: string, spans: Span[]): string {
    let result = content;

    // Right-to-left, so earlier offsets stay valid.
    for (const { start, end } of [...spans].sort((a, b) => b.start - a.start)) {
        let from = start;

        while (from > 0 && (result[from - 1] === ' ' || result[from - 1] === '\t')) from--;

        if (result[from - 1] === '\n') {
            from--;

            if (result[from - 1] === '\r') from--;
        }

        result = result.slice(0, from) + result.slice(end);
    }

    return result;
}

/**
 * Removes every `demoteOverlay` attribute from a template. Returns `null` when
 * the template could not be parsed — editing it blind is how a regex-based
 * migration corrupts binding expressions, so the caller warns instead.
 */
async function migrateTemplate(template: string): Promise<string | null> {
    if (!template.includes(REMOVED_ATTRIBUTE)) return template;

    const parsed = await parseTemplate(template);

    if (!parsed.tree) return null;

    const collector = new RemovedAttributeCollector();

    visitAll(collector, (parsed.tree as { rootNodes: unknown[] }).rootNodes);

    return removeSpans(template, collector.spans);
}

/**
 * Interior `[start, end)` ranges of inline `template:` literals.
 *
 * Scoping matters: a wrapper component may legitimately declare its own
 * `demoteOverlay` member (e.g. `@Input() demoteOverlay = false;`) that forwards
 * to the trigger. Only the binding in its template is removed; the now-dead
 * member is left for the compiler to flag.
 */
function collectInlineTemplateRanges(content: string): Span[] {
    const opener = /template\s*:\s*(['"`])/g;
    const ranges: Span[] = [];
    let match: RegExpExecArray | null;

    while ((match = opener.exec(content)) !== null) {
        const quote = match[1];
        const start = match.index + match[0].length;
        let index = start;
        let terminated = false;

        while (index < content.length) {
            const char = content[index];

            if (char === '\\') {
                index += 2;
                continue;
            }

            if (char === quote) {
                terminated = true;
                break;
            }

            // A quoted (non-template) literal cannot span lines, so an unescaped
            // line break means this was not a template after all.
            if (quote !== '`' && char === '\n') break;

            index++;
        }

        opener.lastIndex = Math.min(index + 1, content.length);

        if (terminated) ranges.push({ start, end: index });
    }

    return ranges;
}

/** Applies the template migration to every inline `template:` literal of a `.ts` source. */
async function migrateInlineTemplates(content: string, onParseError: () => void): Promise<string> {
    let result = content;

    // Splice right-to-left so earlier offsets stay valid.
    for (const { start, end } of collectInlineTemplateRanges(content).reverse()) {
        const migrated = await migrateTemplate(result.slice(start, end));

        if (migrated === null) {
            onParseError();
            continue;
        }

        result = result.slice(0, start) + migrated + result.slice(end);
    }

    return result;
}

/**
 * Removes the `KBQ_DROPDOWN_HOST` provider entry together with exactly one
 * adjacent separator, so the array keeps its shape and nothing outside the entry
 * is reformatted.
 */
function removeProviderEntry(content: string): string {
    const separator = '(,[ \\t]*\\r?\\n?[ \\t]*)';
    const pattern = new RegExp(`${separator}?(?:${PROVIDER_ENTRY})${separator}?`, 'g');

    // With a neighbour on both sides one separator has to survive, otherwise the
    // entry and whichever separator it had are dropped together.
    return content.replace(pattern, (_match, before: string | undefined, after: string | undefined) =>
        before && after ? after : ''
    );
}

/**
 * Idempotently strips `symbol` from any `import { … } from 'from'` clause.
 * - Multi-symbol clause: drop just that symbol, keep the others.
 * - Single-symbol clause: drop the whole import line.
 */
function removeImport(content: string, symbol: string, from: string): string {
    // The trailing part deliberately stops after a single newline (`[ \t]*\r?\n?`
    // rather than `\s*\n?`): dropping the whole import line must not also swallow
    // the blank line that separates the import block from the code below it.
    const moduleRe = new RegExp(
        `(import\\s*(?:type\\s*)?\\{)([^}]*)(\\}\\s*from\\s*['"]${escapeRegExp(from)}['"];?[ \\t]*\\r?\\n?)`,
        'g'
    );

    return content.replace(moduleRe, (full, open: string, body: string, close: string) => {
        const items = body
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        // An already-empty clause is somebody else's import — leave it alone.
        if (items.length === 0) return full;

        // Handle `<name> as <alias>` — match on the source name, not the alias.
        const kept = items.filter((spec) => spec.split(/\s+as\s+/)[0].trim() !== symbol);

        if (kept.length === items.length) return full;
        if (kept.length === 0) return '';

        return `${open} ${kept.join(', ')} ${close}`;
    });
}

/**
 * Drops a `providers` property the removal left empty. Angular treats
 * `providers: []` as a no-op, so this is purely cosmetic — but leaving it
 * behind in a decorator whose only provider was `KBQ_DROPDOWN_HOST` looks like
 * an unfinished migration.
 */
function dropEmptyProvidersProperty(content: string): string {
    return content.replace(/[ \t]*providers:\s*\[\s*\],?[ \t]*\r?\n/g, '').replace(/,?[ \t]*providers:\s*\[\s*\]/g, '');
}

function logWarnings(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]) {
    for (const { pattern, message } of patterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${message}`]);
        }
    }
}

function pickWarnPatterns(filePath: string): WarnPattern[] {
    if (filePath.endsWith(TS_EXT)) return [...tsWarnPatterns, ...templateWarnPatterns];
    if (filePath.endsWith(HTML_EXT)) return templateWarnPatterns;

    return styleWarnPatterns;
}

function isMigratableFile(filePath: string): boolean {
    return (
        filePath.endsWith(TS_EXT) ||
        filePath.endsWith(HTML_EXT) ||
        filePath.endsWith(SCSS_EXT) ||
        filePath.endsWith(CSS_EXT)
    );
}

export default function dropdownDemoteOverlay(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json
        // declares no schema, so the schema default never reaches us — applying the
        // fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        const filePaths: Path[] = [];

        rootDir.visit((filePath: Path) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!isMigratableFile(filePath)) return;

            filePaths.push(filePath);
        });

        let touched = 0;

        for (const filePath of filePaths) {
            const originalContent = tree.read(filePath)?.toString();

            if (!originalContent) continue;

            let content = originalContent;
            let unparseable = false;
            const reportParseError = () => (unparseable = true);

            if (filePath.endsWith(TS_EXT)) {
                const withoutProvider = removeProviderEntry(content);

                if (withoutProvider !== content) {
                    content = dropEmptyProvidersProperty(
                        removeImport(withoutProvider, PROVIDER_IMPORT.symbol, PROVIDER_IMPORT.from)
                    );
                }

                content = await migrateInlineTemplates(content, reportParseError);
            } else if (filePath.endsWith(HTML_EXT)) {
                const migrated = await migrateTemplate(content);

                if (migrated === null) reportParseError();
                else content = migrated;
            }

            // Warn on what is left over, so an auto-fixed usage does not also
            // produce a "manual migration required" note. In dry-run mode the
            // fix is not written, so report against the original content.
            logWarnings(context, filePath, fix ? content : originalContent, pickWarnPatterns(filePath));

            if (unparseable) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${UNPARSEABLE_TEMPLATE_MESSAGE}`]);
            }

            if (content === originalContent) continue;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        }

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            '',
            ...BEHAVIOUR_NOTE
        ]);
    };
}

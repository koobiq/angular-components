import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import {
    BEHAVIOUR_NOTE,
    Replacement,
    styleWarnPatterns,
    templateReplacements,
    templateWarnPatterns,
    tsReplacements,
    tsWarnPatterns,
    WarnPattern
} from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const SCSS_EXT = '.scss';
const CSS_EXT = '.css';

const LABEL = '[dropdown-demote-overlay]';

interface ReplaceResult {
    content: string;
    changed: boolean;
    importsToRemove: { symbol: string; from: string }[];
    dropEmptyProviders: boolean;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Applies an ordered list of regex replacements, reporting the follow-up cleanups they require. */
function applyReplacements(content: string, replacements: Replacement[]): ReplaceResult {
    let result = content;
    const importsToRemove: { symbol: string; from: string }[] = [];
    let dropEmptyProviders = false;

    for (const replacement of replacements) {
        const before = result;

        result = result.replace(new RegExp(replacement.from, 'g'), replacement.to);

        if (before === result) continue;

        // Tidy up the dangling commas an element deletion leaves behind, e.g.
        // `providers: [a, {provide: KBQ_DROPDOWN_HOST, …}, b]` → `providers: [a, , b]`.
        // The trailing-comma rules are split so a single-line array collapses
        // tightly while a multi-line one keeps the indentation of its bracket.
        if (replacement.to === '') {
            result = result
                .replace(/,\s*,/g, ',')
                .replace(/\[[ \t]*,[ \t]*/g, '[')
                .replace(/\[\s*,(\s*)/g, '[$1')
                .replace(/,[ \t]*\]/g, ']')
                .replace(/,(\s*)\]/g, (_match, gap: string) => `\n${gap.slice(gap.lastIndexOf('\n') + 1)}]`);
        }

        if (replacement.removeImport) {
            importsToRemove.push(replacement.removeImport);
        }

        if (replacement.dropEmptyProviders) {
            dropEmptyProviders = true;
        }
    }

    return { content: result, changed: result !== content, importsToRemove, dropEmptyProviders };
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

        if (items.length === 0) return '';

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

/**
 * Applies template replacements to a `.ts` source, but only inside inline
 * `template: \`…\`` literals.
 *
 * Scoping matters: a wrapper component may legitimately declare its own
 * `demoteOverlay` member (e.g. `@Input() demoteOverlay = false;`) that forwards
 * to the trigger. Running the attribute regexes over the whole file would
 * mangle that declaration; running them over the template alone removes only
 * the binding and leaves the now-dead member for the compiler to flag.
 */
function replaceInInlineTemplates(content: string, replacements: Replacement[]): string {
    const opener = /template\s*:\s*`/g;
    const segments: { start: number; end: number }[] = [];
    let match: RegExpExecArray | null;

    while ((match = opener.exec(content)) !== null) {
        const start = match.index + match[0].length;
        let index = start;

        // Scan to the closing backtick, skipping escaped ones.
        while (index < content.length) {
            const char = content[index];

            if (char === '\\') {
                index += 2;
                continue;
            }

            if (char === '`') break;

            index++;
        }

        if (index >= content.length) break;

        segments.push({ start, end: index });
        opener.lastIndex = index + 1;
    }

    // Splice right-to-left so earlier offsets stay valid.
    let result = content;

    for (const { start, end } of segments.reverse()) {
        const { content: replaced } = applyReplacements(result.slice(start, end), replacements);

        result = result.slice(0, start) + replaced + result.slice(end);
    }

    return result;
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
        const { project, fix } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        let touched = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;
            if (!isMigratableFile(filePath)) return;

            const originalContent = entry?.content.toString();

            if (!originalContent) return;

            let content = originalContent;

            if (filePath.endsWith(TS_EXT)) {
                const {
                    content: replaced,
                    importsToRemove,
                    dropEmptyProviders
                } = applyReplacements(content, tsReplacements);

                content = replaced;

                const seen = new Set<string>();

                for (const { symbol, from } of importsToRemove) {
                    const key = `${symbol}|${from}`;

                    if (seen.has(key)) continue;

                    seen.add(key);
                    content = removeImport(content, symbol, from);
                }

                if (dropEmptyProviders) {
                    content = dropEmptyProvidersProperty(content);
                }

                content = replaceInInlineTemplates(content, templateReplacements);
            } else if (filePath.endsWith(HTML_EXT)) {
                content = applyReplacements(content, templateReplacements).content;
            }

            // Warn on what is left over, so an auto-fixed usage does not also
            // produce a "manual migration required" note. In dry-run mode the
            // fix is not written, so report against the original content.
            logWarnings(context, filePath, fix ? content : originalContent, pickWarnPatterns(filePath));

            if (content === originalContent) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        });

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            '',
            ...BEHAVIOUR_NOTE
        ]);
    };
}

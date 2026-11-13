import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from './messages';
import { setupOptions } from './package-config';
import { visitProjectFiles } from './project-files';

/** A pattern a warn-only migration reports, with what to do about it. */
export interface WarnPattern {
    /** Only a file that also matches it is checked against `pattern`. */
    anchor?: string;
    pattern: string;
    message: string;
    /** File extensions checked against `pattern`. Defaults to `.ts`; a template reads a member through `.html`. */
    extensions?: readonly string[];
}

/** Options every warn-only migration accepts. */
export interface WarnOnlyOptions {
    /** Name of the project to inspect. If omitted, the whole tree is inspected. */
    project?: string;
}

/** What a warn-only migration reports. */
export interface WarnOnlyConfig {
    /** Prefix on every log line, e.g. `[core-mixins-removal]`. */
    label: string;
    warnPatterns: readonly WarnPattern[];
    /** Logged after the reports, when there is any. */
    summary: readonly string[];
}

/**
 * Builds the rule of a migration that only reports: every file of the project that matches a pattern of its extension
 * is logged with its message, then the summary. Never writes.
 *
 * The patterns are compiled once here rather than per file. None carries the `g` flag, so a shared instance
 * holds no `lastIndex`.
 */
export function warnOnlyRule(config: WarnOnlyConfig, options: WarnOnlyOptions): Rule {
    const { label, summary } = config;
    const warnPatterns = config.warnPatterns.map(({ anchor, pattern, message, extensions = ['.ts'] }) => ({
        anchor: anchor ? new RegExp(anchor) : null,
        pattern: new RegExp(pattern),
        message,
        extensions
    }));

    return async (tree: Tree, context: SchematicContext) => {
        const projectDefinition = await setupOptions(options.project, tree);
        const root = projectDefinition?.root ?? '';
        let reported = 0;

        visitProjectFiles(root ? tree.getDir(root) : tree.root, (filePath, entry) => {
            const patterns = warnPatterns.filter(({ extensions }) => extensions.some((ext) => filePath.endsWith(ext)));

            if (patterns.length === 0) return;

            const content = entry.content.toString();

            if (!content) return;

            for (const { anchor, pattern, message } of patterns) {
                if (anchor && !anchor.test(content)) continue;
                if (!pattern.test(content)) continue;

                reported++;

                logMessage(context.logger, [`${label} ${filePath}`, `  ${message}`]);
            }
        });

        // Nothing here is affected, so the summary would only be noise.
        if (reported === 0) return;

        logMessage(context.logger, [
            `${label} processed "${root || '<workspace root>'}", ${reported} use(s) reported.`,
            ...summary
        ]);
    };
}

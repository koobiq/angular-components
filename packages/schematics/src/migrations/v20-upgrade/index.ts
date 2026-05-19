import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { Replacement, WarnPattern, scssReplacements, templateReplacements, tsReplacements, warnPatterns } from './data';
import { Schema } from './schema';

const TS_EXT = '.ts';
const HTML_EXT = '.html';
const SCSS_EXT = '.scss';
const CSS_EXT = '.css';

/**
 * Applies an ordered list of regex replacements to a string, returns the new
 * string and whether anything changed.
 */
function applyReplacements(content: string, replacements: Replacement[]): { content: string; changed: boolean } {
    let result = content;

    for (const { from, to } of replacements) {
        const before = result;

        result = result.replace(new RegExp(from, 'g'), to);

        // Tidy up double commas / empty-element commas left over from identifier
        // deletions like `{ A, KbqValidationOptions, B }` → `{ A, , B }`.
        if (to === '' && before !== result) {
            result = result.replace(/,\s*,/g, ',').replace(/{\s*,/g, '{').replace(/,\s*}/g, ' }');
        }
    }

    return { content: result, changed: result !== content };
}

function logWarnings(context: SchematicContext, filePath: string, content: string, patterns: WarnPattern[]) {
    for (const { pattern, message } of patterns) {
        if (new RegExp(pattern).test(content)) {
            logMessage(context.logger, [`[v20-upgrade] ${filePath}`, `  ${message}`]);
        }
    }
}

function pickReplacements(filePath: string): Replacement[] | null {
    if (filePath.endsWith(TS_EXT)) {
        // .ts files: apply both ts-source and template replacements (covers inline templates)
        return [...tsReplacements, ...templateReplacements];
    }

    if (filePath.endsWith(HTML_EXT)) {
        return templateReplacements;
    }

    if (filePath.endsWith(SCSS_EXT) || filePath.endsWith(CSS_EXT)) {
        return scssReplacements;
    }

    return null;
}

export default function v20Upgrade(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project, fix } = options;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        let touched = 0;

        rootDir.visit((filePath: Path, entry) => {
            if (filePath.includes('node_modules') || filePath.includes('/dist/')) return;

            const replacements = pickReplacements(filePath);

            if (!replacements) return;

            const originalContent = entry?.content.toString();

            if (!originalContent) return;

            // Always surface warn-only patterns regardless of fix mode.
            logWarnings(context, filePath, originalContent, warnPatterns);

            const { content, changed } = applyReplacements(originalContent, replacements);

            if (!changed) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [
                    `[v20-upgrade] would update ${filePath} (run with --fix to apply)`
                ]);
            }
        });

        logMessage(context.logger, [
            `[v20-upgrade] processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}

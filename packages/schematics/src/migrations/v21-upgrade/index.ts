import { JsonValue, workspaces } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { readWorkspace, writeWorkspace } from '@schematics/angular/utility';
import { logMessage } from '../../utils/messages';
import {
    CompiledReplacement,
    applyReplacements,
    compileReplacements,
    replacementMigrationRule
} from '../../utils/replacement-driver';
import { scssReplacements, styleEntryReplacements, templateReplacements, tsReplacements, warnPatterns } from './data';
import { Schema } from './schema';

/** Rewrites a `styles` entry: a path, or an object with an `input` path. */
function rewriteStyleEntry(entry: JsonValue, replacements: readonly CompiledReplacement[]): JsonValue {
    if (typeof entry === 'string') return applyReplacements(entry, replacements).content;

    if (entry && typeof entry === 'object' && !Array.isArray(entry) && typeof entry.input === 'string') {
        const input = applyReplacements(entry.input, replacements).content;

        return input === entry.input ? entry : { ...entry, input };
    }

    return entry;
}

/** Rewrites the entries of a `styles` array and drops the duplicates a rewrite produces; `null` if unchanged. */
function migrateStyleEntries(entries: JsonValue[], replacements: readonly CompiledReplacement[]): JsonValue[] | null {
    // The key of each kept entry → whether it was rewritten.
    const kept = new Map<string, boolean>();
    const result: JsonValue[] = [];
    let changed = false;

    for (const entry of entries) {
        const next = rewriteStyleEntry(entry, replacements);
        const rewritten = next !== entry;
        const key = JSON.stringify(next);

        if (rewritten) changed = true;

        if (kept.has(key)) {
            if (rewritten || kept.get(key)) {
                changed = true;
                continue;
            }
        } else {
            kept.set(key, rewritten);
        }

        result.push(next);
    }

    return changed ? result : null;
}

/**
 * Rewrites the `styles` of every target and configuration of `project` (every project when omitted) in
 * `angular.json`, which lies outside the project directory the rest of the migration walks. Returns whether
 * anything changed.
 */
async function migrateWorkspaceStyles(
    tree: Tree,
    context: SchematicContext,
    project: string | undefined,
    fix: boolean,
    replacements: readonly CompiledReplacement[]
): Promise<boolean> {
    let workspace: workspaces.WorkspaceDefinition;

    try {
        workspace = await readWorkspace(tree);
    } catch {
        return false;
    }

    let changed = false;

    for (const [name, definition] of workspace.projects) {
        if (project && name !== project) continue;

        for (const target of definition.targets.values()) {
            for (const options of [target.options, ...Object.values(target.configurations ?? {})]) {
                const styles = options?.styles;

                if (!options || !Array.isArray(styles)) continue;

                const migrated = migrateStyleEntries(styles, replacements);

                if (!migrated) continue;

                options.styles = migrated;
                changed = true;
            }
        }
    }

    if (!changed) return false;

    if (fix) {
        await writeWorkspace(tree, workspace);
    } else {
        logMessage(context.logger, ['[v21-upgrade] would update the styles in angular.json (run with --fix to apply)']);
    }

    return true;
}

export default function v21Upgrade(options: Schema): Rule {
    const styleEntries = compileReplacements(styleEntryReplacements);

    return replacementMigrationRule(
        { label: '[v21-upgrade]', tsReplacements, templateReplacements, scssReplacements, warnPatterns },
        options,
        (tree, context, fix) => migrateWorkspaceStyles(tree, context, options.project, fix, styleEntries)
    );
}

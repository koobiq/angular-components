import type { IconRename } from '../types.js';

/**
 * Turns a missed icon name into the name that exists in *this* project.
 *
 * The direction is derived from what is installed rather than from a version number: if the asked-for
 * name is the post-rename one and the pre-rename one is present, the project predates the rename, and
 * the other way round. That keeps the answer right even for a project pinned somewhere unexpected,
 * and it is the one case where a version-aware server beats reading the current documentation —
 * the docs only ever describe the newest names.
 */

export type RenameHint = {
    /** The name to use in this project. */
    use: string;
    /** The name that was asked for. */
    asked: string;
    direction: 'renamed-since' | 'not-yet-renamed';
};

export const resolveRename = (
    asked: string,
    renames: IconRename[],
    installed: ReadonlySet<string>
): RenameHint | null => {
    for (const rename of renames) {
        if (rename.from === asked && installed.has(rename.to)) {
            return { use: rename.to, asked, direction: 'renamed-since' };
        }

        if (rename.to === asked && installed.has(rename.from)) {
            return { use: rename.from, asked, direction: 'not-yet-renamed' };
        }
    }

    return null;
};

/**
 * The working name leads in both directions; the renaming is stated as a fact after it.
 *
 * A project below major 11 asking for a post-rename name has not made that migration, so being
 * told to migrate is not the answer it came for — it came for an icon. It still needs to know the
 * names changed, because every current document spells the new ones.
 */
export const describeRename = (hint: RenameHint, version: string): string =>
    hint.direction === 'renamed-since'
        ? `"${hint.asked}" was renamed to "${hint.use}"; @koobiq/icons@${version} has the new name.`
        : `In @koobiq/icons@${version} this icon is "${hint.use}" — use that. Names changed in major 11, which is why current documentation spells it "${hint.asked}"; \`ng g @koobiq/components:icons-replacement\` migrates a project's names when it upgrades.`;

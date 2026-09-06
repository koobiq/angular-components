/**
 * Data for the `top-bar-container-selectors` migration.
 *
 * The top-bar review renamed the two placement classes of `[kbqTopBarContainer]` and replaced the
 * flex-basis token of the `start` container:
 *
 * - `kbq-top-bar-container__start` / `__end` are modifiers of `.kbq-top-bar-container`, but were
 *   written with the `__` element separator. The repo spells modifiers with a single `_`, which the
 *   component already did one line away in `kbq-top-bar_with-shadow`.
 * - `--kbq-top-bar-container-start-basis` fed `flex: 1 0 <basis>`. With `flex-shrink: 0` the basis was
 *   never a basis: it was the width the container could not fall below. The container is
 *   `flex: 1 1 auto` now and the floor is spelled `--kbq-top-bar-container-start-min-width`.
 *
 * Both are plain, library-owned strings that appear nowhere else, so they are rewritten rather than
 * reported.
 */

export interface RenameData {
    replace: string;
    replaceWith: string;
}

/** Rewritten in `.ts`, `.html`, `.scss` and `.css`. */
export const renames: RenameData[] = [
    { replace: 'kbq-top-bar-container__start', replaceWith: 'kbq-top-bar-container_start' },
    { replace: 'kbq-top-bar-container__end', replaceWith: 'kbq-top-bar-container_end' },
    {
        replace: '--kbq-top-bar-container-start-basis',
        replaceWith: '--kbq-top-bar-container-start-min-width'
    }
];

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** Checked against the post-fix content, so an auto-fixed usage is not reported again. */
export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\.kbq-top-bar-container\\s*\\[\\s*placement',
        message:
            'This rule selects the container by its `placement` attribute. That only matches the static ' +
            'attribute form (placement="start"); a [placement]="\'start\'" property binding leaves no ' +
            'attribute behind and the rule silently stops applying. Select the class the directive ' +
            'applies instead: .kbq-top-bar-container_start / .kbq-top-bar-container_end.'
    }
];

/** Printed once per run, after the per-file reports. */
export const SUMMARY = [
    '  The start container is `flex: 1 1 auto` with `min-width: var(--kbq-top-bar-container-start-min-width)`',
    '  instead of `flex: 1 0 <basis>`, so it now shrinks toward the floor you set rather than being pinned',
    '  at it while the end container absorbs the whole overflow.',
    '  kbq-top-bar carries `z-index: var(--kbq-top-bar-z-index)` (990) instead of the CDK overlay layer',
    '  (1000). If your app raised something above the bar to work around that tie — the way a search modal',
    '  or a floating panel would have had to — that override is now redundant.',
    '  `--kbq-top-bar-position` still defaults to `sticky` and still does nothing on its own. Set',
    '  `--kbq-top-bar-inset-block-start: 0` to make the bar stick to the top of its scrolling ancestor.'
];

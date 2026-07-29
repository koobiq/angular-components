/**
 * Replacement data for the removal of the overlay-demotion mechanism.
 *
 * `KbqDropdownTrigger.demoteOverlay`, the `KBQ_DROPDOWN_HOST` marker token and
 * the `.cdk-overlay-container_dropdown` stylesheet rule were removed. They used
 * to lower the whole shared `.cdk-overlay-container` from `z-index: 1000` to
 * `999` while a dropdown / select / popover panel was open, so the panel slid
 * under a sticky `kbq-navbar` / `kbq-top-bar`. Panels now always render above
 * page content.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/**
 * The input removed from templates. Matched against the parsed template AST, so
 * every binding form (`demoteOverlay`, `demoteOverlay="…"`, `[demoteOverlay]="…"`,
 * `bind-demoteOverlay="…"`) is covered, while an identifier of the same name in an
 * interpolation, a binding expression or a text node is never touched.
 */
export const REMOVED_ATTRIBUTE = 'demoteOverlay';

/**
 * The token whose provider entries are removed. Matched against the TypeScript
 * AST — an object literal with a `provide: KBQ_DROPDOWN_HOST` property — so the
 * entry's own shape does not matter (a `useFactory` returning an object literal
 * is removed as cleanly as a `useExisting`), and a provider object declared
 * outside a provider array is never touched.
 */
export const PROVIDER_TOKEN = 'KBQ_DROPDOWN_HOST';

/** The import specifier the provider removal makes invalid. */
export const PROVIDER_IMPORT = { symbol: 'KBQ_DROPDOWN_HOST', from: '@koobiq/components/dropdown' };

/**
 * Warnings for `.ts` files. Checked against the post-fix content, so they only
 * fire on what the auto-fix could not handle.
 */
export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\.demoteOverlay\\b',
        message:
            'KbqDropdownTrigger.demoteOverlay was removed. Delete the read/assignment — the overlay ' +
            'container is no longer demoted, so there is nothing to opt out of.'
    },
    {
        pattern: '\\bKBQ_DROPDOWN_HOST\\b',
        message:
            'KBQ_DROPDOWN_HOST was removed from @koobiq/components/dropdown. Remove the provider / ' +
            'inject() call. Manual migration required — this usage was not in a shape the schematic could rewrite.'
    }
];

/** Warnings for `.html` files and inline templates. */
export const templateWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\.demoteOverlay\\b',
        message:
            'KbqDropdownTrigger.demoteOverlay was removed. Drop this read from the template ' +
            '(e.g. via a #trigger="kbqDropdownTrigger" reference).'
    }
];

/** Warnings for `.scss` / `.css` files. */
export const styleWarnPatterns: WarnPattern[] = [
    {
        pattern: 'cdk-overlay-container_dropdown',
        message:
            'The .cdk-overlay-container_dropdown class is no longer applied by @koobiq/components, so ' +
            'this rule is dead — remove it. If it was an override neutralising the demotion, it is now redundant.'
    }
];

/** Reported when a template mentions the input but cannot be parsed, so nothing was rewritten in it. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template mentions demoteOverlay but could not be parsed, so it was left untouched. ' +
    'Remove the attribute by hand.';

/**
 * Behaviour note printed once per run. The removal is not purely mechanical:
 * panels that used to slide under sticky chrome now render on top of it.
 */
export const BEHAVIOUR_NOTE = [
    'Layering behaviour changed: kbq-dropdown, kbq-select and popover panels now render ABOVE',
    'kbq-navbar / kbq-top-bar instead of sliding under them while open. The shared',
    '.cdk-overlay-container stays at z-index 1000 at all times.',
    'If your app relied on the old behaviour, lower your sticky chrome below the overlay',
    'container z-index (the library ships $overlay-container-z-index: 1000).'
];

/**
 * Replacement data for the removal of the overlay-demotion mechanism.
 *
 * `KbqDropdownTrigger.demoteOverlay`, the `KBQ_DROPDOWN_HOST` marker token and
 * the `.cdk-overlay-container_dropdown` stylesheet rule were removed. They used
 * to lower the whole shared `.cdk-overlay-container` from `z-index: 1000` to
 * `999` while a dropdown / select / popover panel was open, so the panel slid
 * under a sticky `kbq-navbar` / `kbq-top-bar`. Panels now always render above
 * page content.
 *
 * Each entry uses a RegExp source string in `from` and a literal `to`. The
 * RegExp is compiled with the `g` flag inside the migration driver.
 */

export interface Replacement {
    from: string;
    to: string;
    /** Human-readable note shown in dry-run mode. */
    note?: string;
    /**
     * When this replacement matches in a .ts file, strip `symbol` from any
     * existing `import { … } from 'from'` named-import clause. The symbol no
     * longer exists, so leaving the import would break compilation.
     */
    removeImport?: { symbol: string; from: string };
    /**
     * When this replacement matches in a .ts file, drop a `providers` property
     * that the removal left empty (`providers: []`).
     */
    dropEmptyProviders?: boolean;
}

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** A quoted attribute value: `="…"` or `='…'`. */
const VALUE = '\\s*=\\s*(?:"[^"]*"|\'[^\']*\')';
/** The attribute name, as a static attribute or a property binding. */
const NAME = '\\[?demoteOverlay\\]?';
/** The attribute must be followed by whitespace or the end of its tag. */
const TAIL = '(?=[ \\t\\r\\n>/])';

/**
 * Template replacements. Applied to `.html` files and — via the driver — only
 * inside inline `template: \`…\`` literals of `.ts` files, so a component's own
 * `demoteOverlay` class member is never mistaken for an attribute.
 *
 * Ordered: valued forms first, so a leftover bare match cannot swallow half of
 * an `demoteOverlay="…"` pair. Each rule comes in an own-line and an inline
 * variant; the own-line variant consumes the preceding newline and indent so
 * the tag is not left with a blank line.
 */
export const templateReplacements: Replacement[] = [
    {
        from: `\\r?\\n[ \\t]*${NAME}${VALUE}${TAIL}`,
        to: '',
        note: 'demoteOverlay was removed from KbqDropdownTrigger'
    },
    {
        from: `[ \\t]+${NAME}${VALUE}${TAIL}`,
        to: '',
        note: 'demoteOverlay was removed from KbqDropdownTrigger'
    },
    {
        from: `\\r?\\n[ \\t]*${NAME}(?!\\s*=)${TAIL}`,
        to: '',
        note: 'demoteOverlay was removed from KbqDropdownTrigger'
    },
    {
        from: `[ \\t]+${NAME}(?!\\s*=)${TAIL}`,
        to: '',
        note: 'demoteOverlay was removed from KbqDropdownTrigger'
    }
];

/** TypeScript-source replacements. */
export const tsReplacements: Replacement[] = [
    {
        // `{ provide: KBQ_DROPDOWN_HOST, useExisting: MyHeader }` and friends.
        // `[^{}]*` deliberately stops at a nested object literal — a
        // `useFactory` returning one is left in place and surfaced by the
        // leftover-token warning instead of being half-deleted.
        from: '\\{\\s*provide:\\s*KBQ_DROPDOWN_HOST\\s*,[^{}]*\\}',
        to: '',
        removeImport: { symbol: 'KBQ_DROPDOWN_HOST', from: '@koobiq/components/dropdown' },
        dropEmptyProviders: true,
        note: 'KBQ_DROPDOWN_HOST was removed; hosts no longer opt out of overlay demotion'
    }
];

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

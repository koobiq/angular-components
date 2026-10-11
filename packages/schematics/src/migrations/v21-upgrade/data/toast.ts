import type { AreaData } from '../data';

const MARGIN_TOP = String.raw`(?<![\w-])--kbq-toast-stack-size-margin-top(?![\w-])`;
const MARGIN_RIGHT = String.raw`(?<![\w-])--kbq-toast-stack-size-margin-right(?![\w-])`;
const MARGIN_REPLACEMENTS = [
    { from: MARGIN_TOP, to: '--kbq-toast-stack-size-margin-vertical' },
    { from: MARGIN_RIGHT, to: '--kbq-toast-stack-size-margin-horizontal' }
];

// A declaration of one of the properties, as opposed to a `var()` that reads it.
const declaration = (names: string): string => String.raw`(?<![\w-])--kbq-toast-stack-size-margin-(?:${names})\s*:`;

/**
 * Removed in 21.0.0: `KbqToastContainerComponent.dispatchScrollEvent` and the
 * `--kbq-toast-stack-size-margin-top` / `-right` custom properties.
 */
export const toast: AreaData = {
    // Style bindings and `setProperty()` calls name the properties too.
    templateReplacements: MARGIN_REPLACEMENTS,
    scssReplacements: MARGIN_REPLACEMENTS,
    warnPatterns: [
        {
            anchor: String.raw`\bKbqToastContainerComponent\b|<kbq-toast-container(?![\w-])`,
            pattern: String.raw`\bdispatchScrollEvent\b`,
            message:
                'KbqToastContainerComponent.dispatchScrollEvent was removed: the container reports its own ' +
                'reflow through `elementScrolled()`, so overlays anchored in a toast reposition without it. ' +
                'Delete the call.'
        },
        {
            anchor: declaration('top|right'),
            pattern: declaration('vertical|horizontal'),
            message:
                '--kbq-toast-stack-size-margin-top and -right were renamed to -vertical and -horizontal. This ' +
                'file declares both a removed and a new name: the new one used to win, after the rewrite the ' +
                'cascade decides. Keep one declaration of each.'
        }
    ]
};

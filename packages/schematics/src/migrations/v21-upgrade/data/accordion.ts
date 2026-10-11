import type { AreaData } from '../data';

/** Removed in 21.0.0: the `kbq-accordion-trigger__action` class. */
export const accordion: AreaData = {
    warnPatterns: [
        {
            pattern: String.raw`(?<![\w-])kbq-accordion-trigger__action(?![\w-])`,
            message:
                'The kbq-accordion-trigger__action class was removed: an action inside the trigger is a focusable ' +
                'element inside a `role="button"`. Move the actions out of the trigger into a ' +
                '`<div class="kbq-accordion-header__actions">` placed after it in `<kbq-accordion-header>`.'
        }
    ]
};

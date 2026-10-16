import type { AreaData } from '../data';

// A file that names the directive class or reaches it through its `exportAs`.
const TAG_INPUT_ANCHOR = '\\bKbqTagInput\\b|["\']kbqTagInput(?:For)?["\']';

/**
 * Removed in 21.0.0: the unused validation members of KbqTagInput and KbqTagTextControl. Neither has a
 * replacement to rewrite to, so both are reported. KbqTagTextControl is not exported, so its member is not.
 */
export const tags: AreaData = {
    warnPatterns: [
        // `this.ngControl` is a component's own control and `tagList.ngControl` the one that stays.
        {
            anchor: TAG_INPUT_ANCHOR,
            pattern: '(?<!\\bthis|[Ll]ist(?:\\(\\))?[!?]?)\\.ngControl\\b',
            message:
                '`KbqTagInput.ngControl` was removed. Read the control you bound to the input with ' +
                '`[formControl]`/`[ngModel]` directly; validation belongs to the `<kbq-tag-list>` control.'
        },
        {
            anchor: TAG_INPUT_ANCHOR,
            pattern: '(?<!\\bthis)\\.triggerValidation\\s*\\(',
            message:
                '`KbqTagInput.triggerValidation()` was removed: it was a no-op. Delete the call; the ' +
                '`<kbq-tag-list>` control revalidates itself whenever its value changes.'
        },
        {
            anchor: '\\bextends\\s+KbqTagInput\\b',
            pattern: '\\b(?:ngControl|triggerValidation)\\b',
            message:
                '`KbqTagInput` no longer declares `ngControl` and `triggerValidation()`. A subclass that reads ' +
                'or overrides them injects `NgControl` itself or drops the override.'
        }
    ]
};

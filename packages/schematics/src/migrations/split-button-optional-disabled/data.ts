/**
 * Data for the `split-button-optional-disabled` migration.
 *
 * `KbqSplitButton.disabled` was declared `boolean` over a field with no initializer, so an unbound
 * control reported `undefined` through a non-nullable type: `const flag: boolean = sb.disabled` held
 * `undefined`, and `if (sb.disabled === false)` never ran for a control nobody had disabled. The
 * getter now reports `boolean | undefined`, matching the sibling `KbqButtonGroupRoot`, so those call
 * sites finally fail to compile instead of lying at runtime.
 *
 * The content query moved from `QueryList<KbqButton>` to a signal query in the same review. It is
 * `protected`, so only a subclass can see it.
 *
 * Warn-only. Narrowing `boolean | undefined` back to `boolean` is a decision — `?? false`, a
 * non-null assertion, or handling the third state — and which one is right depends on what the call
 * site does with it.
 */

/** Import specifier that marks a file as a split-button consumer. */
export const SPLIT_BUTTON_PACKAGE = '@koobiq/components/split-button';

/** Identifier shape that marks a consumer without an import (e.g. a re-export or a subclass). */
export const SPLIT_BUTTON_TYPE = '\\bKbqSplitButton\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

const SUBCLASS_ANCHOR = 'extends\\s+KbqSplitButton\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: SPLIT_BUTTON_TYPE,
        pattern: '\\.\\s*disabled\\b',
        message:
            'KbqSplitButton.disabled reports `boolean | undefined` instead of `boolean`. The backing field has ' +
            'no initializer, so a control with no [disabled] binding always returned `undefined` behind a ' +
            'non-nullable type — an assignment to a `boolean` held `undefined`, and `=== false` never matched. ' +
            'Decide per call site: `?? false` for the common reading, or handle the unset state explicitly.'
    },
    {
        anchor: SUBCLASS_ANCHOR,
        pattern:
            '\\bbuttons\\s*\\.\\s*(?:changes|first|last|toArray|notifyOnChanges|reset|length|forEach|map|filter)\\b',
        message:
            'KbqSplitButton.buttons is a signal query — `Signal<readonly KbqButton[]>` instead of ' +
            '`QueryList<KbqButton>`. Read it as `buttons()` and use array methods on the result; ' +
            '`buttons.changes` is gone, and `buttons.length` is the arity of the signal function, not the ' +
            'number of buttons.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  A <kbq-split-button> with no projected button no longer throws outside dev mode: the guard is ' +
        'behind isDevMode(), so production renders an empty control instead of aborting the change ' +
        'detection pass of whoever rendered it. A host that relied on the throw as a runtime assertion ' +
        'needs its own check.'
];

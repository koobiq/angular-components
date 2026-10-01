/**
 * Data for the `clamped-text-disclosure` migration.
 *
 * The clamped-text review moved the disclosure semantics onto the control that is actually
 * operated and tightened the surface around the measurement:
 *
 * - `aria-expanded` is no longer rendered on the `<kbq-clamped-text>` host or on the
 *   `[kbqClampedList]` container. Both are role-less wrappers; `KbqClampedListTrigger` publishes
 *   `role`, `tabindex`, `aria-expanded` and `aria-controls` on itself now.
 * - `KbqClampedListTrigger` no longer puts `kbq-clamped-text__toggle` on its host, so a
 *   `kbqClampedList` trigger no longer inherits the clamped-text margin — which only applied when
 *   an unrelated `kbq-clamped-text` happened to be on the page.
 * - `KbqClampedText.isCollapsed` is a `model()`. `isCollapsedChange` reports user intent only: it
 *   no longer fires for the component's first measurement nor echoes a value the parent wrote.
 * - `KbqClampedText.hasToggle` is read-only, and `text` / `textContainer` are `protected`.
 * - Collapsing scrolls with `{ block: 'nearest', inline: 'nearest' }` and can be turned off with
 *   `[scrollOnCollapse]="false"`.
 *
 * Warn-only. Where `aria-expanded` has to be read from, what replaces a removed class and whether
 * an `isCollapsedChange` handler wanted the initial value are all decisions an automatic rewrite cannot make.
 */

/** Import specifier that marks a file as a clamped-text consumer. */
export const CLAMPED_TEXT_PACKAGE = '@koobiq/components/clamped-text';

/** Identifier, element, attribute and class shapes that mark a consumer without an import. */
export const CLAMPED_TEXT_TYPE = '\\bKbqClamped\\w*\\b|\\bkbq-clamped-\\w+|\\bkbqClampedList\\w*\\b';

/** Files that render one of the two containers, as opposed to naming any symbol of the package. */
const CLAMPED_CONTAINER = '\\bKbqClampedText\\b|\\bkbq-clamped-text\\b|\\bkbqClampedList\\b|\\bKbqClampedList\\b';

/** Files that place the trigger themselves. */
const CLAMPED_TRIGGER = '\\bkbqClampedListTrigger\\b|\\bKbqClampedListTrigger\\b';

/** Files that render the clamped text, whose two-way channel changed semantics. */
const CLAMPED_TEXT_ONLY = '\\bKbqClampedText\\b|\\bkbq-clamped-text\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: CLAMPED_CONTAINER,
        pattern: '\\baria-expanded\\b',
        message:
            'aria-expanded is no longer rendered on the <kbq-clamped-text> host or on the [kbqClampedList] ' +
            'container — both are role-less wrappers, where the attribute conveyed nothing. The trigger ' +
            'publishes it now, together with role="button", tabindex and aria-controls. A selector or ' +
            'assertion that reads the state off the container has to read it off the ' +
            '[kbqClampedListTrigger] element instead.'
    },
    {
        anchor: CLAMPED_TEXT_TYPE,
        pattern: '\\bkbq-clamped-text__toggle\\b',
        message:
            'KbqClampedListTrigger no longer carries the kbq-clamped-text__toggle class: the margin it ' +
            'brought came from the clamped-text stylesheet and only applied when a kbq-clamped-text ' +
            'happened to be rendered somewhere on the page. A kbqClampedList trigger now has no spacing ' +
            'of its own — lay it out with the list, and drop any margin-top override written against it. ' +
            'The clamped-text toggle keeps the class and is adjustable through ' +
            '--kbq-clamped-text-size-toggle-margin.'
    },
    {
        anchor: CLAMPED_TRIGGER,
        pattern: '\\brole\\s*=\\s*["\'`]button["\'`]',
        message:
            'kbqClampedListTrigger supplies role="button" and tabindex="0" itself. A hand-written role on ' +
            'the trigger element is now a duplicate; remove it unless you deliberately want a different ' +
            'role, which still wins over the directive default.'
    },
    {
        anchor: CLAMPED_TEXT_ONLY,
        pattern: '\\bisCollapsedChange\\b',
        message:
            'KbqClampedText.isCollapsed is a model() and isCollapsedChange reports user intent only: it no ' +
            "longer fires for the component's own first measurement, and no longer echoes a value the " +
            'parent wrote into [isCollapsed]. A handler that relied on the mount-time emission to learn ' +
            'the initial state has to read it from [(isCollapsed)] instead.'
    },
    {
        anchor: CLAMPED_TEXT_ONLY,
        pattern: '\\.\\s*hasToggle\\s*\\.\\s*(?:set|update)\\s*\\(',
        message:
            'KbqClampedText.hasToggle is a read-only Signal now, matching the KbqClamped contract. It is ' +
            'written by the measurement; setting it from outside desynchronized the component from its ' +
            'own layout.'
    },
    {
        anchor: CLAMPED_TEXT_ONLY,
        pattern: '\\.\\s*(?:textContainer|text)\\s*\\(\\s*\\)\\s*\\.\\s*nativeElement',
        message:
            'KbqClampedText.text and KbqClampedText.textContainer are protected: they were view queries ' +
            "into the component's own DOM. Query the rendered element from the host template instead."
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Collapsing scrolls with { block: "nearest", inline: "nearest" } instead of centering on both ' +
        'axes, so it no longer pans an ancestor horizontally, and [scrollOnCollapse]="false" turns it ' +
        'off entirely.',
    '  Space and Enter on the trigger call preventDefault(): Space no longer scrolls the page while ' +
        'expanding, and a native <button> host no longer toggles twice from the synthetic click.',
    '  rows takes a string attribute now (numberAttribute), so rows="3" compiles under strictTemplates ' +
        'the way debounceTime="300" already did.',
    '  [debounceTime] is re-read on every resize instead of once at ngAfterViewInit, so a bound value ' +
        'that changes now applies.',
    '  Nothing renders before the first measurement any more: the toggle appears once the content is ' +
        'known to overflow, and the text is clamped until then rather than flashing in full.'
];

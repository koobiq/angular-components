/**
 * Data for the `popover-leave-delay` migration.
 *
 * The popover review fixed a dead `this.leaveDelay ?? 500` — the base sets the field to `0`,
 * so `0 ?? 500` is `0` and hover mode closed the panel before the pointer could cross the 8px gap to
 * it. The delay is now derived from the trigger, and `kbqLeaveDelay` became a write-only input that
 * records having been bound:
 *
 * - bound in the template → the bound value stands;
 * - not bound → the `trigger` setter re-derives the delay on every change, so a popover switched to
 *   `hover` later gets the hover default instead of the `0` it was born with.
 *
 * A programmatic `trigger.leaveDelay = 500` does not record anything, so the next write to `trigger`
 * overwrites it. That is the one change here with no compile error behind it.
 *
 * Warn-only. Whether a call site should move to the `kbqLeaveDelay` binding or drop its assignment
 * (the hover default is now correct on its own) depends on why it was written.
 */

/** Import specifier that marks a file as a popover consumer. */
export const POPOVER_PACKAGE = '@koobiq/components/popover';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const POPOVER_TYPE = '\\bKbqPopover\\w*\\b|\\bkbqPopover\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: POPOVER_TYPE,
        pattern: '\\.\\s*leaveDelay\\s*=(?!=)',
        message:
            'Assigning KbqPopoverTrigger.leaveDelay no longer sticks. The delay is re-derived from `trigger` ' +
            'on every change unless the `kbqLeaveDelay` input was bound, and a programmatic write does not ' +
            'record that — the next write to `trigger` overwrites it. Bind [kbqLeaveDelay] instead, or drop ' +
            'the assignment: hover mode now defaults to a delay long enough to reach the panel, which the ' +
            'dead `?? 500` never produced.'
    },
    {
        anchor: POPOVER_TYPE,
        pattern: '\\.\\s*onConfirm\\s*=(?!=)',
        message: 'KbqPopoverConfirmComponent.onConfirm is readonly. Subscribe to it instead of replacing it.'
    },
    {
        anchor: POPOVER_TYPE,
        pattern: '\\bplacementChange\\b',
        message:
            'kbqPopoverPlacementChange emits KbqPopUpPlacementValues instead of string. A handler declared ' +
            '`(p: string)` no longer matches; widen it to the union.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The confirm popover no longer hardcodes its Russian defaults: «Вы уверены, что хотите ' +
        'продолжить?» / «Да» now come from the locale, so a non-RU application renders translated text ' +
        'where it used to render Russian. Override them through the popover-confirm locale section.',
    '  The trigger subscribed to the global ScrollDispatcher with no teardown in the default ' +
        'configuration; that subscription is now bounded, so a host that worked around the leak by ' +
        'destroying triggers eagerly can stop.',
    '  KbqPopoverTrigger can be imported standalone — the scroll-strategy provider is no longer ' + 'NgModule-only.'
];

/**
 * Data for the `time-range-forms-contract` migration.
 *
 * The time-range review made the component tell Angular's forms layer the truth about itself, and
 * turned the published form-field adapter from a set of declarations into a real implementation:
 *
 * - The end of a custom range was assembled from the *time* control instead of the *date* control,
 *   so every range a user drew ended on whatever day the timepicker happened to hold.
 * - `setDisabledState` is implemented on both `KbqTimeRange` and `KbqTimeRangeEditor`; a disabled
 *   control is inert instead of merely having its value discarded.
 * - `onTouched` is called when the popover closes, so `ErrorStateMatcher` finally sees `touched`.
 * - `valueCorrected` compares the outcome instead of the shape of the input, so it no longer fires
 *   for values it did not correct.
 * - `KbqTimeRangeTitleAsControl` derives `value`, `empty`, `required`, `disabled` and `errorState`
 *   from the host and the bound control, emits `stateChanges`, and generates its own `id`.
 * - `KbqTimeRangeEditor.timepickerList` is gone with the subscription that wrote `errorState` onto
 *   the first timepicker by hand; both fields route through `ErrorStateMatcher` now.
 *
 * Warn-only. What replaces a write to a member that became a getter is a binding on the host or
 * nothing at all, and neither can be derived from the assignment.
 */

/** Import specifier that marks a file as a time-range consumer. */
export const TIME_RANGE_PACKAGE = '@koobiq/components/time-range';

/** Identifier and element shapes that mark a consumer without an import. */
export const TIME_RANGE_TYPE = '\\bKbqTimeRange\\w*\\b|\\bkbq-time-range\\b';

/** The form-field adapter, whose members stopped being plain fields. */
export const TITLE_AS_CONTROL_TYPE = '\\bKbqTimeRangeTitleAsControl\\b|\\bkbq-time-range-title-as-control\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TIME_RANGE_TYPE,
        pattern: '\\.\\s*timepickerList\\b',
        message:
            'KbqTimeRangeEditor.timepickerList was removed together with the statusChanges subscription ' +
            'that wrote errorState onto the first timepicker by hand. It only ever marked the `from` ' +
            'field, leaving the `to` field - the one an inverted range usually needs - looking valid. ' +
            'Both pairs take their error state from ErrorStateMatcher now; provide your own matcher ' +
            'through the ErrorStateMatcher token if you need different timing.'
    },
    {
        anchor: TITLE_AS_CONTROL_TYPE,
        pattern:
            '\\.\\s*(?:errorState|empty|required|disabled|id|placeholder|value|controlType|stateChanges)\\s*=(?!=)',
        message:
            'KbqTimeRangeTitleAsControl no longer takes assignments to value, empty, required, disabled, ' +
            'errorState, id, placeholder, controlType or stateChanges. They were declared and never ' +
            'written, so a form field around the control rendered once against undefined state; they are ' +
            'derived from the host and the bound NgControl now, and the control emits stateChanges when ' +
            'any of them moves. Drive them through the form control instead - a write throws.'
    },
    {
        anchor: TIME_RANGE_TYPE,
        pattern: '\\bvalueCorrected\\b',
        message:
            'valueCorrected now fires only when the correction produced a different range. It used to ' +
            'fire on every write of a value with no startDateTime, which the allTime preset legitimately ' +
            'produces - a host that wrote the payload back looped on it. A handler that counted emissions ' +
            'or relied on one arriving for allTime sees fewer of them.'
    },
    {
        anchor: TIME_RANGE_TYPE,
        pattern: '\\bkbq-time-range-editor__(?:range|container)\\b',
        message:
            'The editor markup changed: the from/to block is a sibling of the radiogroup rather than a ' +
            'child of it, because a role="radiogroup" must not own two datepickers and two timepickers. ' +
            '.kbq-time-range-editor__container is the flex column that holds both, the range radio ' +
            'carries .kbq-time-range-editor__range-option, and .kbq-time-range-editor__range holds only ' +
            'the two date/time rows. A selector that descends from the radiogroup no longer matches.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The end of a custom range is built from the `to` date control instead of the `to` time control. ' +
        'Ranges emitted before this fix ended on whatever calendar day the timepicker held - today, or ' +
        'the day of the previously applied value - rather than the day the user picked. Persisted ' +
        'ranges may need correcting; the form validated the range the user saw while the component ' +
        'emitted a different one, so an inverted range could pass validation and a valid one fail it.',
    '  setDisabledState is implemented on KbqTimeRange and KbqTimeRangeEditor. A disabled control drops ' +
        'the trigger out of the tab order, refuses to open the popover and takes a kbq-disabled host ' +
        'class; it used to look and behave enabled while Angular silently discarded the value.',
    '  onTouched is called when the popover closes, so the control becomes `touched` after the first ' +
        'interaction. Every ErrorStateMatcher in the library keys error display off that, so a required ' +
        'time range that never showed its message now shows it at the right moment.',
    '  The popover footer no longer wraps Apply and Cancel in an unnamed role="group", and the from/to ' +
        'prefixes carry an id that the four inputs point at with aria-labelledby instead of an inert ' +
        'aria-label on a bare <span>.'
];

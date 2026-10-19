/**
 * Data for the time-range migration.
 *
 * Two changes to the same component land in the same release and ship as one schematic:
 *
 * - The `title` of `kbq-time-range` used to prepend `title.for` ("за" / "for") to the selected period.
 *   The period stands alone now ("последний час" / "Last hour") and the duration templates of each
 *   locale carry whatever word it needs, so the key was removed.
 * - The component was made to tell Angular's forms layer the truth about itself: the end of a custom
 *   range was assembled from the *time* control instead of the *date* control, `setDisabledState` was
 *   implemented on both `KbqTimeRange` and `KbqTimeRangeEditor`, `onTouched` is called when the popover
 *   closes, `valueCorrected` compares the outcome instead of the shape of the input, the from/to block
 *   moved out of the radiogroup, and `KbqTimeRangeTitleAsControl` became a real `KbqFormFieldControl`
 *   instead of a set of declarations nothing ever assigned.
 *
 * Only the `for` removal has a mechanical translation. Everything else is reported: what replaces a
 * write to a member that became a read-only signal is a binding on the host, or nothing at all, and
 * neither can be derived from the assignment.
 */

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor?: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

/** The key removed from the `title` section of the time-range locale configuration. */
export const REMOVED_KEY = 'for';

/** The section that held the removed key. */
export const TITLE_KEY = 'title';

/** The time-range section of the locale data (`addLocale()`, `KBQ_LOCALE_DATA`, `[localeOverrides]`). */
export const TIME_RANGE_KEY = 'timeRange';

/** The provider whose argument is a time-range locale configuration. */
export const PROVIDER_NAME = 'kbqTimeRangeLocaleConfigurationProvider';

/** Siblings of `title` that only a time-range locale configuration has. */
export const SIBLING_KEYS = ['editor', 'durationTemplate'];

/** Import specifier that marks a file as a time-range consumer. */
export const TIME_RANGE_PACKAGE = '@koobiq/components/time-range';

/** Identifier and element shapes that mark a consumer without an import. */
export const TIME_RANGE_TYPE = '\\bKbqTimeRange\\w*\\b|\\bkbq-time-range\\b';

/** The form-field adapter, whose members became read-only signals. */
export const TITLE_AS_CONTROL_TYPE = '\\bKbqTimeRangeTitleAsControl\\b|\\bkbq-time-range-title-as-control\\b';

/**
 * Cheap pre-check gating the AST parse: a `for` member of an object literal (`for:` or `'for':`). A
 * preceding word character or dot rules out longer identifiers and property reads, which are warn-only.
 */
export const FOR_MEMBER_PATTERN = /(?:^|[^.\w$])(['"]?)for\1\s*:/;

/** Whether a file is a time-range consumer at all, by import or by name. */
export const referencesTimeRange = (content: string): boolean =>
    content.includes(TIME_RANGE_PACKAGE) || new RegExp(TIME_RANGE_TYPE).test(content);

/**
 * Warnings for `.ts`, `.html`, `.scss` and `.css` files, inline templates included. Checked against the
 * post-fix content, so the `for` ones only fire on what the fix left behind. An anchored pattern names a
 * member of the component, so the file has to be a consumer before a match means anything.
 */
export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\btitle\\.for\\b',
        message:
            'The `for` key was removed from the title section of the time-range locale configuration: the ' +
            'title shows the period alone. Drop this read. Manual migration required.'
    },
    {
        pattern: '\\btitle\\s*:\\s*\\{[^{}]*\\bfor\\s*:',
        message:
            'A `for` key in a `title` section the fix did not rewrite: a time-range locale override it could not ' +
            'recognise, or one bound in a template. Remove the key, or ignore this if the object is not a ' +
            'time-range locale override.'
    },
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
        // `control().stateChanges` read off a form field is reported by `form-field-signals`.
        pattern:
            '\\.\\s*(?:errorState|empty|required|disabled|focused|id|placeholder|value|controlType)\\s*=(?!=)|' +
            '(?<!control\\(\\)\\??)\\.\\s*stateChanges\\b',
        message:
            'A write to a member of a KbqTimeRangeTitleAsControl, or a read of its stateChanges - ignore this ' +
            'if the receiver is another object, the anchor is the file, not the expression: value, id, ' +
            'placeholder, focused, empty, required, disabled and errorState are no longer assignable, and ' +
            'stateChanges was removed. They were declared and never written, so a form field around the ' +
            'control rendered once against undefined state; they are read-only signals derived from the host ' +
            'and the bound NgControl now, and controlType is readonly. Drive them through the form control ' +
            'instead of assigning them, read them with a call - errorState() - and read the signals in a ' +
            'computed() or an effect() where you subscribed to stateChanges.'
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
        pattern: '\\bkbq-time-range-editor__(?:range|container)(?![\\w-])',
        message:
            'The editor markup changed: the from/to block is a sibling of the radiogroup rather than a ' +
            'child of it, because a role="radiogroup" must not own two datepickers and two timepickers. ' +
            '.kbq-time-range-editor__container is the flex column that holds both, the range radio ' +
            'carries .kbq-time-range-editor__range-option, and .kbq-time-range-editor__range holds only ' +
            'the two date/time rows. A selector that descends from the radiogroup no longer matches.'
    }
];

/** Behaviour note printed once per run — the parts no call site can point at. */
export const BEHAVIOUR_NOTE = [
    'Time-range title behaviour changed:',
    '  - The title no longer prepends `title.for` to the selected period: it reads "последний час" /',
    '    "Last hour" rather than "за последний час" / "for last hour". A custom title template receives',
    '    the period alone in `formattedDate`.',
    '  - If you prefixed a word through `title.for`, move it into your `durationTemplate.title` overrides.',
    '',
    'Time-range forms contract changed:',
    '  - The end of a custom range is built from the `to` date control instead of the `to` time control.',
    '    Ranges emitted before this fix ended on whatever calendar day the timepicker held - today, or the',
    '    day of the previously applied value - rather than the day the user picked. Persisted ranges may',
    '    need correcting; the form validated the range the user saw while the component emitted a different',
    '    one, so an inverted range could pass validation and a valid one fail it.',
    '  - setDisabledState is implemented on KbqTimeRange and KbqTimeRangeEditor. A disabled control drops',
    '    the trigger out of the tab order, refuses to open the popover and takes a kbq-disabled host class;',
    '    it used to look and behave enabled while Angular silently discarded the value.',
    '  - onTouched is called when the popover closes, so the control becomes `touched` after the first',
    '    interaction. Every ErrorStateMatcher in the library keys error display off that, so a required',
    '    time range that never showed its message now shows it at the right moment.',
    '  - The popover footer no longer wraps Apply and Cancel in an unnamed role="group", and the from/to',
    '    prefixes carry an id that the four inputs point at with aria-labelledby instead of an inert',
    '    aria-label on a bare <span>.'
];

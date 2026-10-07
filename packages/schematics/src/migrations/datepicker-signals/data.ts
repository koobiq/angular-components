/**
 * Data for the `datepicker-signals` migration.
 *
 * The decorator inputs of the datepicker, its input, toggle and calendar are signal inputs named `<member>Input` now,
 * handed to the unchanged member from `ngOnChanges`. Reads and writes of the members are unchanged; a subclass and a
 * hand-made `SimpleChanges` are not. Warn-only.
 */

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor: string;
    pattern: string;
    message: string;
}

const CLASSES = [
    'KbqDatepicker',
    'KbqDatepickerInput',
    'KbqDatepickerToggleIconComponent',
    'KbqCalendar',
    'KbqCalendarHeader',
    'KbqMonthView'
].join('|');

export const warnPatterns: WarnPattern[] = [
    {
        anchor: `\\bextends\\s+(?:${CLASSES})\\b`,
        pattern: `\\bextends\\s+(?:${CLASSES})\\b`,
        message:
            'A subclass of a Koobiq datepicker class whose inputs became signal inputs. The bound value reaches the ' +
            'member from ngOnChanges now, which KbqDatepicker, KbqDatepickerInput, KbqCalendarHeader and KbqMonthView ' +
            'declare for the first time: an ngOnChanges of the subclass is marked override and calls ' +
            'super.ngOnChanges(changes). An input the subclass redeclared with @Input() is overridden through the ' +
            '`<member>Input` signal input instead, e.g. ' +
            "`override readonly minInput = input<Date | null | undefined>(undefined, { alias: 'min' })`."
    },
    {
        anchor: `\\b(?:${CLASSES})\\b`,
        pattern: '(?<!\\bsuper)\\.ngOnChanges\\s*\\(',
        message:
            'A direct call of ngOnChanges in a file that uses a Koobiq datepicker class. The SimpleChanges of ' +
            'KbqDatepicker, KbqDatepickerInput, KbqDatepickerToggleIconComponent, KbqCalendar, KbqCalendarHeader and ' +
            'KbqMonthView are keyed by the `<member>Input` names now (minDateInput, not minDate), and a bound value ' +
            'reaches its member only through them: set the input with a template binding or ComponentRef.setInput ' +
            'instead. This pattern also matches ngOnChanges of an unrelated class in the same file — check before ' +
            'changing it.'
    }
];

export const SUMMARY = [
    'Reads and writes of the datepicker members are unchanged. A boolean input (hasBackdrop, disabled, opened)',
    'accepts boolean | string | null | undefined in a template now.'
];

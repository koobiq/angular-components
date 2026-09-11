/**
 * Data for the `textarea-signals` migration.
 *
 * `KbqTextarea` implements `KbqFormFieldControl`, which declares `value`, `id`, `placeholder`,
 * `required`, `disabled`, `focused`, `empty` and `errorState` as plain members — so those stay plain
 * accessors. What moved are the inputs that belong to the textarea itself.
 *
 * - `textarea.canGrow` → a signal whose value changed: the getter folded in the row limit (warn)
 * - `textarea.freeRowsHeight` → a signal whose value changed: the textarea used to write the measured
 *   line height into it on init, so an unbound read came back with a number (warn)
 * - `textarea.maxRows` / `maxRowLimitReached` → calls (value unchanged — auto-fixed)
 * - `textarea.grow` → a prototype method instead of a bound arrow property (warn)
 */

/** Members whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['maxRows', 'maxRowLimitReached'];

/** TypeScript type annotation that marks a receiver as a textarea. */
export const TEXTAREA_TYPE = 'KbqTextarea';

/** `exportAs` a template reference variable has to carry to point at the textarea. */
export const TEXTAREA_EXPORT_AS = 'kbqTextarea';

/** Signal-API methods reachable on a signal; a read followed by one is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** Reported for a value-changed member read through a template reference, which is not auto-fixed. */
export const templateManualMessage = (members: Iterable<string>): string =>
    `Read through a template reference variable and left untouched, because the value changed as well ` +
    `as the shape: ${[...members].join(', ')}. Migrate those bindings by hand.`;

/** Reported when a template names the textarea but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template names `kbqTextarea` but could not be parsed, so it was left untouched. Migrate reads ' +
    'through its template reference variables by hand.';

/** Import specifier that marks a file as a textarea consumer. */
export const TEXTAREA_PACKAGE = '@koobiq/components/textarea';

/**
 * Read-only `InputSignal`s whose value also changed, so a mechanical `()` append would compile and hand
 * back something else.
 *
 * `canGrow`: the getter used to return `!maxRowLimitReached && bound`, so it reported `false` once the
 * textarea hit `maxRows` even though the consumer had asked for growth. It reports what was bound now.
 *
 * `freeRowsHeight`: `ngOnInit` used to assign the measured line height into the input, so an unbound
 * textarea read back a number once the first microtask had run. The fallback is a private computed now
 * and the input stays `undefined`, which turns `gap + 'px'` at a call site into `"undefined" + "px"` with no
 * diagnostic.
 */
export const VALUE_CHANGED_MEMBERS: readonly string[] = ['canGrow', 'freeRowsHeight'];

/**
 * Reported for a read of a member that still compiles after a mechanical `()` append but hands back a
 * different value than it did before.
 */
export const valueChangedMessage = (members: Iterable<string>): string => {
    const names = [...members];
    const lines = [
        `${names.join(' and ')} ${names.length > 1 ? 'are' : 'is a'} read-only InputSignal` +
            `${names.length > 1 ? 's' : ''} whose value also changed, so appending \`()\` compiles and ` +
            'hands back something else. Migrate by hand.'
    ];

    if (names.includes('canGrow')) {
        lines.push(
            '`canGrow` used to return `!maxRowLimitReached && bound`, so it reported false once the ' +
                'textarea hit `maxRows` even though the consumer had asked for growth; it reports what ' +
                'was bound now.'
        );
    }

    if (names.includes('freeRowsHeight')) {
        lines.push(
            '`freeRowsHeight` used to be assigned the measured line height in `ngOnInit`, so an unbound ' +
                'textarea read back a number; the fallback is internal now and the input stays ' +
                '`undefined`, which turns `gap + "px"` into `"undefined" + "px"` with no diagnostic.'
        );
    }

    return lines.join(' ');
};

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const TEXTAREA_ANCHOR = '\\bKbqTextarea\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TEXTAREA_ANCHOR,
        pattern: '\\.\\s*(?:freeRowsHeight|maxRows|canGrow)\\s*=[^=]',
        message:
            'KbqTextarea.canGrow, maxRows and freeRowsHeight are read-only signal inputs now, so a ' +
            'programmatic write no longer compiles. Bind them in the template instead. `freeRowsHeight` in ' +
            'particular used to be written by the textarea itself on init, which is why the automated ' +
            'migration skipped it.'
    },
    {
        anchor: TEXTAREA_ANCHOR,
        pattern: '\\.\\s*grow\\b(?!\\s*\\()',
        message:
            'KbqTextarea.grow is a prototype method now, not a bound arrow property, so a detached ' +
            'reference loses `this`: `setTimeout(textarea.grow, 0)` and ' +
            '`el.addEventListener("input", textarea.grow)` throw at the first property read. Call it ' +
            'through the instance - `() => textarea.grow()` - or bind it.'
    },
    {
        anchor: TEXTAREA_ANCHOR,
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqTextarea\\b',
        message:
            'A KbqTextarea view/content query returns the directive instance, whose `maxRows` and ' +
            '`maxRowLimitReached` are now signals — reading one is a double call, e.g. ' +
            '`this.textarea().maxRows()`. Verify query reads manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `maxRows` and `freeRowsHeight` report `number | undefined` instead of `number`. Both were declared ' +
        'non-nullable while an unbound textarea held `undefined`, and `maxRowLimitReached` compared against ' +
        'it — `rowsCount > undefined` is false, which is why unlimited growth worked at all.',
    '  `freeRowsHeight` no longer writes itself. It defaulted to the measured line height by assigning its ' +
        'own input in `ngOnInit`; the fallback is a computed now, so binding it later actually takes effect ' +
        'instead of being overwritten on the next init.',
    '  The `kbq-textarea_max-row-limit-reached` class follows the row count directly. It is derived from a ' +
        'signal written inside `runOutsideAngular`, so the class used to wait for an unrelated change ' +
        'detection pass to appear.',
    '  Generated ids come from the CDK `_IdGenerator` instead of a module-level counter. The shape is ' +
        'unchanged for a default `APP_ID`: the CDK omits the app id when it is `ng`, and the per-prefix ' +
        'counter still starts at 0, so a real app keeps getting `kbq-textarea-0`. Only an app that sets ' +
        '`APP_ID` explicitly sees it in the id, and the counter is shared per prefix rather than per module.'
];

/**
 * Data for the `timepicker-signals` migration.
 *
 * `KbqTimepicker` implements `KbqFormFieldControl`, which declares `value`, `id`, `placeholder`,
 * `required`, `disabled`, `focused`, `empty` and `errorState` as plain members — so those stay plain
 * accessors. The four inputs the timepicker owns are signals now.
 *
 * - `timepicker.format` → `timepicker.format()` (value unchanged — auto-fixed)
 * - `timepicker.min` / `max` → signals whose value changed: the getters returned the parsed date (reported)
 * - `kbqValidationTooltip` → a read-only input driven by an effect (writes reported)
 */

/** One class whose members moved, and how its instances are reached. */
export interface MigrationTarget {
    /** Exported class name, as it appears in a type annotation or an `inject()` / query argument. */
    type: string;
    /** Members whose value is unchanged; a read must become a call. Auto-fixed. */
    signalMembers: readonly string[];
    /**
     * Members whose read must become a call too, but whose value changed, so the rewrite is left to a human
     * and each read is reported instead.
     */
    reportedMembers: readonly string[];
    /** Members that are read-only now, so every write is reported rather than rewritten. */
    readOnlyMembers: readonly string[];
    /** `exportAs` names a template reference variable can bind the instance by. */
    exportAs: readonly string[];
    /**
     * Element and attribute selectors of a component, where a bare `#ref` holds the instance. Empty for a
     * directive on a native element, where a bare `#ref` is the element itself.
     */
    elements: readonly string[];
    /** Reported for a write to one of `readOnlyMembers`. */
    writeAdvice: string;
}

export const TARGETS: readonly MigrationTarget[] = [
    {
        type: 'KbqTimepicker',
        signalMembers: ['format'],
        reportedMembers: ['min', 'max'],
        readOnlyMembers: ['format', 'min', 'max', 'kbqValidationTooltip'],
        exportAs: ['kbqTimepicker'],
        elements: [],
        writeAdvice: 'Bind `[format]`, `[min]`, `[max]` and `[kbqValidationTooltip]` in the template instead.'
    }
];

/** Methods on a signal, whose presence after the member means the read is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** Import specifier that marks a file as a timepicker consumer. */
export const TIMEPICKER_PACKAGE = '@koobiq/components/timepicker';

/** Reported for writes to members that are read-only now, whatever form the write takes. */
export const writeMessage = (type: string, members: Iterable<string>, advice: string): string =>
    `These ${type} members are read-only signals now, so these writes no longer compile: ` +
    `${[...members].join(', ')}. That covers compound assignments (\`??=\`, \`+=\`), increments, \`delete\` ` +
    `and destructuring targets as well as a plain \`=\`. ${advice}`;

/** Reported for reads of `min` / `max`, which have to become calls and changed what they return. */
export const reportedMessage = (members: Iterable<string>): string =>
    `These KbqTimepicker reads were left untouched: ${[...members].join(', ')}. Add \`()\` - a read ` +
    'without the call is the signal itself, a function, so `if (timepicker.min)` always passes - and ' +
    'expect the value that was bound rather than the parsed date: the getters returned ' +
    '`getValidDateOrNull(dateAdapter.deserialize(bound))`, so an unparseable bound value used to read as ' +
    '`null` and reads as itself now.';

/**
 * Reported for a read through a signal query, which is a signal holding the instance: the read needs two
 * calls rather than one. Emitted from the AST pass rather than a regex, so a `@ViewChild` field - which holds
 * the instance itself - is never mistaken for one.
 */
export const signalQueryMessage = (member: string, required: boolean): string =>
    `A signal query holds the instance behind a call of its own, so reading \`${member}\` through it needs ` +
    `two calls: \`this.query()${required ? '' : '?'}.${member}()\`.` +
    (required ? '' : ' The query is optional, so keep the `?.`.') +
    ' Those reads are left untouched - migrate them by hand.';

/** Reported when a template references the timepicker but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template references the timepicker but could not be parsed, so it was left untouched. Migrate ' +
    'reads through its `#ref="kbqTimepicker"` reference variables by hand. If every template is reported ' +
    'this way, `@angular/compiler` could not be loaded from this install.';

/**
 * Reported when a file names `KbqTimepicker` in a type position the receiver pass cannot scope to a single
 * identifier - a union, an array, a `QueryList<…>`, a return type - or reads a member in a shape the access
 * pass cannot reach.
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqTimepicker is used here in a way this migration cannot resolve to a single receiver, so any signal ' +
    'read through it was left untouched. Check these lines by hand:';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  A re-bound `kbqValidationTooltip` no longer stacks subscriptions. The setter subscribed to ' +
        '`incorrectInput` every time it ran, so after several re-binds one rejected keystroke opened every ' +
        'tooltip ever bound. It is an effect with a teardown now, which also gives an unbound tooltip its own ' +
        'trigger and delay back.',
    '  A locale change reformats the rendered time even when the placeholder was set by the consumer. The ' +
        'effect used to return early on a consumer-provided placeholder, which skipped the reformat with ' +
        'it — the two are separate concerns now.',
    '  Generated ids come from the CDK `_IdGenerator` instead of a module-level counter. The shape is ' +
        'unchanged for a default `APP_ID`: the CDK omits the app id when it is `ng`, and the counter still ' +
        'starts at 0, so a real app keeps getting `kbq-timepicker-0`. Only an app that sets `APP_ID` ' +
        'explicitly sees it in the id, right before the counter and with no separator.'
];

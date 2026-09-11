/**
 * Data for the `checkbox-signals` migration.
 *
 * The one-way inputs became signals; `id` and `clickAction` are the two the automated migration skipped,
 * because application code writes to them.
 *
 * - `checkbox.id` / `clickAction` / `big` / `required` / `value` / `name` / `labelPosition` → calls (auto-fixed)
 * - the template plumbing (`inputId`, `inputElement`, `getAriaChecked`, the click handlers) → `protected` (warn)
 *
 * `checked`, `disabled`, `indeterminate` and `tabIndex` stay accessor inputs over the signals of the
 * `KbqCheckable` host directive: they are two-way state that the component and the `ControlValueAccessor`
 * both write, and a `model()` cannot carry the `booleanAttribute` / `numberAttribute` transform they need.
 * That is the shape the reviewed `KbqButtonToggle` settled on. Reads and writes of those four are unchanged.
 */

/** Members of `KbqCheckbox` whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = [
    'id',
    'clickAction',
    'big',
    'required',
    'value',
    'name',
    'labelPosition'
];

/** Signal-API methods reachable on a signal; a read followed by one is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** `exportAs` name a template reference has to carry to be the checkbox rather than some other directive. */
export const CHECKBOX_EXPORT_AS = 'kbqCheckbox';

/** TypeScript type annotation that marks a receiver as a checkbox. */
export const CHECKBOX_TYPE = 'KbqCheckbox';

/** Element selector whose template reference variables (`#ref`) point at a checkbox. */
export const CHECKBOX_ELEMENT = 'kbq-checkbox';

/** Import specifier that marks a file as a checkbox consumer. */
export const CHECKBOX_PACKAGE = '@koobiq/components/checkbox';

/** Members that moved out of the public surface and can no longer be reached from outside the component. */
export const PROTECTED_MEMBERS: readonly string[] = [
    'inputId',
    'inputElement',
    'getAriaChecked',
    'onInputClick',
    'onInteractionEvent',
    'onLabelTextChange'
];

/**
 * Reported for a programmatic write. Emitted from the AST pass rather than a regex: the old pattern was
 * anchored only on `KbqCheckbox` appearing somewhere in the file, so `el.id = 'x'` on an `HTMLElement`
 * warned, and a genuine write at the very end of a file did not.
 */
export const writeMessage = (members: Iterable<string>): string =>
    `These are read-only signal inputs now, so a programmatic write no longer compiles: ` +
    `${[...members].join(', ')}. Bind them in the template instead. Note that binding ` +
    '`[clickAction]="undefined"` explicitly overrides the KBQ_CHECKBOX_CLICK_ACTION token rather than ' +
    'falling back to it - leave the input unbound to use the token.';

/**
 * Reported for a read through a signal query, which is a signal holding the component: the read needs two
 * calls rather than one. Emitted from the AST pass, so the decorator form - which the rewrite handles
 * correctly on its own - is never told it needs two calls.
 *
 * `viewChild()` without `.required` is typed `Signal<KbqCheckbox | undefined>`, so the safe spelling
 * differs between the two forms.
 */
export const signalQueryMessage = (member: string, required: boolean): string =>
    `A signal query holds the component behind a call of its own, so reading \`${member}\` through it needs ` +
    `two calls: \`this.checkbox()${required ? '' : '?'}.${member}()\`.` +
    (required ? '' : ' The query is optional, so keep the `?.`.') +
    ' Those reads are left untouched - migrate them by hand.';

/** Reported when a template renders the checkbox but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template renders <kbq-checkbox> but could not be parsed, so it was left untouched. Migrate reads ' +
    'through its template reference variables by hand.';

/**
 * Reported when a file names `KbqCheckbox` in a type position the receiver pass cannot scope to a single
 * identifier - a union, an array, a `QueryList<…>`, a cast, a return type - or reads a member in a shape
 * the access pass cannot reach.
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqCheckbox is used here in a way this migration cannot resolve to a single receiver, so any signal ' +
    'read through it was left untouched. Check these lines by hand:';

/** Reported for the members that left the public surface, in both the TypeScript and the template pass. */
export const protectedMessage = (members: Iterable<string>): string =>
    `These KbqCheckbox members are \`protected\` now and can't be read from outside the component: ` +
    `${[...members].join(', ')}. They are the wiring between the label, the visually hidden native input ` +
    'and the click algorithm. Use `focus()` and `toggle()`, or drive the checkbox through its inputs.';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  Generated ids come from the CDK `_IdGenerator`. The shape is unchanged for a default `APP_ID` - the ' +
        'CDK omits the app id unless it was overridden - but the counter is 0-based and shared per prefix, ' +
        'so the first checkbox is `kbq-checkbox-0` where it used to be `kbq-checkbox-1`. An assertion on an ' +
        'exact id needs updating; one matching the shape does not.',
    '  `<kbq-checkbox [id]="null">` now falls back to the generated id on the host as well. It used to leave ' +
        'the host without an id while the hidden input still pointed its `for` at the generated one.',
    '  `checked`, `big` and `indeterminate` are `booleanAttribute` inputs, and `required` defaults to `false` ' +
        'instead of `undefined` behind a `boolean` type. `<kbq-checkbox checked>` used to pass the empty ' +
        'string, which is falsy, so the valueless attribute did nothing; it checks the box now. The same ' +
        'coercion runs on a bound value, so `[checked]="items.length"` with an empty list, `[checked]="0"` ' +
        'and `NaN` now read as true - and the template type is `unknown`, so a binding that used to be a ' +
        'compile error under strictTemplates is accepted and reads as true.',
    '  `value` reports `string | undefined` instead of `string`. It was declared non-nullable over an ' +
        '`undefined!` default, so an unbound checkbox always handed back `undefined`.',
    '  An enabled <kbq-checkbox> no longer carries `disabled="false"` on its host. The host binding ' +
        'rendered the boolean verbatim, so every enabled checkbox shipped the attribute — enough for a ' +
        'consumer stylesheet or test selector written as `kbq-checkbox[disabled]` to match all of them.'
];

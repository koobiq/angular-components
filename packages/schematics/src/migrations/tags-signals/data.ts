/**
 * Data for the `tags-signals` migration.
 *
 * `KbqTagList` implements `KbqFormFieldControl` and `KbqTagInput` implements `KbqTagTextControl`, both of
 * which declare their members as plain properties — so the members those interfaces name stay plain
 * accessors. So do the ones that fold in a parent or child: `KbqTag.disabled` reports the tag list's state
 * as well as its own, and a `model()` cannot carry the `booleanAttribute` transform a valueless attribute
 * needs. Those accessors are backed by signals now, so the host bindings that read them re-render on their
 * own; **their read and write syntax is unchanged**.
 *
 * What moved is the handful of inputs on `KbqTagInput` that answer to nobody else:
 *
 * - `tagInput.addOnBlur` → `tagInput.addOnBlur()` (value unchanged — auto-fixed)
 * - `tagInput.separators` → `tagInput.separators()` (value unchanged — auto-fixed)
 * - `tagInput.separatorKeyCodes = …` → a read-only input; it was write-only before (reported)
 */

/** Members whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['addOnBlur', 'separators'];

/**
 * Members a consumer could write before the upgrade and cannot now. Every one of them is a read-only
 * `input()` or `computed`, so no write has a mechanical translation - each is reported instead.
 */
export const READ_ONLY_MEMBERS: readonly string[] = ['addOnBlur', 'separators', 'separatorKeyCodes'];

/** Methods on a signal, whose presence after the member means the read is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** TypeScript type annotation that marks a receiver as a tag input. */
export const TAG_INPUT_TYPE = 'KbqTagInput';

/**
 * The `exportAs` names a template reference variable can bind the tag input by. A bare `#ref` on the native
 * `<input>` is the element itself, not the directive, so only these count.
 */
export const TAG_INPUT_EXPORT_AS: readonly string[] = ['kbqTagInput', 'kbqTagInputFor'];

/** Import specifier that marks a file as a tags consumer. */
export const TAGS_PACKAGE = '@koobiq/components/tags';

/** Reported for a write to a member that is read-only now, whatever form the write takes. */
export const writeMessage = (members: Iterable<string>): string =>
    `These KbqTagInput members are read-only signal inputs now, so these writes no longer compile: ` +
    `${[...members].join(', ')}. That covers compound assignments (\`||=\`, \`+=\`), increments, \`delete\` ` +
    'and destructuring targets as well as a plain `=`. Bind `[kbqTagInputAddOnBlur]` / ' +
    '`[kbqTagInputSeparatorKeyCodes]` instead. `separatorKeyCodes` was a setter with no getter, so in ' +
    'exchange it can finally be read.';

/**
 * Reported for a read through a signal query, which is a signal holding the directive: the read needs two
 * calls rather than one. Emitted from the AST pass rather than a regex, so a `@ViewChild` field - which
 * holds the instance itself - is never mistaken for one.
 */
export const signalQueryMessage = (member: string, required: boolean): string =>
    `A signal query holds the tag input behind a call of its own, so reading \`${member}\` through it ` +
    `needs two calls: \`this.tagInput()${required ? '' : '?'}.${member}()\`.` +
    (required ? '' : ' The query is optional, so keep the `?.`.') +
    ' Those reads are left untouched - migrate them by hand.';

/** Reported when a template names the tag input but cannot be parsed, so nothing in it was inspected. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template references the tag input but could not be parsed, so it was left untouched. Migrate ' +
    'reads through its `#ref="kbqTagInput"` reference variables by hand. If every template is reported ' +
    'this way, `@angular/compiler` could not be loaded from this install.';

/**
 * Reported when a file names `KbqTagInput` in a type position the receiver pass cannot scope to a single
 * identifier - a union, an array, a `QueryList<…>`, a return type - or reads a member in a shape the access
 * pass cannot reach.
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqTagInput is used here in a way this migration cannot resolve to a single receiver, so any signal ' +
    'read through it was left untouched. Check these lines by hand:';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `distinct` is a `booleanAttribute` input. A valueless `distinct` attribute used to pass the empty ' +
        'string, which is falsy, so duplicate tags were still accepted; it prevents them now.',
    '  Generated ids come from the CDK `_IdGenerator` instead of a module-level counter. The shape is ' +
        'unchanged for a default `APP_ID`: the CDK omits the app id when it is `ng`, and the counter still ' +
        'starts at 0, so a real app keeps getting `kbq-tag-list-0` and `kbq-tag-list-input-0`. Only an app ' +
        'that sets `APP_ID` explicitly sees it in the id, right before the counter and with no separator. ' +
        'The tag list reports the id of its input when it has one, so both surface through the form field.',
    '  Everything the interfaces name — `value`, `id`, `placeholder`, `required`, `disabled` on the tag ' +
        'list, and `disabled`, `selected`, `selectable`, `removable`, `editable`, `tabindex` on the tag — ' +
        'keeps its accessor shape and its exact read and write syntax. The backing fields are signals now, ' +
        'so anything that derives from them can be a computed, but nothing about when they are read changed.'
];

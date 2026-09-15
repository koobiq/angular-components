/**
 * Data for the `tags-signals` migration.
 *
 * What stays an accessor stays for a reason the code enforces, not for want of a transform - a backing input
 * carries `booleanAttribute`, and a `computed` or `linkedSignal` over it reads back as a signal:
 *
 * - `KbqTagList` implements `KbqFormFieldControl` and `KbqTagInput` implements `KbqTagTextControl`, which
 *   declare `value`, `id`, `placeholder`, `required` and `disabled` as plain properties;
 * - `KbqTag.disabled` is read by the focus key manager as a value, and a signal would always be truthy;
 * - `disabled`, `draggable` and `tabindex` fold in the tag list's form control, a plain property a `computed`
 *   would not see change; `KbqTag.value` falls back to the projected text content, which is DOM state.
 *
 * Everything else moved:
 *
 * - `KbqTagInput`: `addOnBlur` and `separators` read as calls; `separatorKeyCodes` and `tagList` are read-only
 * - `KbqTag`: `selected`, `editable`, `selectable` and `removable` read as calls and are read-only
 * - `KbqTagList`: `removable` reads as a call and is read-only
 */

/** One class whose members moved, and how its instances are reached. */
export interface MigrationTarget {
    /** Exported class name, as it appears in a type annotation or an `inject()` / query argument. */
    type: string;
    /** Members whose value is unchanged; a read must become a call. Auto-fixed. */
    signalMembers: readonly string[];
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
        type: 'KbqTagInput',
        signalMembers: ['addOnBlur', 'separators'],
        readOnlyMembers: ['addOnBlur', 'separators', 'separatorKeyCodes', 'tagList'],
        exportAs: ['kbqTagInput', 'kbqTagInputFor'],
        elements: [],
        writeAdvice:
            'Bind `[kbqTagInputAddOnBlur]`, `[kbqTagInputSeparatorKeyCodes]` and `[kbqTagInputFor]` instead. ' +
            '`separatorKeyCodes` and `tagList` were setters with no getter, so in exchange they can be read now.'
    },
    {
        type: 'KbqTag',
        signalMembers: ['selected', 'editable', 'selectable', 'removable'],
        readOnlyMembers: ['selected', 'editable', 'selectable', 'removable'],
        exportAs: ['kbqTag'],
        elements: ['kbq-tag', 'kbq-basic-tag'],
        writeAdvice:
            'Bind `[selected]`, `[editable]`, `[selectable]` and `[removable]` instead. To change the selection ' +
            'from code, call `select()`, `deselect()` or `toggleSelected()`: like the old `selected` setter, ' +
            'they emit `selectionChange`, which the tag list listens to.'
    },
    {
        type: 'KbqTagList',
        signalMembers: ['removable'],
        readOnlyMembers: ['removable'],
        exportAs: ['kbqTagList'],
        elements: ['kbq-tag-list'],
        writeAdvice: 'Bind `[removable]` instead.'
    }
];

/** Methods on a signal, whose presence after the member means the read is already migrated. */
export const SIGNAL_API_METHODS: ReadonlySet<string> = new Set(['set', 'update', 'asReadonly', 'subscribe']);

/** Import specifier that marks a file as a tags consumer. */
export const TAGS_PACKAGE = '@koobiq/components/tags';

/** Reported for writes to members that are read-only now, whatever form the write takes. */
export const writeMessage = (type: string, members: Iterable<string>, advice: string): string =>
    `These ${type} members are read-only signals now, so these writes no longer compile: ` +
    `${[...members].join(', ')}. That covers compound assignments (\`||=\`, \`+=\`), increments, \`delete\` ` +
    `and destructuring targets as well as a plain \`=\`. ${advice}`;

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

/** Reported when a template references a tag, a tag list or a tag input but cannot be parsed. */
export const UNPARSEABLE_TEMPLATE_MESSAGE =
    'This template references a tag, a tag list or a tag input but could not be parsed, so it was left ' +
    'untouched. Migrate reads through its template reference variables by hand. If every template is ' +
    'reported this way, `@angular/compiler` could not be loaded from this install.';

/**
 * Reported when a file names one of the classes in a type position the receiver pass cannot scope to a single
 * identifier - a union, an array, a `QueryList<…>`, a return type - or reads a member in a shape the access
 * pass cannot reach.
 */
export const UNRESOLVED_RECEIVER_MESSAGE =
    'KbqTag, KbqTagList or KbqTagInput is used here in a way this migration cannot resolve to a single ' +
    'receiver, so any signal read through it was left untouched. Check these lines by hand:';

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `distinct` is a `booleanAttribute` input. A valueless `distinct` attribute used to pass the empty ' +
        'string, which is falsy, so duplicate tags were still accepted; it prevents them now.',
    '  Generated ids come from the CDK `_IdGenerator` instead of a module-level counter. The shape is ' +
        'unchanged for a default `APP_ID`: the CDK omits the app id when it is `ng`, and the counter still ' +
        'starts at 0, so a real app keeps getting `kbq-tag-list-0` and `kbq-tag-list-input-0`. Only an app ' +
        'that sets `APP_ID` explicitly sees it in the id, right before the counter and with no separator. ' +
        'The tag list reports the id of its input when it has one, so both surface through the form field.',
    '  A change of the `[selected]` binding still emits `selectionChange`, the way the old setter did.',
    '  What the interfaces name - `value`, `id`, `placeholder`, `required`, `disabled` on the tag list, and ' +
        '`id`, `placeholder` on the tag input - keeps its accessor shape. So do `disabled`, `tabindex` and ' +
        '`value` on the tag and `draggable`, `tabIndex` on the tag list, which fold in state a signal cannot ' +
        'track: the form control, and the projected text.'
];

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
 * - `tagInput.separatorKeyCodes = …` → a read-only input; it was write-only before (warn)
 */

/** Members whose value is unchanged; a read must become a call. Auto-fixed. */
export const SIGNAL_MEMBERS: readonly string[] = ['addOnBlur', 'separators'];

/**
 * Signal members that are writable via `.set(...)`. Every migrated member is an `input()` or a read-only
 * `computed`, so this is empty — a programmatic write is left untouched and becomes a compile error.
 */
export const WRITABLE_MEMBERS: ReadonlySet<string> = new Set<string>();

/** TypeScript type annotation that marks a receiver as a tag input. */
export const TAG_INPUT_TYPE = 'KbqTagInput';

/** Import specifier that marks a file as a tags consumer. */
export const TAGS_PACKAGE = '@koobiq/components/tags';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    pattern: string;
    message: string;
}

const TAG_INPUT_ANCHOR = '\\bKbqTagInput\\b';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TAG_INPUT_ANCHOR,
        pattern: '\\.\\s*(?:separatorKeyCodes|addOnBlur)\\s*=[^=]',
        message:
            'KbqTagInput.separatorKeyCodes and addOnBlur are read-only signal inputs now, so a programmatic ' +
            'write no longer compiles. Bind [kbqTagInputSeparatorKeyCodes] / [kbqTagInputAddOnBlur] instead. ' +
            '`separatorKeyCodes` was a setter with no getter, so in exchange it can finally be read.'
    },
    {
        anchor: TAG_INPUT_ANCHOR,
        pattern: '(?:viewChild|ViewChild|contentChild|ContentChild)[^\\n;]*\\bKbqTagInput\\b',
        message:
            'A KbqTagInput view/content query returns the directive instance, whose `addOnBlur` and ' +
            '`separators` are now signals — reading one is a double call, e.g. ' +
            '`this.tagInput().addOnBlur()`. Verify query reads manually.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  `distinct` is a `booleanAttribute` input. A valueless `distinct` attribute used to pass the empty ' +
        'string, which is falsy, so duplicate tags were still accepted; it prevents them now.',
    '  Generated ids come from the CDK `_IdGenerator`, so their shape changed from `kbq-tag-list-1` and ' +
        '`kbq-tag-list-input-1` to `kbq-tag-list-a1` and `kbq-tag-list-input-a1` — the app id is part of the ' +
        'prefix, which keeps two Angular apps on one page from colliding. The tag list reports the id of its input ' +
        'id when it has one, so both surface through the form field.',
    '  Everything the interfaces name — `value`, `id`, `placeholder`, `required`, `disabled` on the tag ' +
        'list, and `disabled`, `selected`, `selectable`, `removable`, `editable`, `tabindex` on the tag — ' +
        'keeps its accessor shape and its exact read and write syntax. The backing fields are signals now, ' +
        'so anything that derives from them can be a computed, but nothing about when they are read changed.'
];

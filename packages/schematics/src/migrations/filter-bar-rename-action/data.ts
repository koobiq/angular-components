/**
 * Replacement data for the filter-bar "rename" rework.
 *
 * The `filters.name` key was removed from the filter-bar locale configuration: the save/rename
 * popover no longer renders a separate caption above its name field, because its header now
 * carries that caption itself. `filters.error` went too: a taken name is reported by the alert above
 * the field (`filters.errorHint`) alone. `filters.saveChanges` and `filters.saveAsNew` each served as
 * both a popover header and a dropdown item label, so each was split into a `…Header` and a `…Button`
 * key. Renaming a filter also stopped writing `saved: true` / `changed: false` onto the emitted
 * payload, so it no longer persists the filter's pending pipe edits as a side effect.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** The locale keys removed from the `filters` section of the filter-bar configuration. */
export const REMOVED_KEYS = ['name', 'error'];

/**
 * Cheap pre-check gating the AST parse.
 *
 * Searching for `name` or `error` alone would match `className`, `errorState` and most of a project,
 * so the parse is gated on the shapes a key can take inside an object literal: `name:`, a quoted
 * `'name':`, and the shorthand `name` standing between a brace or comma and the next one. A preceding
 * word character or dot rules out both longer identifiers and property reads, which are warn-only.
 */
export const REMOVED_MEMBER_PATTERN = /(?:^|[^.\w])(['"]?)(?:name|error)\1\s*[:,}]/;

/** Keys split in two: the popover header (`…Header`) and the dropdown item label (`…Button`). */
export const SPLIT_KEYS = new Map<string, readonly [string, string]>([
    ['saveChanges', ['saveChangesHeader', 'saveChangesButton']],
    ['saveAsNew', ['saveAsNewHeader', 'saveAsNewButton']]
]);

/** The same pre-check for the split keys; `saveAsNewFilter` does not match. */
export const SPLIT_MEMBER_PATTERN = /(?:^|[^.\w])(['"]?)(?:saveChanges|saveAsNew)\1\s*[:,}]/;

/** Reported for a shorthand removed key the fix deliberately leaves in place. */
export const shorthandMessage = (key: string): string =>
    `This filter-bar locale literal carries \`${key}\` as a shorthand property. It was left in place — ` +
    'deleting it would drop a reference to a variable the file still declares — so remove it by hand, ' +
    'together with the variable if nothing else reads it.';

/**
 * Sibling keys that identify a `filters` locale literal.
 *
 * A full locale literal carries the whole key set — matching on a handful of them keeps an unrelated
 * object that merely has a `name`, `error`, `saveChanges` or `saveAsNew` property from being
 * touched. Both the old and the split keys count, so a literal is recognised before and after the
 * split. No type resolution is involved: the schematic's virtual tree has no `@koobiq` types to
 * resolve against.
 */
export const FINGERPRINT_KEYS = [
    'defaultName',
    'saveNewFilterTooltip',
    'searchPlaceholder',
    'searchEmptyResult',
    'saveAsNewFilter',
    'saveChanges',
    'saveAsNew',
    'saveChangesHeader',
    'saveChangesButton',
    'saveAsNewHeader',
    'saveAsNewButton',
    'change',
    'resetChanges',
    'errorHint',
    'saveButton',
    'cancelButton',
    'actionsTooltip'
];

/**
 * How many fingerprint keys an object literal needs before it is rewritten.
 *
 * Three distinct filter-bar strings never co-occur by accident, while a full section carries well
 * over a dozen, so the threshold rejects look-alikes. A partial override with fewer keys is left to
 * the warnings below.
 */
export const MIN_FINGERPRINT_MATCHES = 3;

/** Warnings for `.ts` files. Checked against post-fix content, so they only fire on what was left. */
export const tsWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\bfilters\\.name\\b',
        message:
            'The `name` key was removed from the filters section of the filter-bar locale configuration. ' +
            'Drop this read — the popover header now captions the name field. Manual migration required: ' +
            'this usage was not an object literal the schematic could rewrite.'
    },
    {
        pattern: 'KbqSaveFilterStatuses\\.NewName',
        message:
            "Renaming changed meaning: the payload of a NewName save now keeps the filter's own `saved` / " +
            '`changed` flags instead of forcing saved: true / changed: false, and it still carries the pipes ' +
            'currently shown in the bar. Persist the name only — writing the whole payload back would ' +
            'silently save the pending pipe edits along with it.'
    }
];

/**
 * Warnings for `.html` files and inline templates. A `.ts` file is checked against them too, so the
 * split-key warnings live here and cover both.
 */
export const templateWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\bfilters\\.name\\b|\\blocaleData\\.name\\b',
        message:
            'The `name` key was removed from the filters section of the filter-bar locale configuration. ' +
            'Drop this binding, or bind your own string if the field still needs a visible caption.'
    },
    {
        pattern: '\\b(?:filters|localeData)\\.error\\b',
        message:
            'The `error` key was removed from the filters section of the filter-bar locale configuration: ' +
            'a taken name is reported by the alert above the name field (`errorHint`) alone. Drop this ' +
            'read or binding. Manual migration required.'
    },
    {
        pattern: '\\bfilters\\s*:\\s*\\{[^{}]*\\berror\\s*:',
        message:
            'An `error` key the fix did not rewrite: a filter-bar locale override with too few keys to be ' +
            'recognised, or one bound in a template. The key was removed — delete it, or ignore this if ' +
            'the object is not a filter-bar locale override.'
    },
    {
        // The lookahead skips calls of the KbqFilters methods that share these names.
        pattern: '\\b(?:filters|localeData)\\.(?:saveChanges|saveAsNew)\\b(?!\\s*\\()',
        message:
            '`filters.saveChanges` and `filters.saveAsNew` were split: read `saveChangesHeader` / ' +
            '`saveAsNewHeader` for the popover header, or `saveChangesButton` / `saveAsNewButton` for the ' +
            'dropdown item. Manual migration required.'
    },
    {
        pattern: '([\'"]?)\\b(?:saveChanges|saveAsNew)\\1\\s*:\\s*[\'"`]',
        message:
            'A `saveChanges` / `saveAsNew` string the fix did not rewrite: a filter-bar locale override with too ' +
            'few keys to be recognised, or one bound in a template. Each key was split in two — replace it ' +
            'with `…Header` (popover header) and `…Button` (dropdown item), or ignore this if the object is ' +
            'not a filter-bar locale override.'
    }
];

/** Behaviour note printed once per run — the parts no call site can point at. */
export const BEHAVIOUR_NOTE = [
    'Filter-bar rename behaviour changed:',
    '  - The "Изменить" / "Edit" dropdown item now reads "Переименовать" / "Rename" and only renames.',
    '    A filter with unsaved pipe changes stays changed under its new name, so the "save changes"',
    '    action (and its warning marker) survives a rename instead of being cleared by it.',
    '  - `filters.saveChanges` and `filters.saveAsNew` were each split into a `…Header` key (the popover',
    '    header, which now also captions the name field: "Новое название" / "Новый фильтр") and a',
    '    `…Button` key (the dropdown item: "Сохранить" / "Сохранить как новый"). The fix copies an',
    '    overridden value into both; re-check the headers — an action-shaped string reads wrong there.',
    '  - The popover no longer renders a caption above the name field; its header carries it.',
    '  - A taken name is reported by the alert above the name field alone ("Такой фильтр уже есть",',
    '    `filters.errorHint`): the field is still marked invalid, but `filters.error` no longer repeats',
    '    the message underneath.',
    'Override these strings through kbqFilterBarLocaleConfigurationProvider if the new wording does not fit.'
];

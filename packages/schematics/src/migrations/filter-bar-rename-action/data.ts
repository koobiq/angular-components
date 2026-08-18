/**
 * Replacement data for the filter-bar "rename" rework.
 *
 * The `filters.name` key was removed from the filter-bar locale configuration: the save/rename
 * popover no longer renders a separate caption above its name field, because its header now
 * carries that caption itself. Renaming a filter also stopped writing `saved: true` /
 * `changed: false` onto the emitted payload, so it no longer persists the filter's pending pipe
 * edits as a side effect.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

/** The locale key removed from the `filters` section of the filter-bar configuration. */
export const REMOVED_KEY = 'name';

/**
 * Sibling keys that identify a `filters` locale literal.
 *
 * `KBQ_FILTER_BAR_CONFIGURATION` is typed as the full configuration (not a `Partial`), so a
 * consumer's literal carries the whole key set — matching on a handful of them keeps an unrelated
 * object that merely has a `name` property from being touched. No type resolution is involved: the
 * schematic's virtual tree has no `@koobiq` types to resolve against.
 */
export const FINGERPRINT_KEYS = [
    'defaultName',
    'saveNewFilterTooltip',
    'searchPlaceholder',
    'searchEmptyResult',
    'saveAsNewFilter',
    'saveChanges',
    'saveAsNew',
    'change',
    'resetChanges',
    'errorHint',
    'saveButton',
    'cancelButton',
    'actionsTooltip'
];

/**
 * How many fingerprint keys an object literal needs before its `name` property is deleted.
 *
 * Three distinct filter-bar strings never co-occur by accident, and a real configuration carries
 * all thirteen, so the threshold rejects look-alikes without rejecting hand-written overrides.
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
    },
    {
        pattern: '\\bpopoverHeader\\b',
        message:
            'KbqFilterSavePopover.popoverHeader no longer depends on the mode: both creating and renaming a ' +
            'filter show the `saveAsNew` caption, since both ask for a name. Nothing reads `saveChanges` as a ' +
            'popover header any more.'
    }
];

/** Warnings for `.html` files and inline templates. */
export const templateWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\bfilters\\.name\\b|\\blocaleData\\.name\\b',
        message:
            'The `name` key was removed from the filters section of the filter-bar locale configuration. ' +
            'Drop this binding, or bind your own string if the field still needs a visible caption.'
    }
];

/** Behaviour note printed once per run — the parts no call site can point at. */
export const BEHAVIOUR_NOTE = [
    'Filter-bar rename behaviour changed:',
    '  - The "Изменить" / "Edit" dropdown item now reads "Переименовать" / "Rename" and only renames.',
    '    A filter with unsaved pipe changes stays changed under its new name, so the "save changes"',
    '    action (and its warning marker) survives a rename instead of being cleared by it.',
    '  - `filters.saveAsNew` was reworded from an action ("Сохранить как новый") to a field caption',
    '    ("Новое название"), and is now also the popover header when renaming. Re-check any override',
    '    of that key — an action-shaped string reads wrong as the caption of the name field.',
    '  - The popover no longer renders a caption above the name field; its header carries it.',
    'Override these strings through KBQ_FILTER_BAR_CONFIGURATION if the new wording does not fit.'
];

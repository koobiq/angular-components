import { listItemPattern } from '../../../utils/list-item-pattern';
import type { AreaData, Replacement } from '../data';

const CORE = '@koobiq/components/core';
const DROPDOWN = '@koobiq/components/dropdown';

/** A file that uses one of the selects: an import in code or the element in a template. */
const SELECTS = '@koobiq/components/(?:select|tree-select|timezone)\\b|<kbq-(?:tree-|timezone-)?select\\b';

/** A file that names the dropdown entry point, before or after the match. */
const IN_DROPDOWN_FILE = `(?:(?<=['"]${DROPDOWN}['"][\\s\\S]*)|(?=[\\s\\S]*['"]${DROPDOWN}['"]))`;

const TRIGGER_WIDTH =
    'it had no effect, delete it. To match the panel to an element other than the trigger, set ' +
    '`KbqDropdownTrigger.widthOrigin`.';
const OFFSET_Y =
    '`offsetY` was removed from `KbqSelect`, `KbqTreeSelect` and `KbqTimezoneSelect`; delete it. The gap between ' +
    'the trigger and the panel is the `--kbq-connected-overlay-gap` CSS variable, set on `:root` or on the pane.';
const CLEAR_VALUE =
    '`clearValue()` was removed from `KbqSelect`, `KbqTreeSelect` and `KbqTimezoneSelect`: project ' +
    '`<kbq-cleaner />` into the select for the user to clear it, and reset the bound form control or model to ' +
    'clear it from code.';

/**
 * Moves `symbol` of `module` to `KbqPanelWidth` of the core entry point. An aliased import and a re-export are
 * left to the warning below.
 */
const toPanelWidth = (symbol: string, module: string): Replacement[] => [
    {
        // The imported specifier, with one of its commas; an emptied clause is dropped by `removeImport`.
        from: `(?<=import\\s*(?:type\\s*)?\\{[^}]*)${listItemPattern(`\\b${symbol}\\b(?!\\s+as\\b)`)}(?=[^}]*\\}\\s*from\\s*['"]${module}['"])`,
        to: '',
        removeImport: { symbol, from: module },
        ensureImport: { symbol: 'KbqPanelWidth', from: CORE }
    },
    {
        from: `\\b${symbol}\\b(?!\\s+as\\b)(?![^}]*\\}\\s*from\\s*['"]${module}['"])`,
        to: 'KbqPanelWidth',
        ensureImport: { symbol: 'KbqPanelWidth', from: CORE }
    }
];

/**
 * Removed in 21.0.0: KbqDropdown triggerWidth, KbqSelect and KbqTreeSelect offsetY, AUTOCOMPLETE_PANEL_HEIGHT,
 * DropdownPositionX and DropdownPositionY, KbqSelectPanelWidth and KbqTreeSelectPanelWidth, KbqSelect and
 * KbqTreeSelect clearValue(), the kbq-dropdown__group-header_small modifier.
 *
 * The type aliases are rewritten to their replacements. The rest has nothing to rewrite to and is reported: none
 * of the members was an input, so a template can only reach them through a reference.
 */
export const dropdownAndSelect: AreaData = {
    tsReplacements: [
        // Only in a file that names the dropdown entry point: an app may have a type of the same name.
        { from: `\\bDropdownPosition([XY])\\b${IN_DROPDOWN_FILE}`, to: 'KbqDropdownPosition$1' },
        {
            // A clause that imported both names now holds the new one twice; keep the last one.
            from: `([{,]\\s*)KbqDropdownPosition([XY])\\s*,\\s*(?=(?:[\\w\\s,]*,\\s*)?KbqDropdownPosition\\2\\b(?!\\s+as\\b)[\\w\\s,]*\\}\\s*from\\s*['"]${DROPDOWN}['"])`,
            to: '$1'
        },
        ...toPanelWidth('KbqSelectPanelWidth', '@koobiq/components/select'),
        ...toPanelWidth('KbqTreeSelectPanelWidth', '@koobiq/components/tree-select')
    ],
    templateReplacements: [],
    warnPatterns: [
        {
            anchor: '@koobiq/components/dropdown\\b|<kbq-dropdown\\b',
            pattern: '\\.triggerWidth\\b',
            message: `\`KbqDropdown.triggerWidth\` was removed; ${TRIGGER_WIDTH}`
        },
        {
            anchor: '\\bKbqDropdownPanel\\b|\\bextends\\s+KbqDropdown\\b',
            pattern: '(?<!\\.)\\btriggerWidth\\b',
            message: `\`KbqDropdownPanel.triggerWidth\` was removed; ${TRIGGER_WIDTH}`
        },
        {
            anchor: SELECTS,
            // Called, it is the `KbqDropdownTrigger.offsetY` input, which stays.
            pattern: '\\.offsetY\\b(?!\\s*\\()',
            message: OFFSET_Y
        },
        {
            anchor: '\\bextends\\s+Kbq(?:Tree|Timezone)?Select\\b',
            pattern: '(?:^|\\n)\\s*(?:(?:public|override)\\s+)*offsetY\\s*(?::\\s*number\\s*)?[=;]',
            message: OFFSET_Y
        },
        {
            anchor: '@koobiq/components/autocomplete\\b',
            pattern: '\\bAUTOCOMPLETE_PANEL_HEIGHT\\b',
            message:
                '`AUTOCOMPLETE_PANEL_HEIGHT` was removed; the library did not read it. The panel height is capped ' +
                'by the `--kbq-autocomplete-size-panel-max-height` CSS variable; keep a constant of your own if ' +
                'you need the 256.'
        },
        {
            // The rewrite above leaves the type alone in a file that does not name the dropdown.
            pattern: `^(?![\\s\\S]*['"]${DROPDOWN}['"])[\\s\\S]*\\bDropdownPosition[XY]\\b`,
            message:
                '`DropdownPositionX` and `DropdownPositionY` were removed from `@koobiq/components/dropdown`. If ' +
                'this one is theirs, re-exported, use `KbqDropdownPositionX` / `KbqDropdownPositionY`.'
        },
        {
            pattern:
                '\\bKbq(?:Tree)?SelectPanelWidth\\s+as\\b|\\bexport\\s*(?:type\\s+)?\\{[^}]*\\bKbq(?:Tree)?SelectPanelWidth\\b',
            message:
                '`KbqSelectPanelWidth` and `KbqTreeSelectPanelWidth` were removed: use `KbqPanelWidth` from ' +
                '`@koobiq/components/core`. Plain imports and uses are rewritten; fix this aliased import or ' +
                're-export by hand.'
        },
        {
            anchor: SELECTS,
            // `KbqFormField.clearValue()` stays; on `this` it is a method of the file's own class.
            pattern: '(?<!\\bthis|[Ff]ormField(?:\\(\\))?[!?]?)\\.clearValue\\b',
            message: `${CLEAR_VALUE} \`KbqFormField.clearValue()\` stays.`
        },
        {
            anchor: '\\bextends\\s+Kbq(?:Tree|Timezone)?Select\\b',
            pattern: '\\bclearValue\\b',
            message: `${CLEAR_VALUE} A subclass drops its override.`
        },
        {
            pattern: '\\bkbq-dropdown__group-header_small\\b',
            message:
                'The `kbq-dropdown__group-header_small` modifier was removed: replace the header with ' +
                '`<kbq-optgroup label="…" />` (`KbqOptgroup` from `@koobiq/components/core`), which renders the ' +
                'subheading in the same typography and color.'
        }
    ]
};

import type { AreaData } from '../data';

const TRIGGER_WIDTH =
    'it had no effect, delete it. To match the panel to an element other than the trigger, set ' +
    '`KbqDropdownTrigger.widthOrigin`.';
const OFFSET_Y =
    '`offsetY` was removed from `KbqSelect`, `KbqTreeSelect` and `KbqTimezoneSelect`; delete it. The gap between ' +
    'the trigger and the panel is the `--kbq-connected-overlay-gap` CSS variable, set on `:root` or on the pane.';

/**
 * Removed in 21.0.0: KbqDropdown triggerWidth, KbqSelect and KbqTreeSelect offsetY, AUTOCOMPLETE_PANEL_HEIGHT.
 *
 * None of them was an input, so no template could bind them: only member accesses, subclasses and imports are
 * left, and they are reported.
 */
export const dropdownAndSelect: AreaData = {
    tsReplacements: [],
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
            anchor: '@koobiq/components/(?:select|tree-select|timezone)\\b|<kbq-(?:tree-|timezone-)?select\\b',
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
        }
    ]
};

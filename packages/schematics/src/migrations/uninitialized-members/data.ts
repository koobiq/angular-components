import type { WarnPattern } from '../../utils/warn-only-migration';

/**
 * Data for the `uninitialized-members` migration.
 *
 * Fields that the library left unset until a hook ran or an overlay opened, and getters that returned `undefined`, were
 * typed as if they always held a value. They now say `| undefined`; a few contracts became a constructor or abstract
 * members. A read with no check stops compiling, which only a person can resolve: `!` keeps the old behaviour of
 * throwing, `?.` skips the work. Warn-only.
 */

const CHECK =
    'Check it before use, or add `!` where the code runs only after the component is initialized. This pattern ' +
    'also matches an unrelated object in the same file — check before changing it.';

export const warnPatterns: WarnPattern[] = [
    {
        anchor: '\\bKbq(?:Tree)?Select(?:Change)?\\b|<kbq-(?:tree-)?select\\b',
        pattern: '\\.(?:selectionModel|triggerRect)\\b',
        message:
            'KbqSelect.selectionModel and KbqTreeSelect.selectionModel are `| undefined`: the select creates the ' +
            `model in ngOnInit, the tree select in ngAfterContentInit and only with a projected tree. ${CHECK}`
    },
    {
        anchor: '\\bKbq(?:Tree)?Select(?:Change)?\\b|<kbq-(?:tree-)?select\\b',
        pattern: '\\.selected\\b(?!\\s*=[^=])',
        message:
            'KbqSelect.selected and KbqTreeSelect.selected return `undefined` in single selection with nothing ' +
            `selected. ${CHECK}`
    },
    {
        anchor: '\\b(?:Base)?TreeControl\\b',
        pattern: '\\.(?:getLevel|isExpandable|getChildren)\\b',
        message:
            'TreeControl and BaseTreeControl declare getLevel, isExpandable and getChildren as `| undefined`: a flat ' +
            'control has no getChildren, a nested one no getLevel or isExpandable. FlatTreeControl and ' +
            `NestedTreeControl keep the functions they have. ${CHECK}`
    },
    {
        anchor: '\\bKbqTree(?:Node|Option|SelectionChange)\\b|\\bKbqTreeNodeDef\\b',
        pattern: '\\.(?:data|when)\\b',
        message:
            'KbqTreeNode.data and KbqTreeOption.data are `T | undefined`: the "select all" row of kbq-tree-selection ' +
            `has no data. KbqTreeNodeDef.when is \`undefined\` on the default node definition. ${CHECK}`
    },
    {
        anchor: '\\bKbqDatepicker(?:Input(?:Event)?)?\\b',
        pattern: '\\.(?:datepicker|calendar|datepickerInput)\\b',
        message:
            'KbqDatepickerInput.datepicker and .calendar are set only by [kbqDatepicker] and [kbqCalendar], ' +
            `KbqDatepicker.datepickerInput only once an input registers: they are \`| undefined\`. ${CHECK}`
    },
    {
        anchor: '\\bKbq(?:Accordion(?:Item)?|AppSwitcherComponent|Autocomplete(?:Trigger|SelectedEvent)?)\\b',
        pattern: '\\.keyManager\\b',
        message:
            'The keyManager of KbqAccordion, KbqAppSwitcherComponent and KbqAutocomplete is created once the ' +
            `content is initialized and is \`| undefined\` before. ${CHECK}`
    },
    {
        anchor: '\\bKbq(?:PopUp|PopUpTrigger|PopoverComponent|NotificationCenterComponent|AppSwitcherComponent|AbstractSelect)\\b',
        pattern: '\\.(?:trigger|portal|strategy|externalNativeElement|panelId|triggerRect)\\b',
        message:
            'The pop-up members trigger, portal, strategy, externalNativeElement, panelId and triggerRect are ' +
            `\`| undefined\` until the overlay is created or the trigger writes them. ${CHECK}`
    },
    {
        anchor: '\\bKbqDropdown\\b',
        pattern: '\\.direction\\b',
        message: `KbqDropdown.direction is \`| undefined\` until the trigger opens the dropdown. ${CHECK}`
    },
    {
        anchor: '\\bKbqTab(?:ChangeEvent|LabelWrapper|Header)\\b|selectedTabChange',
        pattern: '\\.tab\\b',
        message:
            'KbqTabChangeEvent.tab and KbqTabLabelWrapper.tab are `KbqTab | undefined`: the event also fires when ' +
            `every tab was removed, and the label wrapper has none until its \`tab\` input is bound. ${CHECK}`
    },
    {
        anchor: '\\bKbqTab(?:LabelWrapper|Body)?\\b',
        pattern: '\\.(?:templateLabel|bodyPosition|origin)\\b',
        message:
            'KbqTab.templateLabel is `undefined` for a tab labelled with text; KbqTabBody.bodyPosition and .origin ' +
            `are \`| undefined\` until a position is set. ${CHECK}`
    },
    {
        anchor: '\\bKbqSidepanel(?:Ref|Service)\\b',
        pattern: '\\.instance\\b',
        message: `KbqSidepanelRef.instance is \`undefined\` for a sidepanel opened with a TemplateRef. ${CHECK}`
    },
    {
        anchor: '\\bKbqNotificationItemComponent\\b',
        pattern: '\\.(?:data|context)\\b',
        message: `KbqNotificationItemComponent.data and .context are \`| undefined\` until an item is set. ${CHECK}`
    },
    {
        anchor: '\\bKbqNavbarFocusableItem\\b',
        pattern: '\\.tooltip\\b',
        message: `KbqNavbarFocusableItem.tooltip is \`undefined\` on a brand and a toggle. ${CHECK}`
    },
    {
        anchor: '\\bKBQ_NUMBER_FORMATTER_(?:DEFAULT_)?OPTIONS\\b',
        pattern: '\\.(?:useGrouping|minimumIntegerDigits|minimumFractionDigits|maximumFractionDigits)\\b',
        message:
            'The fields of KBQ_NUMBER_FORMATTER_OPTIONS and KBQ_NUMBER_FORMATTER_DEFAULT_OPTIONS are `| undefined`: ' +
            `an option the configuration leaves out stays unset. ${CHECK}`
    },
    {
        pattern: '\\bnew\\s+Kbq(?:CheckboxChange|ToggleChange|TabChangeEvent)\\s*\\(\\s*\\)',
        message:
            'KbqCheckboxChange and KbqToggleChange take `source` and `checked`, KbqTabChangeEvent takes `index` and ' +
            '`tab` in the constructor now: pass them instead of assigning the fields after `new`.'
    },
    {
        pattern: '\\bextends\\s+KbqFormFieldControl\\b',
        message:
            'The members of KbqFormFieldControl are abstract now: a class that extends it declares value, id, ' +
            'placeholder, ngControl, focused, empty, required, disabled and errorState. One that implements it ' +
            'already does.'
    },
    {
        pattern: '\\bextends\\s+KbqPopUp\\b',
        message: 'KbqPopUp.prefix is abstract now: a class that extends KbqPopUp declares its CSS class prefix.'
    },
    {
        anchor: '<kbq-(?:tree-)?select\\b',
        pattern: '\\.(?:selectionModel|selected)\\b',
        message:
            'KbqSelect and KbqTreeSelect: selectionModel and, in single selection with nothing selected, selected ' +
            `are \`undefined\` in the template too. ${CHECK}`,
        extensions: ['.html']
    },
    {
        pattern: '\\$event\\.tab\\b',
        message:
            'KbqTabChangeEvent.tab is `KbqTab | undefined`: the event also fires when every tab was removed. ' + CHECK,
        extensions: ['.html']
    }
];

export const SUMMARY = [
    'Members the library left unset until a hook ran or an overlay opened say `| undefined` now; behaviour is unchanged.',
    'A read reported above either checks the value or keeps `!`, which throws exactly where the old code threw.'
];

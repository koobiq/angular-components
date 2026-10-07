/**
 * Data for the `query-list-signals` migration.
 *
 * The remaining decorator queries are signal queries now. The public members over them are getters that keep their
 * types — a `QueryList` whose `changes` emit as before, or an `ElementRef` — so reads are unchanged. A subclass that
 * redeclares one of them, and a write to one, no longer compile. `KbqCodeBlock.tabLinkTemplate`, which is protected,
 * is a signal. Warn-only.
 */

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor: string;
    pattern: string;
    message: string;
}

const OWNERS = [
    'KbqSelect',
    'KbqTimezoneSelect',
    'KbqTreeSelect',
    'KbqAutocomplete',
    'KbqListSelection',
    'KbqListItem',
    'KbqFocusableComponent',
    'KbqNavbar',
    'KbqVerticalNavbar',
    'KbqRadioGroup',
    'KbqTagList',
    'KbqTag',
    'KbqDropdownItem',
    'KbqTreeSelection',
    'KbqAppSwitcherComponent',
    'KbqCodeBlock'
].join('|');

const MEMBERS = [
    'options',
    'tags',
    'lines',
    'focusableItems',
    'radios',
    'unorderedOptions',
    'allItems',
    'textElement',
    'tabLinkTemplate'
].join('|');

const SUBCLASS = `\\bextends\\s+(?:${OWNERS})\\b`;

export const warnPatterns: WarnPattern[] = [
    {
        anchor: SUBCLASS,
        pattern: `@(?:ViewChild|ViewChildren|ContentChild|ContentChildren)\\s*\\(|\\b(?:override|declare)\\s+(?:readonly\\s+)?(?:${MEMBERS})\\s*[!?]?\\s*:`,
        message:
            'A subclass of a Koobiq component whose query members are getters over signal queries now: options of ' +
            'KbqSelect, KbqAutocomplete and KbqListSelection, tags of KbqSelect, KbqTreeSelect and KbqTagList, ' +
            'KbqListItem.lines, focusableItems of KbqNavbar and KbqVerticalNavbar, KbqRadioGroup.radios, ' +
            'KbqTreeSelection.unorderedOptions, KbqAppSwitcherComponent.allItems and textElement of KbqTag and ' +
            'KbqDropdownItem. A subclass can no longer redeclare them as fields: remove the redeclaration, or override ' +
            'the getter. This pattern also matches a query of the subclass itself — check before changing it.'
    },
    {
        anchor: `\\b(?:${OWNERS})\\b`,
        pattern: '\\.\\s*(?:options|tags|lines|focusableItems|radios|unorderedOptions|textElement)\\s*=[^=]',
        message:
            'The query members of KbqSelect, KbqAutocomplete, KbqListSelection, KbqListItem, the navbar, ' +
            'KbqRadioGroup, KbqTagList, KbqTag, KbqDropdownItem and KbqTreeSelection are read-only getters now, so a ' +
            'write no longer compiles. Render the items in the template instead. This pattern also matches a write ' +
            'to an unrelated object in the same file — check before changing it.'
    },
    {
        anchor: '\\bextends\\s+KbqCodeBlock\\b',
        pattern: '\\btabLinkTemplate\\b(?!\\s*\\()',
        message:
            'KbqCodeBlock.tabLinkTemplate is a protected signal now: a subclass reads it as this.tabLinkTemplate().'
    }
];

export const SUMMARY = [
    'Reading these members and subscribing to the changes of a QueryList work as before. Before the content is',
    'initialized a QueryList is empty rather than undefined.'
];

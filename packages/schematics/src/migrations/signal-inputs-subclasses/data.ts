/**
 * Data for the `signal-inputs-subclasses` migration.
 *
 * The decorator inputs of the checkbox, toggle, radio, button toggle, buttons, icons, search-expandable and the
 * pop-up triggers are signal inputs named `<member>Input` now, handed to the unchanged member from `ngOnChanges`.
 * Reads and writes of the members are unchanged; a subclass is not. Warn-only.
 */

export interface WarnPattern {
    /** Only files that match it are checked against `pattern`. */
    anchor: string;
    pattern: string;
    message: string;
}

const COMPONENTS = [
    'KbqCheckbox',
    'KbqToggleComponent',
    'KbqRadioGroup',
    'KbqRadioButton',
    'KbqButtonToggleGroup',
    'KbqButtonToggle',
    'KbqButton',
    'KbqButtonGroupRoot',
    'KbqSplitButton',
    'KbqIcon',
    'KbqIconButton',
    'KbqIconItem',
    'KbqSearchExpandable',
    'KbqTooltipTrigger',
    'KbqPopoverTrigger',
    'KbqPopoverConfirmTrigger',
    'KbqAppSwitcherTrigger',
    'KbqAppSwitcherComponent',
    'KbqNotificationCenterTrigger',
    'KbqPasswordToggle',
    'KbqEllipsisCenterDirective',
    'KbqTagInput',
    'KbqTagList',
    'KbqTag',
    'KbqSingleFileUploadComponent',
    'KbqMultipleFileUploadComponent',
    'KbqAccordionItem',
    'KbqNavbarFocusableItem',
    'KbqNavbarItem',
    'KbqNotificationItemComponent',
    'KbqSidebar'
].join('|');

const PANELS = ['KbqPopUp', 'KbqTooltipComponent', 'KbqPopoverComponent', 'KbqPopoverConfirmComponent'].join('|');

export const warnPatterns: WarnPattern[] = [
    {
        anchor: `\\bextends\\s+(?:${COMPONENTS})\\b`,
        pattern: `\\bextends\\s+(?:${COMPONENTS})\\b`,
        message:
            'A subclass of a Koobiq component whose inputs became signal inputs. The bound value reaches the member ' +
            'from ngOnChanges now, so an ngOnChanges of the subclass has to call super.ngOnChanges(changes). An input ' +
            'the subclass redeclared with @Input() is overridden through the `<member>Input` signal input instead, ' +
            "e.g. `override readonly iconNameInput = input<string | undefined>(undefined, { alias: 'my-icon' })`."
    },
    {
        anchor: `\\bextends\\s+(?:${PANELS})\\b`,
        pattern: '@ViewChild\\([^)]*\\)\\s*(?:override\\s+)?elementRef\\b',
        message:
            'KbqPopUp.elementRef is a protected getter now, the element the pop-up measures and decorates. A panel ' +
            'that renders an element of its own overrides the getter over a viewChild() instead of re-declaring the ' +
            'field with @ViewChild.'
    }
];

export const SUMMARY = [
    'Reads and writes of the members of these components are unchanged. A boolean input accepts',
    'boolean | string | null | undefined in a template now, rather than anything.'
];

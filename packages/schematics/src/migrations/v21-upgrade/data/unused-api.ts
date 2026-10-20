import type { AreaData } from '../data';

/** A named import of one of `symbols` (a regex alternation) from the `entry` entry point. */
const importedFrom = (entry: string, symbols: string): string =>
    String.raw`import\s*(?:type\s*)?\{[^}]*\b(?:${symbols})\b[^}]*\}\s*from\s*['"]@koobiq/components/${entry}['"]`;

/** A class of the library that a subclass extends. */
const extending = (classes: string): string => String.raw`\bextends\s+(?:${classes})\b`;

/** A member reached through `this` or `super`, as a subclass does. */
const ownMember = (members: string): string => String.raw`\b(?:this|super)[!?]?\.(?:${members})\b`;

/**
 * Removed in 21.0.0 without a deprecation: the component exports, members and template context fields nothing in
 * the library used, with the classes of the legacy validate directive and `kbq-no-select`.
 */
export const unusedApi: AreaData = {
    warnPatterns: [
        {
            pattern: importedFrom('input', 'normalizeSplitter|isInt|isDigit'),
            message:
                'normalizeSplitter(), isInt() and isDigit() are no longer exported from @koobiq/components/input: ' +
                "nothing in the library used them. Copy what you need: value.replace(/,/g, '.') and " +
                String.raw`/^-?\d+$/.test(value); isFloat() stays.`
        },
        {
            pattern: importedFrom('time-range', 'KbqTimeRangeTranslateTypeMap'),
            message:
                'KbqTimeRangeTranslateTypeMap was removed from @koobiq/components/time-range: nothing read it. Use ' +
                'Record<KbqTimeRangeType, KbqTimeRangeTranslationType> instead.'
        },
        {
            pattern: importedFrom('tabs', 'KbqTabBodyOriginState'),
            message: "KbqTabBodyOriginState was removed: nothing read it. Use 'left' | 'right' instead."
        },
        {
            pattern: importedFrom('datepicker', 'KbqDatepickerIntl'),
            message:
                'KbqDatepickerIntl was removed: no view of the datepicker rendered its labels, and its changes ' +
                'stream only re-rendered the calendar. Drop the provider and the subclass; the datepicker texts ' +
                'come from the locale configuration (kbqDatepickerLocaleConfigurationProvider()).'
        },
        {
            anchor: String.raw`\bKbqDropdown\b|\bkbqDropdown\b|<kbq-dropdown\b`,
            pattern: String.raw`\.onPanelReached\s*\(`,
            message: 'KbqDropdown.onPanelReached() was removed: nothing subscribed to it. Delete the subscription.'
        },
        {
            anchor: extending('KbqTreeSelection'),
            pattern: ownMember('getItemHeight'),
            message:
                'The protected KbqTreeSelection.getItemHeight() was removed: call getHeight() on the first rendered ' +
                'option instead, for example this.renderedOptions.first?.getHeight() ?? 0.'
        },
        {
            anchor: extending('KbqTreeSelection'),
            pattern: ownMember('setFocusedOption'),
            message:
                'The protected KbqTreeSelection.setFocusedOption() was removed: call ' +
                'this.keyManager.setActiveItem(option) instead.'
        },
        {
            anchor: String.raw`\bKbqTagList\b|<kbq-tag-list\b`,
            pattern: String.raw`\.(?:tagSelectionChanges|shouldLabelFloat)\b`,
            message:
                'KbqTagList.tagSelectionChanges and shouldLabelFloat were removed: nothing read them. Listen to ' +
                'the selectionChange output of each tag, and compute !tagList.empty() || tagList.focused() ' +
                'yourself.'
        },
        {
            anchor: String.raw`\bKbqTreeNodeOutlet\b`,
            pattern: String.raw`\.changeDetectorRef\b`,
            message: 'KbqTreeNodeOutlet.changeDetectorRef was removed: inject ChangeDetectorRef where you need it.'
        },

        // Protected members: only a subclass reaches them.
        {
            anchor: extending(
                'KbqAccordion|KbqAccordionItem|KbqPasswordToggle|KbqIcon|KbqIconButton|KbqIconItem|KbqSearchExpandable'
            ),
            pattern: ownMember('changeDetectorRef'),
            message:
                'The protected changeDetectorRef of KbqAccordion, KbqAccordionItem, KbqPasswordToggle, KbqIcon ' +
                '(with KbqIconButton and KbqIconItem) and KbqSearchExpandable was removed: nothing read it. Inject ' +
                'ChangeDetectorRef in the subclass.'
        },
        {
            anchor: extending('KbqAccordionTrigger'),
            pattern: ownMember('nativeElement'),
            message: 'The protected KbqAccordionTrigger.nativeElement was removed: inject ElementRef in the subclass.'
        },
        {
            anchor: extending('KbqNotificationCenterComponent'),
            pattern: ownMember('dateAdapter'),
            message:
                'The protected KbqNotificationCenterComponent.dateAdapter was removed: inject DateAdapter in the ' +
                'subclass.'
        },
        {
            anchor: extending('KbqFilters'),
            pattern: ownMember('styles'),
            message: 'The protected KbqFilters.styles was removed: use KbqButtonStyles from @koobiq/components/button.'
        },
        {
            anchor: extending('KbqTitleDirective'),
            pattern: ownMember('isHorizontalOverflown|isVerticalOverflown|child'),
            message:
                'The protected isHorizontalOverflown, isVerticalOverflown and child of KbqTitleDirective were ' +
                'removed: isOverflown covers both directions and every measured text element.'
        },

        // Classes nothing sets.
        {
            pattern: String.raw`(?<![\w-])kbq-(?:control|form-field)_has-validate-directive(?![\w-])`,
            message:
                'The kbq-control_has-validate-directive and kbq-form-field_has-validate-directive classes no ' +
                'longer style anything: the KbqValidateDirective that set them was removed in 20.0.0. The form ' +
                'field, select and tree select show an error through their ErrorStateMatcher, which sets ' +
                'kbq-form-field_invalid and kbq-invalid.'
        },
        {
            pattern: String.raw`(?<![\w-])kbq-no-select(?![\w-])`,
            message: 'The kbq-no-select class was removed: nothing set it. Set user-select: none in your own styles.'
        }
    ]
};

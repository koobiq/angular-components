import { WarnPattern } from '../../utils/warn-only-migration';

/**
 * Data for the `tabs-signals-and-aria` migration.
 *
 * The decorator inputs of the tabs are signal inputs named `<member>Input`, handed to the unchanged member from
 * `ngOnChanges`, and their decorator queries are signal queries behind getters. Reads and writes of the members are
 * unchanged; a subclass and a hand-made `SimpleChanges` are not.
 *
 * The tabs review closed the members that were wired to nothing and gave `KbqTabGroup` the ARIA tabs pattern its
 * sibling in the same package already had:
 *
 * - `KbqTabGroup.resizeStream` and the `(window:resize)` host listener — removed. The header is observed with the
 *   CDK `SharedResizeObserver` now, which also catches container resizes no window event reports.
 * - `KbqTabGroup.disabled` — removed. It was published, documented and read by nothing at all.
 * - `KbqTabGroup.getTabIndex()` — takes the header as its second argument, and returns `-1` instead of `null` for a
 *   disabled tab so the strip keeps exactly one tab stop.
 * - `KbqVerticalTabsCssStyler` — deprecated no-op. The vertical layout class is bound from the components
 *   themselves, so `[vertical]="false"` now removes it.
 * - `KbqTabLabelWrapper` and `KbqTabLink` emit `aria-disabled` instead of a bare `disabled` attribute.
 *
 * Warn-only. A removed member has no replacement expression, and an attribute selector has to be rewritten by hand.
 */

/** Import specifier that marks a file as a tabs consumer. */
export const TABS_PACKAGE = '@koobiq/components/tabs';

/**
 * Identifier and element shapes that mark a consumer without an import.
 *
 * `KbqTabs?(?![a-z])` rather than `KbqTab\w*`: the greedy form also swallows `KbqTable`, a different component in
 * the same library. Requiring a non-lowercase character after the optional `s` keeps every real export (`KbqTab`,
 * `KbqTabGroup`, `KbqTabNavBar`, `KbqTabsModule`) and drops `KbqTable*`.
 */
export const TABS_TYPE =
    '\\bKbqTabs?(?![a-z])\\w*\\b|\\bkbq-tab(?:-group|-nav-bar)?\\b|\\bkbqTab(?:NavBar|Link|Label)\\b';

const CLASSES = [
    'KbqTabGroup',
    'KbqTab',
    'KbqTabHeader',
    'KbqTabNavBar',
    'KbqTabLink',
    'KbqTabLabelWrapper',
    'KbqTabBody'
].join('|');

const SUBCLASS = `\\bextends\\s+(?:${CLASSES})\\b`;

/** Patterns evaluated for every `.ts` and `.html` file that references the tabs. */
export const warnPatterns: WarnPattern[] = [
    {
        anchor: SUBCLASS,
        pattern: SUBCLASS,
        message:
            'A subclass of a Koobiq tabs class whose inputs became signal inputs. The bound value reaches the member ' +
            'from ngOnChanges now, which every one of them but KbqTab declares for the first time: an ngOnChanges of ' +
            'the subclass is marked override and calls super.ngOnChanges(changes). An input the subclass redeclared ' +
            'with @Input() is overridden through the `<member>Input` signal input instead, e.g. ' +
            '`override readonly headerPositionInput = input<KbqTabHeaderPosition | undefined>(undefined, ' +
            "{ alias: 'headerPosition' })`."
    },
    {
        anchor: SUBCLASS,
        pattern: '@(?:ViewChild|ViewChildren|ContentChild|ContentChildren)\\s*\\(',
        message:
            'A subclass of a Koobiq tabs class that declares a decorator query. KbqTabGroup.tabs, the items, ' +
            'tabListContainer, tabList, nextPaginator and previousPaginator of KbqTabHeader and KbqTabNavBar, ' +
            'KbqTabLabelWrapper.labelContent and KbqTab.templateLabel are getters over signal queries now, so a ' +
            'subclass can no longer redeclare them as fields: override the getter instead. tabs and items stay ' +
            'QueryLists whose changes emit as before.'
    },
    {
        anchor: `\\b(?:${CLASSES})\\b`,
        pattern: '(?<!\\bsuper)\\.ngOnChanges\\s*\\(',
        message:
            'A direct call of ngOnChanges in a file that uses a Koobiq tabs class. Their SimpleChanges are keyed by ' +
            'the `<member>Input` names now (disabledInput, not disabled), and a bound value reaches its member only ' +
            'through them: set the input with a template binding or ComponentRef.setInput instead. This pattern also ' +
            'matches ngOnChanges of an unrelated class in the same file — check before changing it.'
    },
    {
        anchor: TABS_TYPE,
        pattern: '\\bresizeStream\\b',
        message:
            'KbqTabGroup.resizeStream and the (window:resize) host listener were removed. The header is observed with ' +
            'the CDK SharedResizeObserver now, which also catches container resizes, so a manual ' +
            'resizeStream.next(event) has no counterpart.'
    },
    {
        anchor: '\\bKbqTabGroup\\b|\\bkbq-tab-group\\b',
        pattern: '<kbq-tab-group[^>]*\\bdisabled\\b|\\bKbqTabGroup\\b[^\\n]*\\.\\s*disabled\\b',
        message:
            'KbqTabGroup.disabled was removed. It was published and documented but read by nothing — no template ' +
            'bound it and no style targeted it, so <kbq-tab-group disabled> never did anything. Disable the ' +
            'individual tabs instead: <kbq-tab [disabled]="true">.'
    },
    {
        anchor: '\\bKbqTabGroup\\b',
        pattern: '\\.\\s*getTabIndex\\s*\\(',
        message:
            'KbqTabGroup.getTabIndex(tab, index) is getTabIndex(tab, tabHeader, index) and returns -1 rather than ' +
            'null for a disabled tab. The roving tabindex follows the header focus position now, so a disabled ' +
            'selected tab can no longer take the whole strip out of the tab order.'
    },
    {
        anchor: '\\bKbqVerticalTabsCssStyler\\b',
        pattern: '\\bKbqVerticalTabsCssStyler\\b',
        message:
            'KbqVerticalTabsCssStyler is a deprecated no-op and will be removed. The kbq-tab-group_vertical class is ' +
            'bound from KbqTabGroup and KbqTabNavBar themselves, so [vertical]="false" removes it instead of ' +
            'leaving it latched on by the attribute selector. Stop importing the directive.'
    },
    {
        anchor: '\\bkbq-tab-label\\b|\\bkbqTabLabelWrapper\\b',
        pattern: '\\.kbq-tab-label\\[disabled\\]|kbq-tab-label[^\\n]*\\[disabled\\]',
        message:
            'A tab label no longer carries a bare `disabled` attribute — that attribute is defined for form controls ' +
            'only and no assistive technology reads it off a div. Target .kbq-disabled for styling or ' +
            '[aria-disabled="true"] in a test.'
    }
];

/** Printed once per project that references the tabs, after the per-file reports. */
export const SUMMARY = [
    '  Apart from the removals above, reads and writes of the tabs members are unchanged — tab.disabled, ' +
        'tabLink.active and the selection of a group stay plain properties — and tabs and items are still ' +
        'QueryLists. A boolean input (disabled, active, vertical, disablePagination) accepts ' +
        'boolean | string | null | undefined in a template now.',
    '  KbqTabGroup renders the ARIA tabs pattern now: the label strip is a role="tablist" (with ' +
        'aria-orientation="vertical" when vertical), each label a role="tab" with aria-selected and ' +
        'aria-controls, and each body a role="tabpanel" with aria-labelledby and a tab stop while active. ' +
        'Hand-rolled role or aria-* attributes on those elements are duplicates now.',
    '  KbqTabNavBar emits aria-orientation="vertical" when it is both vertical and a real tablist, i.e. ' +
        'when [tabNavPanel] is supplied. Without [tabNavPanel] the nav bar stays plain navigation and ' +
        'emits no tab semantics at all — supply it whenever the bar switches a region on the same page. ' +
        'A tab link carries aria-disabled and no longer a bare disabled attribute: a selector such as ' +
        'a[kbqTabLink][disabled] moves to .kbq-disabled.',
    '  KbqTabHeader is OnPush like every other component in the package. A host that mutated it outside ' +
        'Angular and relied on the Default strategy to pick the change up has to mark it for check.',
    '  KbqTabBody.afterLeavingCenter is an EventEmitter<void>: it never carried a value, so a handler that ' +
        'declared a boolean parameter drops it.',
    '  KbqPaginatedTabHeader is exported from the entry point, so `extends KbqPaginatedTabHeader` in the ' +
        'public signatures is nameable, and the duplicate ScrollDirection in tab-header.component was ' +
        'deleted in favour of the base one — both resolve through @koobiq/components/tabs.',
    '  The four on-surface theme branches read the --kbq-tabs-tab-item-*-on-surface-* tokens they always ' +
        'declared instead of the on-background family. Values that were only overridden on the ' +
        'on-background tokens no longer reach a group or nav bar with [onSurface].'
];

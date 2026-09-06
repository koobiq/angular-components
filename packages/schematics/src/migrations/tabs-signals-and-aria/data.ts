/**
 * Data for the `tabs-signals-and-aria` migration.
 *
 * The tabs review closed the members that were wired to nothing and gave `KbqTabGroup` the ARIA tabs
 * pattern its own sibling in the same package already had:
 *
 * - `KbqTabGroup.resizeStream` and the `(window:resize)` host listener — removed. Nothing was ever
 *   subscribed: `subscribeToResize()` read the `vertical` signal input in the constructor, before
 *   Angular writes inputs, so it always returned early. The header is observed with the CDK
 *   `SharedResizeObserver` now, which also catches container resizes no window event reports.
 * - `KbqTabGroup.disabled` — removed. It was published, documented and read by nothing at all.
 * - `KbqTab.disabled` — accessor input → signal input.
 * - `KbqTabGroup.getTabIndex()` — takes the header as its second argument, and returns `-1` instead of
 *   `null` for a disabled tab so the strip keeps exactly one tab stop.
 * - `KbqVerticalTabsCssStyler` — deprecated no-op. The vertical layout class is bound from the
 *   components themselves, so `[vertical]="false"` now removes it.
 * - `KbqTabLabelWrapper` emits `aria-disabled` instead of a bare `disabled` attribute.
 *
 * Warn-only. A read of a signal member becomes a call, a removed member has no replacement
 * expression, and an attribute selector has to be rewritten by hand.
 */

/** Import specifier that marks a file as a tabs consumer. */
export const TABS_PACKAGE = '@koobiq/components/tabs';

/** Identifier and element shapes that mark a consumer without an import. */
export const TABS_TYPE = '\\bKbqTab\\w*\\b|\\bkbq-tab(?:-group|-nav-bar)?\\b|\\bkbqTab(?:NavBar|Link|Label)\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TABS_TYPE,
        pattern: '\\bresizeStream\\b',
        message:
            'KbqTabGroup.resizeStream and the (window:resize) host listener were removed. Nothing was ' +
            'subscribed to them: the subscription was created in the constructor from a signal input that ' +
            'Angular had not written yet, so it never existed. The header is observed with the CDK ' +
            'SharedResizeObserver now, so a manual resizeStream.next(event) has no counterpart.'
    },
    {
        anchor: '\\bKbqTabGroup\\b|\\bkbq-tab-group\\b',
        pattern: '<kbq-tab-group[^>]*\\bdisabled\\b|\\bKbqTabGroup\\b[^\\n]*\\.\\s*disabled\\b',
        message:
            'KbqTabGroup.disabled was removed. It was published and documented but read by nothing — no ' +
            'template bound it and no style targeted it, so <kbq-tab-group disabled> never did anything. ' +
            'Disable the individual tabs instead: <kbq-tab [disabled]="true">.'
    },
    {
        anchor: '\\bKbqTab\\b',
        pattern: '\\.\\s*disabled\\s*=(?!=)',
        message:
            'KbqTab.disabled is a signal input and takes no assignment. Bind [disabled] in the template; a ' +
            'host that owned the flag should keep it in its own state and bind it.'
    },
    {
        anchor: '\\bKbqTab\\b',
        pattern: '\\.\\s*disabled\\b(?!\\s*[=(])',
        message: 'KbqTab.disabled is a signal input: read it as a call, tab.disabled().'
    },
    {
        anchor: '\\bKbqTabGroup\\b',
        pattern: '\\.\\s*getTabIndex\\s*\\(',
        message:
            'KbqTabGroup.getTabIndex(tab, index) is getTabIndex(tab, tabHeader, index) and returns -1 rather ' +
            'than null for a disabled tab. The roving tabindex follows the header focus position now, so a ' +
            'disabled selected tab can no longer take the whole strip out of the tab order.'
    },
    {
        anchor: '\\bKbqVerticalTabsCssStyler\\b',
        pattern: '\\bKbqVerticalTabsCssStyler\\b',
        message:
            'KbqVerticalTabsCssStyler is a deprecated no-op and will be removed. The kbq-tab-group_vertical ' +
            'class is bound from KbqTabGroup and KbqTabNavBar themselves, so [vertical]="false" removes it ' +
            'instead of leaving it latched on by the attribute selector. Stop importing the directive.'
    },
    {
        anchor: '\\bkbq-tab-label\\b|\\bkbqTabLabelWrapper\\b',
        pattern: '\\.kbq-tab-label\\[disabled\\]|kbq-tab-label[^\\n]*\\[disabled\\]',
        message:
            'A tab label no longer carries a bare `disabled` attribute — that attribute is defined for form ' +
            'controls only and no assistive technology reads it off a div. Target .kbq-disabled for styling ' +
            'or [aria-disabled="true"] in a test.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  KbqTabGroup renders the ARIA tabs pattern now: the label strip is a role="tablist" (with ' +
        'aria-orientation="vertical" when vertical), each label a role="tab" with aria-selected and ' +
        'aria-controls, and each body a role="tabpanel" with aria-labelledby and a tab stop while active. ' +
        'Hand-rolled role or aria-* attributes on those elements are duplicates now.',
    '  KbqTabNavBar emits aria-orientation="vertical" when it is both vertical and a real tablist, i.e. ' +
        'when [tabNavPanel] is supplied. Without [tabNavPanel] the nav bar stays plain navigation and ' +
        'emits no tab semantics at all — supply it whenever the bar switches a region on the same page.',
    '  KbqTabHeader is OnPush like every other component in the package. A host that mutated it outside ' +
        'Angular and relied on the Default strategy to pick the change up has to mark it for check.',
    '  KbqPaginatedTabHeader is exported from the entry point, so `extends KbqPaginatedTabHeader` in the ' +
        'public signatures is nameable, and the duplicate ScrollDirection in tab-header.component was ' +
        'deleted in favour of the base one — both resolve through @koobiq/components/tabs.',
    '  The four on-surface theme branches read the --kbq-tabs-tab-item-*-on-surface-* tokens they always ' +
        'declared instead of the on-background family. Values that were only overridden on the ' +
        'on-background tokens no longer reach a group or nav bar with [onSurface].'
];

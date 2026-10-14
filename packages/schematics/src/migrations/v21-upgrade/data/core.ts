import { listItemPattern } from '../../../utils/list-item-pattern';
import { TAG_BODY } from '../../../utils/tag-patterns';
import type { AreaData, Replacement } from '../data';

const CORE = '@koobiq/components/core';

/** A named import of `symbol` from the core entry point, so an app's own symbol of that name is left alone. */
const importedFromCore = (symbol: string): string =>
    `import\\s*(?:type\\s*)?\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from\\s*['"]${CORE}['"]`;

/** Renames `from` to `to`; a core import clause that held both names keeps the last one. */
const rename = (from: string, to: string): Replacement[] => [
    { from: `\\b${from}\\b`, to },
    {
        from: `([{,]\\s*)${to}\\s*,\\s*(?=(?:[\\w\\s,]*,\\s*)?${to}\\b(?!\\s+as\\b)[\\w\\s,]*\\}\\s*from\\s*['"]${CORE}['"])`,
        to: '$1'
    }
];

// Templates read the enums when a component exposes them under their own name.
const DEFAULT_ENUM_MEMBERS: Replacement[] = [
    { from: '\\bKbqThemeSelector\\.Default\\b', to: 'KbqThemeSelector.Light' },
    { from: '\\bKbqThemeNames\\.Default\\b', to: 'KbqThemeNames.Light' }
];

// The members of `ThemePalette` that `KbqComponentColors` holds under the same value; the others style nothing.
const THEME_PALETTE: Replacement[] = [
    {
        from: `(?<=${importedFromCore('ThemePalette')}[\\s\\S]*)\\bThemePalette\\.(Error|Warning|Success)\\b`,
        to: 'KbqComponentColors.$1',
        ensureImport: { symbol: 'KbqComponentColors', from: CORE }
    },
    {
        // The import specifier, with one of its commas, once nothing else names it; an emptied clause is dropped by
        // `removeImport`. A re-export is reported instead.
        from: `(?<=\\bimport\\s*(?:type\\s*)?\\{[^}]*)${listItemPattern('\\bThemePalette\\b(?!\\s+as\\b)')}(?=[^}]*\\}\\s*from\\s*['"]${CORE}['"])(?![\\s\\S]*\\bThemePalette\\b)`,
        to: '',
        removeImport: { symbol: 'ThemePalette', from: CORE }
    }
];

/**
 * The `mc` alias `name` of a list item slot: an attribute of an opening tag in a template, or an attribute selector
 * in a string, such as a `querySelector()` argument. The template replacements run over the whole of a `.ts` file,
 * where the name anywhere else is the app's own: `mcLine = 1`, `this.mcLine`, a `.mcLine` class in `styles`.
 */
const mcAlias = (name: string, to: string): Replacement[] => [
    { from: `(?<=<[a-zA-Z][\\w-]*\\s${TAG_BODY}*)(?<=\\s)${name}(?=[\\s=/>])`, to },
    { from: `(?<=['"\`][^'"\`\\n]*\\[\\s*)${name}(?=\\s*[\\]=~|^$*])`, to }
];

/** `name` as the attribute of a selector in a stylesheet, which matches an HTML attribute in any case. */
const attributeSelector = (name: string): string => {
    const anyCase = [...name].map((char) => `[${char.toLowerCase()}${char.toUpperCase()}]`).join('');

    return `(?<=\\[\\s*)${anyCase}(?=\\s*[\\]=~|^$*])`;
};

// In a stylesheet, only an attribute selector: `.mcLine` and `$mcLine` are the app's own.
const MC_SELECTORS: Replacement[] = [
    { from: attributeSelector('mcLine'), to: 'kbq-line' },
    { from: attributeSelector('mcListIcon'), to: 'kbq-list-icon' }
];

/** Undocumented core exports nothing in the library needed, removed in 21.0.0, with what to do instead. */
const UNUSED_EXPORTS: { symbols: string[]; message: string }[] = [
    {
        symbols: [
            'POSITION_MAP',
            'EXTENDED_OVERLAY_POSITIONS',
            'POSITION_PRIORITY_STRATEGY',
            '\\w+_POSITION_PRIORITY',
            'ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT',
            'SELECT_PANEL_VIEWPORT_PADDING',
            'NUMBER_FORMAT_REGEXP',
            'isWithin'
        ],
        message:
            'The pop-up position lists (`POSITION_MAP`, `EXTENDED_OVERLAY_POSITIONS`, `POSITION_PRIORITY_STRATEGY`, ' +
            'the `*_POSITION_PRIORITY` lists), `ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT`, ' +
            '`SELECT_PANEL_VIEWPORT_PADDING`, `NUMBER_FORMAT_REGEXP` and `isWithin()` are no longer exported: ' +
            'they are implementation details of the pop-ups, the select and the number pipes. Copy the values ' +
            'you need; for a pop-up position, set `kbqPlacement` on the trigger.'
    },
    {
        symbols: ['KBQ_SELECT_SCROLL_STRATEGY_PROVIDER'],
        message:
            '`KBQ_SELECT_SCROLL_STRATEGY_PROVIDER` was removed: `KBQ_SELECT_SCROLL_STRATEGY` has a root default, ' +
            'so drop the provider; to change the strategy, provide `KBQ_SELECT_SCROLL_STRATEGY` itself.'
    },
    {
        symbols: ['KBQ_CHECKABLE_CONTROL_VALUE_ACCESSOR'],
        message:
            '`KBQ_CHECKABLE_CONTROL_VALUE_ACCESSOR` is no longer exported: `KbqCheckable` registers itself as the ' +
            'value accessor, so drop the provider.'
    },
    {
        symbols: ['KbqHover'],
        message:
            '`KbqHover` was removed: bind `(mouseenter)` and `(mouseleave)`, or style `:hover`. Its host class ' +
            '`kbq-hover` forced the hover look of the themes on every host.'
    },
    {
        symbols: ['CanColor'],
        message:
            '`CanColor` was removed: nothing implemented it. Type the member `Signal<KbqComponentColors | string>`, ' +
            'or add `KbqColorDirective` to the host directives.'
    },
    {
        symbols: ['KbqAnimationCurves', 'KbqAnimationDurations'],
        message:
            '`KbqAnimationCurves` and `KbqAnimationDurations` were removed: they timed the `@angular/animations` ' +
            'triggers the library no longer has. Copy the values you need into your own constants.'
    },
    {
        symbols: ['KbqRectangleItem', 'countGroupLabelsBeforeOption'],
        message:
            '`KbqRectangleItem` (left over from the removed navbar-ic) and `countGroupLabelsBeforeOption()` were ' +
            'removed without a replacement: nothing in the library used them.'
    },
    {
        symbols: ['KbqLineSetter'],
        message:
            '`KbqLineSetter` was removed, and a list item no longer gets the `kbq-2-line`, `kbq-3-line` and ' +
            '`kbq-multi-line` classes: no style read them. Count the lines with `KbqListItem.lines`.'
    }
];

// The 20.x classes deriving from `KbqPopUp` or `KbqPopUpTrigger`: a trigger reaches its pop-up through the untyped
// `instance`, so a removed member called there only fails at run time.
const POP_UP_SUBCLASS =
    '\\bextends\\s+(?:KbqPopUp(?:Trigger)?|Kbq(?:Tooltip|Popover(?:Confirm)?|NotificationCenter|AppSwitcher)' +
    '(?:Component|Trigger)|Kbq(?:Title|EllipsisCenter)Directive|KbqPasswordToggle|KbqNavbar(?:Item|Brand)|' +
    'Kbq(?:Timezone)?OptionTooltip)\\b';

// The 20.x pop-up classes, whose `elementRef` is a getter now; a trigger keeps it as a field.
const POP_UP_PANEL_SUBCLASS =
    '\\bextends\\s+(?:KbqPopUp|Kbq(?:Tooltip|Popover(?:Confirm)?|NotificationCenter|AppSwitcher)Component)\\b';

// `elementRef` declared as a field, decorated or not, or as a constructor parameter property.
const ELEMENT_REF_FIELD =
    '(?:^|\\n)\\s*(?:@ViewChild\\s*\\([^)]*\\)\\s*)?(?:(?:public|protected|private|override|readonly|declare)\\s+)*' +
    'elementRef\\s*[!?]?\\s*(?:=(?!=)|:[^;,(){}=]*;)|' +
    '\\b(?:public|protected|private)\\s+(?:readonly\\s+)?elementRef\\s*\\??\\s*:';

// The unprefixed date pipes and their `ImpurePipe` twins, by pipe name and by class name.
const LEGACY_DATE_PIPE =
    '(?:absolute(?:Long|Short)Date(?:Time)?|relative(?:Long|Short)Date(?:Time)?|range(?:Long|Short)Date(?:Time)?|' +
    'rangeMiddleDateTime|duration(?:Shortest|Long|Short))(?:ImpurePipe)?';
const LEGACY_DATE_PIPE_CLASS = '(?:(?:Absolute|Relative|Range|Duration)\\w*Formatter(?:Impure)?Pipe|BaseFormatterPipe)';

/** Deprecated in 21.0.0 for removal in 22.0.0, with what to use instead. */
const DEPRECATED: { pattern: string; message: string }[] = [
    {
        pattern: `(?<!\\|)\\|\\s*${LEGACY_DATE_PIPE}(?![\\w-])|${importedFromCore(LEGACY_DATE_PIPE_CLASS)}`,
        message:
            'The unprefixed date pipes (`absoluteLongDate`…`durationShort`) and their `ImpurePipe` twins are ' +
            'deprecated and will be removed in 22.0.0: use the `kbq*` pipe of the same format with the same ' +
            'arguments, for example `kbqAbsoluteLongDate` (`KbqAbsoluteLongDatePipe`), which follows a locale change.'
    },
    {
        pattern: `(?<!\\|)\\|\\s*mcHighlight(?![\\w-])|${importedFromCore('KbqHighlightPipe')}`,
        message:
            'The `mcHighlight` pipe (`KbqHighlightPipe`) is deprecated and will be removed in 22.0.0: use ' +
            '`kbqHighlightBold` (`KbqHighlightBoldPipe`), which marks the matches the same way.'
    },
    {
        pattern: importedFromCore('(?:isDigit|isBoolean|KbqMeasureScrollbarService)'),
        message:
            '`isDigit()`, `isBoolean()` and `KbqMeasureScrollbarService` from `@koobiq/components/core` are ' +
            "deprecated and will be removed in 22.0.0: use `isNumberKey()`, `typeof value === 'boolean'`, and " +
            '`element.offsetWidth - element.clientWidth` of the element that scrolls.'
    },
    {
        pattern: '\\.getFocusOrigin\\(\\)',
        message:
            '`FocusKeyManager.getFocusOrigin()` is deprecated and will be removed in 22.0.0: keep the origin you ' +
            'pass to `setFocusOrigin()`.'
    },
    {
        // Beside `placeholder` or under `datepicker`: a `KBQ_DATE_FORMATS` object, its replacement, has the key too.
        pattern:
            '\\bdatepicker\\s*:\\s*\\{[^{}]*\\bdateInput\\s*:|\\bplaceholder\\s*:[^{}]*\\bdateInput\\s*:|' +
            '\\bdateInput\\s*:[^{}]*\\bplaceholder\\s*:|\\.datepicker\\??\\.dateInput\\b',
        message:
            '`dateInput` of the datepicker locale configuration is deprecated and will be removed in 22.0.0: ' +
            'nothing reads it. Set the input format through `KBQ_DATE_FORMATS`.'
    }
];

/**
 * Removed in 21.0.0: the `Default` members of `KbqThemeSelector` and `KbqThemeNames`, `KbqDefaultThemes`,
 * `KbqTheme`, the legacy `ThemeService`, `getOptionScrollPosition`, `ThemePalette`, the unused undocumented
 * exports and members with `KbqLineSetter`, and the `mcLine` and `mcListIcon` aliases. Also reports the core API
 * deprecated for removal in 22.0.0.
 */
export const core: AreaData = {
    tsReplacements: [
        ...DEFAULT_ENUM_MEMBERS,
        ...rename('KbqDefaultThemes', 'KBQ_DEFAULT_THEMES'),
        ...rename('KbqTheme', 'KbqThemeConfig'),
        ...THEME_PALETTE
    ],
    templateReplacements: [
        ...DEFAULT_ENUM_MEMBERS,
        ...mcAlias('mcLine', 'kbq-line'),
        ...mcAlias('mcListIcon', 'kbq-list-icon')
    ],
    scssReplacements: MC_SELECTORS,
    warnPatterns: [
        ...UNUSED_EXPORTS.map(({ symbols, message }) => ({
            pattern: importedFromCore(`(?:${symbols.join('|')})`),
            message
        })),
        ...DEPRECATED,
        {
            pattern: '(?<![\\w-])kbq-(?:2|3|multi)-line(?![\\w-])',
            message:
                'A list item no longer gets the `kbq-2-line`, `kbq-3-line` and `kbq-multi-line` classes: style the ' +
                'item by its content instead, for example `.kbq-list-item:has(.kbq-line + .kbq-line)`.'
        },
        {
            pattern: '\\.(?:handleBodyInteraction\\(|isSpecialFormatForRULocale\\(|roundingOptions\\b)',
            message:
                '`KbqPopUp.handleBodyInteraction()` was removed: nothing called it. `isSpecialFormatForRULocale()` ' +
                'and `roundingOptions` of the number pipes are private: configure a pipe through its arguments and ' +
                'the formatters locale configuration.'
        },
        {
            anchor: POP_UP_SUBCLASS,
            pattern:
                '\\b(?:this|super|instance)[!?]?\\.(?:markForCheck\\s*\\(|warning\\b|closeOnInteraction\\b)|' +
                '\\boverride\\s+(?:readonly\\s+)?(?:markForCheck|warning|closeOnInteraction)\\b',
            message:
                '`KbqPopUp.markForCheck()`, `warning` and the protected `closeOnInteraction` were removed. Delete a ' +
                '`markForCheck()` made after `updateClassMap()` or a change of `visibility`: both re-render the ' +
                'pop-up now. After writing a field of its own, a pop-up subclass calls ' +
                '`this.changeDetectorRef.markForCheck()`; a trigger that writes the fields of its pop-up calls ' +
                '`this.instance.detectChanges()`. `warning` did nothing and `closeOnInteraction` only gated the ' +
                'removed `handleBodyInteraction()`: delete them.'
        },
        {
            anchor: POP_UP_PANEL_SUBCLASS,
            pattern: ELEMENT_REF_FIELD,
            message:
                '`KbqPopUp.elementRef` is a protected getter now, so a pop-up subclass that re-declares it as a ' +
                "field, such as `@ViewChild('panel') elementRef`, no longer compiles. Override the getter over a " +
                'signal query instead: ' +
                "`private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');` and " +
                '`override get elementRef(): ElementRef<HTMLElement> { return this.panel(); }`.'
        },
        {
            anchor: '\\bKbqFormElement\\b|["\']kbqFormElement["\']',
            pattern: '\\.isRow\\b',
            message:
                '`KbqFormElement.isRow` was removed: it only reflected the `kbq-form__row` class of the element, ' +
                'so check that class instead.'
        },
        {
            pattern: '\\bKbqTheme\\b',
            message:
                '`KbqTheme` was renamed to `KbqThemeConfig`, which requires `colorScheme` (`light` or `dark`) and ' +
                'has no `selected`: add `colorScheme` to every custom theme and compare a theme with ' +
                '`KbqThemeService.currentTheme()` instead of reading `selected`.'
        },
        {
            pattern: importedFromCore('ThemeService'),
            message:
                '`ThemeService` was removed: inject `KbqThemeService` instead. `current.value` and `getTheme()` ' +
                'become `currentTheme()` (a signal: wrap it in `toObservable()` for a stream), `themes` becomes ' +
                '`themes()` and `setThemes()`, `setTheme(theme)` becomes `setMode(theme.colorScheme)`, or ' +
                '`selectTheme(theme.name)` to pin that theme. `KbqThemeService` applies a theme once injected and ' +
                "starts in `'auto'` mode: set the initial mode with `kbqThemeProvider({ mode })`."
        },
        {
            pattern: importedFromCore('getOptionScrollPosition'),
            message:
                '`getOptionScrollPosition()` was removed. `KbqOption.focus()` scrolls an option into view; for an ' +
                'element of your own, call `kbqFocusAndReveal(element)` from `@koobiq/components/core`.'
        },
        {
            // Every use but the rewritten members and the import specifier itself.
            anchor: importedFromCore('ThemePalette'),
            pattern:
                '\\bThemePalette\\s+as\\b|\\bThemePalette\\b(?!\\s*\\.\\s*(?:Error|Warning|Success)\\b)(?![^{}]*\\}\\s*from\\b)',
            message:
                '`ThemePalette` was removed: use `KbqComponentColors`, which `Error`, `Warning` and `Success` are ' +
                'rewritten to. `Primary`, `Secondary`, `Info` and `Default` matched no style of any component: drop ' +
                'the color, or pick a member of `KbqComponentColors` the component supports. Instead of `Empty`, ' +
                "leave `color` unset: `KbqComponentColors.Empty` is `'empty'`, not `''`. Type a member " +
                '`KbqComponentColors`, and hand a template `KbqComponentColors` instead of the enum.'
        },
        {
            pattern: `\\bexport\\s*(?:type\\s*)?\\{[^}]*\\bThemePalette\\b[^}]*\\}\\s*from\\s*['"]${CORE}['"]`,
            message:
                'A re-export of `ThemePalette` from `@koobiq/components/core` is left as is: the enum was removed, ' +
                'and `KbqComponentColors` has other members and values, so it cannot take the name. Re-export ' +
                '`KbqComponentColors` instead and migrate the files that import `ThemePalette` from here.'
        }
    ]
};

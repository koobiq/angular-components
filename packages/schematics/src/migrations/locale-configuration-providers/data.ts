/**
 * Replacement data for the locale-configuration provider change.
 *
 * Six components used to resolve their strings as
 * `externalConfiguration ?? localeService.getParams(section) ?? DEFAULT`, so a value provided for
 * `KBQ_<X>_CONFIGURATION` won outright over the locale service. They now read the shared
 * `kbqInjectLocaleConfiguration(section, token)` helper, in which the token supplies only the
 * defaults (it gained a `factory`) and the active locale wins, with consumer overrides merged on top
 * from a separate multi token. A plain `{ provide: KBQ_<X>_CONFIGURATION, useValue: … }` therefore
 * stops taking effect in any application that provides `KBQ_LOCALE_SERVICE` — silently, because it
 * still compiles and still injects. `kbq<X>LocaleConfigurationProvider(…)` registers a real override.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
    /**
     * Report only in a file that mentions one of {@link COMPONENT_MENTIONS}. Set on patterns whose shape
     * is common enough to match unrelated code.
     */
    needsComponentMention?: boolean;
}

/** A configuration token whose `useValue` provider entries are rewritten to its override helper. */
export interface MigratedProviderToken {
    /** Configuration token that now carries the defaults only. */
    token: string;
    /** Provider helper that registers an override the locale service cannot outrank. */
    helper: string;
    /** Module both the token and the helper are exported from. */
    from: string;
}

export const MIGRATED_PROVIDER_TOKENS: MigratedProviderToken[] = [
    {
        token: 'KBQ_NAVBAR_LOCALE_CONFIGURATION',
        helper: 'kbqNavbarLocaleConfigurationProvider',
        from: '@koobiq/components/navbar'
    },
    {
        token: 'KBQ_NOTIFICATION_CENTER_LOCALE_CONFIGURATION',
        helper: 'kbqNotificationCenterLocaleConfigurationProvider',
        from: '@koobiq/components/notification-center'
    },
    {
        token: 'KBQ_APP_SWITCHER_LOCALE_CONFIGURATION',
        helper: 'kbqAppSwitcherLocaleConfigurationProvider',
        from: '@koobiq/components/app-switcher'
    },
    {
        token: 'KBQ_SEARCH_EXPANDABLE_LOCALE_CONFIGURATION',
        helper: 'kbqSearchExpandableLocaleConfigurationProvider',
        from: '@koobiq/components/search-expandable'
    },
    {
        token: 'KBQ_DATEPICKER_LOCALE_CONFIGURATION',
        helper: 'kbqDatepickerLocaleConfigurationProvider',
        from: '@koobiq/components/datepicker'
    },
    {
        token: 'KBQ_FILTER_BAR_LOCALE_CONFIGURATION',
        helper: 'kbqFilterBarLocaleConfigurationProvider',
        from: '@koobiq/components/filter-bar'
    },
    {
        token: 'KBQ_SIZE_UNITS_LOCALE_CONFIGURATION',
        helper: 'kbqSizeUnitsLocaleConfigurationProvider',
        from: '@koobiq/components/core'
    }
];

/** The `provide` key of a provider object literal, matched as an identifier or as a string key. */
export const PROVIDE_PROPERTY = 'provide';

/** The only provider shape the helper can take over — it accepts the configuration by value. */
export const VALUE_PROPERTY = 'useValue';

/** Provider shapes that need a human: the helper takes a value, not a factory, a class or an alias. */
export const UNSUPPORTED_PROPERTIES = ['useFactory', 'useClass', 'useExisting'];

/**
 * Substrings that make a file plausibly about one of the six components. The member warnings are
 * property-name based, and `.configuration = …` is far too common a shape to report in a file that never
 * mentions the components the member belongs to.
 */
export const COMPONENT_MENTIONS = [
    'KbqVerticalNavbar',
    'kbq-vertical-navbar',
    'KbqNotificationCenter',
    'kbq-notification-center',
    'kbqNotificationCenterTrigger',
    'KbqAppSwitcher',
    'kbq-app-switcher',
    'kbqAppSwitcher',
    'KbqSearchExpandable',
    'kbq-search-expandable',
    'KbqDatepicker',
    'kbqDatepicker',
    'KbqFilterBar',
    'kbq-filter-bar',
    'KbqTimezoneSelect',
    'kbq-timezone-select',
    'KbqCodeBlock',
    'kbq-code-block',
    'KbqSingleFileUpload',
    'KbqMultipleFileUpload',
    'kbq-single-file-upload',
    'kbq-multiple-file-upload',
    'kbq-file-upload',
    'KbqDataSizePipe',
    'kbqDataSize'
];

export function unsupportedShapeMessage({ token, helper }: MigratedProviderToken, property: string): string {
    return (
        `${token} is now a defaults-only token, so this ${property} provider no longer overrides the ` +
        `active locale. ${helper}() takes the configuration by value — resolve it yourself and pass the ` +
        'result, or keep the provider as it is if changing the defaults only is what you meant.'
    );
}

export function nonArrayProviderMessage({ token, helper }: MigratedProviderToken): string {
    return (
        `${token} is now a defaults-only token, so this provider object no longer overrides the active ` +
        `locale. It is not an element of a provider array, so it was left alone: replace it with ` +
        `${helper}(<value>) by hand — the helper returns a Provider, not an object literal.`
    );
}

export function leftoverTokenMessage({ token, helper }: MigratedProviderToken): string {
    return (
        `${token} now supplies the defaults only — the active locale wins over it, and consumer ` +
        `overrides are registered through ${helper}(). Review this usage: providing the token no longer ` +
        'changes the rendered strings in an application that provides KBQ_LOCALE_SERVICE.'
    );
}

/**
 * Warnings for `.ts` files and templates. Checked against the post-fix content, so they only fire on
 * what the auto-fix could not handle.
 */
export const memberWarnPatterns: WarnPattern[] = [
    {
        pattern: '\\.externalConfiguration\\b',
        message:
            'The externalConfiguration member was removed from KbqVerticalNavbar, KbqNotificationCenterComponent, ' +
            'KbqAppSwitcherComponent, KbqSearchExpandable, KbqDatepickerInput and KbqFilterBar. There is no ' +
            'separate external configuration any more — read `configuration`, which already merges the token ' +
            'defaults, the active locale and every registered override.'
    },
    {
        pattern: '\\.configuration\\s*=(?!=)',
        needsComponentMention: true,
        message:
            'The configuration member of KbqVerticalNavbar, KbqNotificationCenterComponent, ' +
            'KbqAppSwitcherComponent, KbqSearchExpandable, KbqDatepickerInput, KbqTimezoneSelect and ' +
            'KbqFilterBar is a read-only signal. If the receiver is one of them, register the strings with ' +
            'the matching kbq<Component>LocaleConfigurationProvider() instead of assigning to the member.'
    },
    {
        // Both halves are silent: the member kept a name that now means something else, and the getter it
        // replaced returned a value where the signal returns a function.
        pattern: '\\.configuration\\b(?!\\s*[=(])',
        needsComponentMention: true,
        message:
            'The member that carries localized strings is called localeConfiguration everywhere now, and it ' +
            'is a signal rather than a getter over one. On KbqVerticalNavbar, KbqNotificationCenterComponent, ' +
            'KbqAppSwitcherComponent, KbqSearchExpandable, KbqDatepickerInput, KbqFilterBar and ' +
            'KbqFilterBarHost, read localeConfiguration().someString. KbqTimezoneSelect inherits the select ' +
            'section from KbqSelect under that name, so its own section is timezoneLocaleConfiguration().'
    },
    {
        // The alias meant a whole section on some components, a slice on others and a bare string on one.
        pattern: '\\.localeData\\b',
        needsComponentMention: true,
        message:
            'The localeData getter was removed from KbqAppSwitcherComponent, KbqNotificationCenterComponent ' +
            '(and its KbqNotificationCenterPanel contract), KbqSearchExpandable and the filter-bar parts — ' +
            'it aliased the same strings under a name that also means the whole locale. Read ' +
            'localeConfiguration() instead, and the slice you need off it.'
    },
    {
        // Not an auto-fix: the old token carried one flavour's labels flat, while the section is keyed by
        // `single` and `multiple`, so only the author knows which arm a given value belonged to.
        pattern: 'KBQ_FILE_UPLOAD_CONFIGURATION',
        message:
            'KBQ_FILE_UPLOAD_CONFIGURATION was removed. Register the labels with ' +
            'kbqFileUploadLocaleConfigurationProvider({ single: … , multiple: … }) from ' +
            '@koobiq/components/file-upload — it takes the whole fileUpload section, so move the value under ' +
            'the arm it belonged to.'
    },
    {
        pattern: '\\.externalConfig\\b',
        message:
            'The externalConfig member was removed from KbqDataSizePipe. It read KBQ_SIZE_UNITS_LOCALE_CONFIGURATION, which ' +
            'now supplies the defaults only — the active locale wins over it, and overrides go through ' +
            'kbqSizeUnitsLocaleConfigurationProvider().'
    },
    {
        // Both the input and the resolved slice it fed were public, and both are gone.
        pattern: '\\.(?:localeConfig|resolvedLocaleConfig)\\b',
        message:
            'The [localeConfig] input and resolvedLocaleConfig() were removed from ' +
            'KbqSingleFileUploadComponent and KbqMultipleFileUploadComponent — they duplicated the ' +
            'per-instance channel every other component uses. Bind [localeOverrides] keyed by section ' +
            '({ fileUpload: { single: … } }) and read localeConfiguration().single / .multiple.'
    }
];

/**
 * Behaviour note printed once per run. The change is not purely mechanical: the resolution order was
 * inverted, so an application can be affected without ever having provided one of the tokens.
 */
export const BEHAVIOUR_NOTE = [
    'Locale resolution order changed for kbq-vertical-navbar, kbq-notification-center, kbq-app-switcher,',
    'kbq-search-expandable, the datepicker input, kbq-filter-bar, the file upload components and the',
    'kbqDataSize pipe. A KBQ_<X>_CONFIGURATION value used to beat KBQ_LOCALE_SERVICE outright; the token now',
    'supplies the defaults only, the active locale wins, and consumer overrides are merged on top from',
    'kbq<Component>LocaleConfigurationProvider().',
    'An override is now a deep partial: the strings you do not pass keep following the locale instead of',
    'falling back to the Russian defaults.',
    '',
    'Every localized component also accepts the strings as a template binding now:',
    '<kbq-select [localeOverrides]="{ select: { selectAll: … } }" />. Put KbqLocaleOverridesDirective',
    'on an element of your own to scope an override to a whole region.'
];

/** A symbol that changed its name, matched as a whole word in `.ts` and in templates. */
export interface RenamedSymbol {
    from: string;
    to: string;
}

/**
 * Locale symbols renamed to `KBQ_<SECTION>_LOCALE_CONFIGURATION` /
 * `KBQ_<SECTION>_DEFAULT_LOCALE_CONFIGURATION` / `kbq<Section>LocaleConfigurationProvider`, keyed by the
 * locale section rather than by the component. The old names stay as `@deprecated` aliases, so an
 * unmigrated project still compiles; this pass only moves it onto the name the section actually has.
 *
 * The new name is a distinct string in every pair, so a word-boundary rewrite is idempotent and needs no
 * import bookkeeping: the specifier in the import clause is renamed by the same pass.
 */
export const RENAMED_SYMBOLS: RenamedSymbol[] = [
    { from: 'KBQ_DATEPICKER_DEFAULT_CONFIGURATION', to: 'KBQ_DATEPICKER_DEFAULT_LOCALE_CONFIGURATION' },
    { from: 'KBQ_DATEPICKER_CONFIGURATION', to: 'KBQ_DATEPICKER_LOCALE_CONFIGURATION' },
    { from: 'KBQ_FILTER_BAR_DEFAULT_CONFIGURATION', to: 'KBQ_FILTER_BAR_DEFAULT_LOCALE_CONFIGURATION' },
    { from: 'KBQ_FILTER_BAR_CONFIGURATION', to: 'KBQ_FILTER_BAR_LOCALE_CONFIGURATION' },
    {
        from: 'KBQ_SEARCH_EXPANDABLE_DEFAULT_CONFIGURATION',
        to: 'KBQ_SEARCH_EXPANDABLE_DEFAULT_LOCALE_CONFIGURATION'
    },
    { from: 'KBQ_SEARCH_EXPANDABLE_CONFIGURATION', to: 'KBQ_SEARCH_EXPANDABLE_LOCALE_CONFIGURATION' },
    { from: 'KBQ_APP_SWITCHER_DEFAULT_CONFIGURATION', to: 'KBQ_APP_SWITCHER_DEFAULT_LOCALE_CONFIGURATION' },
    { from: 'KBQ_APP_SWITCHER_CONFIGURATION', to: 'KBQ_APP_SWITCHER_LOCALE_CONFIGURATION' },
    {
        from: 'KBQ_NOTIFICATION_CENTER_DEFAULT_CONFIGURATION',
        to: 'KBQ_NOTIFICATION_CENTER_DEFAULT_LOCALE_CONFIGURATION'
    },
    { from: 'KBQ_NOTIFICATION_CENTER_CONFIGURATION', to: 'KBQ_NOTIFICATION_CENTER_LOCALE_CONFIGURATION' },
    { from: 'KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION', to: 'KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION' },
    { from: 'KBQ_VERTICAL_NAVBAR_CONFIGURATION', to: 'KBQ_NAVBAR_LOCALE_CONFIGURATION' },
    { from: 'kbqVerticalNavbarLocaleConfigurationProvider', to: 'kbqNavbarLocaleConfigurationProvider' },
    { from: 'KBQ_TIMEPICKER_DEFAULT_CONFIGURATION', to: 'KBQ_TIMEPICKER_DEFAULT_LOCALE_CONFIGURATION' },
    { from: 'KBQ_TIMEPICKER_CONFIGURATION', to: 'KBQ_TIMEPICKER_LOCALE_CONFIGURATION' },
    { from: 'KBQ_TIMEZONE_DEFAULT_CONFIGURATION', to: 'KBQ_TIMEZONE_DEFAULT_LOCALE_CONFIGURATION' },
    { from: 'KBQ_TIMEZONE_CONFIGURATION', to: 'KBQ_TIMEZONE_LOCALE_CONFIGURATION' },
    { from: 'KBQ_NUMBER_INPUT_DEFAULT_CONFIGURATION', to: 'KBQ_INPUT_DEFAULT_LOCALE_CONFIGURATION' },
    { from: 'KBQ_NUMBER_INPUT_CONFIGURATION', to: 'KBQ_INPUT_LOCALE_CONFIGURATION' },
    { from: 'kbqNumberInputLocaleConfigurationProvider', to: 'kbqInputLocaleConfigurationProvider' },
    { from: 'KBQ_NUMBER_FORMATTERS_LOCALE_CONFIGURATION', to: 'KBQ_FORMATTERS_LOCALE_CONFIGURATION' },
    {
        from: 'kbqNumberFormattersLocaleConfigurationProvider',
        to: 'kbqFormattersLocaleConfigurationProvider'
    },
    { from: 'KBQ_SIZE_UNITS_DEFAULT_CONFIG', to: 'KBQ_SIZE_UNITS_DEFAULT_LOCALE_CONFIGURATION' },
    { from: 'KBQ_SIZE_UNITS_CONFIG', to: 'KBQ_SIZE_UNITS_LOCALE_CONFIGURATION' },
    { from: 'kbqFilesizeFormatterConfigurationProvider', to: 'kbqSizeUnitsLocaleConfigurationProvider' },
    { from: 'KbqFilterBarConfiguration', to: 'KbqFilterBarLocaleConfiguration' },
    { from: 'KbqVerticalNavbarConfiguration', to: 'KbqNavbarLocaleConfiguration' },
    { from: 'KbqAppSwitcherConfiguration', to: 'KbqAppSwitcherLocaleConfiguration' },
    { from: 'KbqClampedTextLocaleConfig', to: 'KbqClampedTextLocaleConfiguration' },
    { from: 'KbqTimeRangeLocaleConfig', to: 'KbqTimeRangeLocaleConfiguration' },
    { from: 'KbqNumberRoundingLocaleConfig', to: 'KbqNumberRoundingLocaleConfiguration' },
    { from: 'KbqNumberInputLocaleConfiguration', to: 'KbqInputNumberLocaleConfiguration' },
    { from: 'KbqNumberInputLocaleConfig', to: 'KbqInputNumberLocaleConfiguration' },
    { from: 'KbqBaseFileUploadLocaleConfig', to: 'KbqBaseFileUploadLocaleConfiguration' },
    { from: 'KbqMultipleFileUploadLocaleConfig', to: 'KbqMultipleFileUploadLocaleConfiguration' },
    { from: 'KbqFileUploadLocaleConfig', to: 'KbqFileUploadLocaleConfiguration' },
    { from: 'kbqInjectKbqClampedLocaleConfiguration', to: 'kbqInjectClampedTextLocaleConfiguration' }
];

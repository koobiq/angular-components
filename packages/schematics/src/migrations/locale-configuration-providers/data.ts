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
        token: 'KBQ_VERTICAL_NAVBAR_CONFIGURATION',
        helper: 'kbqVerticalNavbarLocaleConfigurationProvider',
        from: '@koobiq/components/navbar'
    },
    {
        token: 'KBQ_NOTIFICATION_CENTER_CONFIGURATION',
        helper: 'kbqNotificationCenterLocaleConfigurationProvider',
        from: '@koobiq/components/notification-center'
    },
    {
        token: 'KBQ_APP_SWITCHER_CONFIGURATION',
        helper: 'kbqAppSwitcherLocaleConfigurationProvider',
        from: '@koobiq/components/app-switcher'
    },
    {
        token: 'KBQ_SEARCH_EXPANDABLE_CONFIGURATION',
        helper: 'kbqSearchExpandableLocaleConfigurationProvider',
        from: '@koobiq/components/search-expandable'
    },
    {
        token: 'KBQ_DATEPICKER_CONFIGURATION',
        helper: 'kbqDatepickerLocaleConfigurationProvider',
        from: '@koobiq/components/datepicker'
    },
    {
        token: 'KBQ_FILTER_BAR_CONFIGURATION',
        helper: 'kbqFilterBarLocaleConfigurationProvider',
        from: '@koobiq/components/filter-bar'
    },
    {
        token: 'KBQ_SIZE_UNITS_CONFIG',
        helper: 'kbqFilesizeFormatterConfigurationProvider',
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
        // The getter over the signal is gone, so a read that used to return the strings now returns the
        // signal itself — silently, because every one of these members is read for its properties.
        pattern: '\\.(?:configuration|localeConfiguration)\\b(?!\\s*[=(])',
        needsComponentMention: true,
        message:
            'The configuration member of KbqNotificationCenterComponent, KbqAppSwitcherComponent, ' +
            'KbqSearchExpandable, KbqDatepickerInput, KbqTimezoneSelect and KbqFilterBar became a signal, ' +
            'as it already was on KbqVerticalNavbar — the getter over it is gone. If the receiver is one of ' +
            'them, call it: configuration().someString. The same applies to KbqCodeBlock.localeConfiguration ' +
            'and to KbqFilterBarHost, which pipes and filter-bar sub-components inject.'
    },
    {
        // Not an auto-fix: the old token carried one flavour's labels flat, while the section is keyed by
        // `single` and `multiple`, so only the author knows which arm a given value belonged to.
        pattern: 'KBQ_FILE_UPLOAD_CONFIGURATION',
        message:
            'KBQ_FILE_UPLOAD_CONFIGURATION is no longer read. Register the labels with ' +
            'kbqFileUploadLocaleConfigurationProvider({ single: … , multiple: … }) from ' +
            '@koobiq/components/file-upload — it takes the whole fileUpload section, so move the value under ' +
            'the arm it belonged to. The per-instance [localeConfig] input still works and still wins.'
    },
    {
        pattern: '\\.externalConfig\\b',
        message:
            'The externalConfig member was removed from KbqDataSizePipe. It read KBQ_SIZE_UNITS_CONFIG, which ' +
            'now supplies the defaults only — the active locale wins over it, and overrides go through ' +
            'kbqFilesizeFormatterConfigurationProvider().'
    },
    {
        pattern: '\\.configuration\\b(?!\\s*=)',
        needsComponentMention: true,
        message:
            'The configuration member was removed from KbqSingleFileUploadComponent and ' +
            'KbqMultipleFileUploadComponent. If the receiver is one of them, read resolvedLocaleConfig(), ' +
            'which already merges the defaults, the active locale and every registered override.'
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

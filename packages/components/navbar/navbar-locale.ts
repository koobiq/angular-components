import { InjectionToken, Provider } from '@angular/core';
import {
    KbqDeepPartial,
    kbqLocaleConfigurationOverrideProvider,
    KbqNavbarLocaleConfiguration,
    ruRULocaleData
} from '@koobiq/components/core';

/** default configuration of navbar */
/** @docs-private */
export const KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION: KbqNavbarLocaleConfiguration = ruRULocaleData.navbar;

/** Injection Token for providing configuration of navbar */
/** @docs-private */
export const KBQ_NAVBAR_LOCALE_CONFIGURATION = new InjectionToken<KbqNavbarLocaleConfiguration>(
    'KbqNavbarLocaleConfiguration',
    { factory: () => KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_NAVBAR_LOCALE_CONFIGURATION`. Only the strings you pass are overridden; the
 * rest keep following the active locale.
 */
export const kbqNavbarLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqNavbarLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('navbar', configuration);

/** @deprecated Use {@link KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION}. Will be removed in 22.0.0. */
export const KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION = KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION;
/** @deprecated Use {@link KBQ_NAVBAR_LOCALE_CONFIGURATION}. Will be removed in 22.0.0. */
export const KBQ_VERTICAL_NAVBAR_CONFIGURATION = KBQ_NAVBAR_LOCALE_CONFIGURATION;

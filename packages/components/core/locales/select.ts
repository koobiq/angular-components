import { InjectionToken, Provider } from '@angular/core';
import { KbqDeepPartial } from '../utils';
import { kbqLocaleConfigurationOverrideProvider } from './configuration';
import { ruRULocaleData } from './ru-RU';
import { KbqSelectLocaleConfiguration } from './types';

/** Default localized strings shared by the select-like components. */
export const KBQ_SELECT_DEFAULT_LOCALE_CONFIGURATION: KbqSelectLocaleConfiguration = ruRULocaleData.select;

/**
 * Localization configuration provider for the select-like components.
 *
 * Lives in `core` rather than in `@koobiq/components/select` because three packages that do not depend on
 * one another read this section: `KbqSelect`, `KbqTreeSelect` and `KbqTreeSelection` (the last one also
 * standalone, outside a tree-select).
 */
export const KBQ_SELECT_LOCALE_CONFIGURATION = new InjectionToken<KbqSelectLocaleConfiguration>(
    'KbqSelectLocaleConfiguration',
    { factory: () => KBQ_SELECT_DEFAULT_LOCALE_CONFIGURATION }
);

/**
 * Utility provider. Only the strings you pass are overridden; the rest keep following the active locale.
 *
 * @see KBQ_SELECT_LOCALE_CONFIGURATION
 */
export const kbqSelectLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqSelectLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('select', configuration);

import { InjectionToken, Provider, Signal } from '@angular/core';
import { KbqDeepPartial } from '../utils';
import { kbqInjectLocaleConfiguration, kbqLocaleConfigurationOverrideProvider } from './configuration';
import { ruRULocaleData } from './ru-RU';
import { KbqA11yLocaleConfiguration } from './types';

/** Localization configuration provider for the accessible names of built-in icon-only buttons. */
export const KBQ_A11Y_LOCALE_CONFIGURATION = new InjectionToken<KbqA11yLocaleConfiguration>(
    'KbqA11yLocaleConfiguration',
    {
        factory: () => ruRULocaleData.a11y
    }
);

/**
 * Utility provider. Only the names you pass are overridden; the rest keep following the active locale.
 *
 * @see KBQ_A11Y_LOCALE_CONFIGURATION
 */
export const kbqA11yLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqA11yLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('a11y', configuration);

/**
 * Injection function that creates a reactive locale configuration signal with the accessible names
 * of the icon-only buttons the library renders itself.
 *
 * @docs-private
 */
export function kbqInjectA11yLocaleConfiguration(): Signal<KbqA11yLocaleConfiguration> {
    return kbqInjectLocaleConfiguration('a11y', KBQ_A11Y_LOCALE_CONFIGURATION);
}

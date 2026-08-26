import { InjectionToken, Provider, Signal } from '@angular/core';
import { KbqDeepPartial } from '../utils';
import { kbqInjectLocaleConfiguration, kbqLocaleConfigurationOverrideProvider } from './configuration';
import { ruRULocaleData } from './ru-RU';
import { KbqPopoverConfirmLocaleConfiguration } from './types';

/** Localization configuration provider for the default strings of a confirmation popover. */
export const KBQ_POPOVER_CONFIRM_LOCALE_CONFIGURATION = new InjectionToken<KbqPopoverConfirmLocaleConfiguration>(
    'KbqPopoverConfirmLocaleConfiguration',
    {
        factory: () => ruRULocaleData.popoverConfirm
    }
);

/**
 * Utility provider. Only the strings you pass are overridden; the rest keep following the active locale.
 *
 * @see KBQ_POPOVER_CONFIRM_LOCALE_CONFIGURATION
 */
export const kbqPopoverConfirmLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqPopoverConfirmLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('popoverConfirm', configuration);

/**
 * Injection function that creates a reactive locale configuration signal with the default strings of a
 * confirmation popover.
 *
 * @docs-private
 */
export function kbqInjectPopoverConfirmLocaleConfiguration(): Signal<KbqPopoverConfirmLocaleConfiguration> {
    return kbqInjectLocaleConfiguration('popoverConfirm', KBQ_POPOVER_CONFIRM_LOCALE_CONFIGURATION);
}

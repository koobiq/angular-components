import { inject, InjectionToken, Provider, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { KBQ_LOCALE_SERVICE } from './locale-service';
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
 * Utility provider.
 * @see KBQ_POPOVER_CONFIRM_LOCALE_CONFIGURATION
 */
export const kbqPopoverConfirmLocaleConfigurationProvider = (
    configuration: KbqPopoverConfirmLocaleConfiguration
): Provider => ({
    provide: KBQ_POPOVER_CONFIRM_LOCALE_CONFIGURATION,
    useValue: configuration
});

/**
 * Injection function that creates a reactive locale configuration signal with the default strings of a
 * confirmation popover.
 *
 * @docs-private
 */
export function kbqInjectPopoverConfirmLocaleConfiguration(): Signal<KbqPopoverConfirmLocaleConfiguration> {
    const localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    const initialValue = inject(KBQ_POPOVER_CONFIRM_LOCALE_CONFIGURATION);
    const configuration = localeService
        ? localeService.changes.pipe(
              // Custom locale data registered through `KBQ_LOCALE_DATA`/`addLocale` may predate this
              // section; falling back keeps the confirmation popover rendering its defaults instead of
              // throwing on an undefined configuration.
              map<string, KbqPopoverConfirmLocaleConfiguration>(
                  () => localeService.getParams('popoverConfirm') ?? initialValue
              )
          )
        : of(initialValue);

    return toSignal(configuration, { initialValue });
}

import { inject, InjectionToken, Provider, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { KBQ_LOCALE_SERVICE } from './locale-service';
import { ruRULocaleData } from './ru-RU';
import { KbqA11yLocaleConfiguration } from './types';

/** Localization configuration for the accessible names of the icon-only buttons the library renders itself. */
export const KBQ_A11Y_LOCALE_CONFIGURATION = new InjectionToken<KbqA11yLocaleConfiguration>(
    'KBQ_A11Y_LOCALE_CONFIGURATION',
    { factory: () => ruRULocaleData.a11y }
);

/** Utility provider for `KBQ_A11Y_LOCALE_CONFIGURATION`. */
export const kbqA11yLocaleConfigurationProvider = (configuration: KbqA11yLocaleConfiguration): Provider => ({
    provide: KBQ_A11Y_LOCALE_CONFIGURATION,
    useValue: configuration
});

/**
 * Reactive accessible names for the icon-only buttons the library renders itself.
 *
 * Follows `KbqLocaleService` when one is provided, and otherwise stays on whatever
 * `KBQ_A11Y_LOCALE_CONFIGURATION` resolves to.
 *
 * @docs-private
 */
export function kbqInjectA11yLocaleConfiguration(): Signal<KbqA11yLocaleConfiguration> {
    const localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    const initialValue = inject(KBQ_A11Y_LOCALE_CONFIGURATION);
    const configuration = localeService
        ? localeService.changes.pipe(
              map<string, KbqA11yLocaleConfiguration>(
                  () => localeService.getParams('a11y') satisfies KbqA11yLocaleConfiguration
              )
          )
        : of(initialValue);

    return toSignal(configuration, { initialValue });
}

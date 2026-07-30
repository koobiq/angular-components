import { inject, InjectionToken, Provider, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { KBQ_LOCALE_SERVICE } from './locale-service';
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
 * Utility provider.
 * @see KBQ_A11Y_LOCALE_CONFIGURATION
 */
export const kbqA11yLocaleConfigurationProvider = (configuration: KbqA11yLocaleConfiguration): Provider => ({
    provide: KBQ_A11Y_LOCALE_CONFIGURATION,
    useValue: configuration
});

/**
 * Injection function that creates a reactive locale configuration signal with the accessible names
 * of the icon-only buttons the library renders itself.
 *
 * @docs-private
 */
export function kbqInjectKbqA11yLocaleConfiguration(): Signal<KbqA11yLocaleConfiguration> {
    const localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    const initialValue = inject(KBQ_A11Y_LOCALE_CONFIGURATION);
    const configuration = localeService
        ? localeService.changes.pipe(
              // Custom locale data registered through `KBQ_LOCALE_DATA`/`addLocale` may predate this
              // section; falling back keeps the close buttons of modal, popover and sidepanel
              // rendering instead of throwing on an undefined configuration.
              map<string, KbqA11yLocaleConfiguration>(() => localeService.getParams('a11y') ?? initialValue)
          )
        : of(initialValue);

    return toSignal(configuration, { initialValue });
}

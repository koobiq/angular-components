import { inject, InjectionToken, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { KBQ_LOCALE_SERVICE } from './locale-service';
import { KbqLocaleData, KbqLocaleSection } from './types';

/**
 * Reactive localized strings for one section of the active locale.
 *
 * Follows `KBQ_LOCALE_SERVICE` when the application provides one, and otherwise resolves `token` — which
 * is also where a consumer's `kbq<X>LocaleConfigurationProvider(...)` lands. Being a signal is what makes
 * a runtime `setLocale()` reach `OnPush` children that render these strings: they register the read on
 * their own view, which a subscription in the parent could never do for them.
 *
 * @param section Section of the locale data to read.
 * @param token Configuration token, whose factory supplies the default strings.
 */
export function kbqInjectLocaleConfiguration<K extends KbqLocaleSection>(
    section: K,
    token: InjectionToken<KbqLocaleData[K]>
): Signal<KbqLocaleData[K]> {
    const localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    const initialValue = inject(token);
    const configuration = localeService
        ? localeService.changes.pipe(map(() => localeService.getParams(section) ?? initialValue))
        : of(initialValue);

    return toSignal(configuration, { initialValue });
}

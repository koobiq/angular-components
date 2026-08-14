import { inject, InjectionToken, Provider, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { kbqDeepMerge, KbqDeepPartial } from '../utils';
import { KBQ_LOCALE_SERVICE } from './locale-service';
import { KbqLocaleData, KbqLocaleSection, KbqPartialLocaleData } from './types';

/**
 * Consumer overrides of individual locale sections, contributed by every
 * `kbq<Component>LocaleConfigurationProvider`.
 *
 * `multi` because overriding several sections in one `providers` array is the common case: a single-value
 * token would let the last provider silently drop every other one.
 *
 * @docs-private
 */
// The annotation is load-bearing: `KbqPartialLocaleData` resolves to a conditional type, which TypeScript
// evaluates when emitting an unannotated declaration — inlining 250 lines of expanded shape into the
// public API report.
export const KBQ_LOCALE_CONFIGURATION_OVERRIDES: InjectionToken<KbqPartialLocaleData[]> = new InjectionToken<
    KbqPartialLocaleData[]
>('KBQ_LOCALE_CONFIGURATION_OVERRIDES');

/**
 * Registers a partial override of one locale section.
 *
 * Backs every `kbq<Component>LocaleConfigurationProvider`. The override is applied on top of the active
 * locale rather than replacing it, so the keys it does not mention keep following `setLocale()`.
 *
 * @param section Section of the locale data to override.
 * @param configuration Strings to override; every key is optional at every depth.
 */
export const kbqLocaleConfigurationOverrideProvider = <K extends KbqLocaleSection>(
    section: K,
    configuration: KbqDeepPartial<KbqLocaleData[K]>
): Provider => ({
    provide: KBQ_LOCALE_CONFIGURATION_OVERRIDES,
    // A computed key widens to an index signature, and `section` is the type parameter itself — this is the
    // single place that has to assert the shape, in exchange for a precisely typed call site.
    useValue: { [section]: configuration } as KbqPartialLocaleData,
    multi: true
});

/**
 * Reactive localized strings for one section of the active locale.
 *
 * Follows `KBQ_LOCALE_SERVICE` when the application provides one, and otherwise resolves `token`, whose
 * factory supplies the default strings. Overrides registered through
 * {@link kbqLocaleConfigurationOverrideProvider} are merged on top of whichever of the two applies. Being a
 * signal is what makes a runtime `setLocale()` reach `OnPush` children that render these strings: they
 * register the read on their own view, which a subscription in the parent could never do for them.
 *
 * @param section Section of the locale data to read.
 * @param token Configuration token, whose factory supplies the default strings.
 */
export function kbqInjectLocaleConfiguration<K extends KbqLocaleSection>(
    section: K,
    token: InjectionToken<KbqLocaleData[K]>
): Signal<KbqLocaleData[K]> {
    const localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    const overrides = inject(KBQ_LOCALE_CONFIGURATION_OVERRIDES, { optional: true }) || [];
    const defaultValue = inject(token);
    // `kbqDeepMerge` returns its base untouched when a patch adds nothing, so an unoverridden section stays
    // referentially identical to the data the locale service holds.
    const withOverrides = (configuration: KbqLocaleData[K]): KbqLocaleData[K] =>
        overrides.reduce((result, override) => kbqDeepMerge(result, override[section]), configuration);
    const initialValue = withOverrides(defaultValue);
    const configuration = localeService
        ? localeService.changes.pipe(map(() => withOverrides(localeService.getParams(section) ?? defaultValue)))
        : of(initialValue);

    return toSignal(configuration, { initialValue });
}

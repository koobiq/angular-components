import { computed, Directive, forwardRef, inject, InjectionToken, input, InputSignal, Signal } from '@angular/core';
import { kbqDeepMerge } from '../utils';
import { KbqPartialLocaleData } from './types';

/**
 * Element-level source of localized strings, resolved by {@link kbqInjectLocaleConfiguration}.
 *
 * A narrow token rather than the directive class, so that the reader depends only on the resolved
 * configuration and not on the carrier that happened to supply it.
 *
 * @docs-private
 */
export interface KbqLocaleConfigurationHost {
    /** Own configuration merged over every ancestor carrier's. */
    readonly resolvedConfiguration: Signal<KbqPartialLocaleData>;
}

/** @docs-private */
export const KBQ_LOCALE_CONFIGURATION_HOST = new InjectionToken<KbqLocaleConfigurationHost>(
    'KBQ_LOCALE_CONFIGURATION_HOST'
);

/**
 * Overrides localized strings for one element and its subtree, as a template binding.
 *
 * The provider helpers — `kbqSelectLocaleConfigurationProvider` and its siblings — can only be attached to
 * an injector, so scoping an override to a single component instance means owning a component boundary.
 * This directive is the per-instance counterpart: every localized component applies it through
 * `hostDirectives` and exposes it as `localeConfiguration`, and it can also be placed on any element of
 * your own to scope an override to a whole region.
 *
 * Only the keys you pass are overridden; everything else keeps following the active locale.
 */
@Directive({
    selector: '[kbqLocaleConfiguration]',
    providers: [
        { provide: KBQ_LOCALE_CONFIGURATION_HOST, useExisting: forwardRef(() => KbqLocaleConfigurationDirective) }
    ],
    exportAs: 'kbqLocaleConfiguration'
})
export class KbqLocaleConfigurationDirective implements KbqLocaleConfigurationHost {
    /**
     * Localized strings for this element and its subtree, keyed by locale section. Every key is optional at
     * every depth.
     */
    // The annotation is load-bearing, for the reason given at `KBQ_LOCALE_CONFIGURATION_OVERRIDES`.
    readonly configuration: InputSignal<KbqPartialLocaleData | undefined> = input<KbqPartialLocaleData | undefined>(
        undefined,
        { alias: 'kbqLocaleConfiguration' }
    );

    // Angular resolves an element-injector token from the nearest node that holds it and never merges the
    // levels above — the same trap `kbqLocaleConfigurationOverrideProvider` works around for its `multi`
    // token. Without re-merging the ancestor here, a carrier on a nested component would hide an outer
    // carrier from that whole subtree.
    private readonly parent = inject(KBQ_LOCALE_CONFIGURATION_HOST, { skipSelf: true, optional: true });

    readonly resolvedConfiguration: Signal<KbqPartialLocaleData> = computed(() =>
        kbqDeepMerge(this.parent?.resolvedConfiguration() ?? {}, this.configuration())
    );
}

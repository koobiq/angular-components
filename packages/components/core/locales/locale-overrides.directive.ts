import {
    computed,
    Directive,
    forwardRef,
    inject,
    InjectionToken,
    Injector,
    input,
    InputSignal,
    runInInjectionContext,
    Signal
} from '@angular/core';
import { kbqDeepMerge } from '../utils';
import { KBQ_LOCALE_OVERRIDES_HOST, kbqInjectLocaleConfiguration, KbqLocaleOverridesHost } from './configuration';
import { KbqLocaleData, KbqLocaleSection, KbqPartialLocaleData } from './types';

/**
 * Overrides localized strings for one element and its subtree, as a template binding.
 *
 * The provider helpers — `kbqSelectLocaleConfigurationProvider` and its siblings — can only be attached to
 * an injector, so scoping an override to a single component instance means owning a component boundary.
 * This directive is the per-instance counterpart: every localized component applies it through
 * `hostDirectives` and exposes it as `localeOverrides`, and it can also be placed on any element of your
 * own to scope an override to a whole region.
 *
 * It is also the read side: a component that applies it takes its own strings from {@link read}, so the
 * overrides and the strings they are supposed to override can never come apart. The two directions keep
 * separate names — `[localeOverrides]` writes a partial, `localeConfiguration()` reads the resolved whole.
 *
 * Only the keys you pass are overridden; everything else keeps following the active locale.
 *
 * The `hostDirectives` entry is spelled out in every component rather than shared as a const on purpose:
 * Angular resolves `hostDirectives` with the partial evaluator, and a component in another entry point
 * resolves this package through the built `index.d.ts`, where a const is a declaration without an
 * initializer — `NG1010: Host directive reference must be a class`.
 */
@Directive({
    selector: '[kbqLocaleOverrides]',
    providers: [
        { provide: KBQ_LOCALE_OVERRIDES_HOST, useExisting: forwardRef(() => KbqLocaleOverridesDirective) }
    ],
    exportAs: 'kbqLocaleOverrides'
})
export class KbqLocaleOverridesDirective implements KbqLocaleOverridesHost {
    /**
     * Localized strings for this element and its subtree, keyed by locale section. Every key is optional at
     * every depth.
     */
    // The annotation is load-bearing, for the reason given at `KBQ_LOCALE_CONFIGURATION_OVERRIDES`.
    readonly overrides: InputSignal<KbqPartialLocaleData | undefined> = input<KbqPartialLocaleData | undefined>(
        undefined,
        { alias: 'kbqLocaleOverrides' }
    );

    // Angular resolves an element-injector token from the nearest node that holds it and never merges the
    // levels above — the same trap `kbqLocaleConfigurationOverrideProvider` works around for its `multi`
    // token. Without re-merging the ancestor here, a carrier on a nested component would hide an outer
    // carrier from that whole subtree.
    private readonly parent = inject(KBQ_LOCALE_OVERRIDES_HOST, { skipSelf: true, optional: true });

    private readonly injector = inject(Injector);

    // One signal per token: a public method invites repeated calls, and each of them would otherwise open
    // a subscription of its own, living until the view is destroyed.
    private readonly sections = new Map<InjectionToken<unknown>, Signal<unknown>>();

    readonly resolvedOverrides: Signal<KbqPartialLocaleData> = computed(() =>
        kbqDeepMerge(this.parent?.resolvedOverrides() ?? {}, this.overrides())
    );

    /**
     * Reactive localized strings for one section, resolved against this carrier and every ancestor of it.
     *
     * The counterpart of {@link kbqInjectLocaleConfiguration} for a component that carries this directive:
     * the carrier is `this` rather than a token lookup, so a component cannot read a section it has no
     * `[localeOverrides]` binding for. Sources are merged in the order the localization guide documents,
     * and repeated calls with the same token return the same signal.
     *
     * @param section Section of the locale data to read.
     * @param token Configuration token, whose factory supplies the default strings.
     */
    read<K extends KbqLocaleSection>(section: K, token: InjectionToken<KbqLocaleData[K]>): Signal<KbqLocaleData[K]> {
        if (!this.sections.has(token)) {
            // Own injector rather than the caller's: the two are the same node injector, and taking it
            // from here is what lets the method be called outside an injection context.
            this.sections.set(
                token,
                runInInjectionContext(this.injector, () => kbqInjectLocaleConfiguration(section, token))
            );
        }

        return this.sections.get(token) as Signal<KbqLocaleData[K]>;
    }
}

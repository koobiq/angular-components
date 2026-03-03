import { inject, InjectionToken, Provider, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqClampedTextLocaleConfig, ruRULocaleData } from '@koobiq/components/core';
import { map, of } from 'rxjs';

/**
 * Default maximum number of visible rows for the clamped text component
 * before truncation and the "collapse/expand" toggle is shown.
 */
export const kbqClampedTextDefaultMaxRows = 5;

/** Localization configuration provider. */
export const KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION = new InjectionToken<KbqClampedTextLocaleConfig>(
    'KbqClampedTextLocaleConfig',
    {
        factory: () => ruRULocaleData.clampedText
    }
);

/**
 * Utility provider.
 * @see KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION
 */
export const kbqClampedTextLocaleConfigurationProvider = (configuration: KbqClampedTextLocaleConfig): Provider => ({
    provide: KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION,
    useValue: configuration
});

export const KbqClampedRoot = new InjectionToken<KbqClamped>('KbqClampedRoot');

export interface KbqClamped {
    /**
     * Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = auto.
     * Behavior for auto may vary according to clamped-list/clamped-text
     */
    isCollapsed: Signal<boolean | undefined>;
    /** Whether the toggle trigger should be shown. */
    hasToggle: Signal<boolean>;
    /** Reactive locale strings for open/close labels. */
    localeConfiguration: Signal<KbqClampedTextLocaleConfig>;
    /** Toggles the collapsed state of the list. Stops event propagation. */
    toggleIsCollapsed(event: Event): void;
}

/**
 * Injection function that creates a reactive locale configuration signal.
 * @see {KbqClampedText, KbqClampedList}
 * @docs-private
 */
export function injectKbqClampedLocaleConfiguration(): Signal<KbqClampedTextLocaleConfig> {
    const localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    const initialValue = inject(KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION);
    const config = localeService
        ? localeService.changes.pipe(
              map<string, KbqClampedTextLocaleConfig>(
                  () => localeService.getParams('clampedText') satisfies KbqClampedTextLocaleConfig
              )
          )
        : of(initialValue);

    return toSignal(config, { initialValue });
}

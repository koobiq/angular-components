import { InjectionToken, Provider, Signal } from '@angular/core';
import { KbqClampedTextLocaleConfig, ruRULocaleData } from '@koobiq/components/core';

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
    /** Toggles the collapsed state of the list. Stops event propagation. */
    toggleIsCollapsed(event: Event): void;
}

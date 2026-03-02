import { InjectionToken, InputSignal, OutputEmitterRef, Provider, Signal } from '@angular/core';
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

export interface KbqClamped<T = any> {
    /** Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = auto. model */
    isCollapsed: InputSignal<boolean | undefined>;

    /** Emits when collapsed state changes. Used for two-way binding with `isCollapsed`. */
    isCollapsedChange: OutputEmitterRef<boolean>;

    /** count of hidden items */
    exceededItemCount: Signal<T>;
}

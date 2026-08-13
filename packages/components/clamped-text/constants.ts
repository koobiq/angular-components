import { InjectionToken, Provider, Signal } from '@angular/core';
import {
    KbqClampedTextLocaleConfiguration,
    KbqDeepPartial,
    kbqInjectLocaleConfiguration,
    ruRULocaleData
} from '@koobiq/components/core';

/**
 * Default maximum number of visible rows for the clamped text component
 * before truncation and the "collapse/expand" toggle is shown.
 */
export const kbqClampedTextDefaultMaxRows = 5;

/** Localization configuration provider. */
export const KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION = new InjectionToken<KbqClampedTextLocaleConfiguration>(
    'KbqClampedTextLocaleConfig',
    {
        factory: () => ruRULocaleData.clampedText
    }
);

/**
 * Utility provider. Only the strings you pass are overridden; the rest keep their `ru-RU` defaults.
 *
 * @see KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION
 */
export const kbqClampedTextLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqClampedTextLocaleConfiguration>
): Provider => ({
    provide: KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION,
    useValue: { ...ruRULocaleData.clampedText, ...configuration }
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
    localeConfiguration: Signal<KbqClampedTextLocaleConfiguration>;
    /** Toggles the collapsed state of the list. Stops event propagation. */
    toggle(event: Event): void;
}

/**
 * Injection function that creates a reactive locale configuration signal.
 * @see {KbqClampedText, KbqClampedList}
 * @docs-private
 */
export function kbqInjectClampedTextLocaleConfiguration(): Signal<KbqClampedTextLocaleConfiguration> {
    return kbqInjectLocaleConfiguration('clampedText', KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION);
}

/**
 * @deprecated Use {@link kbqInjectClampedTextLocaleConfiguration}.
 * @docs-private
 */
export const kbqInjectKbqClampedLocaleConfiguration = kbqInjectClampedTextLocaleConfiguration;

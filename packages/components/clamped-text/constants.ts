/**
 * `KbqClampedText` and `KbqClampedList` are documented as two components but ship from one entry
 * point on purpose: they share the `KbqClampedRoot` contract below, the `KbqClampedListTrigger`
 * that drives it and a single `clampedText` locale section. Splitting them would duplicate all
 * three across two packages for no consumer-visible gain.
 */
import { InjectionToken, Provider, Signal } from '@angular/core';
import {
    KbqClampedTextLocaleConfiguration,
    KbqDeepPartial,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
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
 * Utility provider. Only the strings you pass are overridden; the rest keep following the active locale.
 *
 * @see KBQ_CLAMPED_TEXT_LOCALE_CONFIGURATION
 */
export const kbqClampedTextLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqClampedTextLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('clampedText', configuration);

/**
 * Token the clamped containers of this package provide themselves under, so that
 * `KbqClampedListTrigger` can drive whichever of them it is projected into without naming a
 * concrete class.
 */
export const KbqClampedRoot = new InjectionToken<KbqClamped>('KbqClampedRoot');

/** Contract a clamped container exposes to `KbqClampedListTrigger`. */
export interface KbqClamped {
    /**
     * Collapsed state: `true` = collapsed, `false` = expanded, `undefined` = auto.
     * Behavior for auto may vary according to clamped-list/clamped-text
     */
    isCollapsed: Signal<boolean | undefined>;
    /** Whether the toggle trigger should be shown. */
    hasToggle: Signal<boolean>;
    /** Id of the region the trigger expands and collapses, published as its `aria-controls`. */
    contentId: string;
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

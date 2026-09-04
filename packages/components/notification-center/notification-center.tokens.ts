import { InjectionToken, Provider } from '@angular/core';
import {
    KbqDeepPartial,
    KbqNotificationCenterLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    ruRULocaleData
} from '@koobiq/components/core';

/** Default configuration of notification-center. */
export const KBQ_NOTIFICATION_CENTER_DEFAULT_CONFIGURATION: KbqNotificationCenterLocaleConfiguration =
    ruRULocaleData.notificationCenter;

/** Injection Token for providing configuration of notification-center. */
export const KBQ_NOTIFICATION_CENTER_CONFIGURATION = new InjectionToken<KbqNotificationCenterLocaleConfiguration>(
    'KbqNotificationCenterConfiguration',
    { factory: () => KBQ_NOTIFICATION_CENTER_DEFAULT_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_NOTIFICATION_CENTER_CONFIGURATION`. Only the strings you pass are overridden; the
 * rest keep following the active locale.
 */
export const kbqNotificationCenterLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqNotificationCenterLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('notificationCenter', configuration);

/** The panel members a rendered notification item depends on. */
export interface KbqNotificationCenterPanel {
    /** Localized strings of the panel. */
    readonly localeData: KbqNotificationCenterLocaleConfiguration;
    /** Moves focus to a control that survives the removal, once the delete button has unmounted. */
    restoreFocusAfterRemove(): void;
}

/**
 * Narrow contract a `kbq-notification-item` consumes from the panel that renders it, instead of
 * injecting the panel component itself.
 */
export const KBQ_NOTIFICATION_CENTER_PANEL = new InjectionToken<KbqNotificationCenterPanel>(
    'KbqNotificationCenterPanel'
);

import { InjectionToken, Provider } from '@angular/core';
import { EventListenerArgs, EventListeners, InitializationTarget, PartialOptions } from 'overlayscrollbars';

export type KbqScrollbarEvents = EventListeners;
export type KbqScrollbarEventListenerArgs = EventListenerArgs;
export type KbqScrollbarOptions = PartialOptions;
export type KbqScrollbarTarget = InitializationTarget;

export const KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG: KbqScrollbarOptions = {
    scrollbars: {
        /* scrolling behavior when moving the mouse outside the scrollbar area. */
        autoHide: 'leave',
        autoHideDelay: 100
    }
};

export const KBQ_SCROLLBAR_CONFIG = new InjectionToken<KbqScrollbarOptions>('KBQ_SCROLLBAR_CONFIG');

/** Default scroll behavior */
export const KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER: Provider = {
    provide: KBQ_SCROLLBAR_CONFIG,
    useValue: KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG
};

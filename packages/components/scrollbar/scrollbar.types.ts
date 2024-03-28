import {
    EventListeners,
    EventListenerArgs,
    InitializationTarget,
    PartialOptions
} from 'overlayscrollbars';
import { InjectionToken, Provider } from '@angular/core';

export type KbqScrollbarEvents = EventListeners;
export type KbqScrollbarEventListenerArgs = EventListenerArgs;
export type KbqScrollbarOptions = PartialOptions;
export type KbqScrollbarTarget = InitializationTarget;

export const KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG: KbqScrollbarOptions = {
    scrollbars: {
        autoHide: 'leave',
        autoHideDelay: 100
    }
}

export const KBQ_SCROLLBAR_CONFIG = new InjectionToken<KbqScrollbarOptions>('KBQ_SCROLLBAR_CONFIG');

/** Default scroll behavior */
export const KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER: Provider = {
    provide: KBQ_SCROLLBAR_CONFIG, useValue: KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG
};

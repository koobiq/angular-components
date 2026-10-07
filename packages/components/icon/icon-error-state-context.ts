import { InjectionToken, Provider, Signal } from '@angular/core';

/**
 * Narrow contract that lets `KbqIcon` react to a host's error state (e.g. `autoColor`) without
 * depending on the host's concrete class.
 * @docs-private
 */
export interface KbqIconErrorStateContext {
    /** Whether the host is currently in an error state. */
    readonly errorState: Signal<boolean>;
}

/**
 * Injection token used by `KbqIcon` to look up its `KbqIconErrorStateContext`.
 * @docs-private
 */
export const KBQ_ICON_ERROR_STATE_CONTEXT = new InjectionToken<KbqIconErrorStateContext>('KbqIconErrorStateContext');

/**
 * Utility provider for `KBQ_ICON_ERROR_STATE_CONTEXT`, built from a factory that resolves the current host's `KbqIconErrorStateContext`.
 * @docs-private
 */
export const kbqIconErrorStateContextFactoryProvider = (factory: () => KbqIconErrorStateContext): Provider => ({
    provide: KBQ_ICON_ERROR_STATE_CONTEXT,
    useFactory: factory
});

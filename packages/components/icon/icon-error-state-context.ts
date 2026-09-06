import { InjectionToken, Provider } from '@angular/core';
import type { Observable } from 'rxjs';

/**
 * Narrow contract that lets `KbqIcon` react to a host's error state (e.g. `autoColor`) without
 * depending on the host's concrete class.
 * @docs-private
 */
export interface KbqIconErrorStateContext {
    /** Whether the host is currently in an error state. */
    readonly errorState: boolean;
    /** Emits whenever the host's state changes, prompting `KbqIcon` to re-check `errorState`. */
    readonly stateChanges: Observable<void>;
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

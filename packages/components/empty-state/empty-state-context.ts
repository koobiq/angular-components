import { InjectionToken, Signal } from '@angular/core';

/** The part of `kbq-empty-state` its projected slots follow. */
export interface KbqEmptyStateContext {
    /** Whether the empty state renders in the error color. */
    readonly errorColor: Signal<boolean>;
}

/**
 * Injection token a projected slot uses to follow the empty state it belongs to.
 *
 * Internal wiring, kept out of `public-api.ts`: a slot only works inside the component that provides
 * this, so nothing outside the entry point has a reason to inject or re-provide it. The interface
 * above is exported, because `KbqEmptyState` implements it in its public signature.
 *
 * @docs-private
 */
export const KBQ_EMPTY_STATE_CONTEXT = new InjectionToken<KbqEmptyStateContext>('KBQ_EMPTY_STATE_CONTEXT');

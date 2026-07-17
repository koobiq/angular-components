import { Platform } from '@angular/cdk/platform';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';

/** A snapshot of a single accordion item's persisted state. */
export interface KbqAccordionItemSnapshot {
    /** Whether the item is expanded. */
    expanded: boolean;
    /** The item's value. */
    value: string;
}

/** The persisted state of an accordion, keyed by accordion item id. */
export interface KbqAccordionState {
    [itemId: string]: KbqAccordionItemSnapshot;
}

/**
 * Strategy used by `KbqAccordion` to persist and restore the expanded state of its items
 * while `useStateSaving` is enabled.
 *
 * Provide a custom implementation through the `KBQ_ACCORDION_STATE_STORE` token to change
 * where the state is stored (e.g. `sessionStorage`, a backend, or an in-memory map).
 */
export interface KbqAccordionStateStore {
    /** Returns the previously saved state for the given key, or `null` when nothing is stored/available. */
    getState(key: string): KbqAccordionState | null;
    /** Persists the state for the given key. */
    setState(key: string, state: KbqAccordionState): void;
}

/**
 * Default `KbqAccordionStateStore` implementation backed by `localStorage`.
 *
 * All access is guarded so it is safe on the server (SSR) and in environments where storage
 * throws on access (private mode, sandboxed iframes) or contains corrupt JSON.
 */
@Injectable({ providedIn: 'root' })
export class KbqAccordionLocalStorageStateStore implements KbqAccordionStateStore {
    private readonly isBrowser = inject(Platform).isBrowser;
    private readonly window = inject(KBQ_WINDOW);

    getState(key: string): KbqAccordionState | null {
        if (!this.isBrowser) return null;

        try {
            const raw = this.window.localStorage.getItem(key);

            return raw ? (JSON.parse(raw) as KbqAccordionState) : null;
        } catch {
            return null;
        }
    }

    setState(key: string, state: KbqAccordionState): void {
        if (!this.isBrowser) return;

        try {
            this.window.localStorage.setItem(key, JSON.stringify(state));
        } catch {
            // Ignore storage write failures (quota exceeded, disabled/blocked storage, etc.).
        }
    }
}

/**
 * Injection token for the store used to persist accordion state while `useStateSaving` is enabled.
 * Defaults to a `localStorage`-backed implementation (`KbqAccordionLocalStorageStateStore`).
 */
export const KBQ_ACCORDION_STATE_STORE = new InjectionToken<KbqAccordionStateStore>('KBQ_ACCORDION_STATE_STORE', {
    providedIn: 'root',
    factory: () => inject(KbqAccordionLocalStorageStateStore)
});

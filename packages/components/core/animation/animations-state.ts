import { afterNextRender, ANIMATION_MODULE_TYPE, DestroyRef, inject, InjectionToken, Injector } from '@angular/core';
import { KBQ_WINDOW } from '../tokens/window';

/** Configuration of the motion of Koobiq components. */
export interface KbqAnimationsConfig {
    /** Whether components skip their enter, leave and state animations. */
    animationsDisabled?: boolean;
}

/**
 * Configures the motion of Koobiq components, for example `{ animationsDisabled: true }` for a test suite
 * that should not wait for transitions.
 */
export const KBQ_ANIMATIONS_CONFIG = new InjectionToken<KbqAnimationsConfig>('KBQ_ANIMATIONS_CONFIG');

/**
 * Whether Koobiq components render state changes without motion: turned off by `KBQ_ANIMATIONS_CONFIG`,
 * by `provideNoopAnimations()`, or by the user's `prefers-reduced-motion` setting. Reads the setting once,
 * so a component calls it in its injection context.
 * @docs-private
 */
export function kbqAnimationsDisabled(): boolean {
    if (
        inject(KBQ_ANIMATIONS_CONFIG, { optional: true })?.animationsDisabled ||
        inject(ANIMATION_MODULE_TYPE, { optional: true }) === 'NoopAnimations'
    ) {
        return true;
    }

    return inject(KBQ_WINDOW).matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Settles once the CSS animations and transitions running on an element have finished, cancelled ones
 * included; `null` when none runs — animations turned off, reduced motion, no Web Animations API (the
 * server, jsdom).
 * @docs-private
 */
export function kbqAnimationsSettled(element: Element | null | undefined): Promise<void> | null {
    const animations = (element?.getAnimations?.() ?? []).filter(
        // An infinite animation (a spinner in the content) never finishes.
        (animation) => animation.effect?.getComputedTiming().endTime !== Infinity
    );

    return animations.length ? Promise.allSettled(animations.map(({ finished }) => finished)).then(() => {}) : null;
}

/**
 * Calls `callback` once the CSS animations and transitions running on an element after the next render
 * have finished, and right after that render when none runs (see `kbqAnimationsSettled`). The wait ends
 * with the injector; `destroy()` cancels it.
 * @docs-private
 */
export function kbqAfterAnimations(
    element: () => Element | null | undefined,
    callback: () => void,
    injector: Injector
): { destroy(): void } {
    const destroyRef = injector.get(DestroyRef);

    // Nothing is left to animate, nor to notify.
    if (destroyRef.destroyed) return { destroy: () => {} };

    let active = true;

    const renderRef = afterNextRender(
        () => {
            const settled = kbqAnimationsSettled(element());

            if (!settled) return finish();

            settled.then(finish);
        },
        { injector }
    );

    const unregister = destroyRef.onDestroy(() => {
        active = false;
        renderRef.destroy();
    });

    const destroy = (): void => {
        if (!active) return;

        active = false;
        renderRef.destroy();
        unregister();
    };

    const finish = (): void => {
        if (!active) return;

        destroy();
        callback();
    };

    return { destroy };
}

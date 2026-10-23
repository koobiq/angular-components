import { isPlatformServer } from '@angular/common';
import {
    afterNextRender,
    ANIMATION_MODULE_TYPE,
    DestroyRef,
    inject,
    InjectionToken,
    Injector,
    MAX_ANIMATION_TIMEOUT,
    PLATFORM_ID
} from '@angular/core';
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
 *
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
 * included, or once `timeout` milliseconds have passed when it is given: a paused animation never finishes.
 * `null` when none runs — animations turned off, reduced motion, no Web Animations API (the server, jsdom).
 *
 * @docs-private
 */
export function kbqAnimationsSettled(element: Element | null | undefined, timeout?: number): Promise<void> | null {
    const animations = (element?.getAnimations?.() ?? []).filter(
        // An infinite animation (a spinner in the content) never finishes.
        (animation) => animation.effect?.getComputedTiming().endTime !== Infinity
    );

    if (!animations.length) return null;

    const finished = Promise.allSettled(animations.map(({ finished }) => finished)).then(() => {});

    if (timeout === undefined) return finished;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const expired = new Promise<void>((resolve) => (timeoutId = setTimeout(resolve, timeout)));

    return Promise.race([finished, expired]).finally(() => clearTimeout(timeoutId));
}

/**
 * Calls `callback` once the CSS animations and transitions running on an element after the next render
 * have finished, and right after that render when none runs (see `kbqAnimationsSettled`). An animation
 * that does not finish in `MAX_ANIMATION_TIMEOUT` (a paused one) is no longer waited for. On the server,
 * where nothing renders, calls back in a microtask. The wait ends with the injector; `destroy()` cancels it.
 *
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

    const settle = (): void => {
        const settled = kbqAnimationsSettled(element(), injector.get(MAX_ANIMATION_TIMEOUT));

        if (!settled) return finish();

        settled.then(finish);
    };

    // `afterNextRender` does nothing on the server.
    const server = isPlatformServer(injector.get(PLATFORM_ID));
    const renderRef = server ? null : afterNextRender(settle, { injector });

    const stop = (): void => {
        active = false;
        renderRef?.destroy();
    };

    const unregister = destroyRef.onDestroy(stop);

    const destroy = (): void => {
        if (!active) return;

        stop();
        unregister();
    };

    const finish = (): void => {
        if (!active) return;

        destroy();
        callback();
    };

    if (server) Promise.resolve().then(finish);

    return { destroy };
}

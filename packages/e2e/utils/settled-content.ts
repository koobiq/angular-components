import { expect, Locator } from '@playwright/test';

/**
 * Waits until nothing under `root` is still animating, and fails the test if something never settles.
 *
 * A screenshot taken mid-transition is the flake this suite keeps rediscovering, and the usual answer
 * — widening `threshold` until the noise fits — also widens it enough to hide the seam the shot exists
 * to catch. Gating on the animations themselves keeps the tolerance where it was.
 *
 * `parked` is for the transitions a fixture deliberately parks out of reach (an autofill suppression
 * measured in hours, say): anything that ends later than this, or never, is treated as scenery rather
 * than as something the shot is waiting on. It defaults to a minute, which no real transition reaches.
 */
export const e2eWaitForSettledContent = async (root: Locator, parked: number = 60_000): Promise<void> => {
    await expect
        .poll(() =>
            root.evaluate(
                (element: HTMLElement, parkedAfter) =>
                    element
                        .getAnimations({ subtree: true })
                        .filter((animation) => animation.playState === 'running')
                        .filter((animation) => {
                            // An animation without an effect animates nothing, so it can never be the
                            // thing a shot is waiting on. `endTime` counts the delay and every iteration,
                            // and is Infinity for an animation that repeats forever.
                            const { endTime } = animation.effect?.getComputedTiming() ?? {};

                            return typeof endTime === 'number' && endTime < parkedAfter;
                        }).length,
                parked
            )
        )
        .toBe(0);
};

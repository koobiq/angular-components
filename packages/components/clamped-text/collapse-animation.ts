import { afterNextRender, DestroyRef, inject, Injector, runInInjectionContext } from '@angular/core';
import { kbqAnimationsDisabled } from '@koobiq/components/core';

/**
 * Creates a runner that animates `block-size` of an element across a state change made by the user
 * and returns a promise that settles when the motion ends or is cancelled. The promise resolves
 * right away when the change is not animated: the Web Animations API is missing, the motion is
 * turned off, the duration is not a non-negative number, or the height did not change.
 *
 * A running animation is cancelled and the next one starts from the visible height; destroying the
 * injector cancels the animation it owns. A fixed `block-size` makes a flex host squeeze its
 * children when it is smaller than the content and spread wrapped lines when it is larger, so the
 * host keeps its children's size and packs the lines to the start.
 *
 * The heights come from `getBoundingClientRect`, which reads the border box, so an element with a
 * padding or a border under a `content-box` box-sizing snaps when the animation ends.
 *
 * Must be called in an injection context.
 */
export function kbqInjectCollapseAnimation(): (
    element: HTMLElement,
    duration: number,
    change: () => void
) => Promise<void> {
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    let animations: Animation[] = [];

    destroyRef.onDestroy(() => animations.forEach((animation) => animation.cancel()));

    return (element, duration, change) => {
        if (
            typeof element.animate !== 'function' ||
            !Number.isFinite(duration) ||
            duration < 0 ||
            runInInjectionContext(injector, kbqAnimationsDisabled)
        ) {
            change();

            return Promise.resolve();
        }

        const from = element.getBoundingClientRect().height;

        animations.forEach((animation) => animation.cancel());
        change();

        return new Promise<void>((resolve) => {
            afterNextRender(
                () => {
                    const to = element.getBoundingClientRect().height;

                    if (from === to) {
                        resolve();

                        return;
                    }

                    const timing = { duration, easing: 'ease-in-out' };
                    const children = Array.from(element.children).map((child) =>
                        child.animate({ flexShrink: [0, 0] }, timing)
                    );
                    const host = element.animate(
                        {
                            blockSize: [`${from}px`, `${to}px`],
                            overflow: ['clip', 'clip'],
                            alignContent: ['flex-start', 'flex-start']
                        },
                        timing
                    );

                    animations = [host, ...children];
                    // A cancelled animation rejects `finished`; the promise settles either way, so the caller's
                    // follow-up still runs.
                    host.finished.then(
                        () => resolve(),
                        () => resolve()
                    );
                },
                { injector }
            );
        });
    };
}

import { afterNextRender, inject, Injector, runInInjectionContext } from '@angular/core';
import { kbqAnimationsDisabled } from '@koobiq/components/core';

/**
 * Creates a runner that animates `block-size` of an element across a state change made by the user.
 * The runner only makes the change when the Web Animations API is missing, the motion is turned off, or the
 * height did not change. A running animation is cancelled and the next one starts from the visible height.
 *
 * A fixed `block-size` makes a flex host squeeze its children when it is smaller than the content and spread
 * wrapped lines when it is larger, so the host keeps its children's size and packs the lines to the start.
 *
 * Must be called in an injection context.
 */
export function kbqInjectCollapseAnimation(): (element: HTMLElement, duration: number, change: () => void) => void {
    const injector = inject(Injector);
    let animations: Animation[] = [];

    return (element, duration, change) => {
        if (typeof element.animate !== 'function' || runInInjectionContext(injector, kbqAnimationsDisabled)) {
            change();

            return;
        }

        const from = element.getBoundingClientRect().height;

        animations.forEach((animation) => animation.cancel());
        change();

        afterNextRender(
            () => {
                const to = element.getBoundingClientRect().height;

                if (from === to) return;

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
            },
            { injector }
        );
    };
}

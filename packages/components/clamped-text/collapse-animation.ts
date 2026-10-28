import { afterNextRender, inject, Injector, runInInjectionContext } from '@angular/core';
import { KBQ_WINDOW, kbqAnimationsDisabled } from '@koobiq/components/core';

/**
 * Creates a runner that animates the height an element takes in the layout across a state change made by the user.
 *
 * The element is already laid out in its final size, so its children are never squeezed or stretched: the space
 * after it is eased with `margin-block-end` and, when it grows, the part not yet revealed is cut off with `clip-path`.
 * The runner only makes the change when the Web Animations API is missing, the motion is turned off, or the height
 * did not change. A running animation is cancelled and the next one starts from the visible height.
 *
 * Must be called in an injection context.
 */
export function kbqInjectCollapseAnimation(): (element: HTMLElement, duration: number, change: () => void) => void {
    const injector = inject(Injector);
    const window = inject(KBQ_WINDOW);
    let animation: Animation | undefined;

    const getMarginEnd = (element: HTMLElement) => parseFloat(window.getComputedStyle(element).marginBlockEnd) || 0;

    return (element, duration, change) => {
        if (typeof element.animate !== 'function' || runInInjectionContext(injector, kbqAnimationsDisabled)) {
            change();

            return;
        }

        let marginOffset = 0;

        if (animation) {
            const animatedMargin = getMarginEnd(element);

            animation.cancel();
            marginOffset = animatedMargin - getMarginEnd(element);
        }

        const from = element.getBoundingClientRect().height + marginOffset;

        change();

        afterNextRender(
            () => {
                const to = element.getBoundingClientRect().height;

                if (from === to) return;

                const current = element.animate(
                    {
                        marginBlockEnd: [`${from - to}px`, '0px'],
                        ...(to > from && { clipPath: [`inset(0 0 ${to - from}px 0)`, 'inset(0 0 0 0)'] })
                    },
                    { duration, easing: 'ease-in-out', composite: 'add' }
                );

                animation = current;

                const release = () => {
                    if (animation === current) animation = undefined;
                };

                current.onfinish = release;
                current.oncancel = release;
            },
            { injector }
        );
    };
}

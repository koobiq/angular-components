import { afterNextRender, inject, Injector, runInInjectionContext } from '@angular/core';
import { kbqAnimationsDisabled } from '@koobiq/components/core';

/**
 * Creates a runner that animates `block-size` of an element across a state change made by the user.
 * The runner does nothing extra when the Web Animations API is missing, the motion is turned off, or the
 * height did not change. A running animation is cancelled and the next one starts from the visible height.
 *
 * Must be called in an injection context.
 */
export function kbqInjectCollapseAnimation(): (element: HTMLElement, duration: number, change: () => void) => void {
    const injector = inject(Injector);
    let animation: Animation | undefined;

    return (element, duration, change) => {
        if (typeof element.animate !== 'function' || runInInjectionContext(injector, kbqAnimationsDisabled)) {
            change();

            return;
        }

        const from = element.getBoundingClientRect().height;

        animation?.cancel();
        change();

        afterNextRender(
            () => {
                const to = element.getBoundingClientRect().height;

                if (from === to) return;

                const current = element.animate(
                    { blockSize: [`${from}px`, `${to}px`], overflow: ['clip', 'clip'] },
                    { duration, easing: 'ease-in-out' }
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

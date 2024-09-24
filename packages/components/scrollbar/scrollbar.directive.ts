import { Directive, Inject, Input, NgZone, OnDestroy } from '@angular/core';
import { OverlayScrollbars } from 'overlayscrollbars';
import { KBQ_SCROLLBAR_CONFIG, KbqScrollbarEvents, KbqScrollbarOptions, KbqScrollbarTarget } from './scrollbar.types';

type Defer = [
    requestDefer: (callback: () => any, options?: boolean | IdleRequestOptions) => void,
    cancelDefer: () => void
];

const createDefer = (): Defer => {
    if (typeof window === 'undefined') {
        // mock ssr calls with "noop"
        const noop = () => {};
        return [noop, noop];
    }

    let idleId: number;
    let rafId: number;

    const { requestIdleCallback, requestAnimationFrame, cancelAnimationFrame, cancelIdleCallback } = window;

    const idleSupported = typeof requestIdleCallback === 'function';
    const rIdle = idleSupported ? requestIdleCallback : requestAnimationFrame;
    const cIdle = idleSupported ? cancelIdleCallback : cancelAnimationFrame;
    const clear = () => {
        cIdle(idleId);
        cancelAnimationFrame(rafId);
    };

    return [
        (callback, options) => {
            clear();
            idleId = rIdle(
                idleSupported
                    ? () => {
                          clear();
                          // inside idle its best practice to use rAF to change DOM for best performance
                          rafId = requestAnimationFrame(callback);
                      }
                    : callback,
                typeof options === 'object' ? options : { timeout: 2233 }
            );
        },
        clear

    ];
};

/**
 *  A directive for adding overlayscrollbars to elements
 *
 * It leverages the library to provide customizable and visually appealing scrollbars.
 * Also, it provides the optimization with `defer` param
 * */
@Directive({
    selector: '[kbqScrollbar]'
})
export class KbqScrollbarDirective implements OnDestroy {
    private requestDefer: ReturnType<typeof createDefer>[0];
    private cancelDefer: ReturnType<typeof createDefer>[1];

    private _options: KbqScrollbarOptions;

    @Input()
    set options(value: KbqScrollbarOptions) {
        this._options = value;

        if (OverlayScrollbars.valid(this.scrollbarInstance)) {
            this.scrollbarInstance.options(value || {}, true);
        }
    }

    /** Scrollbar behavior customization object */
    get options(): KbqScrollbarOptions | undefined {
        return this._options;
    }

    private _events?: KbqScrollbarEvents;

    @Input()
    set events(value: KbqScrollbarEvents) {
        this._events = value;

        if (OverlayScrollbars.valid(this.scrollbarInstance)) {
            this.scrollbarInstance.on(value || {}, true);
        }
    }

    get events(): KbqScrollbarEvents | undefined {
        return this._events;
    }

    /** Whether to defer the initialization to a point in time when the browser is idle. (or to the next frame if `window.requestIdleCallback` is not supported) */
    @Input()
    defer?: boolean | IdleRequestOptions;

    scrollbarInstance?: OverlayScrollbars;

    constructor(
        private ngZone: NgZone,
        @Inject(KBQ_SCROLLBAR_CONFIG) private scrollbarConfig?: KbqScrollbarOptions
    ) {
        const [requestDefer, cancelDefer] = createDefer();
        this.requestDefer = requestDefer;
        this.cancelDefer = cancelDefer;
    }

    initialize(target: KbqScrollbarTarget) {
        this.ngZone.runOutsideAngular(() => {
            const init = () => {
                this.scrollbarInstance = OverlayScrollbars(
                    target,
                    this.options || this.scrollbarConfig || {},
                    this.events || {}
                );
            };

            if (this.defer) {
                this.requestDefer(init, this.defer);
            } else {
                init();
            }
        });
    }

    ngOnDestroy() {
        this.cancelDefer();
    }
}

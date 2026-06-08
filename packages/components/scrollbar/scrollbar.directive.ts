import { CdkScrollable } from '@angular/cdk/overlay';
import { Directive, Input, NgZone, OnDestroy, inject, input } from '@angular/core';
import { OverlayScrollbars } from 'overlayscrollbars';
import { KBQ_SCROLLBAR_CONFIG, KbqScrollbarEvents, KbqScrollbarOptions, KbqScrollbarTarget } from './scrollbar.types';

type Defer = [
    requestDefer: (callback: () => any, options?: boolean | IdleRequestOptions) => void,
    cancelDefer: () => void
];

const createDefer = (): Defer => {
    // For SSR compatibility
    // eslint-disable-next-line no-restricted-globals
    if (typeof window === 'undefined') {
        const noop = () => {};

        return [noop, noop];
    }

    let idleId: number;
    let rafId: number;

    // eslint-disable-next-line no-restricted-globals
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
 * A directive for adding `overlayscrollbars` to an element.
 */
@Directive({
    selector: '[kbqScrollbar]',
    hostDirectives: [CdkScrollable]
})
export class KbqScrollbarDirective implements OnDestroy {
    private ngZone = inject(NgZone);
    private scrollbarConfig = inject<KbqScrollbarOptions>(KBQ_SCROLLBAR_CONFIG);

    private requestDefer: ReturnType<typeof createDefer>[0];
    private cancelDefer: ReturnType<typeof createDefer>[1];

    private _options: KbqScrollbarOptions;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    readonly defer = input<boolean | IdleRequestOptions>();

    scrollbarInstance?: OverlayScrollbars;

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
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

            const defer = this.defer();

            if (defer) {
                this.requestDefer(init, defer);
            } else {
                init();
            }
        });
    }

    ngOnDestroy() {
        this.cancelDefer();
    }
}

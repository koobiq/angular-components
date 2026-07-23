import { OverlayRef, ScrollDispatcher, ScrollStrategy } from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { InjectionToken, NgZone } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface KbqHideOnScrollStrategyConfig {
    /**
     * Element whose position is tracked against ancestor scroll container boundaries.
     * When omitted, the overlay panel is checked against the viewport instead.
     */
    originElement?: HTMLElement;
    /** Scroll event throttle in ms. Defaults to 20. */
    scrollThrottle?: number;
}

/**
 * Scroll strategy that repositions the overlay on scroll and emits on `hide$`
 * when the tracked element moves outside its boundary:
 *
 * - With `originElement`: tracks the origin against each ancestor `CdkScrollable` container.
 * - Without `originElement`: tracks the overlay panel against the viewport.
 *
 * The caller is responsible for subscribing to `hide$` and hiding/closing the overlay.
 */
export class KbqHideOnScrollStrategy implements ScrollStrategy {
    private readonly _hideSubject = new Subject<void>();

    /** Emits when the tracked element scrolls outside its boundary. */
    readonly hide$: Observable<void> = this._hideSubject.asObservable();

    private _overlayRef: OverlayRef | null = null;
    private _scrollSubscription: Subscription | null = null;

    constructor(
        private readonly _scrollDispatcher: ScrollDispatcher,
        private readonly _viewportRuler: ViewportRuler,
        private readonly _ngZone: NgZone,
        private readonly _config: KbqHideOnScrollStrategyConfig
    ) {}

    /** @docs-private */
    attach(overlayRef: OverlayRef): void {
        this._overlayRef = overlayRef;
    }

    /** Subscribes to scroll events and starts repositioning / out-of-bounds detection. */
    enable(): void {
        if (this._scrollSubscription) return;

        const { originElement, scrollThrottle = 20 } = this._config;

        const stream$ = originElement
            ? this._scrollDispatcher.ancestorScrolled(originElement, scrollThrottle)
            : this._scrollDispatcher
                  .scrolled(scrollThrottle)
                  .pipe(
                      filter(
                          (scrollable) =>
                              !scrollable ||
                              !this._overlayRef!.overlayElement.contains(scrollable.getElementRef().nativeElement)
                      )
                  );

        this._scrollSubscription = stream$.subscribe(() => {
            this._overlayRef!.updatePosition();

            const isOutside = originElement
                ? this._isOriginOutsideAncestors(originElement)
                : this._isOverlayOutsideViewport();

            if (isOutside) {
                this._ngZone.run(() => this._hideSubject.next());
            }
        });
    }

    /** Unsubscribes from scroll events. */
    disable(): void {
        this._scrollSubscription?.unsubscribe();
        this._scrollSubscription = null;
    }

    /** Disables the strategy and completes `hide$`. */
    detach(): void {
        this.disable();
        this._hideSubject.complete();
        this._overlayRef = null;
    }

    private _isOriginOutsideAncestors(originElement: HTMLElement): boolean {
        const originRect = originElement.getBoundingClientRect();

        return this._scrollDispatcher
            .getAncestorScrollContainers(originElement)
            .some((scrollable) =>
                this._isOutsideBounds(originRect, scrollable.getElementRef().nativeElement.getBoundingClientRect())
            );
    }

    private _isOverlayOutsideViewport(): boolean {
        const overlayRect = this._overlayRef!.overlayElement.getBoundingClientRect();
        const { width, height } = this._viewportRuler.getViewportSize();

        return this._isOutsideBounds(overlayRect, { top: 0, left: 0, bottom: height, right: width } as DOMRect);
    }

    private _isOutsideBounds(
        rect: DOMRect,
        containerRect: DOMRect | Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>
    ): boolean {
        return (
            rect.bottom < containerRect.top ||
            rect.top > containerRect.bottom ||
            rect.right < containerRect.left ||
            rect.left > containerRect.right
        );
    }
}

export const KBQ_HIDE_ON_SCROLL_STRATEGY = new InjectionToken<
    (config: KbqHideOnScrollStrategyConfig) => KbqHideOnScrollStrategy
>('kbq-hide-on-scroll-strategy');

/** @docs-private */
export function kbqHideOnScrollStrategyFactory(
    scrollDispatcher: ScrollDispatcher,
    viewportRuler: ViewportRuler,
    ngZone: NgZone
): (config: KbqHideOnScrollStrategyConfig) => KbqHideOnScrollStrategy {
    return (config) => new KbqHideOnScrollStrategy(scrollDispatcher, viewportRuler, ngZone, config);
}

export const KBQ_HIDE_ON_SCROLL_STRATEGY_PROVIDER = {
    provide: KBQ_HIDE_ON_SCROLL_STRATEGY,
    deps: [ScrollDispatcher, ViewportRuler, NgZone],
    useFactory: kbqHideOnScrollStrategyFactory
};

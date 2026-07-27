import {
    FlexibleConnectedPositionStrategyOrigin,
    OverlayRef,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, NgZone } from '@angular/core';
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

/** Lifecycle hooks passed to a scroll strategy factory. New hooks can be added without breaking existing providers. */
export interface KbqScrollStrategyHooks {
    /** Called (inside Angular zone) when the tracked element scrolls outside its scroll container boundary. */
    onHide?: () => void;
}

/**
 * Scroll strategy that repositions the overlay on scroll and calls the optional `onHide` callback
 * when the tracked element moves outside its boundary:
 *
 * - With `originElement`: tracks the origin against each ancestor `CdkScrollable` container.
 * - Without `originElement`: tracks the overlay panel against the viewport.
 *
 * Pass `onHide` via the factory returned by `kbqHideOnScrollStrategyFactory` so the strategy
 * calls it when the trigger scrolls out of bounds.
 */
export class KbqHideOnScrollStrategy implements ScrollStrategy {
    private readonly _hideSubject = new Subject<void>();

    /** Emits when the tracked element scrolls outside its boundary. */
    readonly hide$: Observable<void> = this._hideSubject.asObservable();

    private _overlayRef: OverlayRef | null = null;
    private _scrollSubscription: Subscription | null = null;
    private _originElement: HTMLElement | null = null;

    constructor(
        private readonly _scrollDispatcher: ScrollDispatcher,
        private readonly _viewportRuler: ViewportRuler,
        private readonly _ngZone: NgZone,
        private readonly _config: KbqHideOnScrollStrategyConfig = {},
        private _hooks?: KbqScrollStrategyHooks
    ) {
        this._originElement = _config.originElement ?? null;
    }

    /** @docs-private */
    attach(overlayRef: OverlayRef): void {
        this._overlayRef = overlayRef;

        if (!this._originElement) {
            // FlexibleConnectedPositionStrategy stores the origin as a private field.
            // Reading it here avoids requiring callers to pass originElement explicitly.
            this._originElement = this.coerceOriginElement((overlayRef.getConfig().positionStrategy as any)?._origin);
        }
    }

    /** Subscribes to scroll events and starts repositioning / out-of-bounds detection. */
    enable(): void {
        if (this._scrollSubscription) return;

        const { scrollThrottle = 20 } = this._config;

        this._scrollSubscription = this._scrollDispatcher
            .scrolled(scrollThrottle)
            .pipe(
                filter(
                    (scrollable) =>
                        !scrollable ||
                        !this._overlayRef!.overlayElement.contains(scrollable.getElementRef().nativeElement)
                )
            )
            .subscribe(() => {
                this._overlayRef!.updatePosition();

                const isOutside = this._originElement
                    ? this._isOriginOutsideAncestors(this._originElement)
                    : this._isOverlayOutsideViewport();

                if (isOutside) {
                    this._ngZone.run(() => {
                        this._hideSubject.next();
                        this._hooks?.onHide?.();
                    });
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
        this._hooks = undefined;
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

    private coerceOriginElement(raw?: FlexibleConnectedPositionStrategyOrigin) {
        if (raw instanceof HTMLElement) {
            return raw;
        } else if (raw instanceof ElementRef && raw?.nativeElement instanceof HTMLElement) {
            return raw.nativeElement;
        }

        return null;
    }
}

/**
 * Factory function for `KbqHideOnScrollStrategy`. Use it directly as a `useFactory` value
 * when providing a component-level scroll strategy token (e.g. `KBQ_POPOVER_SCROLL_STRATEGY`).
 *
 * The returned factory accepts an optional `onHide` callback. When provided, the strategy calls
 * it (instead of relying on external `hide$` subscriptions) whenever the trigger scrolls out of
 * its scroll container.
 *
 * @example
 * ```ts
 * {
 *   provide: KBQ_POPOVER_SCROLL_STRATEGY,
 *   deps: [ScrollDispatcher, ViewportRuler, NgZone],
 *   useFactory: kbqHideOnScrollStrategyFactory
 * }
 * ```
 */
export function kbqHideOnScrollStrategyFactory(
    scrollDispatcher: ScrollDispatcher,
    viewportRuler: ViewportRuler,
    ngZone: NgZone
): (hooks?: KbqScrollStrategyHooks) => KbqHideOnScrollStrategy {
    return (hooks?) => new KbqHideOnScrollStrategy(scrollDispatcher, viewportRuler, ngZone, {}, hooks);
}

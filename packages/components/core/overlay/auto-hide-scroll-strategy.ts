import {
    FlexibleConnectedPositionStrategy,
    FlexibleConnectedPositionStrategyOrigin,
    OverlayRef,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, isDevMode, NgZone } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * `FlexibleConnectedPositionStrategy` narrowed to its private `_origin` field, which the
 * class doesn't expose publicly. `_origin` isn't part of the typed public API surface, so a
 * future `@angular/cdk` upgrade could rename or remove it without a compile error here —
 * if that happens, `attach()` below warns in dev mode instead of silently losing the
 * ancestor-scroll-container tracking.
 */
interface PositionStrategyWithOrigin {
    _origin?: FlexibleConnectedPositionStrategyOrigin;
}

export interface KbqAutoHideScrollStrategyConfig {
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
 * Pass `onHide` via the factory returned by `kbqAutoHideScrollStrategyFactory` so the strategy
 * calls it when the trigger scrolls out of bounds.
 */
export class KbqAutoHideScrollStrategy implements ScrollStrategy {
    private readonly hideSubject = new Subject<void>();

    /** Emits when the tracked element scrolls outside its boundary. */
    readonly hide: Observable<void> = this.hideSubject.asObservable();

    private overlayRef: OverlayRef | null = null;
    private scrollSubscription: Subscription | null = null;
    private originElement: HTMLElement | null = null;

    constructor(
        private readonly scrollDispatcher: ScrollDispatcher,
        private readonly viewportRuler: ViewportRuler,
        private readonly ngZone: NgZone,
        private readonly config: KbqAutoHideScrollStrategyConfig = {},
        private hooks?: KbqScrollStrategyHooks
    ) {
        this.originElement = config.originElement ?? null;
    }

    /** @docs-private */
    attach(overlayRef: OverlayRef): void {
        this.overlayRef = overlayRef;

        if (!this.originElement) {
            const positionStrategy = overlayRef.getConfig().positionStrategy;

            // FlexibleConnectedPositionStrategy stores the origin as a private field.
            // Reading it here avoids requiring callers to pass originElement explicitly.
            if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
                const origin = (positionStrategy as PositionStrategyWithOrigin)._origin;

                if (isDevMode() && origin === undefined) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        'KbqAutoHideScrollStrategy: `_origin` is missing on FlexibleConnectedPositionStrategy. Pass `originElement` explicitly.'
                    );
                }

                this.originElement = this.coerceOriginElement(origin);
            }
        }
    }

    /** Subscribes to scroll events and starts repositioning / out-of-bounds detection. */
    enable(): void {
        if (this.scrollSubscription) return;

        if (!this.overlayRef) {
            throw new Error('KbqAutoHideScrollStrategy: enable() was called before attach(). Call attach() first.');
        }

        const overlayRef = this.overlayRef;
        const { scrollThrottle = 20 } = this.config;

        this.scrollSubscription = this.scrollDispatcher
            .scrolled(scrollThrottle)
            .pipe(
                filter(
                    (scrollable) =>
                        !scrollable || !overlayRef.overlayElement.contains(scrollable.getElementRef().nativeElement)
                )
            )
            .subscribe(() => {
                overlayRef.updatePosition();

                const isOutside = this.originElement
                    ? this._isOriginOutsideAncestors(this.originElement)
                    : this._isOverlayOutsideViewport();

                if (isOutside) {
                    this.ngZone.run(() => {
                        this.hideSubject.next();
                        this.hooks?.onHide?.();
                    });
                }
            });
    }

    /** Unsubscribes from scroll events. */
    disable(): void {
        this.scrollSubscription?.unsubscribe();
        this.scrollSubscription = null;
    }

    /** Disables the strategy and completes `hide`. */
    detach(): void {
        this.disable();
        this.hideSubject.complete();
        this.hooks = undefined;
        this.overlayRef = null;
    }

    private _isOriginOutsideAncestors(originElement: HTMLElement): boolean {
        const originRect = originElement.getBoundingClientRect();

        return this.scrollDispatcher
            .getAncestorScrollContainers(originElement)
            .some((scrollable) =>
                this._isOutsideBounds(originRect, scrollable.getElementRef().nativeElement.getBoundingClientRect())
            );
    }

    private _isOverlayOutsideViewport(): boolean {
        const overlayRect = this.overlayRef!.overlayElement.getBoundingClientRect();
        const { width, height } = this.viewportRuler.getViewportSize();

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
 * Factory function for `KbqAutoHideScrollStrategy`. Use it directly as a `useFactory` value
 * when providing a component-level scroll strategy token (e.g. `KBQ_POPOVER_SCROLL_STRATEGY`).
 *
 * The returned factory accepts an optional `onHide` callback. When provided, the strategy calls
 * it (instead of relying on external `hide` subscriptions) whenever the trigger scrolls out of
 * its scroll container.
 *
 * @example
 * ```ts
 * {
 *   provide: KBQ_POPOVER_SCROLL_STRATEGY,
 *   deps: [ScrollDispatcher, ViewportRuler, NgZone],
 *   useFactory: kbqAutoHideScrollStrategyFactory
 * }
 * ```
 */
export function kbqAutoHideScrollStrategyFactory(
    scrollDispatcher: ScrollDispatcher,
    viewportRuler: ViewportRuler,
    ngZone: NgZone
): (hooks?: KbqScrollStrategyHooks) => KbqAutoHideScrollStrategy {
    return (hooks?) => new KbqAutoHideScrollStrategy(scrollDispatcher, viewportRuler, ngZone, {}, hooks);
}

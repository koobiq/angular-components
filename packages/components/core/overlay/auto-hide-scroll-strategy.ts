import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    FlexibleConnectedPositionStrategyOrigin,
    OverlayRef,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, isDevMode, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/** Configuration options for `KbqAutoHideScrollStrategy`. */
export interface KbqAutoHideScrollStrategyConfig {
    /**
     * Element whose position is tracked against ancestor scroll container boundaries.
     * When omitted, the overlay panel is checked against the viewport instead.
     */
    originElement?: HTMLElement;
    /** Scroll event throttle in ms. Defaults to 20. */
    scrollThrottle?: number;
}

/** Lifecycle hooks for `KbqAutoHideScrollStrategy`, passed via `kbqAutoHideScrollStrategyFactory`. */
export interface KbqAutoHideScrollStrategyHooks {
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
    private overlayRef: OverlayRef | null = null;
    private scrollSubscription: Subscription | null = null;
    private originElement: HTMLElement | null = null;
    private ancestorScrollContainers: readonly CdkScrollable[] | null = null;

    constructor(
        private readonly scrollDispatcher: ScrollDispatcher,
        private readonly viewportRuler: ViewportRuler,
        private readonly ngZone: NgZone,
        private readonly config: KbqAutoHideScrollStrategyConfig = {},
        private hooks?: KbqAutoHideScrollStrategyHooks
    ) {}

    /** @docs-private */
    attach(overlayRef: OverlayRef): void {
        if (this.overlayRef && isDevMode()) {
            throw new Error('KbqAutoHideScrollStrategy: attach() has already been called for this instance.');
        }

        this.overlayRef = overlayRef;
    }

    /** Subscribes to scroll events and starts repositioning / out-of-bounds detection. */
    enable(): void {
        if (this.scrollSubscription) return;

        if (!this.overlayRef) {
            throw new Error('KbqAutoHideScrollStrategy: enable() was called before attach(). Call attach() first.');
        }

        const overlayRef = this.overlayRef;
        const { scrollThrottle = 20 } = this.config;

        this.originElement = this.config.originElement ?? this.resolveOriginElement(overlayRef);
        this.ancestorScrollContainers = this.originElement
            ? this.scrollDispatcher.getAncestorScrollContainers(this.originElement)
            : null;

        this.scrollSubscription = this.scrollDispatcher
            .scrolled(scrollThrottle)
            .pipe(
                filter(
                    (scrollable) =>
                        !scrollable || !overlayRef.overlayElement.contains(scrollable.getElementRef().nativeElement)
                )
            )
            .subscribe(() => {
                const isOutside = this.originElement
                    ? this.isOriginOutsideAncestors(this.originElement)
                    : this.isOverlayOutsideViewport(overlayRef);

                if (isOutside) {
                    this.disable();
                    this.ngZone.run(() => this.hooks?.onHide?.());

                    return;
                }

                overlayRef.updatePosition();
            });
    }

    /** Unsubscribes from scroll events. */
    disable(): void {
        this.scrollSubscription?.unsubscribe();
        this.scrollSubscription = null;
    }

    /** Disables the strategy. */
    detach(): void {
        this.disable();
        this.hooks = undefined;
        this.overlayRef = null;
        this.originElement = null;
        this.ancestorScrollContainers = null;
    }

    private resolveOriginElement(overlayRef: OverlayRef): HTMLElement | null {
        const positionStrategy = overlayRef.getConfig().positionStrategy;

        if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
            return this.coerceOriginElement(positionStrategy._origin);
        }

        return null;
    }

    private isOriginOutsideAncestors(originElement: HTMLElement): boolean {
        const originRect = originElement.getBoundingClientRect();

        return (this.ancestorScrollContainers ?? []).some((scrollable) =>
            this.isOutsideBounds(originRect, scrollable.getElementRef().nativeElement.getBoundingClientRect())
        );
    }

    private isOverlayOutsideViewport(overlayRef: OverlayRef): boolean {
        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        const { width, height } = this.viewportRuler.getViewportSize();

        return this.isOutsideBounds(overlayRect, { top: 0, left: 0, bottom: height, right: width } as DOMRect);
    }

    private isOutsideBounds(
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

    private coerceOriginElement(raw?: FlexibleConnectedPositionStrategyOrigin): HTMLElement | null {
        if (raw instanceof HTMLElement) {
            return raw;
        } else if (raw instanceof ElementRef && raw.nativeElement instanceof HTMLElement) {
            return raw.nativeElement;
        }

        return null;
    }
}

/**
 * Factory function for `KbqAutoHideScrollStrategy`. Use it directly as a `useFactory` value
 * when providing a component-level scroll strategy token (e.g. `KBQ_POPOVER_SCROLL_STRATEGY`).
 *
 * The returned function accepts an optional `hooks` object (see `KbqAutoHideScrollStrategyHooks`)
 * and an optional `config` (see `KbqAutoHideScrollStrategyConfig`).
 *
 * @example
 * ```ts
 * const createScrollStrategy = kbqAutoHideScrollStrategyFactory(scrollDispatcher, viewportRuler, ngZone);
 * const strategy = createScrollStrategy({ onHide: () => this.hide() }, { originElement });
 * ```
 */
export function kbqAutoHideScrollStrategyFactory(
    scrollDispatcher: ScrollDispatcher,
    viewportRuler: ViewportRuler,
    ngZone: NgZone
): (hooks?: KbqAutoHideScrollStrategyHooks, config?: KbqAutoHideScrollStrategyConfig) => KbqAutoHideScrollStrategy {
    return (hooks?, config?) =>
        new KbqAutoHideScrollStrategy(scrollDispatcher, viewportRuler, ngZone, config ?? {}, hooks);
}

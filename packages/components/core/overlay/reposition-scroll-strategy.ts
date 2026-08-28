import { OverlayRef, ScrollDispatcher, ScrollStrategy } from '@angular/cdk/overlay';
import { isDevMode } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isScrollFromInsideOverlay } from './scroll-strategy-utils';

function getKbqRepositionScrollStrategyAlreadyAttachedError(): Error {
    return Error('KbqRepositionScrollStrategy: attach() has already been called for this instance.');
}

function getKbqRepositionScrollStrategyNotAttachedError(): Error {
    return Error('KbqRepositionScrollStrategy: enable() was called before attach(). Call attach() first.');
}

/** @docs-private */
export interface KbqRepositionScrollStrategyConfig {
    scrollThrottle?: number;
    /** Whether scrolls originating inside the overlay should be ignored. Defaults to `true`. */
    ignoreInnerScroll?: boolean;
}

/**
 * Repositions an overlay on external scroll events while ignoring its own scrolling by default.
 *
 * @docs-private
 */
export class KbqRepositionScrollStrategy implements ScrollStrategy {
    private overlayRef: OverlayRef | null = null;
    private scrollSubscription: Subscription | null = null;

    constructor(
        private readonly scrollDispatcher: ScrollDispatcher,
        private readonly config: KbqRepositionScrollStrategyConfig = {}
    ) {}

    attach(overlayRef: OverlayRef): void {
        if (this.overlayRef && isDevMode()) {
            throw getKbqRepositionScrollStrategyAlreadyAttachedError();
        }

        this.overlayRef = overlayRef;
    }

    enable(): void {
        if (this.scrollSubscription) return;

        if (!this.overlayRef) {
            throw getKbqRepositionScrollStrategyNotAttachedError();
        }

        const overlayRef = this.overlayRef;
        const { scrollThrottle = 0, ignoreInnerScroll = true } = this.config;

        this.scrollSubscription = this.scrollDispatcher
            .scrolled(scrollThrottle)
            .pipe(filter((scrollable) => !ignoreInnerScroll || !isScrollFromInsideOverlay(overlayRef, scrollable)))
            .subscribe(() => overlayRef.updatePosition());
    }

    disable(): void {
        this.scrollSubscription?.unsubscribe();
        this.scrollSubscription = null;
    }

    detach(): void {
        this.disable();
        this.overlayRef = null;
    }
}

/** @docs-private */
export function kbqRepositionScrollStrategyFactory(
    scrollDispatcher: ScrollDispatcher,
    config?: KbqRepositionScrollStrategyConfig
): () => KbqRepositionScrollStrategy {
    return () => new KbqRepositionScrollStrategy(scrollDispatcher, config);
}

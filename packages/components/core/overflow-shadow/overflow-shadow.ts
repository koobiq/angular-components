import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    afterRenderEffect,
    booleanAttribute,
    Directive,
    inject,
    InjectionToken,
    input,
    numberAttribute,
    signal,
    untracked
} from '@angular/core';
import { fromEvent, merge, NEVER, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { kbqInjectNativeElement } from '../utils';

/** Shadow visibility state — which of the two shadows should be rendered. */
export interface KbqOverflowShadowState {
    /** Whether the top (header) shadow should be visible — content is scrolled past the top. */
    top: boolean;
    /** Whether the bottom (footer) shadow should be visible — more content remains below the fold. */
    bottom: boolean;
}

/**
 * Source of scroll events and scroll metrics. Can be provided by a component that wraps
 * the scrollable element (e.g. `KbqScrollbar`) so that `KbqOverflowShadowContainer` does
 * not have to subscribe to the native `scroll` event directly.
 */
export interface KbqOverflowShadowSource {
    /** Emits whenever the wrapped element scrolls. */
    readonly onScroll: Observable<unknown>;
    /** The element whose `scrollTop`/`clientHeight`/`scrollHeight` drive the shadows, or `null` if not ready yet. */
    getScrollElement(): HTMLElement | null;
}

/**
 * DI token a scrollable wrapper component can provide to expose itself as the scroll source
 * for a co-located `KbqOverflowShadowContainer` (see `KbqScrollbar`).
 */
export const KBQ_OVERFLOW_SHADOW_SOURCE = new InjectionToken<KbqOverflowShadowSource>('KBQ_OVERFLOW_SHADOW_SOURCE');

/**
 * Container directive that sits on the scrollable element. Listens for scroll events and
 * keeps the `overflow` signal up to date, which is then read by `KbqOverflowShadowTop` and
 * `KbqOverflowShadowBottom`.
 *
 * The scroll source is auto-detected: if `KBQ_OVERFLOW_SHADOW_SOURCE` is provided in the
 * host's DI, that source is used; otherwise the native `scroll` event on the host element
 * is observed.
 *
 * In addition to scroll events, the directive observes the scroll source's box-size changes
 * via CDK's `SharedResizeObserver` — this covers layout changes that happen without a scroll
 * and alter the viewport size (modal open/close animation, window resize, reflow that resizes
 * the element). Content that only grows `scrollHeight` without changing the element's box size
 * is not detected by the resize observer; call `checkOverflow()` manually for those cases.
 *
 * `kbqOverflowShadowContainerDisabled` stops both subscriptions and clears the state, for a host
 * that needs the shadows only in some of its layouts.
 */
@Directive({
    selector: '[kbqOverflowShadowContainer]',
    exportAs: 'kbqOverflowShadowContainer'
})
export class KbqOverflowShadowContainer {
    private readonly hostElement = kbqInjectNativeElement();
    private readonly externalSource = inject(KBQ_OVERFLOW_SHADOW_SOURCE, { optional: true, self: true });
    private readonly sharedResizeObserver = inject(SharedResizeObserver);

    /** Optional debounce for scroll events, in milliseconds. Default is 0. */
    readonly debounce = input(0, { transform: numberAttribute });

    /** Whether the container stops tracking scroll and resize and reports no overflow. Defaults to `false`. */
    readonly disabled = input<boolean, boolean | string | null | undefined>(false, {
        alias: 'kbqOverflowShadowContainerDisabled',
        transform: booleanAttribute
    });

    /** Current shadow state. Re-checked on every scroll event and resize; changes only when an edge does. */
    readonly overflow = signal<KbqOverflowShadowState>(
        { top: false, bottom: false },
        { equal: (a, b) => a.top === b.top && a.bottom === b.bottom }
    );

    constructor() {
        // In the read phase, so that containers rendered together measure in one layout rather than one each.
        afterRenderEffect({
            read: (onCleanup) => {
                if (this.disabled()) {
                    this.overflow.set({ top: false, bottom: false });

                    return;
                }

                const subscription = untracked(() => this.observe());

                onCleanup(() => subscription.unsubscribe());
            }
        });
    }

    /**
     * Force-rechecks overflow and updates the signal. Calling this manually is normally not
     * necessary — scroll events plus `SharedResizeObserver` cover the standard scenarios. Kept
     * for rare cases when external code knows about a layout change more precisely than the
     * browser observers (e.g. content that only grows `scrollHeight`).
     */
    checkOverflow(): void {
        const source = this.getScrollSource();

        if (!source) return;

        // `clientHeight` (content-box) is the visible scroll-viewport height. `Math.round` on the
        // bottom comparison absorbs sub-pixel scroll metrics (HiDPI / browser zoom) so the bottom
        // shadow reliably clears at the very bottom instead of lingering on a fractional gap.
        const { scrollTop, clientHeight, scrollHeight } = source;

        this.overflow.set({
            top: scrollTop > 0,
            bottom: Math.round(scrollTop + clientHeight) < scrollHeight
        });
    }

    private getScrollSource(): HTMLElement | null {
        return this.externalSource ? this.externalSource.getScrollElement() : this.hostElement;
    }

    private observe(): Subscription {
        this.checkOverflow();

        const scroll$ = this.externalSource
            ? this.externalSource.onScroll
            : fromEvent(this.hostElement, 'scroll', { passive: true });
        const source = this.getScrollSource();
        const resize$ = source ? this.sharedResizeObserver.observe(source) : NEVER;

        return merge(this.debounce() > 0 ? scroll$.pipe(debounceTime(this.debounce())) : scroll$, resize$).subscribe(
            () => this.checkOverflow()
        );
    }
}

/**
 * Marker directive for the top-shadow indicator. Linked to the container directive via a
 * template ref: `<header [kbqOverflowShadowTop]="containerRef">`.
 *
 * Sets an inline `box-shadow` on the host element using the value from the `shadow` input
 * (the Koobiq token by default). Consumers can override the shadow from the outside by
 * overriding the token `--kbq-shadow-overflow-normal-bottom` (or whichever token is passed
 * via the `shadow` input) in the relevant cascade scope.
 */
@Directive({
    selector: '[kbqOverflowShadowTop]',
    host: {
        '[style.box-shadow]': 'ref()?.overflow()?.top ? shadow() : null'
    },
    exportAs: 'kbqOverflowShadowTop'
})
export class KbqOverflowShadowTop {
    /**
     * Reference to the container directive. May be `undefined` if the container has not
     * been rendered yet (e.g. the indicator lives in one `@if` block and the container in
     * another).
     */
    readonly ref = input<KbqOverflowShadowContainer | undefined>(undefined, { alias: 'kbqOverflowShadowTop' });

    /** Value of `box-shadow` when the shadow is active. Defaults to the standard Koobiq token. */
    readonly shadow = input<string>('var(--kbq-shadow-overflow-normal-bottom)');
}

/**
 * Marker directive for the bottom-shadow indicator. Linked to the container directive via a
 * template ref: `<footer [kbqOverflowShadowBottom]="containerRef">`.
 *
 * Sets an inline `box-shadow` on the host element. See {@link KbqOverflowShadowTop}.
 */
@Directive({
    selector: '[kbqOverflowShadowBottom]',
    host: {
        '[style.box-shadow]': 'ref()?.overflow()?.bottom ? shadow() : null'
    },
    exportAs: 'kbqOverflowShadowBottom'
})
export class KbqOverflowShadowBottom {
    /** Reference to the container directive. See {@link KbqOverflowShadowTop.ref}. */
    readonly ref = input<KbqOverflowShadowContainer | undefined>(undefined, { alias: 'kbqOverflowShadowBottom' });

    /** Value of `box-shadow` when the shadow is active. Defaults to the standard Koobiq token. */
    readonly shadow = input<string>('var(--kbq-shadow-overflow-normal-top)');
}

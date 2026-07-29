import { Directionality } from '@angular/cdk/bidi';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import { CdkScrollable, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    Component,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    Injector,
    input,
    NgZone,
    numberAttribute,
    OnDestroy,
    output,
    OutputEmitterRef,
    Provider,
    Renderer2,
    signal,
    ViewEncapsulation,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    KBQ_OVERFLOW_SHADOW_SOURCE,
    KBQ_WINDOW,
    kbqInjectNativeElement,
    KbqOverflowShadowSource
} from '@koobiq/components/core';
import { fromEvent, Observable, Subject } from 'rxjs';

/** When the custom track/thumb are shown. `'hidden'` never shows them, but scrolling stays fully functional. */
export type KbqScrollbarVisibility = 'hover' | 'always' | 'scroll' | 'hidden';

/** Payload of `kbqScrollbarScrollChange`. */
export type KbqScrollbarScrollChangeEvent = {
    top: number;
    left: number;
};

/** Options accepted by `KbqScrollbar.scrollTo`. */
export type KbqScrollbarScrollToOptions = Partial<{
    top: number;
    left: number;
    behavior: ScrollBehavior;
}>;

/** Options accepted by `KbqScrollbar.scrollToElement`. */
export type KbqScrollbarScrollToElementOptions = Partial<{
    /** Extra gap to leave above the target, in px — e.g. so it doesn't end up under a sticky header. */
    top: number;
    /** Extra gap to leave to the left of the target, in px. */
    left: number;
    behavior: ScrollBehavior;
}>;

/** Shape of the values that can be supplied via `KBQ_SCROLLBAR_CONFIG`. */
export type KbqScrollbarConfig = Partial<{
    /** Default for the `kbqScrollbarVisibility` input — see `KbqScrollbarVisibility`. */
    visibility: KbqScrollbarVisibility;
    /** Default for the `kbqScrollbarAutoHideDelay` input. */
    autoHideDelay: number;
    /** Default for the `kbqScrollbarFloating` input. */
    floating: boolean;
    /**
     * Falls back to the native scrollbar entirely, bypassing the custom track/thumb — same as on a
     * coarse pointer. App/module-level only, not a per-instance input: it decides whether the
     * custom DOM gets built at all, which happens once at directive construction, so a value that
     * could change per instance at runtime wouldn't have anything to react to anyway.
     */
    native: boolean;
    /** Default for the `kbqScrollbarDisableInteraction` input. */
    disableInteraction: boolean;
}>;

/**
 * Default values for `kbqScrollbar` inputs. `autoHideDelay` mirrors
 * `KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG` (`../scrollbar.types.ts`) to keep UX parity with the
 * `overlayscrollbars`-based `kbq-scrollbar`.
 *
 * @docs-private
 */
export const KBQ_SCROLLBAR_DEFAULT_CONFIG: Required<KbqScrollbarConfig> = {
    visibility: 'hover',
    autoHideDelay: 100,
    floating: true,
    native: false,
    disableInteraction: false
};

/**
 * Injection token for app/module-level `kbqScrollbar` defaults. Resolves to
 * `KBQ_SCROLLBAR_DEFAULT_CONFIG` out of the box, so `KbqScrollbar` works without requiring any
 * provider to be registered.
 *
 * @docs-private
 */
export const KBQ_SCROLLBAR_CONFIG = new InjectionToken<KbqScrollbarConfig>('KBQ_SCROLLBAR_CONFIG', {
    factory: () => KBQ_SCROLLBAR_DEFAULT_CONFIG
});

/** Registers app/module-level defaults for `kbqScrollbar` — provide it wherever `KBQ_SCROLLBAR_CONFIG` should resolve to `config` instead of `KBQ_SCROLLBAR_DEFAULT_CONFIG`. */
export const kbqScrollbarConfigProvider = (config: KbqScrollbarConfig): Provider => ({
    provide: KBQ_SCROLLBAR_CONFIG,
    useValue: config
});

/** The two axes a `kbqScrollbar` always builds a track for — see `updateAxis`. */
type Axis = 'vertical' | 'horizontal';

const AXES: readonly Axis[] = ['vertical', 'horizontal'];

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

type DragContext = {
    axis: Axis;
    pointerId: number;
    trackStart: number;
    trackTravel: number;
    grabOffset: number;
    scrollRange: number;
};

/**
 * Component used to load the `.kbq-private-scrollbar` styles.
 */
@Component({
    selector: 'scrollbar-style-loader',
    template: '',
    styleUrl: 'scrollbar.scss',
    encapsulation: ViewEncapsulation.None
})
class KbqScrollbarStyleLoader {}

/**
 * Marks the element that is actually scrollable when it doesn't coincide with the `kbqScrollbar`
 * host — e.g. a `<cdk-virtual-scroll-viewport>` nested inside a `<div kbqScrollbar>`. When
 * present, `KbqScrollbar` measures, listens to, and scrolls this element instead of its own host.
 */
@Directive({
    selector: '[kbqScrollbarViewport]',
    host: { class: 'kbq-private-scrollbar-viewport' }
})
export class KbqScrollbarViewport {
    /** @docs-private */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @docs-private Set only when the viewport element also hosts `CdkVirtualScrollViewport`. */
    readonly virtualScrollViewport = inject(CdkVirtualScrollViewport, { optional: true, self: true });
}

/**
 * Dependency-free custom scrollbar directive. Draws its own track/thumb via `Renderer2` on top of
 * the host's content — no third-party library, unlike `kbqScrollbar`/`kbq-scrollbar`
 * (`../scrollbar.directive.ts`/`../scrollbar.component.ts`), which wrap `overlayscrollbars`.
 *
 * Usable as a plain attribute (`<div kbqScrollbar>`) or composed via `hostDirectives:
 * [KbqScrollbar]` in another component.
 *
 * On coarse-pointer (touch) devices the custom track/thumb are never created — scrolling stays
 * native. Bypassed the same way when `KbqScrollbarConfig.native` is set.
 */
@Directive({
    selector: '[kbqScrollbar]',
    providers: [{ provide: KBQ_OVERFLOW_SHADOW_SOURCE, useExisting: forwardRef(() => KbqScrollbar) }],
    host: {
        class: 'kbq-private-scrollbar',
        '[class.kbq-private-scrollbar_rtl]': 'rtl()',
        '[class.kbq-private-scrollbar_disable-interaction]': 'disableInteraction()'
    },
    hostDirectives: [CdkScrollable],
    exportAs: 'kbqScrollbar'
})
export class KbqScrollbar implements KbqOverflowShadowSource, OnDestroy {
    private readonly renderer = inject(Renderer2);
    private readonly hostElement = kbqInjectNativeElement();
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly sharedResizeObserver = inject(SharedResizeObserver);
    private readonly destroyRef = inject(DestroyRef);
    private readonly zone = inject(NgZone);
    private readonly injector = inject(Injector);
    private readonly config = inject(KBQ_SCROLLBAR_CONFIG);
    private readonly directionality = inject(Directionality, { optional: true });

    /**
     * See `KbqScrollbarConfig.native`. Read once from config rather than an `input()` — whether the
     * custom track/thumb DOM gets built at all is decided once in `afterNextRender`, so there's no
     * later point at which a per-instance change could take effect.
     */
    private readonly native = this.config.native ?? KBQ_SCROLLBAR_DEFAULT_CONFIG.native;

    /**
     * Used from the host binding. A signal (not a plain method) so the class
     * updates even when the host lives inside an `OnPush` ancestor that isn't otherwise dirty —
     * `dir.change` is a plain `EventEmitter`, not something Angular's zone/OnPush tracking picks
     * up on its own. Same reasoning as `overflow` in `core/overflow-shadow/overflow-shadow.ts`.
     *
     * @docs-private
     */
    protected readonly rtl = signal(this.directionality?.value === 'rtl');

    private readonly viewport = contentChild(KbqScrollbarViewport);

    /** Controls when the custom track/thumb are shown — see `KbqScrollbarVisibility`. */
    readonly visibility = input<KbqScrollbarVisibility>(
        this.config.visibility ?? KBQ_SCROLLBAR_DEFAULT_CONFIG.visibility,
        { alias: 'kbqScrollbarVisibility' }
    );

    /** Delay, in ms, before auto-hiding after a scroll in `'scroll'` visibility mode. */
    readonly autoHideDelay = input(this.config.autoHideDelay ?? KBQ_SCROLLBAR_DEFAULT_CONFIG.autoHideDelay, {
        alias: 'kbqScrollbarAutoHideDelay',
        transform: numberAttribute
    });

    /** `true` (default) floats the track/thumb over the content; `false` reserves layout space like a native scrollbar. */
    readonly floating = input(this.config.floating ?? KBQ_SCROLLBAR_DEFAULT_CONFIG.floating, {
        alias: 'kbqScrollbarFloating',
        transform: booleanAttribute
    });

    /** Keeps scrolling working but disables drag-on-thumb and click-on-track. */
    readonly disableInteraction = input(
        this.config.disableInteraction ?? KBQ_SCROLLBAR_DEFAULT_CONFIG.disableInteraction,
        { alias: 'kbqScrollbarDisableInteraction', transform: booleanAttribute }
    );

    /** Emits the scroll position on every scroll event. */
    readonly scrollChange = output<KbqScrollbarScrollChangeEvent>({ alias: 'kbqScrollbarScrollChange' });
    /** Emits when the vertical axis reaches its top. */
    readonly reachTop = output<void>({ alias: 'kbqScrollbarReachTop' });
    /** Emits when the vertical axis reaches its bottom. */
    readonly reachBottom = output<void>({ alias: 'kbqScrollbarReachBottom' });
    /** Emits when the horizontal axis reaches its logical start — the right edge in RTL, left in LTR. */
    readonly reachStart = output<void>({ alias: 'kbqScrollbarReachStart' });
    /** Emits when the horizontal axis reaches its logical end — the left edge in RTL, right in LTR. */
    readonly reachEnd = output<void>({ alias: 'kbqScrollbarReachEnd' });
    /** Emits whenever the custom track/thumb show or hide. */
    readonly visibilityChange = output<boolean>({ alias: 'kbqScrollbarVisibilityChange' });
    /**
     * Emits once, after the directive finishes its initial setup — including the custom
     * track/thumb render when one is built, but also under `native`/coarse pointer, where there's
     * no track/thumb of its own to render.
     */
    readonly initialized = output<void>({ alias: 'kbqScrollbarInitialized' });
    /**
     * Emits after every recompute (resize, content change, or manual `update()`) — thumb
     * size/position when the custom track/thumb are built, or just the overflow/edge measurement
     * behind `isAtTop`-family signals and `reach*` otherwise (`native`, coarse pointer).
     */
    readonly updated = output<void>({ alias: 'kbqScrollbarUpdated' });

    // Separate from the `*At*` signals below: whether an axis overflows at all, so a track with
    // nothing to scroll reads as trivially at both of its own edges (see the early return in
    // `updateAxis`) without that no-overflow state overwriting — and being mistaken later for — a
    // real, measured edge position once content does overflow.
    private readonly verticalOverflows = signal(false);
    private readonly horizontalOverflows = signal(false);

    private readonly verticalAtTop = signal(false);
    private readonly verticalAtBottom = signal(false);
    private readonly horizontalAtLeft = signal(false);
    private readonly horizontalAtRight = signal(false);

    /** Whether the vertical axis is currently scrolled all the way to the top. */
    readonly isAtTop = computed(() => !this.verticalOverflows() || this.verticalAtTop());
    /** Whether the vertical axis is currently scrolled all the way to the bottom. */
    readonly isAtBottom = computed(() => !this.verticalOverflows() || this.verticalAtBottom());
    /**
     * Whether the horizontal axis is currently scrolled to its logical start — the right edge in
     * RTL, left in LTR. Matches `scrollStart()`/`reachStart`.
     */
    readonly isAtStart = computed(
        () => !this.horizontalOverflows() || (this.rtl() ? this.horizontalAtRight() : this.horizontalAtLeft())
    );
    /**
     * Whether the horizontal axis is currently scrolled to its logical end — the left edge in
     * RTL, right in LTR. Matches `scrollEnd()`/`reachEnd`.
     */
    readonly isAtEnd = computed(
        () => !this.horizontalOverflows() || (this.rtl() ? this.horizontalAtLeft() : this.horizontalAtRight())
    );

    private readonly scrollSubject = new Subject<void>();
    /** @docs-private Implementation of `KbqOverflowShadowSource`. */
    readonly onScroll: Observable<void> = this.scrollSubject.asObservable();

    private readonly tracks = new Map<Axis, HTMLElement>();
    private readonly thumbs = new Map<Axis, HTMLElement>();

    // Fallback values for when `readCssTokens` can't resolve the real custom property (e.g. no
    // `document`, or run before the first render) — otherwise overwritten with the real
    // `scrollbar.scss` token values below. Deliberately not configurable except via CSS — see
    // `--kbq-private-scrollbar-size-thumb-min-size`/`--kbq-private-scrollbar-size-track-padding`.
    private cssMinThumbSize = 32;
    private cssTrackPadding = 3;
    private isCoarsePointer = false;
    private isVisible = false;
    private isPointerOver = false;
    private autoHideTimeoutId: ReturnType<typeof setTimeout> | undefined;
    private dragContext: DragContext | null = null;

    /**
     * Auto-created scroll wrapper, only when there's no explicit `kbqScrollbarViewport` and the
     * custom track/thumb are actually being rendered. The track/thumb are `position: absolute`
     * siblings of this wrapper on the (non-scrolling) host — if they were children of the element
     * that itself has `overflow: auto` (i.e. the host, when the host is also the scroll element),
     * they'd be clipped and scrolled away with the rest of the content instead of staying fixed as
     * an overlay.
     */
    private autoViewport: HTMLElement | null = null;

    constructor() {
        inject(_CdkPrivateStyleLoader).load(KbqScrollbarStyleLoader);

        afterNextRender(() => {
            this.isCoarsePointer = this.window.matchMedia?.('(pointer: coarse)').matches ?? false;
            this.readCssTokens();

            const buildingCustomUi = !this.native && !this.isCoarsePointer;

            this.zone.runOutsideAngular(() => {
                if (buildingCustomUi && !this.viewport()) {
                    this.autoViewport = this.createAutoViewport();
                }

                this.applyOverflow();
                this.wireScroll();
                this.wireResize();
                this.wireDirectionality();

                if (buildingCustomUi) {
                    this.applyNativeHiding();
                    this.applyGutterReservation();
                    this.buildDom();
                    this.wireGlobalDragListeners();
                    this.wireVisibility();
                }

                // Runs even under `native`/coarse pointer — `isAtTop`-family signals and `reach*`
                // outputs still need an initial measurement, not just the custom track/thumb.
                this.recompute();

                // A `kbqScrollbarViewport` backed by `CdkVirtualScrollViewport` (or any scroll
                // element whose own layout isn't settled yet) can make the very first recompute
                // under-measure — a 0-height track, or overflow that hasn't shown up yet. Its outer
                // box may never resize again afterwards, so there's no guaranteed later trigger to
                // correct it — retry once, next frame.
                this.window.requestAnimationFrame?.(() => this.recompute());
            });

            this.emit(this.initialized, undefined);
        });
    }

    /** Moves the host's existing content into a new wrapper so the host itself can stay a
     *  non-scrolling, non-clipping positioning context for the track/thumb overlay. */
    private createAutoViewport(): HTMLElement {
        const wrapper = this.renderer.createElement('div') as HTMLElement;

        this.renderer.addClass(wrapper, 'kbq-private-scrollbar-viewport');

        for (const child of Array.from(this.hostElement.childNodes)) {
            this.renderer.appendChild(wrapper, child);
        }

        this.renderer.appendChild(this.hostElement, wrapper);

        return wrapper;
    }

    ngOnDestroy(): void {
        clearTimeout(this.autoHideTimeoutId);
        this.tracks.forEach((track) => this.renderer.removeChild(this.hostElement, track));
        this.tracks.clear();
        this.thumbs.clear();
    }

    /** Scrolls the effective scroll element (or delegates to `kbqScrollbarViewport`'s virtual scroll viewport). */
    scrollTo(options: KbqScrollbarScrollToOptions): void {
        const virtualScrollViewport = this.viewport()?.virtualScrollViewport;

        if (virtualScrollViewport) {
            virtualScrollViewport.scrollToOffset(options.top ?? options.left ?? 0, options.behavior ?? 'auto');

            return;
        }

        const element = this.scrollElement;

        // Feature-detected: some environments (older WebViews, this repo's jsdom-based Jest
        // setup) don't implement `Element.scrollTo`. Falling back to direct scrollTop/scrollLeft
        // assignment loses `behavior: 'smooth'` there, but stays functionally correct everywhere.
        if (typeof element.scrollTo === 'function') {
            element.scrollTo({ top: options.top, left: options.left, behavior: options.behavior });

            return;
        }

        if (options.top !== undefined) element.scrollTop = options.top;
        if (options.left !== undefined) element.scrollLeft = options.left;
    }

    /** Scrolls `target` (an element, or a selector resolved against the scroll element) into view. */
    scrollToElement(target: HTMLElement | string, options?: KbqScrollbarScrollToElementOptions): void {
        const element = typeof target === 'string' ? this.scrollElement.querySelector<HTMLElement>(target) : target;

        if (!element) return;

        const scrollElementRect = this.scrollElement.getBoundingClientRect();
        const targetRect = element.getBoundingClientRect();
        const top = targetRect.top - scrollElementRect.top + this.scrollElement.scrollTop - (options?.top ?? 0);
        const left = targetRect.left - scrollElementRect.left + this.scrollElement.scrollLeft - (options?.left ?? 0);

        this.scrollTo({ top, left, behavior: options?.behavior });
    }

    /** Scrolls to the start of the vertical axis. */
    scrollToTop(behavior?: ScrollBehavior): void {
        this.scrollTo({ top: 0, behavior });
    }

    /** Scrolls to the end of the vertical axis. */
    scrollToBottom(behavior?: ScrollBehavior): void {
        this.scrollTo({ top: this.scrollElement.scrollHeight, behavior });
    }

    /**
     * Scrolls to the logical start of the horizontal axis — the right edge in RTL, left in LTR.
     * Always `left: 0`: per the CSSOM View spec, `scrollLeft` rests at `0` at the start in both
     * directions and moves negative toward the end in RTL, positive in LTR.
     */
    scrollStart(behavior?: ScrollBehavior): void {
        this.scrollTo({ left: 0, behavior });
    }

    /** Scrolls to the logical end of the horizontal axis — the left edge in RTL, right in LTR. */
    scrollEnd(behavior?: ScrollBehavior): void {
        const element = this.scrollElement;
        const maxScroll = element.scrollWidth - element.clientWidth;

        this.scrollTo({ left: this.rtl() ? -maxScroll : maxScroll, behavior });
    }

    /**
     * Forces a recompute of track/thumb size and position. Scroll and viewport-box-size changes
     * are handled automatically via `SharedResizeObserver`; call this manually when content grows
     * `scrollHeight`/`scrollWidth` without the scroll element's own box size changing — a resize
     * observer can't see that on its own (same caveat as `core/overflow-shadow/overflow-shadow.ts`).
     */
    update(): void {
        this.recompute();
    }

    /** @docs-private Implementation of `KbqOverflowShadowSource`. */
    getScrollElement(): HTMLElement | null {
        return this.scrollElement;
    }

    private get scrollElement(): HTMLElement {
        return this.viewport()?.elementRef.nativeElement ?? this.autoViewport ?? this.hostElement;
    }

    private readCssTokens(): void {
        this.cssMinThumbSize = this.readCssPx('--kbq-private-scrollbar-size-thumb-min-size', this.cssMinThumbSize);
        this.cssTrackPadding = this.readCssPx('--kbq-private-scrollbar-size-track-padding', this.cssTrackPadding);
    }

    private readCssPx(property: string, fallback: number): number {
        const raw = this.window.getComputedStyle(this.hostElement).getPropertyValue(property);
        const parsed = parseFloat(raw);

        return Number.isNaN(parsed) ? fallback : parsed;
    }

    private wireScroll(): void {
        fromEvent(this.scrollElement, 'scroll', { passive: true })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.scrollSubject.next();
                this.recompute();
                this.onUserScroll();
            });
    }

    private wireResize(): void {
        this.sharedResizeObserver
            .observe(this.scrollElement)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.recompute());
    }

    private wireDirectionality(): void {
        this.directionality?.change?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((direction) => {
            this.rtl.set(direction === 'rtl');
            this.recompute();
        });
    }

    private applyNativeHiding(): void {
        this.renderer.addClass(this.scrollElement, 'kbq-private-scrollbar_hide-native');
    }

    /**
     * Establishes native scroll on both axes — this directive doesn't just decorate an
     * already-`overflow: auto` element, it makes the effective scroll element scrollable itself
     * (the custom track/thumb are a UI layer on top of real native scrolling, not a replacement
     * for it).
     */
    private applyOverflow(): void {
        this.renderer.setStyle(this.scrollElement, 'overflowY', 'auto');
        this.renderer.setStyle(this.scrollElement, 'overflowX', 'auto');
    }

    private applyGutterReservation(): void {
        if (this.floating()) return;

        const dimension = 'var(--kbq-private-scrollbar-size-track-dimension)';

        this.renderer.setStyle(this.scrollElement, this.rtl() ? 'paddingLeft' : 'paddingRight', dimension);
        this.renderer.setStyle(this.scrollElement, 'paddingBottom', dimension);
    }

    private buildDom(): void {
        for (const axis of AXES) {
            this.buildTrack(axis);
        }
    }

    private buildTrack(axis: Axis): void {
        const track = this.renderer.createElement('div') as HTMLElement;

        this.renderer.addClass(track, 'kbq-private-scrollbar-track');
        this.renderer.addClass(track, `kbq-private-scrollbar-track_${axis}`);
        this.renderer.setAttribute(track, 'aria-hidden', 'true');

        const thumb = this.renderer.createElement('div') as HTMLElement;

        this.renderer.addClass(thumb, 'kbq-private-scrollbar-thumb');
        this.renderer.appendChild(track, thumb);
        this.renderer.appendChild(this.hostElement, track);

        this.tracks.set(axis, track);
        this.thumbs.set(axis, thumb);

        this.wireTrackInteraction(axis, track, thumb);
    }

    private wireTrackInteraction(axis: Axis, track: HTMLElement, thumb: HTMLElement): void {
        fromEvent<PointerEvent>(thumb, 'pointerdown')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => {
                if (this.disableInteraction()) return;
                this.beginInteraction(axis, track, thumb, event, false);
            });

        // "Jump to click": clicking the track (not the thumb itself) re-centers the thumb under
        // the pointer and continues as a drag if the button stays down — same math as a real
        // drag-start, just with the grab offset hardcoded to the thumb's center.
        fromEvent<PointerEvent>(track, 'pointerdown')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => {
                if (this.disableInteraction() || event.target === thumb) return;
                this.beginInteraction(axis, track, thumb, event, true);
            });
    }

    private wireGlobalDragListeners(): void {
        fromEvent<PointerEvent>(this.document, 'pointermove')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => {
                if (!this.dragContext || event.pointerId !== this.dragContext.pointerId) return;

                if (!event.buttons) {
                    this.endDrag();

                    return;
                }

                this.applyDrag(this.dragContext.axis === 'vertical' ? event.clientY : event.clientX);
            });

        fromEvent<PointerEvent>(this.document, 'pointerup')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => {
                if (!this.dragContext || event.pointerId !== this.dragContext.pointerId) return;
                this.endDrag();
            });
    }

    private beginInteraction(
        axis: Axis,
        track: HTMLElement,
        thumb: HTMLElement,
        event: PointerEvent,
        centerOnThumb: boolean
    ): void {
        event.preventDefault();

        const isVertical = axis === 'vertical';
        const trackRect = track.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        // Inset by the same `cssTrackPadding` gap `updateAxis` positions the thumb within, so a
        // drag maps 1:1 to the thumb's actual travel range instead of the track's full box.
        const trackStart = (isVertical ? trackRect.top : trackRect.left) + this.cssTrackPadding;
        const trackLength = (isVertical ? trackRect.height : trackRect.width) - 2 * this.cssTrackPadding;
        const thumbSize = isVertical ? thumbRect.height : thumbRect.width;
        const thumbStart = isVertical ? thumbRect.top : thumbRect.left;
        const pointerCoord = isVertical ? event.clientY : event.clientX;

        const scrollEl = this.scrollElement;
        const scrollRange = isVertical
            ? scrollEl.scrollHeight - scrollEl.clientHeight
            : scrollEl.scrollWidth - scrollEl.clientWidth;

        this.dragContext = {
            axis,
            pointerId: event.pointerId,
            trackStart,
            trackTravel: trackLength - thumbSize,
            grabOffset: centerOnThumb ? thumbSize / 2 : pointerCoord - thumbStart,
            scrollRange
        };

        this.setVisible(true);
        this.renderer.addClass(this.hostElement, 'kbq-private-scrollbar_dragging');
        this.applyDrag(pointerCoord);
    }

    private applyDrag(pointerCoord: number): void {
        const ctx = this.dragContext;

        if (!ctx || ctx.trackTravel <= 0) return;

        const pointerRelative = pointerCoord - ctx.trackStart;
        // Physical ratio: 0 at the track's physical start (left/top), 1 at its physical end.
        const ratio = clamp((pointerRelative - ctx.grabOffset) / ctx.trackTravel, 0, 1);

        if (ctx.axis === 'vertical') {
            this.scrollElement.scrollTop = ratio * ctx.scrollRange;
        } else if (this.rtl()) {
            // RTL `scrollLeft` runs 0 (physical right) to -scrollRange (physical left) — invert
            // the physical ratio derived above onto that range.
            this.scrollElement.scrollLeft = (ratio - 1) * ctx.scrollRange;
        } else {
            this.scrollElement.scrollLeft = ratio * ctx.scrollRange;
        }
    }

    private endDrag(): void {
        if (!this.dragContext) return;

        this.dragContext = null;
        this.renderer.removeClass(this.hostElement, 'kbq-private-scrollbar_dragging');
    }

    private wireVisibility(): void {
        fromEvent(this.hostElement, 'pointerenter')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.isPointerOver = true;

                if (this.visibility() === 'hover') this.setVisible(true);
            });

        fromEvent(this.hostElement, 'pointerleave')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.isPointerOver = false;

                if (this.visibility() === 'hover' && !this.dragContext) this.setVisible(false);
            });

        // Reacts to `kbqScrollbarVisibility` changing at runtime, not just its value at first
        // render — sets the new mode's steady state. `isPointerOver` is read (not tracked) so this
        // only reruns on an actual mode change, using whatever the live hover state is at that
        // moment; ongoing hover-driven toggling still comes from the listeners above. 'scroll'
        // mode's temporary reveal-on-scroll keeps coming from onUserScroll()/showTemporarily() —
        // 'hidden' starts from the same steady state but never gets revealed from anywhere.
        effect(
            () => {
                const mode = this.visibility();

                if (mode === 'always') {
                    this.setVisible(true);
                } else if (mode === 'hover') {
                    this.setVisible(this.isPointerOver);
                } else {
                    this.setVisible(false);
                }
            },
            { injector: this.injector }
        );
    }

    private onUserScroll(): void {
        this.emit(this.scrollChange, { top: this.scrollElement.scrollTop, left: this.scrollElement.scrollLeft });

        if (this.visibility() === 'scroll') this.showTemporarily();
    }

    private showTemporarily(): void {
        this.setVisible(true);
        clearTimeout(this.autoHideTimeoutId);
        this.autoHideTimeoutId = setTimeout(() => {
            if (!this.dragContext) this.setVisible(false);
        }, this.autoHideDelay());
    }

    private setVisible(value: boolean): void {
        if (this.isVisible === value) return;

        this.isVisible = value;
        this.renderer[value ? 'addClass' : 'removeClass'](this.hostElement, 'kbq-private-scrollbar_visible');
        this.emit(this.visibilityChange, value);
    }

    private recompute(): void {
        for (const axis of AXES) {
            this.updateAxis(axis);
        }

        // Corner-avoidance only makes sense between two custom tracks — a no-op anyway without
        // them, but skip it outright under `native`/coarse pointer.
        if (!this.native && !this.isCoarsePointer) {
            this.updateCornerAvoidance();
        }

        this.emit(this.updated, undefined);
    }

    /**
     * Marks each track with whether the other one is currently also visible, so `scrollbar.scss`
     * can shorten its length by the other's thickness — otherwise they'd overlap by one
     * track-thickness in the shared corner, the way native scrollbars leave an empty square where
     * they meet. A no-op whenever content only overflows on one axis.
     */
    private updateCornerAvoidance(): void {
        const verticalTrack = this.tracks.get('vertical');
        const horizontalTrack = this.tracks.get('horizontal');
        const bothVisible =
            !!verticalTrack &&
            !!horizontalTrack &&
            verticalTrack.style.display !== 'none' &&
            horizontalTrack.style.display !== 'none';

        if (verticalTrack) {
            this.renderer[bothVisible ? 'addClass' : 'removeClass'](
                verticalTrack,
                'kbq-private-scrollbar-track_has-horizontal'
            );
        }

        if (horizontalTrack) {
            this.renderer[bothVisible ? 'addClass' : 'removeClass'](
                horizontalTrack,
                'kbq-private-scrollbar-track_has-vertical'
            );
        }
    }

    /**
     * Measures overflow/edge state for `isAtTop`-family signals and `reach*` outputs, then — only
     * when this axis actually has a track/thumb built (i.e. not `native`, not a coarse pointer) —
     * paints the thumb's size and position. The measurement half runs unconditionally: those
     * signals/outputs are meant to keep working even when there's no custom UI of our own to show.
     */
    private updateAxis(axis: Axis): void {
        const scrollEl = this.scrollElement;
        const isVertical = axis === 'vertical';
        const viewportSize = isVertical ? scrollEl.clientHeight : scrollEl.clientWidth;
        const contentSize = isVertical ? scrollEl.scrollHeight : scrollEl.scrollWidth;
        const rawScrollOffset = isVertical ? scrollEl.scrollTop : scrollEl.scrollLeft;
        const overflows = isVertical ? this.verticalOverflows : this.horizontalOverflows;
        const track = this.tracks.get(axis);
        const thumb = this.thumbs.get(axis);

        if (contentSize <= viewportSize) {
            if (track) this.renderer.setStyle(track, 'display', 'none');
            // Nothing to scroll on this axis — `isAtTop()`/`isAtBottom()`-family signals short-
            // circuit to `true` off this flag, without touching the real edge-position signals
            // below (those stay at whatever they last genuinely measured).
            overflows.set(false);

            return;
        }

        overflows.set(true);

        const scrollRange = contentSize - viewportSize;
        // Physical distance from the left/top edge, in [0, scrollRange] — normalizes RTL's negative
        // `scrollLeft` range (0 at the right edge, down to -scrollRange at the left) onto the same
        // physical axis the thumb's CSS position is anchored to. `checkReachedEdges` below
        // re-derives the logical start/end from this physical value itself.
        const scrollOffset = !isVertical && this.rtl() ? scrollRange + rawScrollOffset : rawScrollOffset;

        this.checkReachedEdges(axis, scrollOffset, scrollRange);

        // No custom track/thumb to paint for this axis — `native`/coarse pointer, or the DOM for
        // it hasn't been built. Measurement above already ran either way.
        if (!track || !thumb) return;

        // Un-hide *before* measuring, not after: a `CdkVirtualScrollViewport` (or any scroll
        // element whose layout isn't settled on the very first pass) can make an earlier call
        // land in the branch above and set `display: none`. A hidden element always measures a
        // 0 clientHeight/Width, so if we measured first and only unhid on success, a stale
        // `display: none` would make every subsequent pass measure 0 and bail out below,
        // trapping the track hidden forever even once real content overflow is detected here.
        this.renderer.removeStyle(track, 'display');

        const trackLength = isVertical ? track.clientHeight : track.clientWidth;

        // Track not laid out yet (e.g. inserted this same tick) — a later pass will retry.
        if (trackLength <= 0) return;

        // The thumb travels within the track minus a `cssTrackPadding` gap at *each* end, so it
        // never sits flush against the track's own start/end edge — matching the CSS insets
        // already applied on its cross-axis (`scrollbar.scss`'s `left`/`right`/`top`/`bottom`
        // rules), just computed here since this axis is otherwise entirely JS-driven.
        const travelLength = trackLength - 2 * this.cssTrackPadding;

        // Round the ratio up so the thumb never reads as undersized from float error.
        const ratio = Math.min(1, Math.ceil((viewportSize / contentSize) * 100) / 100);
        const thumbSize = Math.min(travelLength, Math.max(ratio * travelLength, this.cssMinThumbSize));
        const scrollRatio = scrollRange > 0 ? scrollOffset / scrollRange : 0;
        const thumbOffset = this.cssTrackPadding + scrollRatio * (travelLength - thumbSize);

        if (isVertical) {
            this.renderer.setStyle(thumb, 'height', coerceCssPixelValue(thumbSize));
            this.renderer.setStyle(thumb, 'top', coerceCssPixelValue(thumbOffset));
        } else {
            this.renderer.setStyle(thumb, 'width', coerceCssPixelValue(thumbSize));
            this.renderer.setStyle(thumb, 'left', coerceCssPixelValue(thumbOffset));
        }
    }

    /**
     * The writable `isAtTop`/`isAtStart`-family signals for one physical axis — `[start, end]`,
     * both always physically named (top/bottom, left/right); the public `isAtStart`/`isAtEnd`
     * computed signals are what re-map "left/right" onto RTL-aware "start/end".
     */
    private edgeSignals(axis: Axis): readonly [WritableSignal<boolean>, WritableSignal<boolean>] {
        return axis === 'vertical'
            ? [this.verticalAtTop, this.verticalAtBottom]
            : [this.horizontalAtLeft, this.horizontalAtRight];
    }

    private checkReachedEdges(axis: Axis, scrollOffset: number, scrollRange: number): void {
        const atPhysicalStart = scrollOffset <= 0;
        const atPhysicalEnd = scrollRange > 0 && Math.round(scrollOffset) >= Math.round(scrollRange);
        const [startState, endState] = this.edgeSignals(axis);

        // Vertical has no RTL concept — top is always physically first. Horizontal's physical
        // left/right flips which *logical* edge (reachStart/reachEnd) it maps to in RTL, matching
        // scrollStart()/scrollEnd()'s own RTL-aware semantics.
        const physicalStartEmitter = axis === 'vertical' ? this.reachTop : this.rtl() ? this.reachEnd : this.reachStart;
        const physicalEndEmitter =
            axis === 'vertical' ? this.reachBottom : this.rtl() ? this.reachStart : this.reachEnd;

        if (atPhysicalStart && !startState()) {
            this.emit(physicalStartEmitter, undefined);
        }

        startState.set(atPhysicalStart);

        if (atPhysicalEnd && !endState()) {
            this.emit(physicalEndEmitter, undefined);
        }

        endState.set(atPhysicalEnd);
    }

    private emit<T>(emitter: OutputEmitterRef<T>, value: T): void {
        this.zone.run(() => emitter.emit(value));
    }
}

import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import { CdkScrollable, type ExtendedScrollToOptions } from '@angular/cdk/scrolling';
import {
    afterNextRender,
    ApplicationRef,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    createComponent,
    Directive,
    effect,
    EnvironmentInjector,
    inject,
    InjectionToken,
    Injector,
    input,
    NgZone,
    numberAttribute,
    Renderer2,
    ViewEncapsulation,
    type ComponentRef,
    type Provider
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, kbqInjectNativeElement } from '@koobiq/components/core';
import {
    asyncScheduler,
    concat,
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    merge,
    Observable,
    of,
    startWith,
    Subject,
    switchMap,
    takeUntil,
    throttleTime,
    timer,
    type MonoTypeOperatorFunction,
    type SchedulerAction,
    type SchedulerLike,
    type Subscription
} from 'rxjs';

/** Emits `requestAnimationFrame` timestamps outside Angular's zone; never emits during SSR, where there's no frame to wait on. */
function animationFrame(): Observable<number> {
    const window = inject(KBQ_WINDOW);
    const ngZone = inject(NgZone);

    return new Observable<number>((subscriber) => {
        if (typeof window.requestAnimationFrame === 'undefined') {
            return undefined;
        }

        // `requestAnimationFrame` runs its callback in whatever zone was active when it was scheduled,
        // so the recursive re-scheduling below must itself run outside Angular's zone too — otherwise
        // this loop (which never stops on its own) keeps `NgZone` perpetually unstable for as long as
        // the subscription is alive.
        return ngZone.runOutsideAngular(() => {
            let frameId = window.requestAnimationFrame(function loop(timestamp) {
                subscriber.next(timestamp);
                frameId = window.requestAnimationFrame(loop);
            });

            return () => window.cancelAnimationFrame(frameId);
        });
    });
}

/** Runs the source subscription outside Angular's zone so it doesn't trigger change detection. */
function zoneFree<T>(): MonoTypeOperatorFunction<T> {
    const ngZone = inject(NgZone);

    return (source) => new Observable<T>((subscriber) => ngZone.runOutsideAngular(() => source.subscribe(subscriber)));
}

/** A scheduler that always schedules its work outside Angular's zone. */
function zoneFreeScheduler(): SchedulerLike {
    const ngZone = inject(NgZone);

    return {
        now: () => Date.now(),
        schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription {
            let subscription!: Subscription;

            ngZone.runOutsideAngular(() => {
                subscription = asyncScheduler.schedule(work, delay, state);
            });

            return subscription;
        }
    };
}

/** Re-enters Angular's zone for every emission so change detection is triggered. */
function zoneOptimized<T>(): MonoTypeOperatorFunction<T> {
    const ngZone = inject(NgZone);

    return (source) =>
        new Observable<T>((subscriber) =>
            source.subscribe({
                next: (value) => ngZone.run(() => subscriber.next(value)),
                error: (error) => subscriber.error(error),
                complete: () => subscriber.complete()
            })
        );
}

/** Sums `offsetTop`/`offsetLeft` from `element` up to (excluding) `ancestor`. */
function getElementOffset(ancestor: HTMLElement, element: HTMLElement): { offsetTop: number; offsetLeft: number } {
    let offsetTop = 0;
    let offsetLeft = 0;
    let current: HTMLElement | null = element;

    while (current && current !== ancestor) {
        offsetTop += current.offsetTop;
        offsetLeft += current.offsetLeft;
        current = current.offsetParent as HTMLElement | null;
    }

    return { offsetTop, offsetLeft };
}

/**
 * How the scrollbar is presented:
 * - `hover` — track appears on pointer hover or while scrolling (default);
 * - `always` — track is always visible while the content overflows;
 * - `native` — the browser's native scrollbar is used;
 * - `hidden` — no scrollbar is shown, but the content stays scrollable.
 */
export type KbqScrollbarMode = 'always' | 'hidden' | 'hover' | 'native';

/** Configuration for {@link KbqScrollbar}. */
export type KbqScrollbarOptions = {
    mode: KbqScrollbarMode;
    /** How long the scroll-revealed track stays visible after scrolling stops, in milliseconds. */
    hideDelay: number;
};

const KBQ_SCROLLBAR_DEFAULT_OPTIONS: KbqScrollbarOptions = {
    mode: 'hover',
    hideDelay: 1000
};

/** Injection token holding the current {@link KbqScrollbarOptions}. */
export const KBQ_SCROLLBAR_OPTIONS = new InjectionToken<KbqScrollbarOptions>('KBQ_SCROLLBAR_OPTIONS', {
    factory: () => KBQ_SCROLLBAR_DEFAULT_OPTIONS
});

/** Overrides the default scrollbar options within the given injector scope. */
export function kbqScrollbarOptionsProvider(options: Partial<KbqScrollbarOptions>): Provider {
    return {
        provide: KBQ_SCROLLBAR_OPTIONS,
        useValue: { ...KBQ_SCROLLBAR_DEFAULT_OPTIONS, ...options }
    };
}

/** The axis a scrollbar thumb/track moves along. */
type Orientation = 'horizontal' | 'vertical';

/** How often (ms) the track recomputes its visibility and geometry from the viewport, throttling the animation frame. */
const TRACK_THROTTLE_TIME = 300;

/** Based on --kbq-scrollbar-thumb-min-size */
const MIN_THUMB_SIZE = 32;

/** Based on --kbq-scrollbar-thumb-gap */
const THUMB_GAP = 3;

// The CSS-enforced floor on the thumb's own main-axis box size — mirrors `min-block-size`/
// `min-inline-size` in scrollbar-track.scss (`--kbq-scrollbar-thumb-min-size` plus the transparent
// border on both sides). `getCompensation` below needs this exact box size, not just
// `MIN_THUMB_SIZE`, or the reserved top-offset room falls short of what the CSS actually enforces
// and the thumb overhangs the track's trailing edge at the very end of the scroll range.
const MIN_THUMB_BOX_SIZE = MIN_THUMB_SIZE + THUMB_GAP * 2;

type Dimension = Pick<
    HTMLElement,
    'scrollTop' | 'scrollHeight' | 'clientHeight' | 'scrollLeft' | 'scrollWidth' | 'clientWidth'
>;

/** `[vertical, horizontal]` overflow flags. */
type ScrollbarVisibility = readonly [boolean, boolean];

/** The scroll viewport's inner size and start padding on each axis, used to place the track over the scrollport. */
type ViewportMetrics = {
    blockSize: number;
    inlineSize: number;
    paddingBlockStart: number;
    paddingInlineStart: number;
};

/** Loads the shared scrollbar tokens and global native/viewport styles once per app. */
@Component({
    selector: 'scrollbar-style-loader',
    template: '',
    styleUrls: ['./scrollbar-tokens.scss', './native-scrollbar.scss', './scrollbar-viewport.scss'],
    encapsulation: ViewEncapsulation.None
})
class ScrollbarStyleLoader {}

/** Customizes the browser-rendered scrollbar of its host without replacing native scrolling. */
@Directive({
    selector: '[kbqNativeScrollbar]',
    host: {
        class: 'kbq-native-scrollbar',
        '[class.kbq-native-scrollbar_descendants]': 'descendants()'
    },
    exportAs: 'kbqNativeScrollbar'
})
export class KbqNativeScrollbar {
    private readonly styleLoader = inject(_CdkPrivateStyleLoader);

    /** Whether browser-rendered scrollbars of descendant elements should also be customized. */
    readonly descendants = input(false, {
        alias: 'kbqNativeScrollbarDescendants',
        transform: booleanAttribute
    });

    constructor() {
        this.styleLoader.load(ScrollbarStyleLoader);
    }
}

/** Options accepted by {@link KbqScrollbarViewport.scrollTo}/{@link KbqScrollbar.scrollTo} — RTL-normalized, see `CdkScrollable.scrollTo`. */
export type KbqScrollbarScrollToOptions = ExtendedScrollToOptions;

/** Options accepted by {@link KbqScrollbarViewport.scrollToElement}/{@link KbqScrollbar.scrollToElement}. */
export type KbqScrollbarScrollToElementOptions = {
    /** Extra gap to leave above the target, in px — e.g. so it doesn't end up under a sticky header. */
    top?: number;
    /** Extra gap to leave to the left of the target, in px. */
    left?: number;
    behavior?: ScrollBehavior;
};

/** `[top, left]` scroll offsets in pixels. */
type ScrollPosition = [number, number];

/** Marks its host element as the custom scrollbar's scroll target, hiding its native scrollbar whenever a custom scrollbar track replaces it. */
@Directive({
    selector: '[kbqScrollbarViewport]',
    host: {
        class: 'kbq-scrollbar-viewport',
        '[class.kbq-scrollbar-viewport_native-scrollbar-hidden]': 'mode() !== "native"',
        // A stable id for the thumb's `aria-controls` to point at, preserving one a consumer already
        // set rather than clobbering it.
        '[attr.id]': 'id'
    },
    hostDirectives: [CdkScrollable]
})
export class KbqScrollbarViewport {
    private readonly styleLoader = inject(_CdkPrivateStyleLoader);
    private readonly scrollable = inject(CdkScrollable);
    private readonly appRef = inject(ApplicationRef);
    private readonly environmentInjector = inject(EnvironmentInjector);
    private readonly injector = inject(Injector);
    private readonly idGenerator = inject(_IdGenerator);
    private readonly options = inject(KBQ_SCROLLBAR_OPTIONS);

    /** Stable id on the viewport element, used as the `aria-controls` target for the scrollbar thumb. */
    protected readonly id = this.getNativeElement().id || this.idGenerator.getId('kbq-scrollbar-viewport-');

    /** Visibility mode for this viewport's scrollbar. Defaults to the app-wide {@link KBQ_SCROLLBAR_OPTIONS}. */
    readonly mode = input<KbqScrollbarMode>(this.options.mode, { alias: 'kbqScrollbarMode' });

    /**
     * How long the scroll-revealed `hover`-mode track stays visible after scrolling stops, in milliseconds.
     * Defaults to the app-wide {@link KBQ_SCROLLBAR_OPTIONS}.
     */
    readonly hideDelay = input(this.options.hideDelay, {
        alias: 'kbqScrollbarHideDelay',
        transform: numberAttribute
    });

    // Reference to the dynamically created track, used to update its mode and destroy it when custom
    // scrollbars are disabled.
    private trackRef: ComponentRef<KbqScrollbarTrack> | null = null;

    // Fires each `flashScrollIndicators()` call; the track reveals itself on it just like on a scroll event.
    private readonly flashSubject = new Subject<void>();

    constructor() {
        this.styleLoader.load(ScrollbarStyleLoader);

        effect(() => {
            const mode = this.mode();
            const hideDelay = this.hideDelay();
            const showTrack = mode !== 'native' && mode !== 'hidden';

            if (!showTrack) {
                this.trackRef?.destroy();
                this.trackRef = null;

                return;
            }

            if (!this.trackRef) {
                this.trackRef = this.createTrack();
            }

            this.trackRef.setInput('mode', mode);
            this.trackRef.setInput('hideDelay', hideDelay);
        });
    }

    /** The viewport's native scrollable element — the host this directive is applied to. */
    getNativeElement(): HTMLElement {
        return this.scrollable.getElementRef().nativeElement;
    }

    /** Emits on every native `scroll` event of the viewport. Emits outside Angular's zone — see `CdkScrollable.elementScrolled`. */
    get scrollChanges(): Observable<Event> {
        return this.scrollable.elementScrolled();
    }

    /** Emits each time {@link KbqScrollbarViewport.flashScrollIndicators} is called, so the track can reveal itself. */
    get flashes(): Observable<void> {
        return this.flashSubject;
    }

    /**
     * Briefly reveals the scrollbar track, then fades it out after `hideDelay` — the same transient reveal
     * as scrolling, without any actual scroll. Mirrors iOS `UIScrollView.flashScrollIndicators()`: call it
     * to hint that content is scrollable when nothing has scrolled yet (e.g. right after a dropdown panel
     * opens on an already-visible item). Only visible in `hover` mode with overflowing content; a no-op otherwise.
     */
    flashScrollIndicators(): void {
        this.flashSubject.next();
    }

    /** Scrolls to the specified offsets. RTL-normalized — see `CdkScrollable.scrollTo`. */
    scrollTo(options: KbqScrollbarScrollToOptions): void {
        this.scrollable.scrollTo(options);
    }

    /** Scrolls to the start of the vertical axis. */
    scrollToTop(behavior?: ScrollBehavior): void {
        this.scrollTo({ top: 0, behavior });
    }

    /** Scrolls to the end of the vertical axis. */
    scrollToBottom(behavior?: ScrollBehavior): void {
        this.scrollTo({ top: this.getNativeElement().scrollHeight, behavior });
    }

    /** Scrolls to the logical start of the horizontal axis — the right edge in RTL, left in LTR. */
    scrollStart(behavior?: ScrollBehavior): void {
        this.scrollTo({ start: 0, behavior });
    }

    /** Scrolls to the logical end of the horizontal axis — the left edge in RTL, right in LTR. */
    scrollEnd(behavior?: ScrollBehavior): void {
        this.scrollTo({ end: 0, behavior });
    }

    /** Scrolls `target` (an element, or a selector resolved against this viewport) into view. */
    scrollToElement(target: HTMLElement | string, options?: KbqScrollbarScrollToElementOptions): void {
        const _target =
            typeof target === 'string' ? this.getNativeElement().querySelector<HTMLElement>(target) : target;

        if (!_target) return;

        const { offsetTop, offsetLeft } = getElementOffset(this.getNativeElement(), _target);

        this.scrollTo({
            top: offsetTop - (options?.top ?? 0),
            left: offsetLeft - (options?.left ?? 0),
            behavior: options?.behavior
        });
    }

    /** Scrolls `target` to the center of the viewport. */
    scrollIntoView(target: HTMLElement, behavior?: ScrollBehavior): void {
        const { offsetHeight, offsetWidth } = target;
        const { offsetTop, offsetLeft } = getElementOffset(this.getNativeElement(), target);

        this.scrollTo({
            top: offsetTop + offsetHeight / 2 - this.getNativeElement().clientHeight / 2,
            left: offsetLeft + offsetWidth / 2 - this.getNativeElement().clientWidth / 2,
            behavior
        });
    }

    private createTrack(): ComponentRef<KbqScrollbarTrack> {
        // Created standalone and attached to the ApplicationRef rather than through a `ViewContainerRef`:
        // the track must live as a direct child of the scrollable element (for the sticky positioning in
        // scrollbar-track.scss), but a `cdk-virtual-scroll-viewport` re-renders its own DOM subtree, and a
        // VCR-owned view manually moved into it is snapped back to its logical anchor on the next change
        // detection — leaving the virtual viewport with no working scrollbar. An ApplicationRef-attached
        // view has no such anchor, so it stays where we put it.
        const track = createComponent(KbqScrollbarTrack, {
            environmentInjector: this.environmentInjector,
            elementInjector: this.injector
        });

        this.appRef.attachView(track.hostView);

        // Captures `track` itself, not `this.trackRef` — by the time this fires the viewport may already
        // have destroyed/replaced it (e.g. mode flipping through native/hidden and back before the next
        // render), and inserting a stale, already-destroyed node is harmless, but dereferencing a by-then-
        // cleared `this.trackRef` would throw.
        afterNextRender(
            () => {
                this.getNativeElement().insertBefore(track.location.nativeElement, this.getNativeElement().firstChild);
            },
            { injector: this.injector }
        );

        return track;
    }
}

/**
 * Draggable thumb element: turns drags/track clicks into scroll positions of the
 * {@link KbqScrollbarViewport}, and mirrors its scroll position/size back onto its own CSS position.
 */
@Directive({
    selector: '[kbqScrollbarThumb]',
    host: {
        role: 'scrollbar',
        '[attr.aria-orientation]': 'orientation()',
        '[attr.aria-controls]': 'viewportElement.id',
        '[attr.aria-valuemin]': '0',
        '[attr.aria-valuemax]': '100'
    },
    exportAs: 'kbqScrollbarThumb'
})
class KbqScrollbarThumb {
    private readonly viewport = inject(KbqScrollbarViewport);
    private readonly directionality = inject(Directionality);
    /** The scroll viewport's element, whose scroll state this thumb reflects and controls. @docs-private */
    protected readonly viewportElement = this.viewport.getNativeElement();
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly style = this.nativeElement.style;

    /** Axis the thumb scrolls along — `'vertical'` (default) or `'horizontal'`. */
    readonly orientation = input.required<Orientation>();

    constructor() {
        merge(
            fromEvent<MouseEvent>(this.nativeElement.parentElement!, 'mousedown').pipe(
                filter(({ target }) => target !== this.nativeElement),
                map((event) => this.getScrolled(event, 0.5, 0.5))
            ),
            fromEvent<MouseEvent>(this.nativeElement, 'mousedown').pipe(
                zoneFree(),
                switchMap((event) => {
                    const { ownerDocument } = this.nativeElement;
                    const { top, left, height, width } = this.nativeElement.getBoundingClientRect();
                    const vertical = (event.clientY - top) / height;
                    const horizontal = (event.clientX - left) / width;

                    return fromEvent<MouseEvent>(ownerDocument, 'mousemove').pipe(
                        map((event) => this.getScrolled(event, vertical, horizontal)),
                        takeUntil(fromEvent(ownerDocument, 'mouseup'))
                    );
                })
            )
        )
            .pipe(takeUntilDestroyed())
            .subscribe(([top, left]) => {
                this.viewportElement.style.scrollBehavior = 'auto';

                if (this.orientation() === 'horizontal') {
                    this.viewportElement.scrollLeft = left;
                } else {
                    this.viewportElement.scrollTop = top;
                }

                this.viewportElement.style.scrollBehavior = '';
            });

        merge(animationFrame().pipe(throttleTime(100, zoneFreeScheduler())), this.viewport.scrollChanges)
            .pipe(
                zoneFree(),
                map(() => this.getDimension()),
                takeUntilDestroyed()
            )
            .subscribe((dimension) => {
                this.applyPosition(this.getPosition(dimension));
                this.applyValueNow(this.getValueNow(dimension));
            });

        // Not applied directly here: `orientation()` still reads its default value at this point in
        // the constructor — Angular hasn't applied the template-bound input yet — so reading it now
        // would compute a wrong-axis position for a horizontal thumb. `afterNextRender` runs once the
        // input is actually set, while still landing before the first throttled animation-frame/scroll
        // update above — `role="scrollbar"` requires `aria-valuenow` to be present from the start, or
        // axe (and any screen reader) could observe it missing.
        afterNextRender(() => {
            const dimension = this.getDimension();

            this.applyPosition(this.getPosition(dimension));
            this.applyValueNow(this.getValueNow(dimension));
        });
    }

    private getScrolled({ clientY, clientX }: MouseEvent, offsetY: number, offsetX: number): ScrollPosition {
        const { offsetHeight, offsetWidth } = this.nativeElement;
        const { top, left, right, width, height } = this.nativeElement.parentElement!.getBoundingClientRect();
        const rtl = this.directionality.value === 'rtl';
        const inline = rtl ? right : left;
        const multiplier = rtl ? -1 : 1;
        const maxTop = this.viewportElement.scrollHeight - height;
        const maxLeft = this.viewportElement.scrollWidth - width;
        const scrolledTop = (clientY - top - offsetHeight * offsetY) / (height - offsetHeight);
        const scrolledLeft = (clientX - inline - offsetWidth * offsetX * multiplier) / (width - offsetWidth);

        return [maxTop * scrolledTop, maxLeft * scrolledLeft];
    }

    private applyPosition(style: Partial<CSSStyleDeclaration>): void {
        Object.assign(this.style, style);
    }

    private applyValueNow(valueNow: number): void {
        this.nativeElement.setAttribute('aria-valuenow', `${valueNow}`);
    }

    private getDimension(): Dimension {
        const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = this.viewportElement;

        return { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth };
    }

    private getPosition(dimension: Dimension): Partial<CSSStyleDeclaration> {
        const thumb = `${this.getThumbFraction(dimension) * 100}%`;
        const view = `${this.getViewFraction(dimension) * 100}%`;

        return this.orientation() === 'vertical'
            ? { top: thumb, height: view }
            : { insetInlineStart: thumb, width: view };
    }

    private getValueNow(dimension: Dimension): number {
        const scrolledFraction = this.getScrolledFraction(dimension);

        // `getScrolledFraction` divides by zero (NaN) when there's nothing to scroll — 0% in that case.
        return Number.isNaN(scrolledFraction) ? 0 : Math.round(Math.abs(scrolledFraction) * 100);
    }

    private getThumbFraction(dimension: Dimension): number {
        const compensation = this.getCompensation(dimension) || this.getViewFraction(dimension);

        return Math.abs(this.getScrolledFraction(dimension) * (1 - compensation));
    }

    private getViewFraction(dimension: Dimension): number {
        return this.orientation() === 'vertical'
            ? Math.ceil((dimension.clientHeight / dimension.scrollHeight) * 100) / 100
            : Math.ceil((dimension.clientWidth / dimension.scrollWidth) * 100) / 100;
    }

    private getScrolledFraction({
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollLeft,
        scrollWidth,
        clientWidth
    }: Dimension): number {
        return this.orientation() === 'vertical'
            ? scrollTop / (scrollHeight - clientHeight)
            : scrollLeft / (scrollWidth - clientWidth);
    }

    private getCompensation({ clientHeight, clientWidth, scrollWidth, scrollHeight }: Dimension): number {
        if (
            ((clientHeight * clientHeight) / scrollHeight > MIN_THUMB_BOX_SIZE && this.orientation() === 'vertical') ||
            ((clientWidth * clientWidth) / scrollWidth > MIN_THUMB_BOX_SIZE && this.orientation() === 'horizontal')
        ) {
            return 0;
        }

        return this.orientation() === 'vertical' ? MIN_THUMB_BOX_SIZE / clientHeight : MIN_THUMB_BOX_SIZE / clientWidth;
    }
}

/**
 * Renders the visual scroll bars/thumbs for the {@link KbqScrollbarViewport}.
 *
 * Created and positioned exclusively by `KbqScrollbarViewport` — not exported, never place this
 * directly in a template. It only ever exists for `kbqScrollbarMode="hover"`/`"always"` (`KbqScrollbarViewport`
 * destroys it instead for `"native"`/`"hidden"`), so it carries no native/hidden handling itself.
 */
@Component({
    selector: 'kbq-scrollbar-track',
    imports: [KbqScrollbarThumb],
    template: `
        @if (visibility()[0]) {
            <div
                animate.enter="kbq-scrollbar-track__bar_enter"
                animate.leave="kbq-scrollbar-track__bar_leave"
                class="kbq-scrollbar-track__bar kbq-scrollbar-track__bar_vertical"
                [class.kbq-scrollbar-track__bar_has-horizontal]="visibility()[1]"
                (mousedown)="$event.preventDefault()"
            >
                <div kbqScrollbarThumb orientation="vertical" class="kbq-scrollbar-track__thumb"></div>
            </div>
        }
        @if (visibility()[1]) {
            <div
                animate.enter="kbq-scrollbar-track__bar_enter"
                animate.leave="kbq-scrollbar-track__bar_leave"
                class="kbq-scrollbar-track__bar kbq-scrollbar-track__bar_horizontal"
                [class.kbq-scrollbar-track__bar_has-vertical]="visibility()[0]"
                (mousedown)="$event.preventDefault()"
            >
                <div kbqScrollbarThumb orientation="horizontal" class="kbq-scrollbar-track__thumb"></div>
            </div>
        }
    `,
    styleUrl: './scrollbar-track.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-scrollbar-track',
        '[class.kbq-scrollbar-track_hover]': "mode() === 'hover'",
        '[class.kbq-scrollbar-track_revealed]': 'revealed()'
    }
})
class KbqScrollbarTrack {
    private readonly viewport = inject(KbqScrollbarViewport);
    private readonly viewportElement = this.viewport.getNativeElement();
    private readonly window = inject(KBQ_WINDOW);
    private readonly renderer = inject(Renderer2);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly nativeElement = kbqInjectNativeElement();
    protected readonly visibility = toSignal<ScrollbarVisibility>(
        animationFrame().pipe(
            throttleTime(TRACK_THROTTLE_TIME, zoneFreeScheduler()),
            map(() => this.scrollbars),
            startWith([false, false] as const),
            distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1]),
            zoneOptimized()
        ),
        { requireSync: true }
    );

    /**
     * Whether the hover-mode track is transiently revealed — `true` on each scroll event or
     * {@link KbqScrollbarViewport.flashScrollIndicators} call, cleared `hideDelay` ms after the last one
     * (`switchMap` restarts the hide timer on every trigger, so continuous scrolling keeps it `true`).
     * Shows the track on wheel/keyboard scrolling, on the programmatic scroll-into-view when a dropdown
     * opens by mouse, and on an explicit flash — matching native/overlayscrollbars.
     */
    protected readonly revealed = toSignal(
        // `scrollChanges` (CdkScrollable.elementScrolled) already emits outside Angular's zone.
        merge(this.viewport.scrollChanges, this.viewport.flashes).pipe(
            // No `zoneFreeScheduler()` on `timer`: it would `inject()` inside this per-scroll `switchMap`
            // callback — outside an injection context — and throw. The chain is already zone-free.
            switchMap(() => concat(of(true), timer(this.hideDelay()).pipe(map(() => false)))),
            startWith(false),
            distinctUntilChanged(),
            zoneOptimized()
        ),
        { requireSync: true }
    );

    /** Visibility mode, forwarded from the owning {@link KbqScrollbarViewport}; only `hover`/`always` reach the track. */
    readonly mode = input.required<KbqScrollbarMode>();

    /** Scroll-reveal hide delay (ms), forwarded from the owning {@link KbqScrollbarViewport}. */
    readonly hideDelay = input.required<number>();

    constructor() {
        // Reapply the geometry whenever the viewport's box changes. `SharedResizeObserver` fires only on an
        // actual size/padding change (a padding change shifts the content box too), not every frame, so
        // `getComputedStyle` runs only when something changed — and its `shareReplay` delivers the current
        // size on subscribe, applying the initial geometry right away. Writes styles directly, no change
        // detection. In SSR (no `ResizeObserver`) the stream simply never emits.
        this.resizeObserver
            .observe(this.viewportElement)
            .pipe(
                map(() => this.getViewportMetrics()),
                distinctUntilChanged(
                    (a, b) =>
                        a.blockSize === b.blockSize &&
                        a.inlineSize === b.inlineSize &&
                        a.paddingBlockStart === b.paddingBlockStart &&
                        a.paddingInlineStart === b.paddingInlineStart
                ),
                takeUntilDestroyed()
            )
            .subscribe((metrics) => this.applyGeometry(metrics));
    }

    private get scrollbars(): ScrollbarVisibility {
        const { clientHeight, scrollHeight, clientWidth, scrollWidth } = this.viewportElement;

        return [
            Math.ceil((clientHeight / scrollHeight) * 100) < 100,
            Math.ceil((clientWidth / scrollWidth) * 100) < 100
        ];
    }

    /**
     * The scroll viewport's inner size and start padding on both axes: `blockSize`/`inlineSize` (its
     * `clientHeight`/`clientWidth`, i.e. the padding box) and `paddingBlockStart`/`paddingInlineStart`
     * (logical, so RTL flips the inline start to the right edge).
     */
    private getViewportMetrics(): ViewportMetrics {
        const element = this.viewportElement;
        const style = this.window.getComputedStyle(element);

        return {
            blockSize: element.clientHeight,
            inlineSize: element.clientWidth,
            paddingBlockStart: parseFloat(style.paddingBlockStart) || 0,
            paddingInlineStart: parseFloat(style.paddingInlineStart) || 0
        };
    }

    /**
     * Aligns the sticky track to the scrollport (the padding box) on both axes, flush at every scroll
     * position. Without it the viewport's own padding pushes the track onto the content box, so it overhangs
     * the scrollport end (block axis) and the bar sits `padding-inline-end` inside the scrollport end (inline
     * axis). Each axis uses the same three-part trick:
     * - `margin-*-start` lifts the track's box over the start padding to the scrollport start edge;
     * - `inset-*-start` keeps it pinned there (not at the content-box start) once scrolled;
     * - `margin-*-end` cancels the track's size in flow AND compensates the lifting `margin-*-start`, so the
     *   net layout contribution stays zero and content isn't shifted.
     */
    private applyGeometry({ blockSize, inlineSize, paddingBlockStart, paddingInlineStart }: ViewportMetrics): void {
        const setStyle = (property: string, value: number) =>
            this.renderer.setStyle(this.nativeElement, property, coerceCssPixelValue(value));

        setStyle('blockSize', blockSize - 1);
        setStyle('marginBlockStart', -paddingBlockStart);
        setStyle('marginBlockEnd', paddingBlockStart - (blockSize - 1));
        setStyle('insetBlockStart', -paddingBlockStart);

        setStyle('minInlineSize', inlineSize - 1);
        setStyle('maxInlineSize', inlineSize - 1);
        setStyle('marginInlineStart', -paddingInlineStart);
        setStyle('marginInlineEnd', paddingInlineStart - (inlineSize - 1));
        setStyle('insetInlineStart', -paddingInlineStart);
    }
}

/** Custom scrollbar wrapper: projects content and overlays a scrollbar track over it (created by its {@link KbqScrollbarViewport} host directive). */
@Component({
    selector: 'kbq-scrollbar',
    template: `
        <div class="kbq-scrollbar__content">
            <ng-content />
        </div>
    `,
    styleUrl: './scrollbar.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        { directive: KbqScrollbarViewport, inputs: ['kbqScrollbarMode', 'kbqScrollbarHideDelay'] }
    ],
    exportAs: 'kbqScrollbar'
})
export class KbqScrollbar {
    private readonly options = inject(KBQ_SCROLLBAR_OPTIONS);
    private readonly viewport = inject(KbqScrollbarViewport);

    /** Visibility mode for the scrollbar. Defaults to the app-wide {@link KBQ_SCROLLBAR_OPTIONS}. */
    readonly mode = input<KbqScrollbarMode>(this.options.mode, { alias: 'kbqScrollbarMode' });

    /**
     * How long the scroll-revealed `hover`-mode track stays visible after scrolling stops, in milliseconds.
     * Defaults to the app-wide {@link KBQ_SCROLLBAR_OPTIONS}.
     */
    readonly hideDelay = input(this.options.hideDelay, {
        alias: 'kbqScrollbarHideDelay',
        transform: numberAttribute
    });

    /** The scrollbar's native scrollable element. */
    getNativeElement(): HTMLElement {
        return this.viewport.getNativeElement();
    }

    /** Scrolls to the specified offsets. RTL-normalized — see `CdkScrollable.scrollTo`. */
    scrollTo(options: KbqScrollbarScrollToOptions): void {
        this.viewport.scrollTo(options);
    }

    /** Scrolls to the start of the vertical axis. */
    scrollToTop(behavior?: ScrollBehavior): void {
        this.viewport.scrollToTop(behavior);
    }

    /** Scrolls to the end of the vertical axis. */
    scrollToBottom(behavior?: ScrollBehavior): void {
        this.viewport.scrollToBottom(behavior);
    }

    /** Scrolls to the logical start of the horizontal axis — the right edge in RTL, left in LTR. */
    scrollStart(behavior?: ScrollBehavior): void {
        this.viewport.scrollStart(behavior);
    }

    /** Scrolls to the logical end of the horizontal axis — the left edge in RTL, right in LTR. */
    scrollEnd(behavior?: ScrollBehavior): void {
        this.viewport.scrollEnd(behavior);
    }

    /** Scrolls `target` (an element, or a selector resolved against this scrollbar) into view. */
    scrollToElement(target: HTMLElement | string, options?: KbqScrollbarScrollToElementOptions): void {
        this.viewport.scrollToElement(target, options);
    }

    /** Scrolls `target` to the center of the viewport. */
    scrollIntoView(target: HTMLElement, behavior?: ScrollBehavior): void {
        this.viewport.scrollIntoView(target, behavior);
    }

    /** Briefly reveals the scrollbar track — see {@link KbqScrollbarViewport.flashScrollIndicators}. */
    flashScrollIndicators(): void {
        this.viewport.flashScrollIndicators();
    }

    /** Emits on every native `scroll` event of the viewport. Emits outside Angular's zone — see `CdkScrollable.elementScrolled`. */
    get scrollChanges(): Observable<Event> {
        return this.viewport.scrollChanges;
    }
}

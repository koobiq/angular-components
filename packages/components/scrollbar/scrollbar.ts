import { _IdGenerator, CdkMonitorFocus } from '@angular/cdk/a11y';
import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import { CdkScrollable, type ExtendedScrollToOptions } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    Injector,
    input,
    NgZone,
    ViewContainerRef,
    ViewEncapsulation,
    type ComponentRef,
    type Provider
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, kbqInjectNativeElement } from '@koobiq/components/core';
import {
    asyncScheduler,
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    merge,
    Observable,
    startWith,
    switchMap,
    takeUntil,
    throttleTime,
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
 * A DI token pointing to the element whose scroll state the scrollbar tracks and controls.
 * By default resolves to {@link KbqScrollbar}'s own host element; place `[kbqScrollbarViewport]` on a
 * nested element to delegate to it instead.
 */
export const KBQ_SCROLLBAR_VIEWPORT = new InjectionToken<ElementRef<HTMLElement>>('KBQ_SCROLLBAR_VIEWPORT', {
    factory: () => new ElementRef(inject(DOCUMENT).documentElement)
});

/**
 * How the scrollbar is presented:
 * - `hover` — track appears on pointer hover or keyboard focus (default);
 * - `always` — track is always visible while the content overflows;
 * - `native` — the browser's native scrollbar is used;
 * - `hidden` — no scrollbar is shown, but the content stays scrollable.
 */
export type KbqScrollbarMode = 'always' | 'hidden' | 'hover' | 'native';

/** Configuration for {@link KbqScrollbar}. */
export type KbqScrollbarOptions = {
    mode: KbqScrollbarMode;
};

const KBQ_SCROLLBAR_DEFAULT_OPTIONS: KbqScrollbarOptions = {
    mode: 'hover'
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

/** Loads the global `.kbq-scrollbar-viewport_native-scrollbar-hidden` utility class once per app (see {@link KbqScrollbarViewport}). */
@Component({
    selector: 'scrollbar-viewport-style-loader',
    template: '',
    styleUrl: './scrollbar-viewport.scss',
    encapsulation: ViewEncapsulation.None
})
class ScrollbarViewportStyleLoader {}

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

/** Marks its host element as the scroll target for {@link KBQ_SCROLLBAR_VIEWPORT} consumers, hiding its native scrollbar whenever a custom scrollbar track replaces it. */
@Directive({
    selector: '[kbqScrollbarViewport]',
    providers: [{ provide: KBQ_SCROLLBAR_VIEWPORT, useExisting: ElementRef }],
    host: {
        class: 'kbq-scrollbar-viewport',
        '[class.kbq-scrollbar-viewport_native-scrollbar-hidden]': 'mode() !== "native"',
        // Monitors the whole subtree (not just this element) so `cdk-keyboard-focused` lands on the
        // viewport itself whenever ANY descendant is keyboard-focused — projected content doesn't have
        // to opt in individually with its own `cdkMonitorElementFocus`. Drives the hover-mode track's
        // visibility in scrollbar-viewport.scss.
        '[attr.cdkMonitorSubtreeFocus]': 'true',
        // A stable id for the thumb's `aria-controls` to point at, preserving one a consumer already
        // set rather than clobbering it.
        '[attr.id]': 'id'
    },
    hostDirectives: [CdkScrollable, CdkMonitorFocus]
})
export class KbqScrollbarViewport {
    private readonly styleLoader = inject(_CdkPrivateStyleLoader);
    private readonly scrollable = inject(CdkScrollable);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly injector = inject(Injector);
    private readonly idGenerator = inject(_IdGenerator);

    /** Stable id on the viewport element, used as the `aria-controls` target for the scrollbar thumb. */
    protected readonly id = this.getNativeElement().id || this.idGenerator.getId('kbq-scrollbar-viewport-');

    /** Visibility mode for this viewport's scrollbar. Defaults to the app-wide {@link KBQ_SCROLLBAR_OPTIONS}. */
    readonly mode = input<KbqScrollbarMode>(inject(KBQ_SCROLLBAR_OPTIONS).mode);

    // Reference to the dynamically created track, used to update its mode and destroy it when custom
    // scrollbars are disabled.
    private trackRef: ComponentRef<KbqScrollbarTrack> | null = null;

    constructor() {
        this.styleLoader.load(ScrollbarViewportStyleLoader);

        effect(() => {
            const mode = this.mode();
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
        const track = this.viewContainerRef.createComponent(KbqScrollbarTrack, { injector: this.injector });

        // The track needs to be a direct child of the scrollable element itself (for the sticky
        // positioning in scrollbar-track.scss to work) regardless of where `createComponent` happens to
        // insert its view, so move it there explicitly. Captures `track` itself, not `this.trackRef` —
        // by the time this fires the viewport may already have destroyed/replaced it (e.g. mode flipping
        // through native/hidden and back before the next render), and relocating a stale, already-detached
        // node is harmless, but dereferencing a by-then-cleared `this.trackRef` would throw.
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
 * Draggable thumb element: turns drags/track clicks into scroll positions of
 * {@link KBQ_SCROLLBAR_VIEWPORT}, and mirrors its scroll position/size back onto its own CSS position.
 */
@Directive({
    selector: '[kbqScrollbarThumb]',
    host: {
        role: 'scrollbar',
        '[attr.aria-orientation]': 'orientation()',
        '[attr.aria-controls]': 'viewport.nativeElement.id',
        '[attr.aria-valuemin]': '0',
        '[attr.aria-valuemax]': '100'
    },
    exportAs: 'kbqScrollbarThumb'
})
class KbqScrollbarThumb {
    /** @docs-private */
    protected readonly viewport = inject(KBQ_SCROLLBAR_VIEWPORT);
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly style = this.nativeElement.style;

    /** Axis the thumb scrolls along — `'vertical'` (default) or `'horizontal'`. */
    readonly orientation = input<Orientation>('vertical');

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
                this.viewport.nativeElement.style.scrollBehavior = 'auto';

                if (this.orientation() === 'horizontal') {
                    this.viewport.nativeElement.scrollLeft = left;
                } else {
                    this.viewport.nativeElement.scrollTop = top;
                }

                this.viewport.nativeElement.style.scrollBehavior = '';
            });

        merge(
            animationFrame().pipe(throttleTime(100, zoneFreeScheduler())),
            fromEvent(this.viewport.nativeElement, 'scroll').pipe(zoneFree())
        )
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
        const rtl = this.nativeElement.matches('[dir="rtl"] :scope');
        const inline = rtl ? right : left;
        const multiplier = rtl ? -1 : 1;
        const maxTop = this.viewport.nativeElement.scrollHeight - height;
        const maxLeft = this.viewport.nativeElement.scrollWidth - width;
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
        const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } =
            this.viewport.nativeElement;

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
 * Renders the visual scroll bars/thumbs for {@link KBQ_SCROLLBAR_VIEWPORT}.
 *
 * Created and positioned exclusively by `KbqScrollbarViewport` — not exported, never place this
 * directly in a template. It only ever exists for `mode="hover"`/`"always"` (`KbqScrollbarViewport`
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
        '[style.block-size.px]': 'viewportBlockSize() - 1',
        '[style.margin-block-end.px]': '-(viewportBlockSize() - 1)'
    }
})
class KbqScrollbarTrack {
    private readonly viewport = inject(KBQ_SCROLLBAR_VIEWPORT);
    protected readonly visibility = toSignal<ScrollbarVisibility>(
        animationFrame().pipe(
            throttleTime(300, zoneFreeScheduler()),
            map(() => this.scrollbars),
            startWith([false, false] as const),
            distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1]),
            zoneOptimized()
        ),
        { requireSync: true }
    );
    /**
     * The scroll viewport's pixel height. The sticky track remains in normal flow, so an equal negative
     * `margin-block-end` cancels its height without shifting content or increasing the scrollable area.
     * Both values must use pixels because percentage block margins resolve against the viewport's inline
     * size rather than its block size.
     */
    protected readonly viewportBlockSize = toSignal(
        animationFrame().pipe(
            throttleTime(300, zoneFreeScheduler()),
            map(() => this.viewport.nativeElement.clientHeight),
            startWith(0),
            distinctUntilChanged(),
            zoneOptimized()
        ),
        { requireSync: true }
    );

    /** Visibility mode, forwarded from the owning {@link KbqScrollbarViewport}; only `hover`/`always` reach the track. */
    readonly mode = input.required<KbqScrollbarMode>();

    private get scrollbars(): ScrollbarVisibility {
        const { clientHeight, scrollHeight, clientWidth, scrollWidth } = this.viewport.nativeElement;

        return [
            Math.ceil((clientHeight / scrollHeight) * 100) < 100,
            Math.ceil((clientWidth / scrollWidth) * 100) < 100
        ];
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
    hostDirectives: [{ directive: KbqScrollbarViewport, inputs: ['mode'] }],
    exportAs: 'kbqScrollbar'
})
export class KbqScrollbar {
    private readonly options = inject(KBQ_SCROLLBAR_OPTIONS);
    private readonly viewport = inject(KbqScrollbarViewport);

    /** Visibility mode for the scrollbar. Defaults to the app-wide {@link KBQ_SCROLLBAR_OPTIONS}. */
    readonly mode = input<KbqScrollbarMode>(this.options.mode);

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

    /** Emits on every native `scroll` event of the viewport. Emits outside Angular's zone — see `CdkScrollable.elementScrolled`. */
    get scrollChanges(): Observable<Event> {
        return this.viewport.scrollChanges;
    }
}

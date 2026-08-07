import { Platform } from '@angular/cdk/platform';
import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import { CdkScrollable, type ExtendedScrollToOptions } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    NgZone,
    ViewEncapsulation,
    type Provider
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { kbqInjectNativeElement } from '@koobiq/components/core';
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
    timer,
    type MonoTypeOperatorFunction,
    type SchedulerAction,
    type SchedulerLike,
    type Subscription
} from 'rxjs';

/** Emits `requestAnimationFrame` timestamps outside Angular's zone. */
const ANIMATION_FRAME: Observable<number> = new Observable<number>((subscriber) => {
    let frameId = requestAnimationFrame(function loop(timestamp) {
        subscriber.next(timestamp);
        frameId = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(frameId);
});

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
 * nested element (together with {@link KbqScrollbarTrack}) to delegate to it instead.
 */
export const KBQ_SCROLLBAR_VIEWPORT = new InjectionToken<ElementRef<HTMLElement>>('KBQ_SCROLLBAR_VIEWPORT', {
    factory: () => new ElementRef(inject(DOCUMENT).documentElement)
});

export type KbqScrollbarMode = 'always' | 'hidden' | 'hover' | 'native';

/** Configuration for {@link KbqScrollbar}. */
export type KbqScrollbarOptions = {
    mode: KbqScrollbarMode;
};

const KBQ_SCROLLBAR_DEFAULT_OPTIONS: KbqScrollbarOptions = { mode: 'hover' };

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

/** An event for scrolling an element into view within {@link KbqScrollbar}. */
const KBQ_SCROLLBAR_SCROLL_INTO_VIEW = 'kbq-scrollbar-scroll-into-view';

/** The axis a scrollbar thumb/track moves along. */
export type KbqScrollbarOrientation = 'horizontal' | 'vertical';

const MIN_THUMB_SIZE = 24;

type Dimension = {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
    scrollLeft: number;
    scrollWidth: number;
    clientWidth: number;
};

/** `[vertical, horizontal]` overflow flags. */
type ScrollbarVisibility = readonly [boolean, boolean];

/** Loads the global `.kbq-scrollbar-viewport_hidden` utility class once per app (see {@link KbqScrollbarViewport}). */
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

/** Marks its host element as the scroll target for {@link KBQ_SCROLLBAR_VIEWPORT} consumers, hiding its native scrollbar whenever a custom {@link KbqScrollbarTrack} replaces it. */
@Directive({
    selector: '[kbqScrollbarViewport]',
    providers: [{ provide: KBQ_SCROLLBAR_VIEWPORT, useExisting: ElementRef }],
    hostDirectives: [CdkScrollable],
    host: {
        class: 'kbq-scrollbar-viewport',
        '[class.kbq-scrollbar-viewport_hidden]': 'nativeHidden()'
    }
})
export class KbqScrollbarViewport {
    private readonly styleLoader = inject(_CdkPrivateStyleLoader);
    private readonly isIOS = inject(Platform).IOS;
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly scrollable = inject(CdkScrollable);

    readonly mode = input<KbqScrollbarMode>(inject(KBQ_SCROLLBAR_OPTIONS).mode);

    protected readonly nativeHidden = computed(
        () => this.mode() !== 'native' && (!this.isIOS || this.mode() === 'hidden')
    );

    constructor() {
        this.styleLoader.load(ScrollbarViewportStyleLoader);
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
        this.scrollTo({ top: this.nativeElement.scrollHeight, behavior });
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
        const element = typeof target === 'string' ? this.nativeElement.querySelector<HTMLElement>(target) : target;

        if (!element) return;

        const { offsetTop, offsetLeft } = getElementOffset(this.nativeElement, element);

        this.scrollTo({
            top: offsetTop - (options?.top ?? 0),
            left: offsetLeft - (options?.left ?? 0),
            behavior: options?.behavior
        });
    }
}

/** Tracks scroll position/size of {@link KBQ_SCROLLBAR_VIEWPORT} and computes the thumb's CSS position. */
@Directive()
export class KbqScrollbarPosition extends Observable<Partial<CSSStyleDeclaration>> {
    private readonly viewport = inject(KBQ_SCROLLBAR_VIEWPORT);
    private readonly stream = merge(
        ANIMATION_FRAME.pipe(throttleTime(100, zoneFreeScheduler())),
        fromEvent(this.element, 'scroll').pipe(zoneFree())
    ).pipe(
        zoneFree(),
        map(() => {
            const dimension: Dimension = {
                scrollTop: this.element.scrollTop,
                scrollHeight: this.element.scrollHeight,
                clientHeight: this.element.clientHeight,
                scrollLeft: this.element.scrollLeft,
                scrollWidth: this.element.scrollWidth,
                clientWidth: this.element.clientWidth
            };

            const thumb = `${this.getThumb(dimension) * 100}%`;
            const view = `${this.getView(dimension) * 100}%`;

            return this.orientation() === 'vertical'
                ? { top: thumb, height: view }
                : { insetInlineStart: thumb, width: view };
        })
    );

    readonly orientation = input<KbqScrollbarOrientation>('vertical');

    constructor() {
        super((subscriber) => this.stream.subscribe(subscriber));
    }

    private get element(): HTMLElement {
        return this.viewport.nativeElement;
    }

    private getThumb(dimension: Dimension): number {
        const compensation = this.getCompensation(dimension) || this.getView(dimension);

        return Math.abs(this.getScrolled(dimension) * (1 - compensation));
    }

    private getView(dimension: Dimension): number {
        return this.orientation() === 'vertical'
            ? Math.ceil((dimension.clientHeight / dimension.scrollHeight) * 100) / 100
            : Math.ceil((dimension.clientWidth / dimension.scrollWidth) * 100) / 100;
    }

    private getScrolled({
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
            ((clientHeight * clientHeight) / scrollHeight > MIN_THUMB_SIZE && this.orientation() === 'vertical') ||
            ((clientWidth * clientWidth) / scrollWidth > MIN_THUMB_SIZE && this.orientation() === 'horizontal')
        ) {
            return 0;
        }

        return this.orientation() === 'vertical' ? MIN_THUMB_SIZE / clientHeight : MIN_THUMB_SIZE / clientWidth;
    }
}

/** `[top, left]` scroll offsets in pixels. */
type ScrollPosition = [number, number];

/** Applies {@link KbqScrollbarPosition} to a draggable thumb element, turning drags/track clicks into scroll positions of {@link KBQ_SCROLLBAR_VIEWPORT}. */
@Directive({
    selector: '[kbqScrollbarThumb]',
    hostDirectives: [{ directive: KbqScrollbarPosition, inputs: ['orientation: kbqScrollbarThumb'] }],
    exportAs: 'kbqScrollbarThumb'
})
export class KbqScrollbarThumb {
    private readonly viewport = inject(KBQ_SCROLLBAR_VIEWPORT);
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly style = this.nativeElement.style;

    readonly orientation = input<KbqScrollbarOrientation>('vertical', { alias: 'kbqScrollbarThumb' });

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

        inject(KbqScrollbarPosition)
            .pipe(takeUntilDestroyed())
            .subscribe((position) => Object.assign(this.style, position));
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
}

/** Renders the visual scroll bars/thumbs for {@link KBQ_SCROLLBAR_VIEWPORT}. */
@Component({
    selector: 'kbq-scrollbar-track',
    host: {
        class: 'kbq-scrollbar-track',
        '[class.kbq-scrollbar-track_hover]': "mode() === 'hover'",
        '[style.block-size.px]': 'hostBlockSize() - 1',
        '[style.margin-block-end.px]': '-(hostBlockSize() - 1)'
    },
    exportAs: 'kbqScrollbarTrack',
    imports: [KbqScrollbarThumb],
    template: `
        @if (!isNativeMode()) {
            @if (visibility()[0]) {
                <div
                    animate.enter="kbq-scrollbar-track__bar_enter"
                    animate.leave="kbq-scrollbar-track__bar_leave"
                    class="kbq-scrollbar-track__bar kbq-scrollbar-track__bar_vertical"
                    [class.kbq-scrollbar-track__bar_has-horizontal]="visibility()[1]"
                    (mousedown.capture.prevent)="(0)"
                >
                    <div kbqScrollbarThumb="vertical" class="kbq-scrollbar-track__thumb"></div>
                </div>
            }
            @if (visibility()[1]) {
                <div
                    animate.enter="kbq-scrollbar-track__bar_enter"
                    animate.leave="kbq-scrollbar-track__bar_leave"
                    class="kbq-scrollbar-track__bar kbq-scrollbar-track__bar_horizontal"
                    [class.kbq-scrollbar-track__bar_has-vertical]="visibility()[0]"
                    (mousedown.capture.prevent)="(0)"
                >
                    <div kbqScrollbarThumb="horizontal" class="kbq-scrollbar-track__thumb"></div>
                </div>
            }
        }
    `,
    styleUrl: './scrollbar-track.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqScrollbarTrack {
    private readonly styleLoader = inject(_CdkPrivateStyleLoader);
    private readonly scrollable = inject(CdkScrollable, { optional: true, host: true });
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly scrollbar = inject(KbqScrollbar, { optional: true });
    private readonly options = inject(KBQ_SCROLLBAR_OPTIONS);
    private readonly viewport = inject(KBQ_SCROLLBAR_VIEWPORT);

    protected readonly isNativeMode = computed(() => this.mode() === 'native');
    protected readonly visibility = toSignal(
        ANIMATION_FRAME.pipe(
            throttleTime(300, zoneFreeScheduler()),
            map(() => this.scrollbars),
            startWith([false, false] as const),
            distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1]),
            zoneOptimized()
        ),
        { requireSync: true }
    );
    /** The scroll container's own pixel height — percentage-based `margin-block-end` can't cancel a sticky element's height contribution (percentages in the block direction resolve against width, not height, per the CSS spec), so we track and apply the cancellation in exact pixels instead. */
    protected readonly hostBlockSize = toSignal(
        ANIMATION_FRAME.pipe(
            throttleTime(300, zoneFreeScheduler()),
            map(() => this.viewport.nativeElement.clientHeight),
            startWith(0),
            distinctUntilChanged(),
            zoneOptimized()
        ),
        { requireSync: true }
    );

    readonly mode = input<KbqScrollbarMode>(this.scrollbar?.mode() ?? this.options.mode);

    constructor() {
        this.styleLoader.load(ScrollbarViewportStyleLoader);

        afterNextRender(() => {
            this.scrollable
                ?.getElementRef()
                .nativeElement.insertBefore(
                    this.nativeElement,
                    this.scrollable.getElementRef().nativeElement.firstChild
                );
        });
    }

    private get scrollbars(): ScrollbarVisibility {
        const { clientHeight, scrollHeight, clientWidth, scrollWidth } = this.viewport.nativeElement;

        return [
            Math.ceil((clientHeight / scrollHeight) * 100) < 100,
            Math.ceil((clientWidth / scrollWidth) * 100) < 100
        ];
    }
}

/** Custom scrollbar wrapper: projects content and overlays {@link KbqScrollbarTrack} over it. */
@Component({
    selector: 'kbq-scrollbar',
    exportAs: 'kbqScrollbar',
    imports: [KbqScrollbarTrack],
    template: `
        @if (showTrack()) {
            <kbq-scrollbar-track class="kbq-scrollbar__track" />
        }
        <div class="kbq-scrollbar__content" [class.kbq-scrollbar__content_fill]="isNativeMode()">
            <ng-content />
        </div>
    `,
    styleUrl: './scrollbar.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [{ directive: KbqScrollbarViewport, inputs: ['mode'] }],
    host: {
        class: 'kbq-scrollbar',
        [`(${KBQ_SCROLLBAR_SCROLL_INTO_VIEW}.stop)`]: 'scrollIntoView($event.detail)'
    }
})
export class KbqScrollbar {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly options = inject(KBQ_SCROLLBAR_OPTIONS);
    private readonly viewport = inject(KbqScrollbarViewport);
    protected readonly isIOS = inject(Platform).IOS;
    protected readonly showTrack = computed(() => !this.isIOS && this.mode() !== 'native' && this.mode() !== 'hidden');
    protected readonly isNativeMode = computed(() => this.mode() === 'native');

    readonly mode = input<KbqScrollbarMode>(this.options.mode);

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

    protected scrollIntoView(detail: HTMLElement): void {
        if (this.isNativeMode()) return;

        const { offsetHeight, offsetWidth } = detail;
        const { offsetTop, offsetLeft } = getElementOffset(this.nativeElement, detail);

        this.scrollTo({
            top: offsetTop + offsetHeight / 2 - this.nativeElement.clientHeight / 2,
            left: offsetLeft + offsetWidth / 2 - this.nativeElement.clientWidth / 2
        });
    }
}

/** Scrolls its host element into view inside the nearest {@link KbqScrollbar} when the input becomes truthy. */
@Directive({
    selector: '[kbqScrollbarScrollIntoView]'
})
export class KbqScrollbarScrollIntoView {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly destroyRef = inject(DestroyRef);

    readonly scrollIntoView = input<boolean>(false, { alias: 'kbqScrollbarScrollIntoView' });

    constructor() {
        effect(() => {
            if (!this.scrollIntoView()) return;

            // Timeout is necessary in order to give element render cycle to get into its final spot
            // (for example if it is inside dropdown box which has to be positioned first)
            timer(0)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    this.nativeElement.dispatchEvent(
                        new CustomEvent<Element>(KBQ_SCROLLBAR_SCROLL_INTO_VIEW, {
                            bubbles: true,
                            detail: this.nativeElement
                        })
                    );
                });
        });
    }
}

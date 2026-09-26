import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { MutationObserverFactory } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import {
    CdkScrollable,
    CdkVirtualScrollViewport,
    ScrollDispatcher,
    type ExtendedScrollToOptions
} from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    ApplicationRef,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    createComponent,
    DestroyRef,
    Directive,
    effect,
    EnvironmentInjector,
    inject,
    Injectable,
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
    audit,
    concat,
    distinctUntilChanged,
    EMPTY,
    filter,
    fromEvent,
    map,
    merge,
    NEVER,
    Observable,
    of,
    share,
    startWith,
    Subject,
    switchMap,
    take,
    takeUntil,
    timer,
    type MonoTypeOperatorFunction,
    type SchedulerAction,
    type SchedulerLike,
    type Subscription
} from 'rxjs';

/**
 * The next animation frame, requested on subscription and only then, so an idle page schedules none.
 *
 * One frame per subscriber rather than a shared one: a frame that is already being delivered cannot be
 * joined, so whatever asks for a frame from inside one gets the next.
 */
function nextAnimationFrame(): Observable<void> {
    const window = inject(KBQ_WINDOW);
    const ngZone = inject(NgZone);

    if (typeof window.requestAnimationFrame === 'undefined') {
        return NEVER;
    }

    return new Observable<void>((subscriber) =>
        // Outside Angular, so waiting for a frame does not keep NgZone unstable.
        ngZone.runOutsideAngular(() => {
            const frameId = window.requestAnimationFrame(() => {
                subscriber.next();
                subscriber.complete();
            });

            return () => window.cancelAnimationFrame(frameId);
        })
    );
}

function zoneFree<T>(): MonoTypeOperatorFunction<T> {
    const ngZone = inject(NgZone);

    return (source) => new Observable<T>((subscriber) => ngZone.runOutsideAngular(() => source.subscribe(subscriber)));
}

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
 *
 * `hover` and `always` draw a bar only for an axis the user can scroll: one whose computed `overflow` is
 * `hidden`, `clip` or `visible` gets none, however far its content overflows.
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

/** Configuration for {@link KbqNativeScrollbar}. */
export type KbqNativeScrollbarOptions = {
    /** Whether browser-rendered scrollbars of descendant elements should also be customized. */
    descendants: boolean;
};

const KBQ_NATIVE_SCROLLBAR_DEFAULT_OPTIONS: KbqNativeScrollbarOptions = {
    descendants: false
};

/** Injection token holding the current {@link KbqNativeScrollbarOptions}. */
export const KBQ_NATIVE_SCROLLBAR_OPTIONS = new InjectionToken<KbqNativeScrollbarOptions>(
    'KBQ_NATIVE_SCROLLBAR_OPTIONS',
    { factory: () => KBQ_NATIVE_SCROLLBAR_DEFAULT_OPTIONS }
);

/** Overrides the default native scrollbar options within the given injector scope. */
export function kbqNativeScrollbarOptionsProvider(options: Partial<KbqNativeScrollbarOptions>): Provider {
    return {
        provide: KBQ_NATIVE_SCROLLBAR_OPTIONS,
        useValue: { ...KBQ_NATIVE_SCROLLBAR_DEFAULT_OPTIONS, ...options }
    };
}

type Orientation = 'horizontal' | 'vertical';

/**
 * Computed `overflow` values that rule out user scrolling. `visible` belongs here as much as the other
 * two: it only computes to `auto` when the other axis scrolls, so a box left at the initial value on
 * both axes is not a scroll container at all. Listed as the exclusions rather than as the scrollable
 * values so an unreadable computed style leaves the scrollbar alone instead of erasing it.
 */
const NON_SCROLLABLE_OVERFLOW: readonly string[] = ['clip', 'hidden', 'visible'];

const TRACK_TAG = 'kbq-scrollbar-track';

/** Based on --kbq-scrollbar-thumb-min-size */
const MIN_THUMB_SIZE = 32;

/** Based on --kbq-scrollbar-thumb-gap */
const THUMB_GAP = 3;

// Include the transparent border because CSS applies the minimum to the thumb's border box.
const MIN_THUMB_BOX_SIZE = MIN_THUMB_SIZE + THUMB_GAP * 2;

type Dimension = Pick<
    HTMLElement,
    'scrollTop' | 'scrollHeight' | 'clientHeight' | 'scrollLeft' | 'scrollWidth' | 'clientWidth'
>;

type ScrollbarVisibility = readonly [boolean, boolean];

type ViewportMetrics = {
    blockSize: number;
    inlineSize: number;
    paddingBlockStart: number;
    paddingInlineStart: number;
};

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
    private readonly options = inject(KBQ_NATIVE_SCROLLBAR_OPTIONS);

    /**
     * Whether browser-rendered scrollbars of descendant elements should also be customized.
     * Defaults to {@link KBQ_NATIVE_SCROLLBAR_OPTIONS}.
     */
    readonly descendants = input(this.options.descendants, {
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
    private readonly destroyRef = inject(DestroyRef);
    private readonly scrollDispatcher = inject(ScrollDispatcher);

    private readonly generatedId = this.idGenerator.getId('kbq-scrollbar-viewport-');

    // Read live because a bound consumer id is unavailable during construction.
    protected get id(): string {
        return this.getNativeElement().id || this.generatedId;
    }

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

    private trackRef: ComponentRef<KbqScrollbarTrack> | null = null;

    private readonly flashSubject = new Subject<void>();

    /** Emits when {@link flashScrollIndicators} is called. */
    readonly flashes = this.flashSubject.asObservable();

    /** Emits on every native `scroll` event of the viewport. Emits outside Angular's zone — see `CdkScrollable.elementScrolled`. */
    readonly scrollChanges = this.scrollable.elementScrolled();

    constructor() {
        this.styleLoader.load(ScrollbarStyleLoader);

        effect(() => {
            const mode = this.mode();
            const hideDelay = this.hideDelay();
            const showTrack = mode !== 'native' && mode !== 'hidden';

            if (!showTrack) {
                this.destroyTrack();

                return;
            }

            if (!this.trackRef) {
                this.trackRef = this.createTrack();
            }

            this.trackRef.setInput('mode', mode);
            this.trackRef.setInput('hideDelay', hideDelay);
        });

        // ApplicationRef owns the track view, so the viewport must destroy it explicitly.
        this.destroyRef.onDestroy(() => this.destroyTrack());

        if (this.scrollable instanceof CdkVirtualScrollViewport) {
            afterNextRender(() => this.dropDuplicateScrollableRegistration(), { injector: this.injector });
        }
    }

    // Virtual scroll provides its own CdkScrollable while the host directive still registers another
    // instance for the same element. Keep only the instance used by this directive.
    private dropDuplicateScrollableRegistration(): void {
        const element = this.getNativeElement();

        for (const scrollable of this.scrollDispatcher.getAncestorScrollContainers(element)) {
            if (scrollable !== this.scrollable && scrollable.getElementRef().nativeElement === element) {
                this.scrollDispatcher.deregister(scrollable);
            }
        }
    }

    /** Briefly reveals an overflowing `hover`-mode scrollbar. */
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
        // A ViewContainerRef-owned view is moved back to its anchor when virtual scroll rebuilds its DOM.
        // ApplicationRef lets the track remain a direct child of the scrollable element.
        const track = createComponent(KbqScrollbarTrack, {
            environmentInjector: this.environmentInjector,
            elementInjector: this.injector
        });

        this.appRef.attachView(track.hostView);

        // The field may point to a replacement by the time the render callback runs.
        afterNextRender(
            () => {
                this.getNativeElement().insertBefore(track.location.nativeElement, this.getNativeElement().firstChild);
            },
            { injector: this.injector }
        );

        return track;
    }

    private destroyTrack(): void {
        if (!this.trackRef) {
            return;
        }

        this.appRef.detachView(this.trackRef.hostView);
        this.trackRef.destroy();
        this.trackRef = null;
    }

    /** The viewport's native scrollable element — the host this directive is applied to. */
    getNativeElement(): HTMLElement {
        return this.scrollable.getElementRef().nativeElement;
    }
}

/**
 * Emits, at most once a frame, whenever the viewport's scrollable size may have changed.
 *
 * Nothing fires when `scrollHeight` itself changes, and polling it would keep an otherwise idle page
 * rendering for as long as the viewport exists. What changes that size does fire something: the viewport
 * or a box directly inside its content resizes; the DOM inside changes — nodes, text or attributes; an
 * image or a font loads; a transition or an animation ends.
 *
 * What still escapes — a style applied from outside the viewport that grows only the content of an
 * inline element, a transform reaching past the content — is caught once the viewport is hovered or
 * focused, and the track also re-measures whenever the viewport scrolls, which it only does once there
 * is something to scroll.
 */
@Injectable()
class KbqScrollbarContentObserver {
    private readonly viewport = inject(KbqScrollbarViewport);
    private readonly viewportElement = this.viewport.getNativeElement();
    private readonly document = inject(DOCUMENT);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly mutationObserverFactory = inject(MutationObserverFactory);
    private readonly nextFrame = nextAnimationFrame();

    readonly changes: Observable<void> = merge(
        this.resizeObserver.observe(this.viewportElement),
        this.domChanges(),
        this.document.fonts ? fromEvent(this.document.fonts, 'loadingdone') : EMPTY,
        // `load` does not bubble, so it is caught on its way down. The other two end a change that a
        // mutation only started: content transitioning open, an element animating in.
        merge(
            ...['load', 'transitionend', 'animationend'].map((type) =>
                fromEvent<Event>(this.viewportElement, type, { capture: true })
            )
        ).pipe(filter(({ target }) => !this.isInsideTrack(target as Node))),
        fromEvent(this.viewportElement, 'pointerenter'),
        fromEvent(this.viewportElement, 'focusin'),
        this.viewport.flashes
    ).pipe(
        // Ahead of the audit, which holds the last value until the frame — and no frame comes while the tab
        // is hidden, so a batch of removed nodes would stay reachable all that time.
        map(() => undefined),
        startWith(undefined),
        audit(() => this.nextFrame),
        zoneFree(),
        share()
    );

    // Mutations inside the viewport and resizes of the boxes directly inside its content, as one stream.
    private domChanges(): Observable<void> {
        return new Observable<void>((subscriber) => {
            const notify = () => subscriber.next();
            const boxes = new Set<Element>();
            // An observer of its own rather than CDK's SharedResizeObserver, which filters every batch once per
            // observed element — quadratic for a list whose rows sit directly in the viewport.
            const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(notify);

            const syncBoxes = () => {
                const current = new Set(this.getContentBoxes());

                boxes.forEach((box) => {
                    if (!current.has(box)) {
                        resizeObserver?.unobserve(box);
                        boxes.delete(box);
                    }
                });

                current.forEach((box) => {
                    if (!boxes.has(box)) {
                        // The border box, so that a padding or border change counts as the resize it is.
                        resizeObserver?.observe(box, { box: 'border-box' });
                        boxes.add(box);
                    }
                });
            };

            // Not CDK's ContentObserver: it emits inside NgZone, and every emission would then cost the whole
            // application a change detection pass — usually a second one, right after the render that mutated.
            const mutationObserver = this.mutationObserverFactory.create((records) => {
                const relevant = records.filter((record) => this.affectsContent(record));

                if (!relevant.length) {
                    return;
                }

                const root = this.getContentRoot();

                if (
                    relevant.some(
                        ({ type, target }) =>
                            type === 'childList' && (target === root || target === this.viewportElement)
                    )
                ) {
                    syncBoxes();
                }

                notify();
            });

            // Attributes too: a class, style or `hidden` toggle inside an inline element grows the content
            // without resizing any box watched here, and it is how the viewport's own `overflow` changes.
            mutationObserver?.observe(this.viewportElement, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
            syncBoxes();

            return () => {
                mutationObserver?.disconnect();
                resizeObserver?.disconnect();
            };
        });
    }

    // `kbq-scrollbar` keeps its content in a wrapper held at the viewport's full height, which never grows
    // with what it holds, so the boxes that do are its children.
    private getContentRoot(): Element {
        return this.viewportElement.querySelector(':scope > .kbq-scrollbar__content') ?? this.viewportElement;
    }

    private getContentBoxes(): Element[] {
        return Array.from(this.getContentRoot().children).filter((child) => child.localName !== TRACK_TAG);
    }

    // Skips what cannot change the scrollable size: tracks redrawing their bars, and Angular moving the
    // comment anchors of `@if` and `@for` — the same comment-only records CDK's ContentObserver skips.
    private affectsContent({ type, target, addedNodes, removedNodes }: MutationRecord): boolean {
        if (target.nodeType === Node.COMMENT_NODE || this.isInsideTrack(target)) {
            return false;
        }

        if (type !== 'childList') {
            return true;
        }

        return [...Array.from(addedNodes), ...Array.from(removedNodes)].some(
            (node) => node.nodeType !== Node.COMMENT_NODE && !this.isInsideTrack(node)
        );
    }

    // This viewport's track or a nested viewport's: tracks move their thumbs on every scroll and never
    // change the size of the content around them. Recognised by structure, not by the element this
    // observer happens to be provided on.
    private isInsideTrack(node: Node | null): boolean {
        for (let current = node; current && current !== this.viewportElement; current = current.parentNode) {
            if ((current as Element).localName === TRACK_TAG) {
                return true;
            }
        }

        return false;
    }
}

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
    protected readonly viewportElement = this.viewport.getNativeElement();
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly style = this.nativeElement.style;
    private readonly contentChanges = inject(KbqScrollbarContentObserver).changes;

    readonly orientation = input.required<Orientation>();

    constructor() {
        merge(
            fromEvent<MouseEvent>(this.nativeElement.parentElement!, 'mousedown').pipe(
                filter(({ target }) => target !== this.nativeElement),
                map((event) => this.getScrolled(event, 0.5, 0.5, this.isRtl()))
            ),
            fromEvent<MouseEvent>(this.nativeElement, 'mousedown').pipe(
                zoneFree(),
                switchMap((event) => {
                    const { ownerDocument } = this.nativeElement;
                    const { top, left, height, width } = this.nativeElement.getBoundingClientRect();
                    const vertical = (event.clientY - top) / height;
                    const horizontal = (event.clientX - left) / width;
                    const rtl = this.isRtl();

                    return fromEvent<MouseEvent>(ownerDocument, 'mousemove').pipe(
                        map((event) => this.getScrolled(event, vertical, horizontal, rtl)),
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

        merge(this.contentChanges, this.viewport.scrollChanges)
            .pipe(
                zoneFree(),
                map(() => this.getDimension()),
                takeUntilDestroyed()
            )
            .subscribe((dimension) => {
                this.applyPosition(this.getPosition(dimension));
                this.applyValueNow(this.getValueNow(dimension));
            });

        // Wait until Angular has applied `orientation` before calculating the initial ARIA value.
        afterNextRender(() => {
            const dimension = this.getDimension();

            this.applyPosition(this.getPosition(dimension));
            this.applyValueNow(this.getValueNow(dimension));
        });
    }

    // The DOM fallback covers bare or dynamically updated `dir` attributes that do not update Directionality.
    private isRtl(): boolean {
        return this.directionality.value === 'rtl' || !!this.viewportElement.closest('[dir="rtl"]');
    }

    private getScrolled(
        { clientY, clientX }: MouseEvent,
        offsetY: number,
        offsetX: number,
        rtl: boolean
    ): ScrollPosition {
        const { offsetHeight, offsetWidth } = this.nativeElement;
        const { top, left, right, width, height } = this.nativeElement.parentElement!.getBoundingClientRect();
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

@Component({
    selector: TRACK_TAG,
    imports: [KbqScrollbarThumb],
    template: `
        @if (visibility()[0]) {
            <div
                animate.enter="kbq-scrollbar-track__bar_enter"
                animate.leave="kbq-scrollbar-track__bar_leave"
                class="kbq-scrollbar-track__bar kbq-scrollbar-track__bar_vertical"
                [class.kbq-scrollbar-track__bar_has-horizontal]="visibility()[1]"
                (mousedown)="onBarPointerDown($event)"
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
                (mousedown)="onBarPointerDown($event)"
            >
                <div kbqScrollbarThumb orientation="horizontal" class="kbq-scrollbar-track__thumb"></div>
            </div>
        }
    `,
    styleUrl: './scrollbar-track.scss',
    // Shared by the track and both of its thumbs, so the viewport is observed once.
    providers: [KbqScrollbarContentObserver],
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
    private readonly ngZone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly scheduler = zoneFreeScheduler();

    // Scrolling re-measures too: a viewport that scrolls has something to scroll, whatever the observers
    // missed on the way there.
    protected readonly visibility = toSignal<ScrollbarVisibility>(
        merge(inject(KbqScrollbarContentObserver).changes, this.viewport.scrollChanges).pipe(
            map(() => this.scrollbars),
            startWith([false, false] as const),
            distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1]),
            zoneOptimized()
        ),
        { requireSync: true }
    );

    protected readonly revealed = toSignal(
        merge(this.viewport.scrollChanges, this.viewport.flashes).pipe(
            // Hoisted rather than injected inside switchMap, which runs outside an injection context.
            // The scheduler is what keeps the hide timer out of Angular: `scrollChanges` already emits
            // outside the zone, but `flashes` carries whatever zone its caller was in, and a caller
            // inside Angular would otherwise leave NgZone unstable for the whole hideDelay.
            switchMap(() => concat(of(true), timer(this.hideDelay(), this.scheduler).pipe(map(() => false)))),
            startWith(false),
            distinctUntilChanged(),
            zoneOptimized()
        ),
        { requireSync: true }
    );

    readonly mode = input.required<KbqScrollbarMode>();

    readonly hideDelay = input.required<number>();

    constructor() {
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

    // A drag released over sibling content produces a click on their common ancestor. Capture that
    // single click after mouseup so scrollbar gestures cannot activate the host panel.
    protected onBarPointerDown(event: MouseEvent): void {
        event.preventDefault();

        this.ngZone.runOutsideAngular(() => {
            fromEvent<MouseEvent>(this.window, 'mouseup')
                .pipe(
                    take(1),
                    switchMap(() =>
                        fromEvent<MouseEvent>(this.window, 'click', { capture: true }).pipe(
                            take(1),
                            // Drop the listener on the next task when the gesture produces no click.
                            takeUntil(timer(0))
                        )
                    ),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((click) => click.stopPropagation());
        });
    }

    private get scrollbars(): ScrollbarVisibility {
        const { clientHeight, scrollHeight, clientWidth, scrollWidth } = this.viewportElement;
        // An overflowing axis is not necessarily a scrollable one: `overflow: hidden` still scrolls
        // programmatically, so the size ratio alone would paint a bar — and hand over a draggable
        // thumb — for an axis the browser itself refuses to give a scrollbar to.
        const { overflowX, overflowY } = this.window.getComputedStyle(this.viewportElement);

        return [
            !NON_SCROLLABLE_OVERFLOW.includes(overflowY) && Math.ceil((clientHeight / scrollHeight) * 100) < 100,
            !NON_SCROLLABLE_OVERFLOW.includes(overflowX) && Math.ceil((clientWidth / scrollWidth) * 100) < 100
        ];
    }

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

    // Start margins and insets move the sticky track from the content box to the padded scrollport;
    // end margins cancel its layout contribution.
    private applyGeometry({ blockSize, inlineSize, paddingBlockStart, paddingInlineStart }: ViewportMetrics): void {
        const setStyle = (property: string, value: number) =>
            this.renderer.setStyle(this.nativeElement, property, coerceCssPixelValue(value));

        // Clamped once and reused, so the size and the end margin cancel out by construction. Passing
        // the unclamped value would break that on a zero-sized viewport: CSSOM silently drops the
        // negative size while it accepts the positive margin paired with it, leaving the track a pixel
        // tall inside a scrollport that has no room for it. That pixel changes `clientHeight`, which
        // re-runs this method through the resize observer, which takes the pixel back — forever.
        const trackBlockSize = Math.max(0, blockSize - 1);
        const trackInlineSize = Math.max(0, inlineSize - 1);

        setStyle('blockSize', trackBlockSize);
        setStyle('marginBlockStart', -paddingBlockStart);
        setStyle('marginBlockEnd', paddingBlockStart - trackBlockSize);
        setStyle('insetBlockStart', -paddingBlockStart);
        setStyle('minInlineSize', trackInlineSize);
        setStyle('maxInlineSize', trackInlineSize);
        setStyle('marginInlineStart', -paddingInlineStart);
        setStyle('marginInlineEnd', paddingInlineStart - trackInlineSize);
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

    /** Emits on every native `scroll` event of the viewport. Emits outside Angular's zone — see `CdkScrollable.elementScrolled`. */
    readonly scrollChanges = this.viewport.scrollChanges;

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
}

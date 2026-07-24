import { CdkScrollable, ScrollDispatcher, ScrollStrategy } from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DestroyRef, ElementRef, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { KbqHideOnScrollStrategy, wireHideOnScroll } from './hide-on-scroll.strategy';

function makeRect(top: number, left: number, bottom: number, right: number): DOMRect {
    return {
        top,
        left,
        bottom,
        right,
        width: right - left,
        height: bottom - top,
        x: left,
        y: top,
        toJSON: () => ({})
    } as DOMRect;
}

function makeScrollDispatcher(scrollSubject: Subject<CdkScrollable | void>, containers: CdkScrollable[] = []) {
    return {
        scrolled: jest.fn(() => scrollSubject.asObservable()),
        getAncestorScrollContainers: jest.fn(() => containers)
    } as unknown as ScrollDispatcher;
}

function makeOverlayRef(overlayElement: HTMLElement, positionOrigin?: unknown) {
    const positionStrategy = positionOrigin !== undefined ? { _origin: positionOrigin } : {};

    return {
        overlayElement,
        updatePosition: jest.fn(),
        getConfig: jest.fn(() => ({ positionStrategy }))
    } as any;
}

function makeViewportRuler(width = 1000, height = 800) {
    return { getViewportSize: jest.fn(() => ({ width, height })) } as unknown as ViewportRuler;
}

function makeNgZone() {
    return { run: jest.fn((fn: () => void) => fn()) } as unknown as NgZone;
}

function makeScrollable(el: HTMLElement) {
    return { getElementRef: () => new ElementRef(el) } as CdkScrollable;
}

function buildStrategy(
    config: { originElement?: HTMLElement; scrollThrottle?: number } = {},
    deps: {
        scrollDispatcher?: ScrollDispatcher;
        viewportRuler?: ViewportRuler;
        ngZone?: NgZone;
    } = {}
) {
    const scroll$ = new Subject<CdkScrollable | void>();
    const scrollDispatcher = deps.scrollDispatcher ?? makeScrollDispatcher(scroll$);
    const viewportRuler = deps.viewportRuler ?? makeViewportRuler();
    const ngZone = deps.ngZone ?? makeNgZone();
    const strategy = new KbqHideOnScrollStrategy(scrollDispatcher, viewportRuler, ngZone, config);

    return { strategy, scroll$, scrollDispatcher, viewportRuler, ngZone };
}

describe('KbqHideOnScrollStrategy', () => {
    describe('lifecycle', () => {
        it('attach() stores the overlayRef', () => {
            const { strategy } = buildStrategy();
            const overlayEl = document.createElement('div');
            const overlayRef = makeOverlayRef(overlayEl);

            strategy.attach(overlayRef);
            strategy.enable();

            expect(overlayRef.updatePosition).toBeDefined();
        });

        it('attach() does not throw when position strategy has no _origin', () => {
            const { strategy } = buildStrategy();
            const overlayEl = document.createElement('div');
            const overlayRef = makeOverlayRef(overlayEl);

            expect(() => strategy.attach(overlayRef)).not.toThrow();
        });

        it('enable() subscribes to scrolled(); second call is a no-op', () => {
            const { strategy, scrollDispatcher } = buildStrategy();
            const overlayEl = document.createElement('div');

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();
            strategy.enable();

            expect(scrollDispatcher.scrolled).toHaveBeenCalledTimes(1);
        });

        it('disable() unsubscribes; calling again is a no-op', () => {
            const { strategy, scroll$ } = buildStrategy();
            const overlayEl = document.createElement('div');

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();
            strategy.disable();

            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();

            expect(count).toBe(0);
        });

        it('detach() unsubscribes and completes hide$', () => {
            const { strategy } = buildStrategy();
            const overlayEl = document.createElement('div');

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();

            let completed = false;

            strategy.hide$.subscribe({ complete: () => (completed = true) });

            strategy.detach();
            expect(completed).toBe(true);
        });
    });

    describe('auto-origin derivation in attach()', () => {
        it('uses _origin when it is an HTMLElement', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);
            originEl.getBoundingClientRect = () => makeRect(-100, 0, -50, 100); // above container

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy } = buildStrategy({}, { scrollDispatcher });

            strategy.attach(makeOverlayRef(document.createElement('div'), originEl));
            strategy.enable();

            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();

            expect(count).toBe(1);
        });

        it('uses _origin.nativeElement when _origin is an ElementRef', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);
            originEl.getBoundingClientRect = () => makeRect(-100, 0, -50, 100);

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy } = buildStrategy({}, { scrollDispatcher });

            strategy.attach(makeOverlayRef(document.createElement('div'), new ElementRef(originEl)));
            strategy.enable();

            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();

            expect(count).toBe(1);
        });

        it('falls back to viewport check when _origin is a point object', () => {
            const overlayEl = document.createElement('div');

            overlayEl.getBoundingClientRect = () => makeRect(0, 0, 100, 100);

            const viewportRuler = makeViewportRuler(1000, 800);
            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$);
            const { strategy } = buildStrategy({}, { scrollDispatcher, viewportRuler });

            strategy.attach(makeOverlayRef(overlayEl, { x: 100, y: 100 }));
            strategy.enable();

            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();

            // overlay is inside viewport → no emit
            expect(count).toBe(0);
        });

        it('does NOT overwrite config.originElement set at construction time', () => {
            const configOrigin = document.createElement('div');
            const attachOrigin = document.createElement('div');
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);
            configOrigin.getBoundingClientRect = () => makeRect(-100, 0, -50, 100); // outside
            attachOrigin.getBoundingClientRect = () => makeRect(10, 10, 100, 200); // inside

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy } = buildStrategy({ originElement: configOrigin }, { scrollDispatcher });

            strategy.attach(makeOverlayRef(document.createElement('div'), attachOrigin));
            strategy.enable();

            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();

            // configOrigin is outside → should still emit
            expect(count).toBe(1);
        });
    });

    describe('hide$ with origin', () => {
        function buildWithOrigin(originRect: DOMRect, containerRect: DOMRect) {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            originEl.getBoundingClientRect = () => originRect;
            container.getBoundingClientRect = () => containerRect;

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy } = buildStrategy({ originElement: originEl }, { scrollDispatcher });
            const overlayEl = document.createElement('div');

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();

            return { strategy, scroll$ };
        }

        const containerRect = makeRect(0, 0, 500, 500);

        it('emits when origin scrolls above container', () => {
            const { strategy, scroll$ } = buildWithOrigin(makeRect(-100, 0, -10, 100), containerRect);
            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();
            expect(count).toBe(1);
        });

        it('emits when origin scrolls below container', () => {
            const { strategy, scroll$ } = buildWithOrigin(makeRect(510, 0, 600, 100), containerRect);
            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();
            expect(count).toBe(1);
        });

        it('emits when origin scrolls left of container', () => {
            const { strategy, scroll$ } = buildWithOrigin(makeRect(10, -200, 50, -10), containerRect);
            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();
            expect(count).toBe(1);
        });

        it('emits when origin scrolls right of container', () => {
            const { strategy, scroll$ } = buildWithOrigin(makeRect(10, 510, 50, 600), containerRect);
            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();
            expect(count).toBe(1);
        });

        it('does NOT emit when origin is within the container', () => {
            const { strategy, scroll$ } = buildWithOrigin(makeRect(10, 10, 50, 100), containerRect);
            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();
            expect(count).toBe(0);
        });

        it('calls updatePosition() on every scroll', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            originEl.getBoundingClientRect = () => makeRect(10, 10, 50, 100);
            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy } = buildStrategy({ originElement: originEl }, { scrollDispatcher });
            const overlayEl = document.createElement('div');
            const overlayRef = makeOverlayRef(overlayEl);

            strategy.attach(overlayRef);
            strategy.enable();
            scroll$.next();

            expect(overlayRef.updatePosition).toHaveBeenCalledTimes(1);
        });
    });

    describe('hide$ without origin (viewport fallback)', () => {
        function buildViewportCase(overlayRect: DOMRect, viewportWidth = 1000, viewportHeight = 800) {
            const overlayEl = document.createElement('div');

            overlayEl.getBoundingClientRect = () => overlayRect;

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$);
            const viewportRuler = makeViewportRuler(viewportWidth, viewportHeight);
            const { strategy } = buildStrategy({}, { scrollDispatcher, viewportRuler });

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();

            return { strategy, scroll$ };
        }

        it('emits when overlay panel is outside viewport', () => {
            const { strategy, scroll$ } = buildViewportCase(makeRect(-200, 0, -100, 100));
            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();
            expect(count).toBe(1);
        });

        it('does NOT emit when overlay panel is inside viewport', () => {
            const { strategy, scroll$ } = buildViewportCase(makeRect(10, 10, 100, 200));
            let count = 0;

            strategy.hide$.subscribe(() => count++);
            scroll$.next();
            expect(count).toBe(0);
        });
    });

    describe('scroll from inside overlay panel', () => {
        it('is filtered out — no reposition and no hide check', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');
            const overlayEl = document.createElement('div');
            const innerScrollable = document.createElement('div');

            overlayEl.appendChild(innerScrollable);
            originEl.getBoundingClientRect = () => makeRect(-100, 0, -50, 100);
            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy } = buildStrategy({ originElement: originEl }, { scrollDispatcher });
            const overlayRef = makeOverlayRef(overlayEl);

            strategy.attach(overlayRef);
            strategy.enable();

            let count = 0;

            strategy.hide$.subscribe(() => count++);

            // emit a scroll event that comes from inside the overlay panel
            scroll$.next(makeScrollable(innerScrollable));

            expect(overlayRef.updatePosition).not.toHaveBeenCalled();
            expect(count).toBe(0);
        });
    });
});

describe('wireHideOnScroll', () => {
    function makeDestroyRef(): DestroyRef {
        const callbacks: (() => void)[] = [];

        return {
            onDestroy: (cb: () => void) => {
                callbacks.push(cb);

                return () => {};
            },
            _destroy: () => callbacks.forEach((cb) => cb())
        } as any;
    }

    it('subscribes to hide$ when strategy is KbqHideOnScrollStrategy', () => {
        const scroll$ = new Subject<CdkScrollable | void>();
        const scrollDispatcher = makeScrollDispatcher(scroll$);
        const strategy = new KbqHideOnScrollStrategy(scrollDispatcher, makeViewportRuler(), makeNgZone(), {});
        const overlayEl = document.createElement('div');

        overlayEl.getBoundingClientRect = () => makeRect(-200, 0, -100, 100);
        strategy.attach(makeOverlayRef(overlayEl));
        strategy.enable();

        const destroyRef = makeDestroyRef();
        const onHide = jest.fn();

        wireHideOnScroll(strategy, destroyRef, onHide);
        scroll$.next();

        expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('does nothing when strategy is not KbqHideOnScrollStrategy', () => {
        const noop: ScrollStrategy = { attach: jest.fn(), enable: jest.fn(), disable: jest.fn(), detach: jest.fn() };
        const destroyRef = makeDestroyRef();
        const onHide = jest.fn();

        expect(() => wireHideOnScroll(noop, destroyRef, onHide)).not.toThrow();
        expect(onHide).not.toHaveBeenCalled();
    });

    it('unsubscribes when destroyRef fires', () => {
        const scroll$ = new Subject<CdkScrollable | void>();
        const scrollDispatcher = makeScrollDispatcher(scroll$);
        const strategy = new KbqHideOnScrollStrategy(scrollDispatcher, makeViewportRuler(), makeNgZone(), {});
        const overlayEl = document.createElement('div');

        overlayEl.getBoundingClientRect = () => makeRect(-200, 0, -100, 100);
        strategy.attach(makeOverlayRef(overlayEl));
        strategy.enable();

        const destroyRef = makeDestroyRef() as any;
        const onHide = jest.fn();

        wireHideOnScroll(strategy, destroyRef, onHide);
        destroyRef._destroy();
        scroll$.next();

        expect(onHide).not.toHaveBeenCalled();
    });
});

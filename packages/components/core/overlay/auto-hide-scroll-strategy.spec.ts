import { CdkScrollable, FlexibleConnectedPositionStrategy, ScrollDispatcher } from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, NgZone } from '@angular/core';
import { KbqAutoHideScrollStrategy, kbqAutoHideScrollStrategyFactory } from '@koobiq/components/core';
import { Subject } from 'rxjs';

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
    // `instanceof FlexibleConnectedPositionStrategy` mirrors the real CDK class the strategy
    // checks for in production, without needing a full DI-constructed instance.
    const positionStrategy =
        positionOrigin !== undefined
            ? Object.assign(Object.create(FlexibleConnectedPositionStrategy.prototype), { _origin: positionOrigin })
            : {};

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
    const onHide = jest.fn();
    const strategy = new KbqAutoHideScrollStrategy(scrollDispatcher, viewportRuler, ngZone, config, { onHide });

    return { strategy, scroll$, scrollDispatcher, viewportRuler, ngZone, onHide };
}

describe('KbqAutoHideScrollStrategy', () => {
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

        it('attach() throws when called a second time', () => {
            const { strategy } = buildStrategy();
            const overlayEl = document.createElement('div');

            strategy.attach(makeOverlayRef(overlayEl));

            expect(() => strategy.attach(makeOverlayRef(overlayEl))).toThrow();
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
            const { strategy, scroll$, onHide } = buildStrategy();
            const overlayEl = document.createElement('div');

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();
            strategy.disable();

            scroll$.next();

            expect(onHide).not.toHaveBeenCalled();
        });

        it('detach() unsubscribes', () => {
            const { strategy, scroll$, onHide } = buildStrategy();
            const overlayEl = document.createElement('div');

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();
            strategy.detach();

            scroll$.next();

            expect(onHide).not.toHaveBeenCalled();
        });
    });

    describe('fires onHide only once while out of bounds', () => {
        it('disables itself after the first out-of-bounds tick, so onHide fires only once', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);
            originEl.getBoundingClientRect = () => makeRect(-100, 0, -50, 100); // permanently above container

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy, onHide } = buildStrategy({ originElement: originEl }, { scrollDispatcher });

            strategy.attach(makeOverlayRef(document.createElement('div')));
            strategy.enable();

            for (let i = 0; i < 5; i++) {
                scroll$.next();
            }

            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('does not call updatePosition() on the tick where it hides', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);
            originEl.getBoundingClientRect = () => makeRect(-100, 0, -50, 100);

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy } = buildStrategy({ originElement: originEl }, { scrollDispatcher });
            const overlayRef = makeOverlayRef(document.createElement('div'));

            strategy.attach(overlayRef);
            strategy.enable();
            scroll$.next();

            expect(overlayRef.updatePosition).not.toHaveBeenCalled();
        });
    });

    describe('auto-origin derivation in enable()', () => {
        it('uses _origin when it is an HTMLElement', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);
            originEl.getBoundingClientRect = () => makeRect(-100, 0, -50, 100); // above container

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy, onHide } = buildStrategy({}, { scrollDispatcher });

            strategy.attach(makeOverlayRef(document.createElement('div'), originEl));
            strategy.enable();
            scroll$.next();

            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('uses _origin.nativeElement when _origin is an ElementRef', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);
            originEl.getBoundingClientRect = () => makeRect(-100, 0, -50, 100);

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy, onHide } = buildStrategy({}, { scrollDispatcher });

            strategy.attach(makeOverlayRef(document.createElement('div'), new ElementRef(originEl)));
            strategy.enable();
            scroll$.next();

            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('falls back to viewport check when _origin is a point object', () => {
            const overlayEl = document.createElement('div');

            overlayEl.getBoundingClientRect = () => makeRect(0, 0, 100, 100);

            const viewportRuler = makeViewportRuler(1000, 800);
            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$);
            const { strategy, onHide } = buildStrategy({}, { scrollDispatcher, viewportRuler });

            strategy.attach(makeOverlayRef(overlayEl, { x: 100, y: 100 }));
            strategy.enable();
            scroll$.next();

            // overlay is inside viewport → no hide
            expect(onHide).not.toHaveBeenCalled();
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
            const { strategy, onHide } = buildStrategy({ originElement: configOrigin }, { scrollDispatcher });

            strategy.attach(makeOverlayRef(document.createElement('div'), attachOrigin));
            strategy.enable();
            scroll$.next();

            // configOrigin is outside → should still hide
            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('re-resolves the origin on each enable(), picking up a changed _origin', () => {
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);

            const insideOrigin = document.createElement('div');
            const outsideOrigin = document.createElement('div');

            insideOrigin.getBoundingClientRect = () => makeRect(10, 10, 100, 200);
            outsideOrigin.getBoundingClientRect = () => makeRect(-100, 0, -50, 100);

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy, onHide } = buildStrategy({}, { scrollDispatcher });
            const overlayRef = makeOverlayRef(document.createElement('div'), insideOrigin);

            strategy.attach(overlayRef);
            strategy.enable();
            scroll$.next();

            expect(onHide).not.toHaveBeenCalled();

            // simulate the trigger swapping its anchor between close and reopen
            overlayRef.getConfig = jest.fn(() => ({
                positionStrategy: Object.assign(Object.create(FlexibleConnectedPositionStrategy.prototype), {
                    _origin: outsideOrigin
                })
            }));

            strategy.disable();
            strategy.enable();
            scroll$.next();

            expect(onHide).toHaveBeenCalledTimes(1);
        });
    });

    describe('ancestor scroll container caching', () => {
        it('computes getAncestorScrollContainers() once per enable(), not per scroll tick', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            originEl.getBoundingClientRect = () => makeRect(10, 10, 50, 100);
            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy } = buildStrategy({ originElement: originEl }, { scrollDispatcher });

            strategy.attach(makeOverlayRef(document.createElement('div')));
            strategy.enable();

            scroll$.next();
            scroll$.next();
            scroll$.next();

            expect(scrollDispatcher.getAncestorScrollContainers).toHaveBeenCalledTimes(1);
        });
    });

    describe('hide with origin', () => {
        function buildWithOrigin(originRect: DOMRect, containerRect: DOMRect) {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            originEl.getBoundingClientRect = () => originRect;
            container.getBoundingClientRect = () => containerRect;

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const { strategy, onHide } = buildStrategy({ originElement: originEl }, { scrollDispatcher });
            const overlayEl = document.createElement('div');

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();

            return { strategy, scroll$, onHide };
        }

        const containerRect = makeRect(0, 0, 500, 500);

        it('hides when origin scrolls above container', () => {
            const { scroll$, onHide } = buildWithOrigin(makeRect(-100, 0, -10, 100), containerRect);

            scroll$.next();
            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('hides when origin scrolls below container', () => {
            const { scroll$, onHide } = buildWithOrigin(makeRect(510, 0, 600, 100), containerRect);

            scroll$.next();
            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('hides when origin scrolls left of container', () => {
            const { scroll$, onHide } = buildWithOrigin(makeRect(10, -200, 50, -10), containerRect);

            scroll$.next();
            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('hides when origin scrolls right of container', () => {
            const { scroll$, onHide } = buildWithOrigin(makeRect(10, 510, 50, 600), containerRect);

            scroll$.next();
            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('does NOT hide when origin is within the container', () => {
            const { scroll$, onHide } = buildWithOrigin(makeRect(10, 10, 50, 100), containerRect);

            scroll$.next();
            expect(onHide).not.toHaveBeenCalled();
        });

        it('calls updatePosition() when the origin stays inside bounds', () => {
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

    describe('hide without origin (viewport fallback)', () => {
        function buildViewportCase(overlayRect: DOMRect, viewportWidth = 1000, viewportHeight = 800) {
            const overlayEl = document.createElement('div');

            overlayEl.getBoundingClientRect = () => overlayRect;

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$);
            const viewportRuler = makeViewportRuler(viewportWidth, viewportHeight);
            const { strategy, onHide } = buildStrategy({}, { scrollDispatcher, viewportRuler });

            strategy.attach(makeOverlayRef(overlayEl));
            strategy.enable();

            return { strategy, scroll$, onHide };
        }

        it('hides when overlay panel is outside viewport', () => {
            const { scroll$, onHide } = buildViewportCase(makeRect(-200, 0, -100, 100));

            scroll$.next();
            expect(onHide).toHaveBeenCalledTimes(1);
        });

        it('does NOT hide when overlay panel is inside viewport', () => {
            const { scroll$, onHide } = buildViewportCase(makeRect(10, 10, 100, 200));

            scroll$.next();
            expect(onHide).not.toHaveBeenCalled();
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
            const { strategy, onHide } = buildStrategy({ originElement: originEl }, { scrollDispatcher });
            const overlayRef = makeOverlayRef(overlayEl);

            strategy.attach(overlayRef);
            strategy.enable();

            // emit a scroll event that comes from inside the overlay panel
            scroll$.next(makeScrollable(innerScrollable));

            expect(overlayRef.updatePosition).not.toHaveBeenCalled();
            expect(onHide).not.toHaveBeenCalled();
        });
    });

    describe('kbqAutoHideScrollStrategyFactory', () => {
        it('forwards config through to the created strategy', () => {
            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$);
            const viewportRuler = makeViewportRuler();
            const ngZone = makeNgZone();

            const createScrollStrategy = kbqAutoHideScrollStrategyFactory(scrollDispatcher, viewportRuler, ngZone);
            const strategy = createScrollStrategy(undefined, { scrollThrottle: 123 });

            strategy.attach(makeOverlayRef(document.createElement('div')));
            strategy.enable();

            expect(scrollDispatcher.scrolled).toHaveBeenCalledWith(123);
        });

        it('forwards hooks through to the created strategy', () => {
            const originEl = document.createElement('div');
            const container = document.createElement('div');

            container.getBoundingClientRect = () => makeRect(0, 0, 500, 500);
            originEl.getBoundingClientRect = () => makeRect(-100, 0, -50, 100);

            const scroll$ = new Subject<CdkScrollable | void>();
            const scrollDispatcher = makeScrollDispatcher(scroll$, [makeScrollable(container)]);
            const viewportRuler = makeViewportRuler();
            const ngZone = makeNgZone();
            const onHide = jest.fn();

            const createScrollStrategy = kbqAutoHideScrollStrategyFactory(scrollDispatcher, viewportRuler, ngZone);
            const strategy = createScrollStrategy({ onHide }, { originElement: originEl });

            strategy.attach(makeOverlayRef(document.createElement('div')));
            strategy.enable();
            scroll$.next();

            expect(onHide).toHaveBeenCalledTimes(1);
        });
    });
});

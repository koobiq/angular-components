import { Direction, Directionality } from '@angular/cdk/bidi';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, Injectable, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { END, ENTER, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE, dispatchKeyboardEvent } from '@koobiq/components/core';
import { Observable, Subject } from 'rxjs';
import { KbqPaginatedTabHeader } from './paginated-tab-header';
import { KbqTabHeader } from './tab-header.component';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';

// jsdom doesn't implement `Element.prototype.scrollTo` at all
// (https://github.com/jsdom/jsdom/issues/1695). `KbqPaginatedTabHeader`'s scroll-correction path
// calls `container.scrollTo({ left, behavior })` directly, so the arrow-click/focus-scroll tests
// below need it to actually move `scrollLeft`, not just be callable. Scoped to this file — jsdom
// gives every spec file its own global environment, so this can't affect other suites the way a
// `tools/jest/setup.ts` addition would.
if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = function (this: Element, options?: ScrollToOptions | number): void {
        if (typeof options === 'object' && options?.left !== undefined) this.scrollLeft = options.left;
    };
}

/** Audit interval (ms) the header waits before re-checking pagination after a scroll-box resize. See `RESIZE_AUDIT_TIME`. */
const RESIZE_AUDIT_TIME = 100;

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    // A plain `Subject`, not a `BehaviorSubject`: the latter replays its initial `[]` to every new
    // subscriber, which would make a test pass merely by subscribing — without proving a
    // *subsequent* emission (an actual resize) re-triggers anything.
    readonly changes = new Subject<ResizeObserverEntry[]>();

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

describe('KbqTabHeader', () => {
    let dir: Direction = 'ltr';
    let change: Subject<Direction>;
    let fixture: ComponentFixture<SimpleTabHeaderApp>;
    let appComponent: SimpleTabHeaderApp;

    beforeEach(() => {
        change = new Subject();
        dir = 'ltr';
        TestBed.configureTestingModule({
            imports: [
                PortalModule,
                ScrollingModule,
                KbqTabHeader,
                KbqTabLabelWrapper,
                SimpleTabHeaderApp
            ],
            providers: [
                { provide: SharedResizeObserver, useClass: MockResizeObserver },
                {
                    provide: Directionality,
                    useFactory: () => ({
                        value: dir,
                        change: change.asObservable()
                    })
                }
            ]
        }).compileComponents();
    });

    describe('focusing', () => {
        let tabListContainer: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabHeaderApp);
            fixture.detectChanges();

            appComponent = fixture.componentInstance;
            tabListContainer = appComponent.tabHeader().tabListContainer.nativeElement;
        });

        it('should initialize to the selected index', () => {
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(appComponent.selectedIndex);
        });

        it('should update focusIndex when set', () => {
            appComponent.tabHeader().focusIndex = 2;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(2);
        });

        it('should not set focus to a disabled tab', () => {
            appComponent.tabHeader().focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            appComponent.tabHeader().focusIndex = appComponent.disabledTabIndex;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);
        });

        it('should move focus right and skip disabled tabs', () => {
            appComponent.tabHeader().focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            expect(appComponent.disabledTabIndex).toBe(1);
            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(2);

            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(3);
        });

        it('should move focus left and skip disabled tabs', () => {
            appComponent.tabHeader().focusIndex = 3;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(3);

            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(2);

            expect(appComponent.disabledTabIndex).toBe(1);
            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);
        });

        it('should support key down events to move and select focus', () => {
            appComponent.tabHeader().focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(2);

            expect(appComponent.selectedIndex).toBe(0);
            const enterEvent = dispatchKeyboardEvent(tabListContainer, 'keydown', ENTER);

            fixture.detectChanges();
            expect(appComponent.selectedIndex).toBe(2);
            expect(enterEvent.defaultPrevented).toBe(true);

            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            expect(appComponent.selectedIndex).toBe(2);
            const spaceEvent = dispatchKeyboardEvent(tabListContainer, 'keydown', SPACE);

            fixture.detectChanges();
            expect(appComponent.selectedIndex).toBe(0);
            expect(spaceEvent.defaultPrevented).toBe(true);
        });

        it('should move focus to the first tab when pressing HOME', () => {
            appComponent.tabHeader().focusIndex = 3;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(3);

            const event = dispatchKeyboardEvent(tabListContainer, 'keydown', HOME);

            fixture.detectChanges();

            expect(appComponent.tabHeader().focusIndex).toBe(0);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should skip disabled items when moving focus using HOME', () => {
            appComponent.tabHeader().focusIndex = 3;
            appComponent.tabs[0].disabled = true;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(3);

            dispatchKeyboardEvent(tabListContainer, 'keydown', HOME);
            fixture.detectChanges();

            // Note that the second tab is disabled by default already.
            expect(appComponent.tabHeader().focusIndex).toBe(2);
        });

        it('should move focus to the last tab when pressing END', () => {
            appComponent.tabHeader().focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            const event = dispatchKeyboardEvent(tabListContainer, 'keydown', END);

            fixture.detectChanges();

            expect(appComponent.tabHeader().focusIndex).toBe(3);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should skip disabled items when moving focus using END', () => {
            appComponent.tabHeader().focusIndex = 0;
            appComponent.tabs[3].disabled = true;
            fixture.detectChanges();
            expect(appComponent.tabHeader().focusIndex).toBe(0);

            dispatchKeyboardEvent(tabListContainer, 'keydown', END);
            fixture.detectChanges();

            expect(appComponent.tabHeader().focusIndex).toBe(2);
        });
    });

    describe('pagination', () => {
        describe('in LTR direction', () => {
            beforeEach(() => {
                dir = 'ltr';
                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                fixture.detectChanges();

                appComponent = fixture.componentInstance;
            });

            it('should not show pagination when tab list fits container', () => {
                const header = appComponent.tabHeader();

                Object.defineProperty(header.tabListContainer.nativeElement, 'scrollWidth', {
                    configurable: true,
                    value: 60
                });
                Object.defineProperty(header.tabListContainer.nativeElement, 'clientWidth', {
                    configurable: true,
                    value: 130
                });

                header.checkPaginationEnabled();
                fixture.detectChanges();

                expect(header.showPaginationControls).toBe(false);
            });

            it('should show pagination when tab list exceeds container', () => {
                const header = appComponent.tabHeader();

                Object.defineProperty(header.tabListContainer.nativeElement, 'scrollWidth', {
                    configurable: true,
                    value: 240
                });
                Object.defineProperty(header.tabListContainer.nativeElement, 'clientWidth', {
                    configurable: true,
                    value: 130
                });

                header.checkPaginationEnabled();
                fixture.detectChanges();

                expect(header.showPaginationControls).toBe(true);
            });

            it('should recheck pagination when tabs are removed from the list', () => {
                const header = appComponent.tabHeader();
                const container = header.tabListContainer.nativeElement;

                Object.defineProperty(container, 'scrollWidth', { configurable: true, value: 240 });
                Object.defineProperty(container, 'clientWidth', { configurable: true, value: 130 });

                header.checkPaginationEnabled();
                fixture.detectChanges();
                expect(header.showPaginationControls).toBe(true);

                // Shrink `scrollWidth` to what removing the tabs would really produce, then remove
                // them — `ngAfterContentChecked` diffs `items.length` on every change-detection
                // pass, so pagination re-evaluates without an explicit `updatePagination()` call.
                Object.defineProperty(container, 'scrollWidth', { configurable: true, value: 60 });
                appComponent.tabs = appComponent.tabs.slice(0, 1);
                fixture.detectChanges();

                expect(header.showPaginationControls).toBe(false);
            });

            it('should scroll to bring a focused, out-of-view tab label into view', fakeAsync(() => {
                const header = appComponent.tabHeader();
                const container = header.tabListContainer.nativeElement;

                Object.defineProperty(container, 'scrollWidth', { configurable: true, value: 400 });
                Object.defineProperty(container, 'clientWidth', { configurable: true, value: 100 });

                // Real browsers clamp `scrollLeft` to [0, scrollWidth - clientWidth]; the file-local
                // `scrollTo` polyfill above doesn't, so an out-of-range target (e.g. the overscroll
                // below the first tab) would otherwise assert a value no browser actually produces.
                let scrollLeft = 0;

                Object.defineProperty(container, 'scrollLeft', {
                    configurable: true,
                    get: () => scrollLeft,
                    set: (value: number) => {
                        scrollLeft = Math.max(0, Math.min(300, value));
                    }
                });

                const lastLabel = header.items.get(3)!.elementRef.nativeElement;

                Object.defineProperty(lastLabel, 'offsetLeft', { configurable: true, value: 300 });
                Object.defineProperty(lastLabel, 'offsetWidth', { configurable: true, value: 30 });
                Object.defineProperty(header.nextPaginator.nativeElement, 'clientWidth', {
                    configurable: true,
                    value: 20
                });

                header.updatePagination();
                fixture.detectChanges();
                expect(container.scrollLeft).toBe(0);

                header.focusIndex = 3;
                fixture.detectChanges();
                tick(150);

                // labelAfterPos(330) > afterVisiblePos(100) -> scroll by (330 - 100 + overscroll(20)) = 250
                expect(container.scrollLeft).toBe(250);

                const firstLabel = header.items.get(0)!.elementRef.nativeElement;

                Object.defineProperty(firstLabel, 'offsetLeft', { configurable: true, value: 0 });
                Object.defineProperty(firstLabel, 'offsetWidth', { configurable: true, value: 30 });
                Object.defineProperty(header.previousPaginator.nativeElement, 'clientWidth', {
                    configurable: true,
                    value: 20
                });

                header.focusIndex = 0;
                fixture.detectChanges();
                tick(150);

                // labelBeforePos(0) < beforeVisiblePos(250) -> target (0 - overscroll(20)) = -20,
                // clamped to the real minimum of 0.
                expect(container.scrollLeft).toBe(0);
            }));

            it('should not drop the scroll-into-view request for a selectedIndex set before the first change detection', fakeAsync(() => {
                // `ngAfterContentChecked` (a content hook) queues this request before
                // `ngAfterViewInit` (a view hook) has run and subscribed to it — a plain `Subject`
                // would silently drop it, and `<kbq-tab-group [selectedIndex]="6">` would render
                // with the selected tab off-screen and no scroll ever happening.
                const scrollCorrectionSpy = jest.spyOn(KbqPaginatedTabHeader.prototype as any, 'scrollCorrection');

                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                appComponent = fixture.componentInstance;
                appComponent.selectedIndex = 3;

                fixture.detectChanges();
                tick(150);

                expect(scrollCorrectionSpy).toHaveBeenCalledWith(3, 'smooth');

                scrollCorrectionSpy.mockRestore();
            }));
        });

        describe('in RTL direction', () => {
            beforeEach(() => {
                dir = 'rtl';
                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                appComponent = fixture.componentInstance;
                appComponent.dir = 'rtl';

                fixture.detectChanges();
            });

            it('should scroll towards negative scrollLeft to bring a focused, out-of-view tab label into view', fakeAsync(() => {
                const header = appComponent.tabHeader();
                const container = header.tabListContainer.nativeElement;

                Object.defineProperty(container, 'scrollWidth', { configurable: true, value: 400 });
                Object.defineProperty(container, 'clientWidth', { configurable: true, value: 100 });
                Object.defineProperty(header.tabList.nativeElement, 'offsetWidth', {
                    configurable: true,
                    value: 400
                });

                const lastLabel = header.items.get(3)!.elementRef.nativeElement;

                // RTL: labelAfterPos = tabList.offsetWidth - offsetLeft.
                Object.defineProperty(lastLabel, 'offsetLeft', { configurable: true, value: 70 });
                Object.defineProperty(lastLabel, 'offsetWidth', { configurable: true, value: 30 });
                Object.defineProperty(header.nextPaginator.nativeElement, 'clientWidth', {
                    configurable: true,
                    value: 20
                });

                header.updatePagination();
                fixture.detectChanges();
                expect(container.scrollLeft).toBe(0);

                header.focusIndex = 3;
                fixture.detectChanges();
                tick(150);

                // Same logical math as LTR (250), mirrored onto native scrollLeft's negative RTL range.
                expect(container.scrollLeft).toBe(-250);
            }));

            it('should toggle the pagination arrows from the negative RTL scrollLeft range', () => {
                const header = appComponent.tabHeader();
                const container = header.tabListContainer.nativeElement;

                Object.defineProperty(container, 'scrollWidth', { configurable: true, value: 400 });
                Object.defineProperty(container, 'clientWidth', { configurable: true, value: 100 });

                header.updatePagination();
                fixture.detectChanges();

                // At rest, `scrollLeft` is 0 in both directions — the RTL start (nothing to scroll
                // back to) and the LTR start (nothing scrolled yet) coincide.
                expect(header.disableScrollBefore).toBe(true);
                expect(header.disableScrollAfter).toBe(false);

                // Native RTL `scrollLeft` runs from 0 to -(scrollWidth - clientWidth) as the user
                // scrolls towards the end of the (reading-order) list.
                container.scrollLeft = -300;
                container.dispatchEvent(new Event('scroll'));
                fixture.detectChanges();

                expect(header.disableScrollBefore).toBe(false);
                expect(header.disableScrollAfter).toBe(true);
            });
        });

        describe('scroll box resize', () => {
            it('should recheck pagination when the scroll box is resized', fakeAsync(() => {
                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                fixture.detectChanges();

                const header = fixture.componentInstance.tabHeader();
                const mockResizeObserver = TestBed.inject(SharedResizeObserver) as unknown as MockResizeObserver;
                const checkPaginationEnabledSpy = jest.spyOn(header, 'checkPaginationEnabled');

                mockResizeObserver.changes.next([]);
                tick(RESIZE_AUDIT_TIME);
                fixture.detectChanges();

                expect(checkPaginationEnabledSpy).toHaveBeenCalled();
            }));
        });
    });

    describe('drag scrolling', () => {
        let header: KbqTabHeader;

        // Inertia coasts via `requestAnimationFrame`; drive it deterministically with explicit
        // timestamps instead of relying on real frame timing or zone.js's fakeAsync rAF patch.
        let pendingFrame: FrameRequestCallback | null;

        const flushFrame = (timestamp: number) => {
            const callback = pendingFrame;

            pendingFrame = null;
            callback?.(timestamp);
        };

        // Runs the inertia loop to completion (bounded), simulating unclamped native scrollLeft.
        const runInertiaToCompletion = () => {
            let timestamp = 0;

            for (let i = 0; i < 200 && pendingFrame; i++) {
                timestamp += 32;
                flushFrame(timestamp);
            }
        };

        const createPointerEvent = (
            type: string,
            init: MouseEventInit & { pointerId?: number; pointerType?: string; timeStamp?: number } = {}
        ): PointerEvent => {
            // `MouseEventInit.buttons` defaults to 0 (no button held) — wrong for a `pointermove`
            // mid-drag, which is what almost every caller here simulates. Callers that need to
            // simulate a release outside the window (no buttons on the move) pass `buttons: 0` explicitly.
            const { pointerId = 1, pointerType = 'mouse', timeStamp, buttons = 1, ...mouseInit } = init;
            const event = new MouseEvent(type, { buttons, ...mouseInit });

            Object.defineProperties(event, {
                pointerId: { value: pointerId },
                pointerType: { value: pointerType },
                ...(timeStamp === undefined ? {} : { timeStamp: { value: timeStamp } })
            });

            return event as PointerEvent;
        };

        const enableOverflow = () => {
            Object.defineProperty(header.tabListContainer.nativeElement, 'scrollWidth', {
                configurable: true,
                value: 400
            });
            Object.defineProperty(header.tabListContainer.nativeElement, 'clientWidth', {
                configurable: true,
                value: 100
            });
            header.updatePagination();
            fixture.detectChanges();
        };

        beforeEach(() => {
            pendingFrame = null;
            jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
                pendingFrame = callback;

                return 0;
            });
            jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
                pendingFrame = null;
            });

            dir = 'ltr';
            fixture = TestBed.createComponent(SimpleTabHeaderApp);
            fixture.detectChanges();

            appComponent = fixture.componentInstance;
            header = appComponent.tabHeader();
            enableOverflow();

            // `ngAfterContentInit`'s own `requestAnimationFrame(realign)` (queued during
            // `fixture.detectChanges()` above, before this spy could distinguish it from an inertia
            // frame) would otherwise leave `pendingFrame` non-null before any test runs — making
            // `expect(pendingFrame).not.toBeNull()` assertions pass regardless of whether `endDrag`
            // actually queued an inertia frame, and `runInertiaToCompletion()` would invoke that
            // leftover `realign` as if it were one.
            pendingFrame = null;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should toggle kbq-disabled on the previous/next arrows at each scroll bound without removing them from the DOM', () => {
            const before = fixture.nativeElement.querySelector('.kbq-tab-header__pagination_before');
            const after = fixture.nativeElement.querySelector('.kbq-tab-header__pagination_after');

            expect(before.classList.contains('kbq-disabled')).toBe(true);
            expect(after.classList.contains('kbq-disabled')).toBe(false);

            // scrollWidth(400) - clientWidth(100) = 300, i.e. the max scrollLeft a real browser would allow.
            header.tabListContainer.nativeElement.scrollLeft = 300;
            header.tabListContainer.nativeElement.dispatchEvent(new Event('scroll'));
            fixture.detectChanges();

            expect(before.classList.contains('kbq-disabled')).toBe(false);
            expect(after.classList.contains('kbq-disabled')).toBe(true);
        });

        it('should not start a drag for small movement, allowing a normal click to select a tab', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: 2 }));
            document.dispatchEvent(createPointerEvent('pointerup', { clientX: 2 }));

            expect(tabListContainer.scrollLeft).toBe(0);

            const label = header.items.get(2)!.elementRef.nativeElement;

            label.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(appComponent.selectedIndex).toBe(2);
        });

        it('should scroll while dragging past the threshold, and suppress the resulting click', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -20 }));

            expect(tabListContainer.scrollLeft).toBe(20);

            document.dispatchEvent(createPointerEvent('pointerup', { clientX: -20 }));

            const label = header.items.get(2)!.elementRef.nativeElement;

            label.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(appComponent.selectedIndex).toBe(0);
        });

        it('should end the drag on a buttonless move when no pointerup ever reaches the document', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -20 }));
            expect(tabListContainer.scrollLeft).toBe(20);

            // Simulates the button being released outside the window: no `pointerup` fires, but a
            // move still reaches the document (e.g. the pointer re-enters), reporting no buttons held.
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -25, buttons: 0 }));

            expect(tabListContainer.scrollLeft).toBe(20);
            expect(tabListContainer.classList.contains('kbq-tab-header__scroll-container_dragging')).toBe(false);

            // The drag is over — a further move (even with a button reported again, e.g. a new,
            // unrelated press) must not resume scrolling the old gesture.
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -60 }));
            expect(tabListContainer.scrollLeft).toBe(20);
        });

        it('should reset click suppression after a drag even without a trailing click', fakeAsync(() => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -20 }));
            document.dispatchEvent(createPointerEvent('pointerup', { clientX: -20 }));

            tick(0);

            const label = header.items.get(2)!.elementRef.nativeElement;

            label.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(appComponent.selectedIndex).toBe(2);
        }));

        it('should not drag for touch pointers, leaving the existing touch/arrow interactions untouched', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0, pointerType: 'touch' }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -20, pointerType: 'touch' }));

            expect(tabListContainer.scrollLeft).toBe(0);
        });

        it('should coast after release, decaying frame by frame until it settles', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -10, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -30, timeStamp: 50 }));

            expect(tabListContainer.scrollLeft).toBe(30);

            document.dispatchEvent(createPointerEvent('pointerup', { clientX: -30, timeStamp: 50 }));

            // Release doesn't jump straight to a target — an inertia frame is queued and the
            // position hasn't moved yet.
            expect(pendingFrame).not.toBeNull();
            expect(tabListContainer.scrollLeft).toBe(30);

            runInertiaToCompletion();

            expect(pendingFrame).toBeNull();
            expect(tabListContainer.scrollLeft).toBeGreaterThan(30);
        });

        it('should stop the coast exactly at the scroll boundary', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            // The boundary is now computed from `scrollWidth - clientWidth` (see `startInertia`),
            // not read back from `scrollLeft` — so it has to agree with the setter's own clamp
            // below, instead of `enableOverflow()`'s unrelated 400/100 (a 300px range).
            Object.defineProperty(tabListContainer, 'scrollWidth', { configurable: true, value: 140 });

            // Simulate a real browser clamping `scrollLeft` to [0, 40].
            let scrollLeft = 0;

            Object.defineProperty(tabListContainer, 'scrollLeft', {
                configurable: true,
                get: () => scrollLeft,
                set: (value: number) => {
                    scrollLeft = Math.max(0, Math.min(40, value));
                }
            });

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -50, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -100, timeStamp: 10 }));

            expect(tabListContainer.scrollLeft).toBe(40);

            document.dispatchEvent(createPointerEvent('pointerup', { clientX: -100, timeStamp: 10 }));

            flushFrame(1000); // primes the timestamp, no movement yet
            expect(pendingFrame).not.toBeNull();

            flushFrame(1020); // scrollLeft is already at the boundary -> the write is a no-op -> stop

            expect(tabListContainer.scrollLeft).toBe(40);
            expect(pendingFrame).toBeNull();
        });

        it('should cancel an in-progress inertia coast on wheel input', () => {
            const tabListContainer = header.tabListContainer.nativeElement;

            tabListContainer.dispatchEvent(createPointerEvent('pointerdown', { clientX: 0, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -10, timeStamp: 0 }));
            document.dispatchEvent(createPointerEvent('pointermove', { clientX: -30, timeStamp: 50 }));
            document.dispatchEvent(createPointerEvent('pointerup', { clientX: -30, timeStamp: 50 }));

            expect(pendingFrame).not.toBeNull();

            tabListContainer.dispatchEvent(new WheelEvent('wheel', { deltaX: 10 }));

            expect(pendingFrame).toBeNull();
        });
    });

    describe('activeTabOffset', () => {
        let header: KbqTabHeader;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabHeaderApp);
            fixture.detectChanges();

            appComponent = fixture.componentInstance;
            header = appComponent.tabHeader();
        });

        describe('activeTabOffsetWidth', () => {
            it('subtracts TAB_PADDING * 2 from offsetWidth for text tabs', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetWidth', { configurable: true, value: 120 });

                expect((header as any).activeTabOffsetWidth).toBe(96);
            });

            it('returns raw offsetWidth for icon-only tabs', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetWidth', { configurable: true, value: 36 });
                (item as any).tab = { iconOnlyLabel: true };

                expect((header as any).activeTabOffsetWidth).toBe(36);
            });

            it('returns undefined when no item at selectedIndex', () => {
                appComponent.selectedIndex = 99;
                fixture.detectChanges();

                expect((header as any).activeTabOffsetWidth).toBeUndefined();
            });
        });

        describe('activeTabOffsetLeft', () => {
            it('adds TAB_PADDING to offsetLeft for text tabs', () => {
                appComponent.selectedIndex = 2;
                fixture.detectChanges();

                const item = header.items.get(2)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: 100 });

                expect((header as any).activeTabOffsetLeft).toBe(112);
            });

            it('handles negative offsetLeft for the first tab shifted by negative margin-inline-start', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: -12 });

                expect((header as any).activeTabOffsetLeft).toBe(0);
            });

            it('treats offsetLeft === 0 as a valid position and still adds TAB_PADDING', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: 0 });

                expect((header as any).activeTabOffsetLeft).toBe(12);
            });

            it('returns raw offsetLeft for icon-only tabs', () => {
                const item = header.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: -4 });
                (item as any).tab = { iconOnlyLabel: true };

                expect((header as any).activeTabOffsetLeft).toBe(-4);
            });

            it('returns undefined when no item at selectedIndex', () => {
                appComponent.selectedIndex = 99;
                fixture.detectChanges();

                expect((header as any).activeTabOffsetLeft).toBeUndefined();
            });
        });
    });
});

interface ITab {
    label: string;
    disabled?: boolean;
}

@Component({
    imports: [PortalModule, ScrollingModule, KbqTabHeader, KbqTabLabelWrapper],
    template: `
        <div [dir]="dir">
            <kbq-tab-header [selectedIndex]="selectedIndex" (selectFocusedIndex)="selectedIndex = $event">
                @for (tab of tabs; track tab) {
                    <div
                        class="label-content"
                        kbqTabLabelWrapper
                        style="min-width: 30px; width: 30px"
                        [disabled]="!!tab.disabled"
                        (click)="selectedIndex = $index"
                    >
                        {{ tab.label }}
                    </div>
                }
            </kbq-tab-header>
        </div>
    `,
    styles: [
        `
            :host {
                width: 130px;
            }
        `
    ]
})
class SimpleTabHeaderApp {
    selectedIndex: number = 0;
    disabledTabIndex = 1;
    tabs: ITab[] = [
        { label: 'tab one' },
        { label: 'tab one' },
        { label: 'tab one' },
        { label: 'tab one' }
    ];
    dir: Direction = 'ltr';

    readonly tabHeader = viewChild.required(KbqTabHeader);

    constructor() {
        this.tabs[this.disabledTabIndex].disabled = true;
    }
}

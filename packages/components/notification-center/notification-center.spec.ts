import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement, ElementRef, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule, dispatchFakeEvent } from '@koobiq/components/core';
import {
    KbqNotificationCenterModule,
    KbqNotificationCenterService,
    KbqNotificationCenterTrigger,
    KbqNotificationItem
} from '@koobiq/components/notification-center';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { KbqToastService } from '@koobiq/components/toast';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';

describe('KbqNotificationCenter', () => {
    let fixture: ComponentFixture<KbqNotificationCenterSimple>;
    let componentInstance: KbqNotificationCenterSimple;
    let debugElement: DebugElement;
    let overlayContainer: OverlayContainer;
    let testScheduler: TestScheduler;
    let originalGetComputedStyle: typeof window.getComputedStyle;

    // jsdom's getComputedStyle returns values the scrollbar and overlay position strategy can't parse,
    // so stub it for the whole suite. Keep the stub configurable and restore the original afterwards so
    // the redefine is always permitted and nothing leaks past these tests.
    beforeAll(() => {
        originalGetComputedStyle = window.getComputedStyle;
        Object.defineProperty(global.window, 'getComputedStyle', {
            configurable: true,
            value: () => ({
                getPropertyValue: (_property: string) => ''
            })
        });
    });

    afterAll(() => {
        Object.defineProperty(global.window, 'getComputedStyle', {
            configurable: true,
            value: originalGetComputedStyle
        });
    });

    const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
        TestBed.configureTestingModule({
            imports: [component, NoopAnimationsModule, KbqLuxonDateModule, KbqFormattersModule, KbqScrollbarModule],
            providers: [
                { provide: AsyncScheduler, useValue: testScheduler },
                ...providers
            ]
        });
        const fixture = TestBed.createComponent<T>(component);

        fixture.autoDetectChanges();

        return fixture;
    };

    describe('Check test cases', () => {
        // jsdom does not implement Element.prototype.scroll; the container reveal calls it via
        // KbqScrollbar.scrollTo. Stub it only when it's missing so a real implementation is never shadowed.
        beforeAll(() => {
            if (!HTMLElement.prototype.scroll) {
                Object.defineProperty(HTMLElement.prototype, 'scroll', { configurable: true, value: () => {} });
            }
        });

        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));
            fixture = createComponent(KbqNotificationCenterSimple);
            componentInstance = fixture.componentInstance;
            debugElement = fixture.debugElement;
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => (overlayContainer = oc)));

        afterEach(() => {
            overlayContainer?.ngOnDestroy();
        });

        it('default trigger is click', fakeAsync(() => {
            let center = debugElement.query(By.css('.kbq-notification-center'));

            expect(center).toBe(null);

            componentInstance.trigger().show();
            fixture.detectChanges();

            center = debugElement.query(By.css('.kbq-notification-center'));

            expect(center.nativeElement).toBeDefined();
            expect(center.query(By.css('.kbq-notification-center-header')).nativeElement).toBeDefined();
        }));

        describe('infinite scroll', () => {
            // The rendered center resolves the service from the module provider (re-provided in
            // KbqNotificationCenterModule), so drive that exact instance via the trigger — not the root one.
            const getService = () =>
                (componentInstance.trigger() as unknown as { service: KbqNotificationCenterService }).service;

            const openCenter = () => {
                componentInstance.trigger().show();
                fixture.detectChanges();
            };

            // Mirrors SCROLLED_TO_BOTTOM_AUDIT_TIME in notification-center.ts (private to that module).
            const scrollAuditTime = 100;

            // The scroll-to-bottom detection lives on the rendered overlay component, not the trigger.
            const getCenter = () =>
                (
                    componentInstance.trigger() as unknown as {
                        instance: {
                            scrollContainer: () => {
                                contentElement: () => { nativeElement: HTMLElement };
                                scrollTo: (options?: ScrollToOptions) => void;
                            };
                            onContainerScroll: () => void;
                        };
                    }
                ).instance;

            // Fakes the container geometry. Both `scrollContainer` and `contentElement` are signal
            // queries, so they must be called to reach the native element.
            const setGeometry = (geometry: { scrollHeight: number; clientHeight: number; scrollTop: number }) => {
                const element = getCenter().scrollContainer().contentElement().nativeElement;

                Object.defineProperty(element, 'scrollHeight', { configurable: true, value: geometry.scrollHeight });
                Object.defineProperty(element, 'clientHeight', { configurable: true, value: geometry.clientHeight });
                Object.defineProperty(element, 'offsetHeight', { configurable: true, value: geometry.clientHeight });
                Object.defineProperty(element, 'scrollTop', { configurable: true, value: geometry.scrollTop });
            };

            // Sits the list exactly at the bottom (distance 0 <= the default scrolledToBottomOffset of 0).
            const setAtBottomGeometry = () => setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 500 });

            // Sits the list at the bottom, then fires the container's scroll handler.
            const scrollToBottom = () => {
                setAtBottomGeometry();

                getCenter().onContainerScroll();
            };

            it('shows the bottom "load more" spinner without replacing the list', fakeAsync(() => {
                const service = getService();

                openCenter();

                service.setLoadingMore(true);
                fixture.detectChanges();

                expect(debugElement.query(By.css('.kbq-notification-center-load-more kbq-progress-spinner'))).not.toBe(
                    null
                );
                // the full-screen loader must NOT replace the list
                expect(debugElement.query(By.css('.kbq-loader-overlay'))).toBe(null);
            }));

            it('shows the bottom "load more" error row, separate from the full-screen error', fakeAsync(() => {
                const service = getService();

                openCenter();

                service.setLoadMoreErrorMode(true);
                fixture.detectChanges();

                const errorRow = debugElement.query(By.css('.kbq-notification-center-load-more-error'));

                expect(errorRow).not.toBe(null);
                expect(errorRow.query(By.css('button'))).not.toBe(null);
                // full-screen error state must NOT be shown
                expect(debugElement.query(By.css('.kbq-notification-center-error-container'))).toBe(null);
            }));

            it('re-emits onNextPage and clears the error when the bottom retry button is clicked', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                service.setLoadMoreErrorMode(true);
                fixture.detectChanges();

                debugElement
                    .query(By.css('.kbq-notification-center-load-more-error button'))
                    .triggerEventHandler('click', {});

                expect(emitSpy).toHaveBeenCalled();
                // retry must reset the error state itself so the spinner and the error row can never coexist
                expect(service.loadMoreErrorMode.value).toBe(false);
            }));

            it('keeps paging when a completed load leaves the list still at the bottom', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                // The just-loaded page was too short to overflow: the list is still at the bottom and
                // no further scroll event will fire — completing the load must re-trigger paging.
                setAtBottomGeometry();

                service.setLoadingMore(true);
                service.setLoadingMore(false);
                tick(scrollAuditTime);

                expect(emitSpy).toHaveBeenCalled();
            }));

            it('keeps the full-screen error path emitting onReload', fakeAsync(() => {
                const service = getService();
                const reloadSpy = jest.spyOn(service.onReload, 'emit');

                openCenter();

                service.setErrorMode(true);
                fixture.detectChanges();

                const errorContainer = debugElement.query(By.css('.kbq-notification-center-error-container'));

                expect(errorContainer).not.toBe(null);
                // the bottom load-more rows must NOT render while the full-screen error is shown
                expect(debugElement.query(By.css('.kbq-notification-center-load-more'))).toBe(null);

                errorContainer.query(By.css('button')).triggerEventHandler('click', {});

                expect(reloadSpy).toHaveBeenCalled();
            }));

            it('reports loadingMore / loadMoreErrorMode updates through the changes stream', () => {
                const service = getService();

                let emissions = 0;
                const subscription = service.changes.subscribe(() => emissions++);

                const afterSubscribe = emissions;

                service.setLoadingMore(true);
                expect(emissions).toBe(afterSubscribe + 1);

                const afterLoadingMore = emissions;

                service.setLoadMoreErrorMode(true);
                expect(emissions).toBe(afterLoadingMore + 1);

                subscription.unsubscribe();
            });

            it('updates the corresponding subjects through the setters', () => {
                const service = getService();

                service.setLoadingMore(true);
                expect(service.loadingMore.value).toBe(true);

                service.setLoadMoreErrorMode(true);
                expect(service.loadMoreErrorMode.value).toBe(true);

                service.setHasMore(false);
                expect(service.hasMore.value).toBe(false);
            });

            it('emits onNextPage when scrolled to the bottom with more to load', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                scrollToBottom();
                tick(scrollAuditTime);

                expect(emitSpy).toHaveBeenCalled();
            }));

            it('does not emit onNextPage when there is nothing more to load', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                service.setHasMore(false);

                scrollToBottom();
                tick(scrollAuditTime);

                expect(emitSpy).not.toHaveBeenCalled();
            }));

            it('does not emit onNextPage while a page is already loading', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                service.setLoadingMore(true);

                scrollToBottom();
                tick(scrollAuditTime);

                expect(emitSpy).not.toHaveBeenCalled();
            }));

            it('does not emit onNextPage while the load-more error is shown', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                service.setLoadMoreErrorMode(true);

                scrollToBottom();
                tick(scrollAuditTime);

                expect(emitSpy).not.toHaveBeenCalled();
            }));

            it('emits onNextPage at the bottom when fractional zoom leaves a sub-pixel gap', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                // At fractional browser zoom `scrollHeight` / `clientHeight` are rounded to integers while
                // `scrollTop` stays fractional, so the true bottom reports a residual distance instead of 0.
                setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 499.6 });
                getCenter().onContainerScroll();
                tick(scrollAuditTime);

                expect(emitSpy).toHaveBeenCalled();
            }));

            it('does not emit onNextPage while the list is still a few pixels from the bottom', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                // The sub-pixel tolerance must not stretch into a visible early trigger.
                setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 495 });
                getCenter().onContainerScroll();
                tick(scrollAuditTime);

                expect(emitSpy).not.toHaveBeenCalled();
            }));

            it('emits onNextPage within scrolledToBottomOffset of the bottom', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                componentInstance.trigger().scrolledToBottomOffset = 100;
                openCenter();

                // 50px from the actual bottom — within the 100px threshold
                setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 450 });
                getCenter().onContainerScroll();
                tick(scrollAuditTime);

                expect(emitSpy).toHaveBeenCalled();
            }));

            it('does not emit onNextPage when the distance exceeds scrolledToBottomOffset', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                componentInstance.trigger().scrolledToBottomOffset = 100;
                openCenter();

                // 150px from the actual bottom — outside the 100px threshold
                setGeometry({ scrollHeight: 1000, clientHeight: 500, scrollTop: 350 });
                getCenter().onContainerScroll();
                tick(scrollAuditTime);

                expect(emitSpy).not.toHaveBeenCalled();
            }));

            it('scrolls the list to the bottom when the load-more spinner appears', fakeAsync(() => {
                const service = getService();

                openCenter();
                setAtBottomGeometry();

                const scrollSpy = jest.spyOn(getCenter().scrollContainer(), 'scrollTo');

                service.setLoadingMore(true);
                fixture.detectChanges();
                tick(scrollAuditTime);

                expect(scrollSpy).toHaveBeenCalledWith({ top: 1000 });
            }));

            it('scrolls the list to the bottom when the load-more error row appears', fakeAsync(() => {
                const service = getService();

                openCenter();
                setAtBottomGeometry();

                const scrollSpy = jest.spyOn(getCenter().scrollContainer(), 'scrollTo');

                service.setLoadMoreErrorMode(true);
                fixture.detectChanges();
                tick(scrollAuditTime);

                expect(scrollSpy).toHaveBeenCalledWith({ top: 1000 });
            }));

            it('does not scroll again when the spinner is turned off', fakeAsync(() => {
                const service = getService();

                openCenter();
                setAtBottomGeometry();

                const scrollSpy = jest.spyOn(getCenter().scrollContainer(), 'scrollTo');

                service.setLoadingMore(true);
                fixture.detectChanges();
                tick(scrollAuditTime);

                scrollSpy.mockClear();

                // true -> false must NOT scroll
                service.setLoadingMore(false);
                fixture.detectChanges();
                tick(scrollAuditTime);

                expect(scrollSpy).not.toHaveBeenCalled();
            }));

            it('does not scroll to the bottom on open when a load-more error is already shown', fakeAsync(() => {
                const service = getService();

                // Error left over from a previous session, before the panel is opened.
                service.setLoadMoreErrorMode(true);

                openCenter();
                setAtBottomGeometry();

                const scrollSpy = jest.spyOn(getCenter().scrollContainer(), 'scrollTo');

                // The replayed BehaviorSubject value must not be treated as a fresh appearance: the panel
                // always opens scrolled to the top.
                tick(scrollAuditTime);

                expect(scrollSpy).not.toHaveBeenCalled();
            }));
        });

        describe('onDelete', () => {
            const getService = () =>
                (componentInstance.trigger() as unknown as { service: KbqNotificationCenterService }).service;

            const createItem = (title: string): KbqNotificationItem => ({ title, date: new Date().toISOString() });

            it('emits an "item" event with the removed item on remove()', () => {
                const service = getService();
                const item = createItem('a');

                service.items = [item];

                const emitSpy = jest.spyOn(service.onDelete, 'emit');

                service.remove(item);

                expect(emitSpy).toHaveBeenCalledWith({ type: 'item', items: [item] });
                expect(service.isEmpty).toBe(true);
            });

            it('emits a "group" event with the group items on removeGroup()', () => {
                const service = getService();
                const item = createItem('a');

                service.items = [item];

                const emitSpy = jest.spyOn(service.onDelete, 'emit');

                service.removeGroup({ title: 'group', items: [item] });

                expect(emitSpy).toHaveBeenCalledWith({ type: 'group', items: [item] });
                expect(service.isEmpty).toBe(true);
            });

            it('emits an "all" event with a snapshot of all items on removeAll()', () => {
                const service = getService();
                const items = [createItem('a'), createItem('b')];

                service.items = items;

                const emitSpy = jest.spyOn(service.onDelete, 'emit');

                service.removeAll();

                expect(emitSpy).toHaveBeenCalledWith({ type: 'all', items });
                expect(service.isEmpty).toBe(true);
            });
        });

        describe('hideToast', () => {
            const getService = () =>
                (componentInstance.trigger() as unknown as { service: KbqNotificationCenterService }).service;

            const createItem = (title: string): KbqNotificationItem => ({ title, date: new Date().toISOString() });

            it('push() stores the returned toast id on the item', () => {
                const service = getService();
                const toastService = TestBed.inject(KbqToastService);

                jest.spyOn(toastService, 'show').mockReturnValue({ id: 42, ref: {} as any });

                const item = createItem('a');

                service.push(item);

                expect(item.toastId).toBe(42);
            });

            it('hides the toast by the stored toastId and clears it', () => {
                const service = getService();
                const toastService = TestBed.inject(KbqToastService);
                const hideSpy = jest.spyOn(toastService, 'hide').mockImplementation();

                const item: KbqNotificationItem = { ...createItem('a'), toastId: 42 };

                service.hideToast(item);

                expect(hideSpy).toHaveBeenCalledWith(42);
                expect(item.toastId).toBeUndefined();
            });

            it('does nothing when the item has no toastId', () => {
                const service = getService();
                const toastService = TestBed.inject(KbqToastService);
                const hideSpy = jest.spyOn(toastService, 'hide').mockImplementation();

                service.hideToast(createItem('a'));

                expect(hideSpy).not.toHaveBeenCalled();
            });

            it('remove() hides the toast of the removed item', () => {
                const service = getService();
                const toastService = TestBed.inject(KbqToastService);

                jest.spyOn(toastService, 'show').mockReturnValue({ id: 7, ref: {} as any });
                const hideSpy = jest.spyOn(toastService, 'hide').mockImplementation();

                const item = createItem('a');

                service.push(item);
                service.remove(item);

                expect(hideSpy).toHaveBeenCalledWith(7);
            });

            it('removeAll() hides the toasts of all items shown via push()', () => {
                const service = getService();
                const toastService = TestBed.inject(KbqToastService);

                jest.spyOn(toastService, 'show')
                    .mockReturnValueOnce({ id: 1, ref: {} as any })
                    .mockReturnValueOnce({ id: 2, ref: {} as any });
                const hideSpy = jest.spyOn(toastService, 'hide').mockImplementation();

                service.push(createItem('a'));
                service.push(createItem('b'));
                service.removeAll();

                expect(hideSpy).toHaveBeenCalledWith(1);
                expect(hideSpy).toHaveBeenCalledWith(2);
            });
        });

        describe('ordering', () => {
            const getService = () =>
                (componentInstance.trigger() as unknown as { service: KbqNotificationCenterService }).service;

            const createItem = (title: string, date: string): KbqNotificationItem => ({ title, date });

            // groupedItems is built from a BehaviorSubject, so it emits synchronously on subscribe.
            const readTitles = (service: KbqNotificationCenterService): string[][] => {
                let titles: string[][] = [];

                service.groupedItems
                    .subscribe(
                        (groups) => (titles = groups.map((group) => group.items.map((item) => String(item.title))))
                    )
                    .unsubscribe();

                return titles;
            };

            it('always orders groups and items from newest to oldest, regardless of input order', () => {
                const service = getService();

                // Two days × two times, provided deliberately scrambled. Midday UTC times keep each
                // pair in the same day-group regardless of the test machine's timezone.
                service.items = [
                    createItem('1a', '2025-10-01T12:00:00.000Z'),
                    createItem('2b', '2025-10-02T15:00:00.000Z'),
                    createItem('1b', '2025-10-01T15:00:00.000Z'),
                    createItem('2a', '2025-10-02T12:00:00.000Z')
                ];

                // Newest day first; within each day the newest notification first.
                expect(readTitles(service)).toEqual([
                    ['2b', '2a'],
                    ['1b', '1a']
                ]);
            });
        });

        describe('onRead', () => {
            const getService = () =>
                (componentInstance.trigger() as unknown as { service: KbqNotificationCenterService }).service;

            const createItem = (title: string): KbqNotificationItem => ({ title, date: new Date().toISOString() });

            const openCenter = () => {
                componentInstance.trigger().show();
                fixture.detectChanges();
            };

            // The rendered notification item hosts KbqReadStateDirective, whose (click) handler emits
            // read=true on every click. onRead must still fire only on the unread -> read transition.
            it('emits onRead only once per item across repeated read events', () => {
                const service = getService();
                const item = createItem('a');

                service.items = [item];

                openCenter();

                const itemElement = overlayContainer
                    .getContainerElement()
                    .querySelector<HTMLElement>('kbq-notification-item');

                expect(itemElement).not.toBeNull();

                const onReadSpy = jest.spyOn(service.onRead, 'next');

                itemElement!.click();
                itemElement!.click();
                itemElement!.click();

                expect(onReadSpy).toHaveBeenCalledTimes(1);
                expect(onReadSpy).toHaveBeenCalledWith(item);
                expect(item.read).toBe(true);
            });
        });
    });

    describe('stickToWindow', () => {
        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));
        });

        afterEach(() => {
            overlayContainer?.ngOnDestroy();
        });

        // OverlayContainer should be injected after createComponent, otherwise TestBed
        // gets instantiated before configureTestingModule
        const createStickComponent = <T>(component: Type<T>): ComponentFixture<T> => {
            const fixture = createComponent(component);

            overlayContainer = TestBed.inject(OverlayContainer);

            return fixture;
        };

        const getOverlayPane = (): HTMLElement =>
            overlayContainer.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;

        it('should re-apply stick position on window resize', fakeAsync(() => {
            const stickFixture = createStickComponent(KbqNotificationCenterWithStick);

            stickFixture.componentInstance.trigger().show();
            stickFixture.detectChanges();
            tick();

            const pane = getOverlayPane();

            expect(pane.style.right).toMatch(/^0(px)?$/);
            expect(pane.style.left).toBe('unset');

            // simulate the position strategy wiping the manual stick styles on resize
            pane.style.right = '';
            pane.style.left = '50px';

            dispatchFakeEvent(window, 'resize');
            tick(20);

            expect(pane.style.right).toMatch(/^0(px)?$/);
            expect(pane.style.left).toBe('unset');
        }));

        it('should recalculate stick position against the container on window resize', fakeAsync(() => {
            const stickFixture = createStickComponent(KbqNotificationCenterWithStickContainer);

            stickFixture.componentInstance.trigger().show();
            stickFixture.detectChanges();
            tick();

            const pane = getOverlayPane();
            const panel = overlayContainer.getContainerElement().querySelector('.kbq-notification-center')!;

            jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ width: 400, height: 300 } as DOMRect);
            jest.spyOn(
                stickFixture.componentInstance.container().nativeElement,
                'getBoundingClientRect'
            ).mockReturnValue({
                left: 0,
                right: 800,
                top: 0,
                bottom: 500
            } as DOMRect);

            dispatchFakeEvent(window, 'resize');
            tick(20);

            expect(pane.style.left).toBe('400px');
            expect(pane.style.right).toBe('unset');
        }));

        it('should stop re-applying stick position after the panel is closed', fakeAsync(() => {
            const stickFixture = createStickComponent(KbqNotificationCenterWithStick);
            const trigger = stickFixture.componentInstance.trigger();

            trigger.show();
            stickFixture.detectChanges();
            tick();

            const pane = getOverlayPane();

            trigger.hide();
            stickFixture.detectChanges();
            tick();

            pane.style.right = '';
            pane.style.left = '50px';

            dispatchFakeEvent(window, 'resize');
            tick(20);

            expect(pane.style.right).toBe('');
            expect(pane.style.left).toBe('50px');
        }));
    });
});

@Component({
    selector: 'notification-center-simple',
    imports: [
        KbqNotificationCenterModule
    ],
    template: `
        <button kbqNotificationCenterTrigger>notification-center Trigger</button>
    `
})
export class KbqNotificationCenterSimple {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
}

@Component({
    selector: 'notification-center-with-stick',
    imports: [
        KbqNotificationCenterModule
    ],
    template: `
        <button kbqNotificationCenterTrigger stickToWindow="right">notification-center Trigger</button>
    `
})
export class KbqNotificationCenterWithStick {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
}

@Component({
    selector: 'notification-center-with-stick-container',
    imports: [
        KbqNotificationCenterModule
    ],
    template: `
        <div #containerRef>
            <button kbqNotificationCenterTrigger stickToWindow="right" [container]="containerRef">
                notification-center Trigger
            </button>
        </div>
    `
})
export class KbqNotificationCenterWithStickContainer {
    readonly trigger = viewChild.required(KbqNotificationCenterTrigger);
    readonly container = viewChild.required<ElementRef<HTMLElement>>('containerRef');
}

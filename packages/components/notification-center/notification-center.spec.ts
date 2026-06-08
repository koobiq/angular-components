import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import {
    KbqNotificationCenterModule,
    KbqNotificationCenterService,
    KbqNotificationCenterTrigger,
    KbqNotificationItem
} from '@koobiq/components/notification-center';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';

describe('KbqNotificationCenter', () => {
    let fixture: ComponentFixture<KbqNotificationCenterSimple>;
    let componentInstance: KbqNotificationCenterSimple;
    let debugElement: DebugElement;
    let overlayContainer: OverlayContainer;
    let testScheduler: TestScheduler;

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
        beforeAll(() => {
            Object.defineProperty(global.window, 'getComputedStyle', {
                value: () => ({
                    getPropertyValue: (_property: string) => ''
                })
            });
        });

        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));
            fixture = createComponent(KbqNotificationCenterSimple);
            componentInstance = fixture.componentInstance;
            debugElement = fixture.debugElement;
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => (overlayContainer = oc)));

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('default trigger is click', fakeAsync(() => {
            let center = debugElement.query(By.css('.kbq-notification-center'));

            expect(center).toBe(null);

            componentInstance.trigger.show();
            fixture.detectChanges();

            center = debugElement.query(By.css('.kbq-notification-center'));

            expect(center.nativeElement).toBeDefined();
            expect(center.query(By.css('.kbq-notification-center-header')).nativeElement).toBeDefined();
        }));

        describe('infinite scroll', () => {
            // The rendered center resolves the service from the module provider (re-provided in
            // KbqNotificationCenterModule), so drive that exact instance via the trigger — not the root one.
            const getService = () =>
                (componentInstance.trigger as unknown as { service: KbqNotificationCenterService }).service;

            const openCenter = () => {
                componentInstance.trigger.show();
                fixture.detectChanges();
            };

            // Mirrors SCROLLED_TO_BOTTOM_AUDIT_TIME in notification-center.ts (private to that module).
            const scrollAuditTime = 100;

            // The scroll-to-bottom detection lives on the rendered overlay component, not the trigger.
            const getCenter = () =>
                (
                    componentInstance.trigger as unknown as {
                        instance: {
                            scrollContainer: { contentElement: { nativeElement: HTMLElement } };
                            onContainerScroll: () => void;
                        };
                    }
                ).instance;

            // Fakes the container geometry so the list sits exactly at the bottom (distance 0 <= the
            // default scrolledToBottomOffset of 0), then fires the container's scroll handler.
            const scrollToBottom = () => {
                const center = getCenter();
                const element = center.scrollContainer.contentElement.nativeElement;

                Object.defineProperty(element, 'scrollHeight', { configurable: true, value: 1000 });
                Object.defineProperty(element, 'clientHeight', { configurable: true, value: 500 });
                Object.defineProperty(element, 'offsetHeight', { configurable: true, value: 500 });
                Object.defineProperty(element, 'scrollTop', { configurable: true, value: 500 });

                center.onContainerScroll();
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

            it('re-emits onNextPage when the bottom retry button is clicked', fakeAsync(() => {
                const service = getService();
                const emitSpy = jest.spyOn(service.onNextPage, 'emit');

                openCenter();

                service.setLoadMoreErrorMode(true);
                fixture.detectChanges();

                debugElement
                    .query(By.css('.kbq-notification-center-load-more-error button'))
                    .triggerEventHandler('click', {});

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
        });

        describe('onDelete', () => {
            const getService = () =>
                (componentInstance.trigger as unknown as { service: KbqNotificationCenterService }).service;

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

        describe('ordering', () => {
            const getService = () =>
                (componentInstance.trigger as unknown as { service: KbqNotificationCenterService }).service;

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
                (componentInstance.trigger as unknown as { service: KbqNotificationCenterService }).service;

            const createItem = (title: string): KbqNotificationItem => ({ title, date: new Date().toISOString() });

            const openCenter = () => {
                componentInstance.trigger.show();
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
    @ViewChild(KbqNotificationCenterTrigger) trigger: KbqNotificationCenterTrigger;
}

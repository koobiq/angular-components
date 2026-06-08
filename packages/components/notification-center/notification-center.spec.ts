import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import {
    KbqNotificationCenterModule,
    KbqNotificationCenterService,
    KbqNotificationCenterTrigger
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

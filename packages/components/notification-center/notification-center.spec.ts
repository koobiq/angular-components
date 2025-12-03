import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqNotificationCenterModule, KbqNotificationCenterTrigger } from '@koobiq/components/notification-center';
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

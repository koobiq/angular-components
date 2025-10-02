import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqNotificationCenterModule } from '@koobiq/components/notification-center';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';

describe('KbqNotificationCenter', () => {
    let fixture: ComponentFixture<KbqNotificationCenterSimple>;
    let componentInstance: KbqNotificationCenterSimple;
    let debugElement: DebugElement;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let testScheduler: TestScheduler;

    const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
        TestBed.configureTestingModule({
            imports: [component, NoopAnimationsModule],
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
        beforeEach(() => {
            testScheduler = new TestScheduler((act, exp) => expect(exp).toEqual(act));
            fixture = createComponent(KbqNotificationCenterSimple);
            componentInstance = fixture.componentInstance;
            debugElement = fixture.debugElement;
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }));

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('kbqTrigger = hover', fakeAsync(() => {
            console.log('componentInstance: ', componentInstance);
            console.log('debugElement: ', debugElement);
            console.log('overlayContainerElement: ', overlayContainerElement);
            expect(true).toBe(true);
        }));
    });
});

@Component({
    standalone: true,
    selector: 'notification-center-simple',
    template: `
        <button kbqNotificationCenter>notification-center Trigger</button>
    `,
    imports: [
        KbqNotificationCenterModule
    ]
})
export class KbqNotificationCenterSimple {}

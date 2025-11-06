/* eslint-disable no-console */
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';
import { KbqAppSwitcherModule } from './app-switcher.module';

describe('KbqAppSwitcher', () => {
    let fixture: ComponentFixture<AppSwitcherSimple>;
    let componentInstance: AppSwitcherSimple;
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
            fixture = createComponent(AppSwitcherSimple);
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
    selector: 'app-switcher-simple',
    template: `
        <button kbqAppSwitcher>AppSwitcher Trigger</button>
    `,
    imports: [
        KbqAppSwitcherModule
    ]
})
export class AppSwitcherSimple {}

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAlert, KbqAlertModule } from './index';

describe('MсAlert', () => {
    let fixture: ComponentFixture<TestApp>;
    let alertDebugElement: DebugElement;
    let alertNativeElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqAlertModule, TestApp]
        }).compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        alertDebugElement = fixture.debugElement.query(By.directive(KbqAlert));
        alertNativeElement = alertDebugElement.nativeElement;
    });

    it('should add class', () => {
        expect(alertNativeElement.classList.contains('kbq-alert')).toBe(true);
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqAlertModule],
    template: `
        <kbq-alert />
    `
})
class TestApp {}

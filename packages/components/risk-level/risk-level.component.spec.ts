import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqRiskLevel, KbqRiskLevelModule } from './index';

describe('kbq-risk-level', () => {
    let fixture: ComponentFixture<TestApp>;
    let alertDebugElement: DebugElement;
    let alertNativeElement: HTMLElement;
    // let testComponent: TestApp;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqRiskLevelModule],
            declarations: [TestApp],
        });

        TestBed.compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        alertDebugElement = fixture.debugElement.query(By.directive(KbqRiskLevel));
        alertNativeElement = alertDebugElement.nativeElement;
        // testComponent = fixture.debugElement.componentInstance;
    }));

    it('should add class', () => {
        expect(alertNativeElement.classList.contains('kbq-risk-level')).toBe(true);
    });
});

@Component({
    selector: 'test-app',
    template: ` <kbq-risk-level></kbq-risk-level> `,
})
class TestApp {}

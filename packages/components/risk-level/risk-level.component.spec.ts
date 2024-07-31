import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqRiskLevel, KbqRiskLevelModule } from './index';

describe('kbq-risk-level', () => {
    let fixture: ComponentFixture<TestApp>;
    let alertDebugElement: DebugElement;
    let alertNativeElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqRiskLevelModule],
            declarations: [TestApp]
        }).compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        alertDebugElement = fixture.debugElement.query(By.directive(KbqRiskLevel));
        alertNativeElement = alertDebugElement.nativeElement;
    });

    it('should add class', () => {
        expect(alertNativeElement.classList.contains('kbq-risk-level')).toBe(true);
    });
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-risk-level />
    `
})
class TestApp {}

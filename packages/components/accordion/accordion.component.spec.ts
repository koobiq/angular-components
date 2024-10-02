import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqAccordion, KbqAccordionModule } from './index';

describe('KbqAccordion', () => {
    let fixture: ComponentFixture<TestApp>;
    let alertDebugElement: DebugElement;
    let alertNativeElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqAccordionModule],
            declarations: [TestApp]
        }).compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        alertDebugElement = fixture.debugElement.query(By.directive(KbqAccordion));
        alertNativeElement = alertDebugElement.nativeElement;
    });

    it('should add class', () => {
        expect(alertNativeElement.classList.contains('kbq-accordion')).toBe(true);
    });
});

@Component({
    selector: 'test-app',
    template: `
        <Kbq-accordion />
    `
})
class TestApp {}

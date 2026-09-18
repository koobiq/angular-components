import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqPipeTitle } from './pipe-title';

@Component({
    imports: [KbqPipeTitle],
    template: `
        <button [ignoreTooltipPointerEvents]="true" [kbqPipeTitle]="'Full pipe value'">
            <span #kbqTitleText class="name">Name</span>
            <span #kbqTitleText class="value">Value</span>
        </button>
    `
})
class TestComponent {}

describe('KbqPipeTitle', () => {
    let fixture: ComponentFixture<TestComponent>;
    let host: HTMLElement;
    let name: HTMLElement;
    let value: HTMLElement;
    let tooltip: KbqTooltipTrigger;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestComponent, NoopAnimationsModule] });

        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        host = fixture.nativeElement.querySelector('button');
        name = fixture.nativeElement.querySelector('.name');
        value = fixture.nativeElement.querySelector('.value');
        tooltip = fixture.debugElement.query(By.directive(KbqPipeTitle)).injector.get(KbqTooltipTrigger);
    });

    it('should enable the tooltip when a text track clips inside a wider trigger', () => {
        jest.spyOn(host, 'clientWidth', 'get').mockReturnValue(300);
        jest.spyOn(name, 'clientWidth', 'get').mockReturnValue(50);
        jest.spyOn(name, 'scrollWidth', 'get').mockReturnValue(50);
        jest.spyOn(value, 'clientWidth', 'get').mockReturnValue(100);
        jest.spyOn(value, 'scrollWidth', 'get').mockReturnValue(150);

        dispatchMouseEvent(host, 'mouseenter');

        expect(tooltip.disabled).toBe(false);
    });

    it('should keep the tooltip disabled when both text tracks fit', () => {
        jest.spyOn(name, 'clientWidth', 'get').mockReturnValue(50);
        jest.spyOn(name, 'scrollWidth', 'get').mockReturnValue(50);
        jest.spyOn(value, 'clientWidth', 'get').mockReturnValue(100);
        jest.spyOn(value, 'scrollWidth', 'get').mockReturnValue(100);

        dispatchMouseEvent(host, 'mouseenter');

        expect(tooltip.disabled).toBe(true);
    });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSplitButton, KbqSplitButtonModule } from '@koobiq/components/split-button';

@Component({
    selector: 'test-app-wrapped-only-button',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button>
            <span class="wrapper"><button kbq-button>Only</button></span>
        </kbq-split-button>
    `
})
class WrappedOnlyButton {}

@Component({
    selector: 'test-app-wrapped-second-button',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button>
            <button kbq-button>Action</button>
            <span class="wrapper"><button kbq-button>More</button></span>
        </kbq-split-button>
    `
})
class WrappedSecondButton {}

describe('KbqSplitButton triage: wrapped kbq-button', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [WrappedOnlyButton, WrappedSecondButton] });
    });

    it('DEFECT: a single wrapped button makes dev mode throw "must contain at least one button"', () => {
        const fixture = TestBed.createComponent(WrappedOnlyButton);

        expect(() => fixture.detectChanges()).toThrow('kbq-split-button must contain at least one button');
    });

    it('DEFECT: a wrapped second button is silently dropped from the rendered control', () => {
        const fixture = TestBed.createComponent(WrappedSecondButton);

        fixture.detectChanges();

        const host: HTMLElement = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;

        // The template has two buttons; only the direct child is projected, and nothing warns.
        expect(host.querySelectorAll('button').length).toBe(1);
        expect(host.querySelector('.wrapper')).toBeNull();
        expect(fixture.nativeElement.querySelector('.wrapper')).toBeNull();
        expect(host.classList.contains('kbq-split-button_styles-for-nested')).toBe(false);
    });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';

describe('KbqFlag triage: ARIA attributes written by the consumer', () => {
    it('DEFECT: a static role and aria-label on the flag are removed, and the flag is hidden instead', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <kbq-flag role="img" aria-label="Germany"><img src="DE.svg" alt="" /></kbq-flag>
            `
        })
        class TestApp {}

        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const flag: HTMLElement = fixture.debugElement.query(By.directive(KbqFlag)).nativeElement;

        expect(flag.hasAttribute('role')).toBe(false);
        expect(flag.hasAttribute('aria-label')).toBe(false);
        expect(flag.getAttribute('aria-hidden')).toBe('true');
    });

    it('DEFECT: a flag named with aria-labelledby is still hidden by aria-hidden="true"', () => {
        @Component({
            imports: [KbqFlag],
            template: `
                <span id="flag-name">Germany</span>
                <kbq-flag aria-labelledby="flag-name"><img src="DE.svg" alt="" /></kbq-flag>
            `
        })
        class TestApp {}

        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const flag: HTMLElement = fixture.debugElement.query(By.directive(KbqFlag)).nativeElement;

        expect(flag.getAttribute('aria-labelledby')).toBe('flag-name');
        expect(flag.getAttribute('aria-hidden')).toBe('true');
        expect(flag.hasAttribute('role')).toBe(false);
    });
});

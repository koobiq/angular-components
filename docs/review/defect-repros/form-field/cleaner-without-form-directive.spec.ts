import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqCleaner } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    imports: [KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqInput />
            <kbq-cleaner />
        </kbq-form-field>
    `
})
class CleanerWithoutFormDirective {}

describe('triage: KbqCleaner next to a control without a form directive', () => {
    it('DEFECT: the cleaner appears for typed text, but activating it leaves the text in place', async () => {
        TestBed.configureTestingModule({ imports: [CleanerWithoutFormDirective] });
        const fixture = TestBed.createComponent(CleanerWithoutFormDirective);

        fixture.autoDetectChanges();
        await fixture.whenStable();

        const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(fixture.debugElement.query(By.directive(KbqCleaner))).toBeNull();

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();

        const cleaner = fixture.debugElement.query(By.directive(KbqCleaner));

        expect(cleaner).not.toBeNull();

        cleaner.nativeElement.click();
        await fixture.whenStable();

        // Only the focus moved: there is no form control to reset.
        expect(document.activeElement).toBe(input);
        expect(input.value).toBe('koobiq');
        expect(fixture.debugElement.query(By.directive(KbqCleaner))).not.toBeNull();
    });
});

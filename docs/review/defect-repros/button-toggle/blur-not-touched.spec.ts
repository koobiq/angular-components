import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { dispatchFakeEvent } from '@koobiq/components/core';

@Component({
    imports: [KbqButtonToggleModule, ReactiveFormsModule],
    template: `
        <kbq-button-toggle-group aria-label="Colors" [formControl]="control">
            <kbq-button-toggle [value]="'red'">Red</kbq-button-toggle>
            <kbq-button-toggle [value]="'green'">Green</kbq-button-toggle>
        </kbq-button-toggle-group>
        <button type="button" id="after">After</button>
    `
})
class RequiredGroup {
    readonly control = new FormControl<string | null>(null, Validators.required);
}

describe('triage: button-toggle touched on blur', () => {
    it('DEFECT: tabbing through a required group without choosing leaves the control untouched', async () => {
        TestBed.configureTestingModule({ imports: [RequiredGroup] });

        const fixture = TestBed.createComponent(RequiredGroup);

        fixture.detectChanges();

        const [first] = Array.from<HTMLButtonElement>(
            fixture.nativeElement.querySelectorAll('kbq-button-toggle button')
        );
        const after: HTMLButtonElement = fixture.nativeElement.querySelector('#after');

        first.focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(first);

        after.focus();
        dispatchFakeEvent(first, 'blur');
        dispatchFakeEvent(first, 'focusout', true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.activeElement).toBe(after);
        expect(fixture.componentInstance.control.invalid).toBe(true);
        // A required error shown on `touched` (the default ErrorStateMatcher) never appears.
        expect(fixture.componentInstance.control.touched).toBe(false);
    });
});

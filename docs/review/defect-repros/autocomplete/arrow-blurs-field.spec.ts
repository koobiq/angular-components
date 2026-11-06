import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import {
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    DOWN_ARROW,
    KbqLocaleServiceModule,
    KbqOption
} from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    imports: [KbqInputModule, KbqAutocompleteModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [kbqAutocomplete]="auto" [formControl]="control" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete" [autoActiveFirstOption]="false">
            @for (state of states; track state) {
                <kbq-option [value]="state">{{ state }}</kbq-option>
            }
        </kbq-autocomplete>
    `
})
class RequiredFieldApp {
    readonly control = new UntypedFormControl('', Validators.required);
    readonly states = ['Alabama', 'California', 'Florida'];
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly options = viewChildren(KbqOption);
}

describe('triage: focus jumps to the option on navigation', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqLocaleServiceModule] });
    });

    afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

    it('DEFECT: an arrow key and a hover blur the field, marking the required control touched and invalid while focus stays in it', async () => {
        const fixture = TestBed.createComponent(RequiredFieldApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const { trigger, options, control } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        const blurs = vi.fn();
        const focusins = vi.fn();

        input.focus();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(trigger().panelOpen).toBe(true);
        expect(document.activeElement).toBe(input);
        expect(control.touched).toBe(false);
        expect(input.getAttribute('aria-invalid')).toBe('false');

        input.addEventListener('blur', blurs);
        input.addEventListener('focusin', focusins);

        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        expect(trigger().activeOption).toBe(options()[0]);
        // Focus is back in the field...
        expect(document.activeElement).toBe(input);
        // ...but the field was blurred and focused again on the way.
        expect(blurs).toHaveBeenCalledTimes(1);
        expect(focusins).toHaveBeenCalledTimes(1);
        expect(control.touched).toBe(true);
        expect(input.getAttribute('aria-invalid')).toBe('true');

        const optionElements = TestBed.inject(OverlayContainer)
            .getContainerElement()
            .querySelectorAll<HTMLElement>('kbq-option');

        dispatchFakeEvent(optionElements[2], 'mouseenter');
        fixture.detectChanges();

        expect(trigger().activeOption).toBe(options()[2]);
        expect(document.activeElement).toBe(input);
        expect(blurs).toHaveBeenCalledTimes(2);
    });
});

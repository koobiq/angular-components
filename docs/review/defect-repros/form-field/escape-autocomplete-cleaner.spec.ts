import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqAutocompleteModule, KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import { dispatchKeyboardEvent, ESCAPE } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

// Mirrors the `autocomplete-overview` docs example: an autocomplete input with a cleaner.
@Component({
    imports: [KbqAutocompleteModule, KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" [kbqAutocomplete]="auto" />

            <kbq-autocomplete #auto="kbqAutocomplete">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>

            <kbq-cleaner />
        </kbq-form-field>
    `
})
class AutocompleteWithCleaner {
    readonly control = new FormControl<string | null>('Al');
    readonly options = ['Albania', 'Algeria', 'Andorra'];
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
}

@Component({
    imports: [KbqAutocompleteModule, KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" [kbqAutocomplete]="auto" />

            <kbq-autocomplete #auto="kbqAutocomplete">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `
})
class AutocompleteWithoutCleaner {
    readonly control = new FormControl<string | null>('Al');
    readonly options = ['Albania', 'Algeria', 'Andorra'];
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
}

const openPanelAndPressEscape = async <T extends { trigger: () => KbqAutocompleteTrigger }>(component: new () => T) => {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    const trigger = fixture.componentInstance.trigger();

    input.focus();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();

    expect(document.activeElement).toBe(input);
    expect(trigger.panelOpen).toBe(true);

    const reachedBody = vi.fn();

    document.body.addEventListener('keydown', reachedBody);
    dispatchKeyboardEvent(input, 'keydown', ESCAPE);
    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    document.body.removeEventListener('keydown', reachedBody);

    return { fixture, trigger, reachedBody };
};

describe('triage: Escape in a filled autocomplete field with a cleaner', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('control: without a cleaner, Escape reaches the overlay and closes the panel, keeping the value', async () => {
        const { fixture, trigger, reachedBody } = await openPanelAndPressEscape(AutocompleteWithoutCleaner);

        expect(reachedBody).toHaveBeenCalledTimes(1);
        expect(trigger.panelOpen).toBe(false);
        expect(fixture.componentInstance.control.value).toBe('Al');
    });

    it('DEFECT: with a cleaner, Escape clears the value and never reaches the overlay, so the panel stays open', async () => {
        const { fixture, trigger, reachedBody } = await openPanelAndPressEscape(AutocompleteWithCleaner);

        expect(fixture.componentInstance.control.value).toBeNull();
        expect(reachedBody).not.toHaveBeenCalled();
        expect(trigger.panelOpen).toBe(true);
    });
});

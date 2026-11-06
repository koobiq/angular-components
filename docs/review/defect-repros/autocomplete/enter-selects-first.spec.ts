import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import {
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    DOWN_ARROW,
    ENTER,
    KbqLocaleServiceModule,
    KbqOption,
    KbqOptionSelectionChange
} from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    imports: [KbqInputModule, KbqAutocompleteModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [kbqAutocomplete]="auto" [formControl]="control" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (state of states; track state) {
                <kbq-option [value]="state">{{ state }}</kbq-option>
            }
        </kbq-autocomplete>
    `
})
class ValueModeApp {
    readonly control = new UntypedFormControl();
    readonly states = ['Alabama', 'California', 'Florida'];
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly options = viewChildren(KbqOption);
}

@Component({
    imports: [KbqInputModule, KbqAutocompleteModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput kbqAutocompleteTextMode [kbqAutocomplete]="textAuto" [formControl]="textControl" />
        </kbq-form-field>

        <kbq-autocomplete #textAuto="kbqAutocomplete">
            @for (word of words; track word) {
                <kbq-option [value]="word">{{ word }}</kbq-option>
            }
        </kbq-autocomplete>
    `
})
class TextModeApp {
    readonly textControl = new UntypedFormControl('');
    readonly words = ['Alpha', 'Alpine', 'Beta'];
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly options = viewChildren(KbqOption);
}

describe('triage: autoActiveFirstOption after a choice with Enter', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqLocaleServiceModule] });
    });

    afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

    it('DEFECT: Enter on the second option also selects the first one once the panel has closed', async () => {
        const fixture = TestBed.createComponent(ValueModeApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const { trigger, options, control } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        const selections: KbqOptionSelectionChange[] = [];

        trigger().optionSelections.subscribe((selection) => selections.push(selection));

        trigger().open();
        fixture.detectChanges();
        await fixture.whenStable();

        // autoActiveFirstOption is on by default.
        expect(trigger().activeOption).toBe(options()[0]);

        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        expect(trigger().activeOption).toBe(options()[1]);

        dispatchKeyboardEvent(input, 'keydown', ENTER);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(trigger().panelOpen).toBe(false);
        expect(control.value).toBe('California');
        expect(options()[1].selected).toBe(true);
        // The defect: the first option is selected as well, by the key manager's change handler.
        expect(options()[0].selected).toBe(true);
        expect(selections.map(({ source, isUserInput }) => [source.value, isUserInput])).toEqual([
            ['California', true],
            ['Alabama', true]
        ]);
    });

    it('DEFECT: in text mode Enter on the second option leaves the first option selected', async () => {
        const fixture = TestBed.createComponent(TextModeApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const { trigger, options, textControl } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        input.focus();
        input.value = 'Al';
        input.setSelectionRange(2, 2);
        dispatchFakeEvent(input, 'input');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(trigger().panelOpen).toBe(true);
        expect(trigger().activeOption).toBe(options()[0]);

        dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
        fixture.detectChanges();

        expect(trigger().activeOption).toBe(options()[1]);

        dispatchKeyboardEvent(input, 'keydown', ENTER);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(trigger().panelOpen).toBe(false);
        expect(input.value).toBe('Alpine');
        expect(textControl.value).toBe('Alpine');
        // The inserted option is deselected, as text mode promises...
        expect(options()[1].selected).toBe(false);
        // ...but the first option, never chosen, stays selected.
        expect(options()[0].selected).toBe(true);
    });
});

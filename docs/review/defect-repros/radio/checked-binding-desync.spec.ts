import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqRadioButton, KbqRadioGroup, KbqRadioModule } from '@koobiq/components/radio';

@Component({
    imports: [KbqRadioModule, ReactiveFormsModule],
    template: `
        <kbq-radio-group aria-label="Pokemon" [formControl]="control">
            <kbq-radio-button [value]="'fire'">Charmander</kbq-radio-button>
            <kbq-radio-button [checked]="true" [value]="'water'">Squirtle</kbq-radio-button>
        </kbq-radio-group>
    `
})
class FormControlGroupWithCheckedBinding {
    readonly control = new FormControl<string | null>('fire');
}

describe('triage: [checked] binding inside a form-bound group', () => {
    it('DEFECT: a [checked] binding moves the group off the form control value from the first render', () => {
        const fixture = TestBed.createComponent(FormControlGroupWithCheckedBinding);

        fixture.detectChanges();

        const radios = fixture.debugElement
            .queryAll(By.directive(KbqRadioButton))
            .map((debugEl) => debugEl.componentInstance as KbqRadioButton);
        const group = fixture.debugElement.query(By.directive(KbqRadioGroup)).injector.get(KbqRadioGroup);

        expect(fixture.componentInstance.control.value).toBe('fire');
        expect(group.value).toBe('water');
        expect(radios.map((radio) => radio.checked)).toEqual([false, true]);
    });
});

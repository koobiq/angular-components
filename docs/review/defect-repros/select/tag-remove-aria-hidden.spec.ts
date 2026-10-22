import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';

@Component({
    selector: 'triage-multi-select-with-default-tags',
    imports: [KbqFormFieldModule, KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple aria-label="Food" [formControl]="control">
                @for (food of foods; track food) {
                    <kbq-option [value]="food.value">{{ food.viewValue }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `
})
class MultiSelectWithDefaultTags {
    foods = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    control = new UntypedFormControl();

    readonly select = viewChild.required(KbqSelect);
}

describe('KbqSelect triage: remove control of the built-in tags', () => {
    let fixture: ComponentFixture<MultiSelectWithDefaultTags>;

    const getRemoveControls = (): HTMLElement[] =>
        Array.from(
            (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.kbq-select__trigger .kbq-tag-remove')
        );

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [MultiSelectWithDefaultTags] });
        fixture = TestBed.createComponent(MultiSelectWithDefaultTags);
        fixture.detectChanges();

        fixture.componentInstance.control.setValue(['steak-0', 'pizza-1']);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    // axe-core's `aria-hidden-focus` only reports this as "incomplete" under jsdom (the control has no size),
    // so the attribute combination the rule flags in a browser is asserted directly.
    it('DEFECT: the remove button is a tab stop but carries aria-hidden="true" from kbq-icon', () => {
        const controls = getRemoveControls();

        expect(controls.length).toBe(2);

        for (const control of controls) {
            expect(control.getAttribute('role')).toBe('button');
            expect(control.getAttribute('tabindex')).toBe('0');
            expect(control.getAttribute('aria-hidden')).toBe('true');
        }
    });
});

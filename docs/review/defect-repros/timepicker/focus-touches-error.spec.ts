import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { dispatchFakeEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTimepicker, KbqTimepickerModule } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqFormFieldModule, KbqTimepickerModule, ReactiveFormsModule, KbqLuxonDateModule],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <input kbqTimepicker formControlName="time" />
            </kbq-form-field>
        </form>
    `
})
class TestApp {
    readonly timepicker = viewChild.required(KbqTimepicker);
    readonly form = new FormGroup({ time: new FormControl<DateTime | null>(null, Validators.required) });
}

describe('triage: focus marks the timepicker control touched', () => {
    let fixture: ComponentFixture<TestApp>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    it('DEFECT: a required empty timepicker shows its error as soon as it is focused, before any input', () => {
        const { form, timepicker } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        const formField: HTMLElement = fixture.nativeElement.querySelector('kbq-form-field');

        expect(timepicker().errorState()).toBe(false);
        expect(formField.classList.contains('kbq-form-field_invalid')).toBe(false);

        dispatchFakeEvent(input, 'focus');
        fixture.detectChanges();

        expect(timepicker().focused()).toBe(true);
        expect(form.controls.time.touched).toBe(true);
        expect(timepicker().errorState()).toBe(true);
        expect(formField.classList.contains('kbq-form-field_invalid')).toBe(true);
    });
});

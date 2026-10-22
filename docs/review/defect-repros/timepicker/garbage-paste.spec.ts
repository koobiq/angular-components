import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { dispatchFakeEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTimepicker, KbqTimepickerModule } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqFormFieldModule, KbqTimepickerModule, ReactiveFormsModule, KbqLuxonDateModule],
    template: `
        <kbq-form-field>
            <input kbqTimepicker [formControl]="control" />
        </kbq-form-field>
    `
})
class TestApp {
    readonly timepicker = viewChild.required(KbqTimepicker);
    readonly control = new FormControl<DateTime | null>(DateTime.fromISO('2020-01-10T10:30:00'));
}

describe('triage: pasted text the timepicker cannot read', () => {
    let fixture: ComponentFixture<TestApp>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    for (const text of ['abc', '1:2:3:4']) {
        it(`DEFECT: "${text}" is written into the input and the control stays valid with the old value`, () => {
            const { control, timepicker } = fixture.componentInstance;
            const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

            dispatchFakeEvent(input, 'focus');
            fixture.detectChanges();

            timepicker().onPaste({ preventDefault: () => {}, clipboardData: { getData: () => text } });
            fixture.detectChanges();

            dispatchFakeEvent(input, 'blur');
            fixture.detectChanges();

            expect(timepicker().focused()).toBe(false);
            expect(input.value).toBe(text);
            expect(control.value?.toISO()).toContain('2020-01-10T10:30:00');
            expect(control.valid).toBe(true);
            expect(control.hasError('kbqTimepickerParse')).toBe(false);
            expect(timepicker().errorState()).toBe(false);

            // The parse validator would flag the text: nothing has run it.
            control.updateValueAndValidity();

            expect(control.hasError('kbqTimepickerParse')).toBe(true);
        });
    }
});

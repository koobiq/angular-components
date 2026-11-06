import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTimepicker, KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

@Component({
    // The adapter comes from the test module, so the spy below reaches the instance the timepicker injects.
    imports: [KbqFormFieldModule, KbqTimepickerModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqTimepicker [formControl]="control" [format]="format" [max]="max" />
        </kbq-form-field>
    `
})
class TestApp {
    readonly timepicker = viewChild.required(KbqTimepicker);
    readonly control = new FormControl<DateTime | null>(null);
    format = TimeFormats.HHmm;
    max: DateTime | null = null;
}

describe('triage: timepicker takes seconds and milliseconds of a typed time from now', () => {
    let fixture: ComponentFixture<TestApp>;
    let adapter: DateAdapter<DateTime>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqLuxonDateModule, TestApp] });
        adapter = TestBed.inject(DateAdapter);

        // "Now" is 14:23:47.123.
        vi.spyOn(adapter, 'today').mockImplementation(() => adapter.createDateTime(2020, 0, 1, 14, 23, 47, 123));

        fixture = TestBed.createComponent(TestApp);
        // The validation example: max = today().startOf('hour').plus({ hours: 1 }).
        fixture.componentInstance.max = adapter.today().startOf('hour').plus({ hours: 1 });
        fixture.detectChanges();
    });

    it('DEFECT: typing exactly max (15:00) into an empty HH:mm field fails kbqTimepickerHigherThenMax', () => {
        const { control, timepicker } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        expect(fixture.componentInstance.max?.toISO()).toContain('T15:00:00.000');

        input.value = '15:00';
        timepicker().onInput();
        fixture.detectChanges();

        // The field shows the maximum...
        expect(input.value).toBe('15:00');
        // ...but the value carries the seconds and milliseconds of "now".
        expect(control.value?.hour).toBe(15);
        expect(control.value?.minute).toBe(0);
        expect(control.value?.second).toBe(47);
        expect(control.value?.millisecond).toBe(123);
        expect(control.hasError('kbqTimepickerHigherThenMax')).toBe(true);
    });

    it('DEFECT: in HH:mm:ss format a typed 15:00:00 still takes the milliseconds of now and fails max', () => {
        const { control, timepicker } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        fixture.componentInstance.format = TimeFormats.HHmmss;
        fixture.detectChanges();

        input.value = '15:00:00';
        timepicker().onInput();
        fixture.detectChanges();

        expect(input.value).toBe('15:00:00');
        expect(control.value?.second).toBe(0);
        expect(control.value?.millisecond).toBe(123);
        expect(control.hasError('kbqTimepickerHigherThenMax')).toBe(true);
    });
});

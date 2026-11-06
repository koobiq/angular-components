import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
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
    readonly control = new FormControl<DateTime | null>(DateTime.fromISO('2020-01-10T08:00:00'));
}

describe('triage: pasted 12-hour times', () => {
    let fixture: ComponentFixture<TestApp>;

    const paste = (text: string) => {
        fixture.componentInstance.timepicker().onPaste({
            preventDefault: () => {},
            clipboardData: { getData: () => text }
        });
        fixture.detectChanges();
    };

    const value = () => fixture.componentInstance.control.value;
    const input = (): HTMLInputElement => fixture.nativeElement.querySelector('input');

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    it('DEFECT: 12:30 pm becomes 00:30 of the next day instead of 12:30', () => {
        paste('12:30 pm');

        expect(input().value).toBe('00:30');
        expect(value()?.toISO()).toContain('2020-01-11T00:30:00');
    });

    it('DEFECT: 12:30 am lands on the next day', () => {
        paste('12:30 am');

        expect(input().value).toBe('00:30');
        expect(value()?.toISO()).toContain('2020-01-11T00:30:00');
    });

    it('DEFECT: hours 13 to 19 are accepted with am/pm', () => {
        paste('15:00 am');

        expect(value()?.toISO()).toContain('2020-01-10T15:00:00');

        paste('13:00 pm');

        // 13 + 12 = 25 rolls over to 01:00 of the following day.
        expect(value()?.toISO()).toContain('2020-01-11T01:00:00');
    });

    it('DEFECT: 1:30PM without the space is read as 01:30', () => {
        paste('1:30PM');

        expect(input().value).toBe('01:30');
        expect(value()?.hour).toBe(1);
        expect(value()?.minute).toBe(30);
    });
});

import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDateTimezoneService } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTimepicker, KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqFormFieldModule, KbqTimepickerModule, ReactiveFormsModule, KbqLuxonDateModule],
    template: `
        <kbq-form-field>
            <input kbqTimepicker [formControl]="control" [format]="format" />
        </kbq-form-field>
    `
})
class TestApp {
    readonly timepicker = viewChild.required(KbqTimepicker);
    readonly control = new FormControl<DateTime | null>(null);
    format = TimeFormats.HHmm;
}

describe('triage: time zone change with no value', () => {
    let fixture: ComponentFixture<TestApp>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    it('DEFECT: a time zone change renders empty text over what the user has half typed', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        input.value = '1';
        fixture.componentInstance.timepicker().onInput();
        fixture.detectChanges();

        // A format change keeps the half-typed text...
        fixture.componentInstance.format = TimeFormats.HHmmss;
        fixture.detectChanges();

        expect(input.value).toBe('1');

        // ...a time zone change does not.
        TestBed.inject(KbqDateTimezoneService).setTimezone('UTC');
        fixture.detectChanges();

        expect(input.value).toBe('');
    });
});

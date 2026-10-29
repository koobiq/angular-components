import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    BACKSPACE,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    KBQ_DATE_LOCALE,
    LEFT_ARROW
} from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqDatepickerModule, ReactiveFormsModule],
    template: `
        <input [formControl]="control" [kbqDatepicker]="d" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithControl {
    readonly control = new FormControl<DateTime | null>(DateTime.local(2020, 1, 15));
}

const settle = async (fixture: ComponentFixture<unknown>) => {
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();
};

describe('triage: no input event handled by the datepicker input', () => {
    let fixture: ComponentFixture<DatepickerWithControl>;
    let input: HTMLInputElement;

    beforeEach(async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            imports: [LuxonDateModule, DatepickerWithControl],
            providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' }]
        });

        fixture = TestBed.createComponent(DatepickerWithControl);
        fixture.detectChanges();
        await settle(fixture);

        input = fixture.nativeElement.querySelector('input');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: text deleted with Backspace reaches the model only on blur', async () => {
        const { control } = fixture.componentInstance;

        expect(input.value).toBe('15.01.2020');

        input.focus();
        input.setSelectionRange(0, input.value.length);

        const backspace = dispatchKeyboardEvent(input, 'keydown', BACKSPACE);

        // What the browser does after an unprevented Backspace over the whole selection.
        input.value = '';
        dispatchFakeEvent(input, 'input');
        await settle(fixture);

        expect(backspace.defaultPrevented).toBe(false);
        expect(input.value).toBe('');
        expect(control.value?.toISODate()).toBe('2020-01-15');

        dispatchFakeEvent(input, 'blur');
        await settle(fixture);

        expect(control.value).toBeNull();
    });

    it('DEFECT: Left is prevented and does nothing in a partly typed field without a value', async () => {
        const { control } = fixture.componentInstance;

        control.setValue(null);
        fixture.detectChanges();

        input.focus();
        input.value = '1';
        input.setSelectionRange(1, 1);

        const left = dispatchKeyboardEvent(input, 'keydown', LEFT_ARROW);

        await settle(fixture);

        expect(left.defaultPrevented).toBe(true);
        expect(input.selectionStart).toBe(1);
        expect(input.value).toBe('1');
    });
});

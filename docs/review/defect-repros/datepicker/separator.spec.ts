import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { dispatchKeyboardEvent, KBQ_DATE_LOCALE, PERIOD, SLASH } from '@koobiq/components/core';
import { KbqDatepickerInput, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqDatepickerModule, ReactiveFormsModule],
    template: `
        <input [formControl]="control" [kbqDatepicker]="d" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithControl {
    readonly control = new FormControl<DateTime | null>(null);
}

const setup = async (): Promise<ComponentFixture<DatepickerWithControl>> => {
    TestBed.configureTestingModule({
        imports: [LuxonDateModule, DatepickerWithControl],
        providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' }]
    });

    const fixture = TestBed.createComponent(DatepickerWithControl);

    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();

    return fixture;
};

const settle = async (fixture: ComponentFixture<unknown>) => {
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();
};

describe('triage: separators in the datepicker input', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("DEFECT: the format's own separator is rejected after a digit, while another punctuation mark completes the part", async () => {
        const fixture = await setup();
        const { control } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        const datepickerInput: KbqDatepickerInput<DateTime> = fixture.debugElement
            .query(By.directive(KbqDatepickerInput))
            .injector.get(KbqDatepickerInput);
        const incorrectInput = vi.fn();

        datepickerInput.incorrectInput.subscribe(incorrectInput);

        input.focus();
        input.value = '5';
        input.setSelectionRange(1, 1);

        const period = dispatchKeyboardEvent(input, 'keydown', PERIOD, undefined, '.');

        await settle(fixture);

        expect(period.defaultPrevented).toBe(true);
        expect(incorrectInput).toHaveBeenCalledTimes(1);
        expect(input.value).toBe('5');
        expect(control.value).toBeNull();

        input.setSelectionRange(1, 1);
        dispatchKeyboardEvent(input, 'keydown', SLASH, undefined, '/');

        await settle(fixture);

        expect(incorrectInput).toHaveBeenCalledTimes(1);
        expect(input.value).toMatch(/^05\.01\.\d{4}$/);
        expect(control.value?.day).toBe(5);
    });

    it('DEFECT: a pasted date whose separators are longer than one character is not normalised', async () => {
        const fixture = await setup();
        const { control } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        const paste = (text: string) =>
            fixture.debugElement.query(By.directive(KbqDatepickerInput)).triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: { getData: () => text }
            });

        paste('15. 06. 2020');
        await settle(fixture);

        expect(input.value).toBe('15. 06. 2020');
        expect(control.value).toBeNull();

        paste('15.06.2020');
        await settle(fixture);

        expect(control.value?.toISODate()).toBe('2020-06-15');
    });
});

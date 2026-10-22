import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { dispatchKeyboardEvent, KBQ_DATE_LOCALE, ONE } from '@koobiq/components/core';
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

const setup = async (locale: string, value: DateTime | null): Promise<ComponentFixture<DatepickerWithControl>> => {
    TestBed.configureTestingModule({
        imports: [LuxonDateModule, DatepickerWithControl],
        providers: [{ provide: KBQ_DATE_LOCALE, useValue: locale }]
    });

    const fixture = TestBed.createComponent(DatepickerWithControl);

    fixture.componentInstance.control.setValue(value);
    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();

    return fixture;
};

const getInput = (fixture: ComponentFixture<unknown>): HTMLInputElement => fixture.nativeElement.querySelector('input');

/** Replaces the whole text with `text`, as typing over a full selection does, and lets the input handle the key. */
const typeOverWholeText = async (fixture: ComponentFixture<unknown>, text: string) => {
    const input = getInput(fixture);

    input.focus();
    input.value = text;
    input.setSelectionRange(text.length, text.length);
    dispatchKeyboardEvent(input, 'keydown', ONE);
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();
};

describe('triage: a lone first part typed over the whole text', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: in yyyy-MM-dd (en-US) a lone year moves the month back by one', async () => {
        const fixture = await setup('en-US', DateTime.local(2020, 6, 15));

        expect(getInput(fixture).value).toBe('2020-06-15');

        await typeOverWholeText(fixture, '2021');

        expect(fixture.componentInstance.control.value?.toISODate()).toBe('2021-05-15');
        expect(getInput(fixture).value).toBe('2021-05-15');
    });

    it('DEFECT: in January a lone year typed into an empty yyyy-MM-dd field throws', async () => {
        vi.setSystemTime(new Date(2027, 0, 15, 12));

        const fixture = await setup('en-US', null);
        const input = getInput(fixture);
        const datepickerInput: KbqDatepickerInput<DateTime> = fixture.debugElement
            .query(By.directive(KbqDatepickerInput))
            .injector.get(KbqDatepickerInput);

        input.focus();
        input.value = '2021';
        input.setSelectionRange(4, 4);

        // The handler a digit key schedules on a timer.
        expect(() => datepickerInput.onInput()).toThrow('Invalid month index "-1"');
        expect(fixture.componentInstance.control.value).toBeNull();
    });

    it('DEFECT: on 31 March a lone year typed into an empty yyyy-MM-dd field sets nothing (31 February)', async () => {
        vi.setSystemTime(new Date(2027, 2, 31, 12));

        const fixture = await setup('en-US', null);

        await typeOverWholeText(fixture, '2021');

        expect(fixture.componentInstance.control.value).toBeNull();
        expect(getInput(fixture).value).toBe('2021');
    });

    it('DEFECT: in dd.MM.yyyy (ru-RU) a lone day sets the month to January', async () => {
        const fixture = await setup('ru-RU', DateTime.local(2020, 6, 15));

        expect(getInput(fixture).value).toBe('15.06.2020');

        await typeOverWholeText(fixture, '20');

        expect(fixture.componentInstance.control.value?.toISODate()).toBe('2020-01-20');
        expect(getInput(fixture).value).toBe('20.01.2020');
    });
});

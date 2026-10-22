import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { dispatchKeyboardEvent, KBQ_DATE_LOCALE, ONE } from '@koobiq/components/core';
import { KbqDatepickerInput, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqDatepickerModule, FormsModule],
    template: `
        <input [kbqDatepicker]="d" [(ngModel)]="value" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithIsoNgModel {
    value: unknown = DateTime.local(2017, 6, 1).toISO();
}

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

const create = async <T>(host: new () => T): Promise<ComponentFixture<T>> => {
    TestBed.configureTestingModule({
        imports: [LuxonDateModule, host],
        providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' }]
    });

    const fixture = TestBed.createComponent(host);

    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();

    return fixture;
};

const getDatepickerInput = (fixture: ComponentFixture<unknown>): KbqDatepickerInput<DateTime> =>
    fixture.debugElement.query(By.directive(KbqDatepickerInput)).injector.get(KbqDatepickerInput);

describe('triage: the raw form control value stored as the input value', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: an ISO string bound through ngModel stays a string, and a typed date does not reach the model', async () => {
        const fixture = await create(DatepickerWithIsoNgModel);
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        const initial = fixture.componentInstance.value;

        expect(input.value).toBe('01.06.2017');
        expect(typeof getDatepickerInput(fixture).value()).toBe('string');

        input.focus();
        input.value = '15.07.2017';
        input.setSelectionRange(10, 10);
        dispatchKeyboardEvent(input, 'keydown', ONE);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        expect(input.value).toBe('15.07.2017');
        expect(fixture.componentInstance.value).toBe(initial);
        expect(typeof getDatepickerInput(fixture).value()).toBe('string');
    });

    it('DEFECT: an invalid date set on the form control is kept as the input value', async () => {
        const fixture = await create(DatepickerWithControl);
        const invalid = DateTime.invalid('triage');

        fixture.componentInstance.control.setValue(invalid);
        fixture.detectChanges();

        expect(getDatepickerInput(fixture).value()).toBe(invalid);
    });
});

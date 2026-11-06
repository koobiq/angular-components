import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { dispatchFakeEvent, KBQ_DATE_LOCALE } from '@koobiq/components/core';
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
    readonly control = new FormControl<DateTime | null>(DateTime.local(2020, 1, 15));
}

const settle = async (fixture: ComponentFixture<unknown>) => {
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();
};

const pasteAndBlur = async (fixture: ComponentFixture<DatepickerWithControl>, text: string) => {
    const inputDebugElement = fixture.debugElement.query(By.directive(KbqDatepickerInput));

    inputDebugElement.triggerEventHandler('paste', {
        preventDefault: () => null,
        clipboardData: { getData: () => text }
    });
    await settle(fixture);

    dispatchFakeEvent(inputDebugElement.nativeElement, 'blur');
    await settle(fixture);
};

describe('triage: unparseable text on blur', () => {
    beforeEach(() => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({
            imports: [LuxonDateModule, DatepickerWithControl],
            providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' }]
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('keeps the model for unparseable text of one group', async () => {
        const fixture = TestBed.createComponent(DatepickerWithControl);

        fixture.detectChanges();
        await settle(fixture);

        await pasteAndBlur(fixture, 'abc');

        const { control } = fixture.componentInstance;

        expect(control.value?.toISODate()).toBe('2020-01-15');
        expect(control.hasError('kbqDatepickerParse')).toBe(true);
    });

    it('DEFECT: unparseable text of three groups sets the model to null on blur', async () => {
        const fixture = TestBed.createComponent(DatepickerWithControl);

        fixture.detectChanges();
        await settle(fixture);

        await pasteAndBlur(fixture, 'aa.bb.cccc');

        const { control } = fixture.componentInstance;

        expect(control.value).toBeNull();
        expect(control.hasError('kbqDatepickerParse')).toBe(true);
    });
});

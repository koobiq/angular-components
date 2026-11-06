import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { dispatchMouseEvent, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqDatepicker, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqDatepickerModule, ReactiveFormsModule],
    template: `
        <input readonly [formControl]="control" [kbqDatepicker]="d" />
        <kbq-datepicker-toggle-icon [for]="d" />
        <kbq-datepicker #d />
    `
})
class ReadonlyDatepickerWithToggle {
    readonly control = new FormControl<DateTime | null>(DateTime.local(2020, 1, 1));
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
}

describe('triage: read-only datepicker input', () => {
    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
    });

    it('DEFECT: the toggle icon opens the calendar of a read-only input, and a picked day overwrites its value', async () => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule, ReadonlyDatepickerWithToggle],
            providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' }]
        });

        const fixture = TestBed.createComponent(ReadonlyDatepickerWithToggle);

        fixture.detectChanges();
        await fixture.whenStable();

        const { control } = fixture.componentInstance;
        const datepicker = fixture.componentInstance.datepicker();
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        expect(input.readOnly).toBe(true);
        expect(input.value).toBe('01.01.2020');

        // `toggle()` refuses a read-only input...
        datepicker.toggle();
        fixture.detectChanges();

        expect(datepicker.opened).toBe(false);

        // ...the toggle icon calls `open()` and does not.
        const icon: HTMLElement = fixture.nativeElement.querySelector('kbq-datepicker-toggle-icon i');

        dispatchMouseEvent(icon, 'mousedown');
        icon.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(datepicker.opened).toBe(true);

        const cells = document.querySelectorAll<HTMLElement>('.kbq-calendar__body-cell');

        cells[4].click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(input.readOnly).toBe(true);
        expect(control.value?.toISODate()).toBe('2020-01-05');
        expect(input.value).toBe('05.01.2020');
    });
});

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchKeyboardEvent,
    DOWN_ARROW,
    ENTER,
    KBQ_DATE_LOCALE,
    TAB
} from '@koobiq/components/core';
import { KbqDatepicker, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqDatepickerModule],
    template: `
        <input [kbqDatepicker]="d" [value]="date" />
        <kbq-datepicker-toggle-icon [for]="d" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithToggle {
    readonly date = DateTime.local(2020, 1, 1);
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
}

const openWithAltDown = async (fixture: ComponentFixture<DatepickerWithToggle>, input: HTMLInputElement) => {
    const event = createKeyboardEvent('keydown', DOWN_ARROW);

    Object.defineProperty(event, 'altKey', { get: () => true });
    dispatchEvent(input, event);
    fixture.detectChanges();
    await fixture.whenStable();
};

describe('triage: keyboard and ARIA of the datepicker', () => {
    let fixture: ComponentFixture<DatepickerWithToggle>;
    let input: HTMLInputElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule, DatepickerWithToggle],
            providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' }]
        });

        fixture = TestBed.createComponent(DatepickerWithToggle);
        fixture.detectChanges();
        await fixture.whenStable();

        input = fixture.nativeElement.querySelector('input');
    });

    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
    });

    it('DEFECT: the calendar keeps no part of itself in reach of the keyboard', async () => {
        const datepicker = fixture.componentInstance.datepicker();
        const toggleHost: HTMLElement = fixture.nativeElement.querySelector('kbq-datepicker-toggle-icon');
        const toggleIcon: HTMLElement = toggleHost.querySelector('i')!;

        expect(toggleIcon.getAttribute('tabindex')).toBe('-1');
        expect(toggleHost.hasAttribute('tabindex')).toBe(false);
        expect(toggleHost.hasAttribute('role')).toBe(false);

        input.focus();
        await openWithAltDown(fixture, input);

        expect(datepicker.opened).toBe(true);
        expect(document.activeElement).toBe(input);

        const cells = Array.from(document.querySelectorAll<HTMLElement>('.kbq-calendar__body-cell'));

        expect(cells.every((cell) => cell.getAttribute('tabindex') === '-1')).toBe(true);

        const selects = Array.from(document.querySelectorAll<HTMLElement>('.kbq-calendar-header kbq-select'));

        expect(selects.map((select) => select.getAttribute('tabindex'))).toEqual(['-1', '-1']);

        const headerButtons = Array.from(
            document.querySelectorAll<HTMLElement>('.kbq-calendar-header__button-group button')
        );

        // Recorded as found: the `[tabindex]="-1"` of the template against the host binding of `kbq-button`.
        expect(headerButtons.map((button) => button.getAttribute('tabindex'))).toEqual([null, null, null]);

        // Enter on a day does nothing.
        dispatchKeyboardEvent(cells[4], 'keydown', ENTER);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(datepicker.opened).toBe(true);
        expect(input.value).toBe('01.01.2020');

        // Tab from the input closes the calendar.
        dispatchKeyboardEvent(input, 'keydown', TAB);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(datepicker.opened).toBe(false);
    });

    it('DEFECT: ARIA gaps of the input, the toggle and the day grid', async () => {
        const toggleHost: HTMLElement = fixture.nativeElement.querySelector('kbq-datepicker-toggle-icon');

        input.focus();
        await openWithAltDown(fixture, input);

        expect(input.hasAttribute('aria-haspopup')).toBe(false);
        expect(input.hasAttribute('aria-expanded')).toBe(false);
        expect(input.hasAttribute('aria-controls')).toBe(false);

        expect(toggleHost.getAttribute('aria-expanded')).toBe('true');
        expect(toggleHost.hasAttribute('role')).toBe(false);

        const table = document.querySelector<HTMLElement>('.kbq-calendar__table')!;
        const selectedCell = document.querySelector<HTMLElement>(
            '.kbq-calendar__body-cell .kbq-selected'
        )!.parentElement!;

        expect(table.hasAttribute('aria-label') || table.hasAttribute('aria-labelledby')).toBe(false);
        expect(table.querySelector('caption')).toBeNull();
        expect(selectedCell.hasAttribute('role')).toBe(false);
        expect(selectedCell.hasAttribute('aria-selected')).toBe(false);

        // axe-core does not report `aria-expanded` on the role-less custom element either, so no axe check catches it.
        const axe = (await import('axe-core')).default;
        const { violations } = await axe.run(fixture.nativeElement, { runOnly: ['aria-allowed-attr'] });

        expect(violations.map((violation) => violation.id)).toEqual([]);
    });
});

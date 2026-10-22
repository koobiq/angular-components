import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqCalendarHeader, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqDatepickerModule],
    template: `
        <kbq-calendar [maxDate]="maxDate" [minDate]="minDate" [startAt]="startAt" />
    `
})
class BoundedCalendar {
    startAt = DateTime.local(2020, 4, 10);
    minDate: DateTime | null = DateTime.local(2020, 3, 5);
    maxDate: DateTime | null = DateTime.local(2020, 6, 20);
}

@Component({
    imports: [KbqDatepickerModule],
    template: `
        <kbq-calendar [startAt]="startAt" />
    `
})
class UnboundedCalendar {
    startAt = DateTime.local(1900, 2, 15);
}

const create = <T>(host: new () => T): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [LuxonDateModule, host],
        providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' }]
    });

    const fixture = TestBed.createComponent(host);

    fixture.detectChanges();

    return fixture;
};

const getHeader = (fixture: ComponentFixture<unknown>): KbqCalendarHeader<DateTime> =>
    fixture.debugElement.query(By.directive(KbqCalendarHeader)).componentInstance;

describe('triage: bounds of the calendar header', () => {
    it('DEFECT: the default minimum is February 1900, so January 1900 cannot be reached', () => {
        const fixture = create(UnboundedCalendar);
        const header = getHeader(fixture);

        expect(header.minDate?.toISODate()).toBe('1900-02-01');
        expect(header.previousDisabled).toBe(true);
        expect(header.monthNames[0].disabled).toBe(true);
    });

    it('DEFECT: with both bounds in one year, the months after maxDate stay enabled', () => {
        const fixture = create(BoundedCalendar);
        const header = getHeader(fixture);

        expect(header.monthNames.filter((month) => month.disabled).map((month) => month.value)).toEqual([0, 1]);
    });

    it('DEFECT: bounds that become unset keep the old year list and limits', () => {
        const fixture = create(BoundedCalendar);
        const header = getHeader(fixture);

        expect(header.years).toEqual([2020]);

        fixture.componentInstance.minDate = null;
        fixture.componentInstance.maxDate = null;
        fixture.detectChanges();

        expect(header.years).toEqual([2020]);
        expect(header.minDate?.toISODate()).toBe('2020-03-05');
        expect(header.maxDate?.toISODate()).toBe('2020-06-20');
    });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqCalendar, KbqCalendarHeader, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqDatepickerModule],
    template: `
        <kbq-calendar
            [startAt]="startAt"
            (monthSelected)="monthSelected = $event"
            (yearSelected)="yearSelected = $event"
        />
    `
})
class CalendarWithSelectionOutputs {
    readonly startAt = DateTime.local(2017, 1, 31);
    monthSelected: DateTime | null = null;
    yearSelected: DateTime | null = null;
}

describe('triage: monthSelected / yearSelected of the calendar', () => {
    it('DEFECT: monthSelected and yearSelected emit the date shown before the pick', () => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule, CalendarWithSelectionOutputs],
            providers: [{ provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' }]
        });

        const fixture = TestBed.createComponent(CalendarWithSelectionOutputs);

        fixture.detectChanges();

        const host = fixture.componentInstance;
        const header: KbqCalendarHeader<DateTime> = fixture.debugElement.query(
            By.directive(KbqCalendarHeader)
        ).componentInstance;
        const calendar: KbqCalendar<DateTime> = fixture.debugElement.query(By.directive(KbqCalendar)).componentInstance;

        // What the `selectionChange` of the month list calls: June.
        header.onMonthSelected(5);
        fixture.detectChanges();

        expect(calendar.activeDate.toISODate()).toBe('2017-06-30');
        expect(host.monthSelected?.toISODate()).toBe('2017-01-31');

        // What the `selectionChange` of the year list calls: 2019.
        header.onYearSelected(2019);
        fixture.detectChanges();

        expect(calendar.activeDate.toISODate()).toBe('2019-06-30');
        expect(host.yearSelected?.toISODate()).toBe('2017-06-30');
    });
});

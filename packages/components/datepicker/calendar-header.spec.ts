// tslint:disable:no-magic-numbers
import { Component } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule, LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { KbqCalendar } from './calendar.component';
import { KbqDatepickerIntl } from './datepicker-intl';
import { KbqDatepickerModule } from './datepicker-module';

describe('KbqCalendarHeader', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqLuxonDateModule,
                KbqDatepickerModule
            ],
            declarations: [StandardCalendar],
            providers: [
                KbqDatepickerIntl,
                { provide: DateAdapter, useClass: LuxonDateAdapter }]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    describe('standard calendar', () => {
        let fixture: ComponentFixture<StandardCalendar>;
        let calendarElement: HTMLElement;
        let prevButton: HTMLElement;
        let nextButton: HTMLElement;
        let calendarInstance: KbqCalendar<DateTime>;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardCalendar);
            fixture.detectChanges();

            const calendarDebugElement = fixture.debugElement.query(By.directive(KbqCalendar));
            calendarElement = calendarDebugElement.nativeElement;
            prevButton = calendarElement.querySelector('.kbq-calendar-header__previous-button') as HTMLElement;
            nextButton = calendarElement.querySelector('.kbq-calendar-header__next-button') as HTMLElement;

            calendarInstance = calendarDebugElement.componentInstance;
        });

        it('should be in month view with specified month active', () => {
            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170131');
        });

        it('should go to next and previous month', () => {
            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170131');

            nextButton.click();
            fixture.detectChanges();

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170228');

            prevButton.click();
            fixture.detectChanges();

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170128');
        });
    });
});

@Component({
    template: `
        <kbq-calendar
            [(selected)]="selected"
            [startAt]="startDate"
            (yearSelected)="selectedYear = $event"
            (monthSelected)="selectedMonth = $event"
        ></kbq-calendar>
    `
})
class StandardCalendar {
    selected: DateTime;
    selectedYear: DateTime;
    selectedMonth: DateTime;
    startDate = this.adapter.createDate(2017, 0, 31);

    constructor(public adapter: DateAdapter<DateTime>) {}
}

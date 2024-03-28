// tslint:disable:no-magic-numbers
// tslint:disable:no-unbound-method
import { Component, LOCALE_ID } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LuxonDateAdapter, KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { ENTER } from '@koobiq/cdk/keycodes';
import {
    dispatchFakeEvent,
    dispatchKeyboardEvent
} from '@koobiq/cdk/testing';
import { DateAdapter } from '@koobiq/components/core';
import { DateTime } from 'luxon';

import { KbqCalendar } from './calendar.component';
import { KbqDatepickerIntl } from './datepicker-intl';
import { KbqDatepickerModule } from './datepicker-module';


describe('KbqCalendar', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqLuxonDateModule,
                KbqDatepickerModule
            ],
            declarations: [
                StandardCalendar,
                CalendarWithMinMax,
                CalendarWithDateFilter,
                CalendarWithSelectableMinDate
            ],
            providers: [
                KbqDatepickerIntl,
                { provide: DateAdapter, useClass: LuxonDateAdapter },
                { provide: LOCALE_ID, useValue: 'ru-RU' }
            ]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    describe('standard calendar', () => {
        let fixture: ComponentFixture<StandardCalendar>;
        let testComponent: StandardCalendar;
        let calendarElement: HTMLElement;
        let calendarInstance: KbqCalendar<DateTime>;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardCalendar);
            fixture.detectChanges();

            const calendarDebugElement = fixture.debugElement.query(By.directive(KbqCalendar));
            calendarElement = calendarDebugElement.nativeElement;

            calendarInstance = calendarDebugElement.componentInstance;
            testComponent = fixture.componentInstance;
        });

        it(`should update today's date`, () => {
            let fakeToday = adapter.createDate(2018, 0, 1);
            spyOn(adapter, 'today').and.callFake(() => fakeToday);

            calendarInstance.activeDate = fakeToday;
            calendarInstance.updateTodaysDate();
            fixture.detectChanges();

            let todayCell = calendarElement.querySelector('.kbq-calendar__body-today')!;
            expect(todayCell).not.toBeNull();
            expect(todayCell.innerHTML.trim()).toBe('1');

            fakeToday = adapter.createDate(2018, 0, 10);
            calendarInstance.updateTodaysDate();
            fixture.detectChanges();

            todayCell = calendarElement.querySelector('.kbq-calendar__body-today')!;
            expect(todayCell).not.toBeNull();
            expect(todayCell.innerHTML.trim()).toBe('10');
        });

        it('should be in month view with specified month active', () => {
            expect(adapter.getYear(calendarInstance.activeDate)).toEqual(2017);
            expect(adapter.getMonth(calendarInstance.activeDate)).toEqual(0);
            expect(adapter.getDate(calendarInstance.activeDate)).toEqual(31);
        });

        it('should select date in month view', () => {
            const monthCells = calendarElement.querySelectorAll('.kbq-calendar__body-cell');
            (monthCells[monthCells.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            expect(testComponent.selected.toString()).toContain('2017-01-31');
        });

        it('should complete the stateChanges stream', () => {
            const spy = jasmine.createSpy('complete spy');
            const subscription = calendarInstance.stateChanges.subscribe({complete: spy});

            fixture.destroy();

            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });

        describe('a11y', () => {
            describe('calendar body', () => {
                let calendarBodyEl: HTMLElement;

                beforeEach(() => {
                    calendarBodyEl = calendarElement.querySelector('.kbq-calendar__content') as HTMLElement;
                    expect(calendarBodyEl).not.toBeNull();

                    dispatchFakeEvent(calendarBodyEl, 'focus');
                    fixture.detectChanges();
                });

                it('should initially set start date active', () => {
                    expect(adapter.getYear(calendarInstance.activeDate)).toEqual(2017);
                    expect(adapter.getMonth(calendarInstance.activeDate)).toEqual(0);
                    expect(adapter.getDate(calendarInstance.activeDate)).toEqual(31);
                });

                it('should set start date active if null assigned to activeDate', () => {
                    calendarInstance.activeDate = null;
                    fixture.detectChanges();

                    expect(adapter.getYear(calendarInstance.activeDate)).toEqual(2017);
                    expect(adapter.getMonth(calendarInstance.activeDate)).toEqual(0);
                    expect(adapter.getDate(calendarInstance.activeDate)).toEqual(31);
                });

                it('should set today active if null assigned to activeDate and start date empty', () => {
                    calendarInstance.startAt = null;
                    calendarInstance.activeDate = null;
                    fixture.detectChanges();

                    expect(adapter.getYear(calendarInstance.activeDate)).toEqual(adapter.getYear(adapter.today()));
                    expect(adapter.getMonth(calendarInstance.activeDate)).toEqual(adapter.getMonth(adapter.today()));
                    expect(adapter.getDate(calendarInstance.activeDate)).toEqual(adapter.getDate(adapter.today()));
                });
            });
        });
    });

    describe('calendar with min and max date', () => {
        let fixture: ComponentFixture<CalendarWithMinMax>;
        let testComponent: CalendarWithMinMax;
        let calendarElement: HTMLElement;
        let calendarInstance: KbqCalendar<DateTime>;

        beforeEach(() => {
            fixture = TestBed.createComponent(CalendarWithMinMax);

            const calendarDebugElement = fixture.debugElement.query(By.directive(KbqCalendar));
            calendarElement = calendarDebugElement.nativeElement;
            calendarInstance = calendarDebugElement.componentInstance;
            testComponent = fixture.componentInstance;
        });

        it('should clamp startAt value below min date', () => {
            testComponent.startAt = adapter.createDate(2000, 0, 1);
            fixture.detectChanges();

            expect(adapter.getYear(calendarInstance.activeDate)).toEqual(2016);
            expect(adapter.getMonth(calendarInstance.activeDate)).toEqual(0);
            expect(adapter.getDate(calendarInstance.activeDate)).toEqual(1);
        });

        it('should clamp startAt value above max date', () => {
            testComponent.startAt = adapter.createDate(2020, 0, 1);
            fixture.detectChanges();

            expect(adapter.getYear(calendarInstance.activeDate)).toEqual(2018);
            expect(adapter.getMonth(calendarInstance.activeDate)).toEqual(0);
            expect(adapter.getDate(calendarInstance.activeDate)).toEqual(1);
        });

        // todo после изменений в хедере календаря нужно поправить
        xit('should not go back past min date', () => {
            testComponent.startAt = adapter.createDate(2016, 1, 1);
            fixture.detectChanges();

            const prevButton =
                calendarElement.querySelector('.kbq-calendar-header__previous-button') as HTMLButtonElement;

            expect(prevButton.disabled)
                .withContext('previous button should not be disabled')
                .toBe(false);

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20160201');

            prevButton.click();
            fixture.detectChanges();

            expect(prevButton.disabled)
                .withContext('previous button should be disabled')
                .toBe(true);

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20160101');

            prevButton.click();
            fixture.detectChanges();

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20160101');
        });

        it('should not go forward past max date', () => {
            testComponent.startAt = adapter.createDate(2017, 11, 1);
            fixture.detectChanges();

            const nextButton =
                calendarElement.querySelector('.kbq-calendar-header__next-button') as HTMLButtonElement;

            expect(nextButton.disabled)
                .withContext('next button should not be disabled')
                .toBe(false);

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20171201');

            nextButton.click();
            fixture.detectChanges();

            expect(nextButton.disabled)
                .withContext('next button should be disabled')
                .toBe(true);
            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20180101');

            nextButton.click();
            fixture.detectChanges();

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20180101');
        });

        it('should re-render the month view when the minDate changes', () => {
            fixture.detectChanges();
            spyOn(calendarInstance.monthView, 'init').and.callThrough();

            testComponent.minDate = adapter.createDate(2017, 10, 1);
            fixture.detectChanges();

            expect(calendarInstance.monthView.init).toHaveBeenCalled();
        });

        it('should re-render the month view when the maxDate changes', () => {
            fixture.detectChanges();
            spyOn(calendarInstance.monthView, 'init').and.callThrough();

            testComponent.maxDate = adapter.createDate(2017, 11, 1);
            fixture.detectChanges();

            expect(calendarInstance.monthView.init).toHaveBeenCalled();
        });

        it('should update the minDate in the child view if it changed after an interaction', () => {
            fixture.destroy();

            const dynamicFixture = TestBed.createComponent(CalendarWithSelectableMinDate);
            dynamicFixture.detectChanges();

            const calendarDebugElement = dynamicFixture.debugElement.query(By.directive(KbqCalendar));
            const disabledClass = 'kbq-disabled';
            calendarElement = calendarDebugElement.nativeElement;
            calendarInstance = calendarDebugElement.componentInstance;

            let cells = Array.from(calendarElement.querySelectorAll('.kbq-calendar__body-cell-content'));

            expect(cells.slice(0, 9).every((c) => c.classList.contains(disabledClass)))
                .withContext('Expected dates up to the 10th to be disabled.')
                .toBe(true);

            expect(cells.slice(9).every((c) => c.classList.contains(disabledClass)))
                .withContext('Expected dates after the 10th to be enabled.')
                .toBe(false);

            (cells[14] as HTMLElement).click();
            dynamicFixture.detectChanges();
            cells = Array.from(calendarElement.querySelectorAll('.kbq-calendar__body-cell-content'));

            expect(cells.slice(0, 14).every((c) => c.classList.contains(disabledClass)))
                .withContext('Expected dates up to the 14th to be disabled.')
                .toBe(true);

            expect(cells.slice(14).every((c) => c.classList.contains(disabledClass)))
                .withContext('Expected dates after the 14th to be enabled.')
                .toBe(false);
        });
    });

    describe('calendar with date filter', () => {
        let fixture: ComponentFixture<CalendarWithDateFilter>;
        let testComponent: CalendarWithDateFilter;
        let calendarElement: HTMLElement;
        let calendarInstance: KbqCalendar<DateTime>;

        beforeEach(() => {
            fixture = TestBed.createComponent(CalendarWithDateFilter);
            fixture.detectChanges();

            const calendarDebugElement = fixture.debugElement.query(By.directive(KbqCalendar));
            calendarElement = calendarDebugElement.nativeElement;
            calendarInstance = calendarDebugElement.componentInstance;
            testComponent = fixture.componentInstance;
        });

        it('should disable and prevent selection of filtered dates', () => {
            const cells = calendarElement.querySelectorAll('.kbq-calendar__body-cell');
            (cells[0] as HTMLElement).click();
            fixture.detectChanges();

            expect(testComponent.selected).toBeFalsy();

            (cells[1] as HTMLElement).click();
            fixture.detectChanges();

            expect(testComponent.selected.toString()).toContain('2017-01-02');
        });

        describe('a11y', () => {
            let tableBodyEl: HTMLElement;

            beforeEach(() => {
                tableBodyEl = calendarElement.querySelector('.kbq-calendar__body') as HTMLElement;
                expect(tableBodyEl).not.toBeNull();

                dispatchFakeEvent(tableBodyEl, 'focus');
                fixture.detectChanges();
            });

            it('should not allow selection of disabled date in month view', () => {
                expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170101');

                dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
                fixture.detectChanges();

                expect(testComponent.selected).toBeUndefined();
            });

            it('should allow entering month view at disabled month', () => {
                (calendarElement.querySelector('.kbq-calendar__body_active') as HTMLElement).click();
                fixture.detectChanges();

                calendarInstance.activeDate = adapter.createDate(2017, 10, 1);
                fixture.detectChanges();

                tableBodyEl = calendarElement.querySelector('.kbq-calendar__body') as HTMLElement;
                dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
                fixture.detectChanges();

                expect(testComponent.selected).toBeUndefined();
            });
        });
    });
});


@Component({
    template: `
        <kbq-calendar
            [startAt]="startDate"
            [(selected)]="selected"
            (yearSelected)="selectedYear=$event"
            (monthSelected)="selectedMonth=$event">
        </kbq-calendar>`
})
class StandardCalendar {
    selected: DateTime;
    selectedYear: DateTime;
    selectedMonth: DateTime;
    startDate = this.adapter.createDate(2017, 0, 31);

    constructor(public adapter: DateAdapter<DateTime>) {}
}


@Component({
    template: `
        <kbq-calendar [startAt]="startAt" [minDate]="minDate" [maxDate]="maxDate"></kbq-calendar>
    `
})
class CalendarWithMinMax {
    startAt: DateTime;
    minDate = this.adapter.createDate(2016, 0, 1);
    maxDate = this.adapter.createDate(2018, 0, 1);

    constructor(public adapter: DateAdapter<DateTime>) {}
}


@Component({
    template: `
        <kbq-calendar
            [startAt]="startDate"
            [(selected)]="selected"
            [dateFilter]="dateFilter">
        </kbq-calendar>
    `
})
class CalendarWithDateFilter {
    selected: DateTime;
    startDate = this.adapter.createDate(2017, 0, 1);

    constructor(public adapter: DateAdapter<DateTime>) {}

    dateFilter(date: DateTime) {
        return !(this.adapter.getDate(date) % 2) && this.adapter.getMonth(date) !== 10;
    }
}


@Component({
    template: `
        <kbq-calendar
            [startAt]="startAt"
            (selectedChange)="select($event)"
            [selected]="selected"
            [minDate]="selected">
        </kbq-calendar>
    `
})
class CalendarWithSelectableMinDate {
    startAt = new Date(2018, 6, 0);
    selected: Date;
    minDate: Date;

    constructor() {
        this.select(new Date(2018, 6, 10));
    }

    select(value: Date) {
        this.minDate = this.selected = value;
    }
}

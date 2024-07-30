import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateTime } from 'luxon';
import { KbqCalendarBody } from './calendar-body.component';
import { KbqMonthView } from './month-view.component';

describe('KbqMonthView', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqLuxonDateModule],
            declarations: [
                KbqCalendarBody,
                KbqMonthView,

                // Test components.
                StandardMonthView,
                MonthViewWithDateFilter,
                MonthViewWithDateClass
            ]
        });

        TestBed.compileComponents();
    }));

    describe('standard month view', () => {
        let fixture: ComponentFixture<StandardMonthView>;
        let testComponent: StandardMonthView;
        let monthViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardMonthView);
            fixture.detectChanges();

            const monthViewDebugElement = fixture.debugElement.query(By.directive(KbqMonthView));
            monthViewNativeElement = monthViewDebugElement.nativeElement;
            testComponent = fixture.componentInstance;
        });

        it('has 31 days', () => {
            const cellEls = monthViewNativeElement.querySelectorAll('.kbq-calendar__body-cell');
            expect(cellEls.length).toBe(31);
        });

        it('shows selected date if in same month', () => {
            const selectedEl = monthViewNativeElement.querySelector('.kbq-selected')!;
            expect(selectedEl.innerHTML.trim()).toBe('10');
        });

        it('does not show selected date if in different month', () => {
            testComponent.selected = DateTime.local(2017, 2, 10);
            fixture.detectChanges();

            const selectedEl = monthViewNativeElement.querySelector('.kbq-selected');
            expect(selectedEl).toBeNull();
        });

        it('fires selected change event on cell clicked', () => {
            const cellEls = monthViewNativeElement.querySelectorAll('.kbq-calendar__body-cell');
            (cellEls[cellEls.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            const selectedEl = monthViewNativeElement.querySelector('.kbq-selected')!;
            expect(selectedEl.innerHTML.trim()).toBe('31');
        });

        it('should mark active date', () => {
            const cellEls = monthViewNativeElement.querySelectorAll('.kbq-calendar__body-cell');
            expect((cellEls[4] as HTMLElement).innerText.trim()).toBe('5');
            expect(cellEls[4].classList).toContain('kbq-calendar__body_active');
        });
    });

    describe('month view with date filter', () => {
        let fixture: ComponentFixture<MonthViewWithDateFilter>;
        let monthViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(MonthViewWithDateFilter);
            fixture.detectChanges();

            const monthViewDebugElement = fixture.debugElement.query(By.directive(KbqMonthView));
            monthViewNativeElement = monthViewDebugElement.nativeElement;
        });

        it('should disable filtered dates', () => {
            const cells = monthViewNativeElement.querySelectorAll('.kbq-calendar__body-cell-content');
            expect(cells[0].classList).toContain('kbq-disabled');
            expect(cells[1].classList).not.toContain('kbq-disabled');
        });
    });

    describe('month view with custom date classes', () => {
        let fixture: ComponentFixture<MonthViewWithDateClass>;
        let monthViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(MonthViewWithDateClass);
            fixture.detectChanges();

            const monthViewDebugElement = fixture.debugElement.query(By.directive(KbqMonthView));
            monthViewNativeElement = monthViewDebugElement.nativeElement;
        });

        it('should be able to add a custom class to some dates', () => {
            const cells = monthViewNativeElement.querySelectorAll('.kbq-calendar__body-cell');
            expect(cells[0].classList).not.toContain('even');
            expect(cells[1].classList).toContain('even');
        });
    });
});

@Component({
    template: `
        <kbq-month-view
            [(activeDate)]="date"
            [(selected)]="selected"
        />
    `
})
class StandardMonthView {
    date = DateTime.local(2017, 1, 5);
    selected = DateTime.local(2017, 1, 10);
}

@Component({
    template: `
        <kbq-month-view
            [activeDate]="activeDate"
            [dateFilter]="dateFilter"
        />
    `
})
class MonthViewWithDateFilter {
    activeDate = DateTime.local(2017, 1, 1);

    dateFilter(date: DateTime): any {
        return date.day % 2 === 0;
    }
}

@Component({
    template: `
        <kbq-month-view
            [activeDate]="activeDate"
            [dateClass]="dateClass"
        />
    `
})
class MonthViewWithDateClass {
    activeDate = DateTime.local(2017, 1, 1);

    dateClass(date: DateTime) {
        return date.day % 2 === 0 ? 'even' : undefined;
    }
}

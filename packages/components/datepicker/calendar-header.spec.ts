import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, inject as inject_1 } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule, LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, ruRULocaleData } from '@koobiq/components/core';
import { KbqSelect } from '@koobiq/components/select';
import { DateTime } from 'luxon';
import { KbqCalendarHeader } from './calendar-header.component';
import { KbqCalendar } from './calendar.component';
import { KbqDatepickerModule } from './datepicker-module';

describe('KbqCalendarHeader', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqLuxonDateModule,
                KbqDatepickerModule,
                StandardCalendar
            ],
            providers: [
                { provide: DateAdapter, useClass: LuxonDateAdapter }
            ]
        }).compileComponents();
    });

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
            prevButton = calendarElement.querySelector<HTMLElement>('.kbq-calendar-header__previous-button')!;
            nextButton = calendarElement.querySelector<HTMLElement>('.kbq-calendar-header__next-button')!;

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

    describe('accessibility', () => {
        let fixture: ComponentFixture<StandardCalendar>;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardCalendar);
            fixture.detectChanges();
            overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
        });

        const getHeader = (): HTMLElement => fixture.nativeElement.querySelector('kbq-calendar-header');

        it('should name the month and year lists', () => {
            const [month, year] = Array.from(getHeader().querySelectorAll('kbq-select'));

            expect(month.getAttribute('aria-label')).toBe(ruRULocaleData.a11y.month);
            expect(year.getAttribute('aria-label')).toBe(ruRULocaleData.a11y.year);
        });

        it('should have no axe violations', async () => {
            await expect(getHeader()).toHaveNoViolations();
        });

        it.each([
            { list: 'month', index: 0 },
            { list: 'year', index: 1 }
        ])(
            'should have no axe violations in the open $list list',
            async ({ index }) => {
                fixture.debugElement.queryAll(By.directive(KbqSelect))[index].componentInstance.open();
                fixture.detectChanges();
                await fixture.whenStable();
                fixture.detectChanges();

                await expect(overlayContainerElement).toHaveNoViolations();
            },
            15_000
        );
    });

    describe('without a DateAdapter', () => {
        it('should say which provider is missing', () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [KbqCalendarHeader] });

            expect(() => TestBed.createComponent(KbqCalendarHeader)).toThrow(
                /KbqDatepicker: No provider found for DateAdapter/
            );
        });
    });
});

@Component({
    imports: [KbqLuxonDateModule, KbqDatepickerModule],
    template: `
        <kbq-calendar
            [startAt]="startDate"
            [(selected)]="selected"
            (yearSelected)="selectedYear = $event"
            (monthSelected)="selectedMonth = $event"
        />
    `
})
class StandardCalendar {
    adapter = inject_1<DateAdapter<DateTime>>(DateAdapter);

    selected: DateTime;
    selectedYear: DateTime;
    selectedMonth: DateTime;
    startDate = this.adapter.createDate(2017, 0, 31);
}

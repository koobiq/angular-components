import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqCalendarBody, KbqCalendarCell } from './calendar-body.component';

describe('KbqCalendarBody', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqCalendarBody,
                // Test components.
                StandardCalendarBody
            ]
        }).compileComponents();
    });

    describe('standard calendar body', () => {
        let fixture: ComponentFixture<StandardCalendarBody>;
        let testComponent: StandardCalendarBody;
        let calendarBodyNativeElement: Element;
        let rowEls: Element[];
        let labelEls: Element[];
        let cellEls: HTMLElement[];

        function refreshElementLists() {
            rowEls = Array.from(calendarBodyNativeElement.querySelectorAll('tr'));
            labelEls = Array.from(calendarBodyNativeElement.querySelectorAll('.kbq-calendar__body-label'));
            cellEls = Array.from(calendarBodyNativeElement.querySelectorAll('.kbq-calendar__body-cell'));
        }

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardCalendarBody);
            fixture.detectChanges();

            const calendarBodyDebugElement = fixture.debugElement.query(By.directive(KbqCalendarBody));

            calendarBodyNativeElement = calendarBodyDebugElement.nativeElement;
            testComponent = fixture.componentInstance;

            refreshElementLists();
        });

        it('creates body', () => {
            expect(rowEls.length).toBe(2);
            expect(labelEls.length).toBe(1);
            expect(cellEls.length).toBe(12);
        });

        it('highlights today', () => {
            const todayCell = calendarBodyNativeElement.querySelector('.kbq-calendar__body-today')!;

            expect(todayCell).not.toBeNull();
            expect(todayCell.innerHTML.trim()).toBe('3');
        });

        it('highlights selected', () => {
            const selectedCell = calendarBodyNativeElement.querySelector('.kbq-selected')!;

            expect(selectedCell).not.toBeNull();
            expect(selectedCell.innerHTML.trim()).toBe('4');
        });

        it('places label in first row if space is available', () => {
            testComponent.rows[0] = testComponent.rows[0].slice(3);
            testComponent.rows = testComponent.rows.slice();
            fixture.detectChanges();
            refreshElementLists();

            expect(rowEls.length).toBe(2);
            expect(labelEls.length).toBe(1);
            expect(cellEls.length).toBe(9);
            expect(rowEls[0].firstElementChild!.classList).toContain('kbq-calendar__body-label');
            expect(labelEls[0].getAttribute('colspan')).toBe('5');
        });

        it('cell should be selected on click', () => {
            const todayElement = calendarBodyNativeElement.querySelector<HTMLElement>('.kbq-calendar__body-today')!;

            todayElement.click();
            fixture.detectChanges();

            expect(todayElement.classList).toContain('kbq-selected');
        });

        it('should mark active date', () => {
            expect(cellEls[10].textContent!.trim()).toBe('11');
            expect(cellEls[10].classList).toContain('kbq-calendar__body_active');
        });

        it('should set a class on even dates', () => {
            expect(cellEls[0].textContent!.trim()).toBe('1');
            expect(cellEls[1].textContent!.trim()).toBe('2');
            expect(cellEls[0].classList).not.toContain('even');
            expect(cellEls[1].classList).toContain('even');
        });
    });
});

@Component({
    imports: [
        KbqCalendarBody
    ],
    template: `
        <table
            kbq-calendar-body
            [rows]="rows"
            [todayValue]="todayValue"
            [selectedValue]="selectedValue"
            [labelMinRequiredCells]="labelMinRequiredCells"
            [numCols]="numCols"
            [activeCell]="10"
            (selectedValueChange)="onSelect($event)"
        ></table>
    `
})
class StandardCalendarBody {
    rows = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11, 12]
    ].map((row) => {
        return row.map((cell) => new KbqCalendarCell(cell, `${cell}`, true, cell % 2 === 0 ? 'even' : undefined));
    });
    todayValue = 3;
    selectedValue = 4;
    labelMinRequiredCells = 3;
    numCols = 7;

    onSelect(value: number) {
        this.selectedValue = value;
    }
}

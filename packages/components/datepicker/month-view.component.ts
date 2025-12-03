import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { KbqCalendarBody, KbqCalendarCell, KbqCalendarCellCssClasses } from './calendar-body.component';
import { createMissingDateImplError } from './datepicker-errors';

const DAYS_PER_WEEK = 7;

/**
 * An internal component used to display a single month in the datepicker.
 * @docs-private
 */
@Component({
    selector: 'kbq-month-view',
    imports: [
        KbqCalendarBody
    ],
    templateUrl: 'month-view.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqMonthView'
})
export class KbqMonthView<D> implements AfterContentInit {
    /**
     * The date to display in this month view (everything other than the month and year is ignored).
     */
    @Input()
    get activeDate(): D {
        return this._activeDate;
    }

    set activeDate(value: D) {
        const oldValue = this._activeDate;

        this._activeDate = value;

        if (!this.hasSameMonthAndYear(oldValue, value)) {
            this.init();
        }
    }

    private _activeDate: D;

    /** The currently selected date. */
    @Input()
    get selected(): D | null {
        return this._selected;
    }

    set selected(value: D | null) {
        this._selected = value;
        this.selectedDate = this.getDateInCurrentMonth(this._selected);
    }

    private _selected: D | null;

    /** The minimum selectable date. */
    @Input() minDate: D | null;

    /** The maximum selectable date. */
    @Input() maxDate: D | null;

    /** Function used to filter which dates are selectable. */
    @Input() dateFilter: (date: D) => boolean;

    /** Function that can be used to add custom CSS classes to dates. */
    @Input() dateClass: (date: D) => KbqCalendarCellCssClasses;

    /** Emits when a new date is selected. */
    @Output() readonly selectedChange: EventEmitter<D | null> = new EventEmitter<D | null>();

    /** Emits when any date is selected. */
    @Output() readonly userSelection: EventEmitter<void> = new EventEmitter<void>();

    /** Emits when any date is activated. */
    @Output() readonly activeDateChange: EventEmitter<D> = new EventEmitter<D>();

    /** The body of calendar table */
    @ViewChild(KbqCalendarBody, { static: false }) kbqCalendarBody: KbqCalendarBody;

    /** Grid of calendar cells representing the dates of the month. */
    weeks: KbqCalendarCell[][];

    /** The number of blank cells in the first row before the 1st of the month. */
    firstWeekOffset: number;

    /**
     * The date of the month that the currently selected Date falls on.
     * Null if the currently selected Date is in another month.
     */
    selectedDate: number | null;

    /** The date of the month that today falls on. Null if today is in another month. */
    todayDate: number | null;

    /** The names of the weekdays. */
    weekdays: { long: string; narrow: string }[];

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() public adapter: DateAdapter<D>
    ) {
        if (!this.adapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        const firstDayOfWeek = this.adapter.getFirstDayOfWeek();
        const narrowWeekdays = this.adapter.getDayOfWeekNames('short');
        const longWeekdays = this.adapter.getDayOfWeekNames('long');

        // Rotate the labels for days of the week based on the configured first day of the week.
        const weekdays = longWeekdays.map((long, i) => {
            return { long, narrow: narrowWeekdays[i] };
        });

        this.weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));

        this._activeDate = this.adapter.today();
    }

    ngAfterContentInit() {
        this.init();
    }

    /** Handles when a new date is selected. */
    dateSelected(date: number) {
        if (this.selectedDate !== date) {
            const selectedYear = this.adapter.getYear(this.activeDate);
            const selectedMonth = this.adapter.getMonth(this.activeDate);
            const selectedDate = this.adapter.createDate(selectedYear, selectedMonth, date);

            this.selectedChange.emit(selectedDate);
        }

        this.userSelection.emit();
    }

    /** Initializes this month view. */
    init() {
        this.selectedDate = this.getDateInCurrentMonth(this.selected);
        this.todayDate = this.getDateInCurrentMonth(this.adapter.today());

        const firstOfMonth = this.adapter.createDate(
            this.adapter.getYear(this.activeDate),
            this.adapter.getMonth(this.activeDate)
        );

        this.firstWeekOffset =
            (DAYS_PER_WEEK + this.adapter.getDayOfWeek(firstOfMonth) - this.adapter.getFirstDayOfWeek()) %
            DAYS_PER_WEEK;

        this.createWeekCells();
        this.changeDetectorRef.markForCheck();
    }

    /** Creates KbqCalendarCells for the dates in this month. */
    private createWeekCells() {
        const daysInMonth = this.adapter.getNumDaysInMonth(this.activeDate);
        const dateNames = this.adapter.getDateNames();

        this.weeks = [[]];

        for (let i = 0, cell = this.firstWeekOffset; i < daysInMonth; i++, cell++) {
            if (cell === DAYS_PER_WEEK) {
                this.weeks.push([]);
                cell = 0;
            }

            const date = this.adapter.createDate(
                this.adapter.getYear(this.activeDate),
                this.adapter.getMonth(this.activeDate),
                i + 1
            );
            const enabled = this.shouldEnableDate(date);
            const cellClasses = this.dateClass ? this.dateClass(date) : undefined;

            this.weeks[this.weeks.length - 1].push(new KbqCalendarCell(i + 1, dateNames[i], enabled, cellClasses));
        }
    }

    /** Date filter for the month */
    private shouldEnableDate(date: D): boolean {
        return (
            !!date &&
            (!this.dateFilter || this.dateFilter(date)) &&
            (!this.minDate || this.adapter.compareDate(date, this.minDate) >= 0) &&
            (!this.maxDate || this.adapter.compareDate(date, this.maxDate) <= 0)
        );
    }

    /**
     * Gets the date in this month that the given Date falls on.
     * Returns null if the given Date is in another month.
     */
    private getDateInCurrentMonth(date: D | null): number | null {
        return date && this.hasSameMonthAndYear(date, this.activeDate) ? this.adapter.getDate(date) : null;
    }

    /** Checks whether the 2 dates are non-null and fall within the same month of the same year. */
    private hasSameMonthAndYear(d1: D | null, d2: D | null): boolean {
        return !!(
            d1 &&
            d2 &&
            this.adapter.getMonth(d1) === this.adapter.getMonth(d2) &&
            this.adapter.getYear(d1) === this.adapter.getYear(d2)
        );
    }
}

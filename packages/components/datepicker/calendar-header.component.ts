import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';

const defaultMinYear = 1900;
const defaultMaxYear = 2099;

/** Default header for KbqCalendar */
@Component({
    selector: 'kbq-calendar-header',
    exportAs: 'kbqCalendarHeader',
    templateUrl: 'calendar-header.html',
    styleUrls: ['calendar-header.scss'],
    host: {
        class: 'kbq-calendar-header'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCalendarHeader<D> implements AfterContentInit {
    monthNames: { name: string; value: number }[];
    selectedMonth: number;

    years: { name: number; value: string }[] = [];
    selectedYear: { name: number; value: string };

    @Input()
    get activeDate(): D {
        return this._activeDate;
    }

    set activeDate(value: D) {
        this._activeDate = value;

        this.updateSelectedValues();
    }

    private _activeDate: D;

    @Input()
    get maxDate(): D | null {
        return this._maxDate;
    }

    set maxDate(value: D | null) {
        if (!value) {
            return;
        }

        this._maxDate = value;

        this.updateYearsArray();
    }

    private _maxDate = this.adapter.createDate(defaultMaxYear, 11);

    @Input()
    get minDate(): D | null {
        return this._minDate;
    }

    set minDate(value: D | null) {
        if (!value) {
            return;
        }

        this._minDate = value;

        this.updateYearsArray();
    }

    private _minDate = this.adapter.createDate(defaultMinYear, 1);

    get previousDisabled(): boolean {
        return this.compareDate(this.activeDate, this.minDate!) < 0;
    }

    get nextDisabled(): boolean {
        return this.compareDate(this.activeDate, this.maxDate!) >= 0;
    }

    /** Emits when any date is activated. */
    @Output() readonly activeDateChange = new EventEmitter<D>();
    @Output() readonly monthSelected = new EventEmitter<D>();
    @Output() readonly yearSelected = new EventEmitter<D>();

    constructor(private readonly adapter: DateAdapter<D>) {
        this.monthNames = this.adapter.getMonthNames('long').map((name, i) => ({ name, value: i }));
    }

    ngAfterContentInit(): void {
        this.updateYearsArray();
        this.updateSelectedValues();
    }

    /** Handles when a new month is selected. */
    onMonthSelected(month: number) {
        const year = this.adapter.getYear(this.activeDate);
        const normalizedDate = this.adapter.createDate(year, month);
        const daysInMonth = this.adapter.getNumDaysInMonth(normalizedDate);

        this.activeDate = this.adapter.createDate(
            year,
            month,
            Math.min(this.adapter.getDate(this.activeDate), daysInMonth)
        );

        this.monthSelected.emit(this.activeDate);
        this.activeDateChange.emit(this.activeDate);
    }

    /** Handles when a new year is selected. */
    onYearSelected(year: number) {
        const month = this.adapter.getMonth(this.activeDate);
        const daysInMonth = this.adapter.getNumDaysInMonth(this.adapter.createDate(year, month));

        this.activeDate = this.adapter.createDate(
            year,
            month,
            Math.min(this.adapter.getDate(this.activeDate), daysInMonth)
        );

        this.yearSelected.emit(this.activeDate);
        this.activeDateChange.emit(this.activeDate);
    }

    selectCurrentDate(): void {
        this.activeDate = this.adapter.today();

        this.activeDateChange.emit(this.activeDate);
    }

    /** Handles user clicks on the previous button. */
    selectPreviousMonth(): void {
        this.activeDate = this.adapter.addCalendarMonths(this.activeDate, -1);

        this.activeDateChange.emit(this.activeDate);
    }

    /** Handles user clicks on the next button. */
    selectNextMonth(): void {
        this.activeDate = this.adapter.addCalendarMonths(this.activeDate, 1);

        this.activeDateChange.emit(this.activeDate);
    }

    private compareDate(first: D, second: D): number {
        const normalizedFirst = this.adapter.createDate(this.adapter.getYear(first), this.adapter.getMonth(first));

        const normalizedSecond = this.adapter.createDate(this.adapter.getYear(second), this.adapter.getMonth(second));

        return this.adapter.compareDate(normalizedFirst, normalizedSecond);
    }

    private updateSelectedValues() {
        this.selectedMonth = this.monthNames[this.adapter.getMonth(this.activeDate)].value;

        const year = this.adapter.getYear(this.activeDate);
        this.selectedYear = this.years.find(({ name }) => name === year) || {
            name: year,
            value: this.adapter.getYearName(this.activeDate)
        };
    }

    private updateYearsArray() {
        const minYear = this.adapter.getYear(this.minDate!);
        const maxYear = this.adapter.getYear(this.maxDate!);

        this.years = [];

        for (let key: number = minYear; key <= maxYear; key++) {
            this.years.push({ name: key, value: this.adapter.getYearName(this.adapter.createDate(key)) });
        }
    }
}

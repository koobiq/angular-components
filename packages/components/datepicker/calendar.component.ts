import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { Subject, Subscription } from 'rxjs';

import { KbqCalendarCellCssClasses } from './calendar-body.component';
import { createMissingDateImplError } from './datepicker-errors';
import { KbqDatepickerIntl } from './datepicker-intl';
import { KbqMonthView } from './month-view.component';


/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
@Component({
    selector: 'kbq-calendar',
    exportAs: 'kbqCalendar',
    templateUrl: 'calendar.html',
    styleUrls: ['calendar.scss'],
    host: {
        class: 'kbq-calendar'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCalendar<D> implements AfterContentInit, OnDestroy, OnChanges {

    /** A date representing the period (month or year) to start the calendar in. */
    @Input()
    get startAt(): D | null {
        return this._startAt;
    }

    set startAt(value: D | null) {
        const deserializedValue = this.getValidDateOrNull(this.adapter.deserialize(value));

        this._startAt = deserializedValue !== null ?
            this.adapter.clampDate(deserializedValue, this.minDate, this.maxDate) : null;
    }

    private _startAt: D | null;

    /** The currently selected date. */
    @Input()
    get selected(): D | null {
        return this._selected;
    }

    set selected(value: D | null) {
        this._selected = this.adapter.deserialize(value);
    }

    private _selected: D | null;

    /** The minimum selectable date. */
    @Input()
    get minDate(): D | null {
        return this._minDate;
    }

    set minDate(value: D | null) {
        this._minDate = this.adapter.deserialize(value);

        this.startAt = this._startAt;
    }

    private _minDate: D | null;

    /** The maximum selectable date. */
    @Input()
    get maxDate(): D | null {
        return this._maxDate;
    }

    set maxDate(value: D | null) {
        this._maxDate = this.adapter.deserialize(value);

        this.startAt = this._startAt;
    }

    private _maxDate: D | null;

    /**
     * The current active date. This determines which time period is shown and which date is
     * highlighted and used as the anchor on  when using keyboard navigation.
     */
    get activeDate(): D {
        return this._activeDate;
    }

    set activeDate(value: D | null) {
        this._activeDate = this.adapter.clampDate(value || this.getActiveDateDefault(), this.minDate, this.maxDate);

        this.stateChanges.next();
    }

    private _activeDate: D;

    /** Function used to filter which dates are selectable. */
    @Input() dateFilter: (date: D) => boolean;

    /** Function that can be used to add custom CSS classes to dates. */
    @Input() dateClass: (date: D) => KbqCalendarCellCssClasses;

    /** Emits when the currently selected date changes. */
    @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits the year chosen in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits the month chosen in year view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

    /** Emits when any date is selected. */
    @Output() readonly userSelection: EventEmitter<void> = new EventEmitter<void>();

    /** Reference to the current month view component. */
    @ViewChild(KbqMonthView, { static: false }) monthView: KbqMonthView<D>;

    /**
     * Emits whenever there is a state change that the header may need to respond to.
     */
    stateChanges = new Subject<void>();

    private readonly intlChanges: Subscription;

    constructor(
        intl: KbqDatepickerIntl,
        @Optional() private readonly adapter: DateAdapter<D>,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        if (!this.adapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        this.intlChanges = intl.changes.subscribe(() => {
            changeDetectorRef.markForCheck();
            this.stateChanges.next();
        });
    }

    ngAfterContentInit() {
        this.activeDate = this.getActiveDateDefault();
    }

    ngOnDestroy() {
        this.intlChanges.unsubscribe();
        this.stateChanges.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        const change = changes.minDate || changes.maxDate || changes.dateFilter;

        if (change && !change.firstChange) {
            if (this.monthView) {
                // We need to `detectChanges` manually here, because the `minDate`, `maxDate` etc. are
                // passed down to the view via data bindings which won't be up-to-date when we call `init`.
                this.changeDetectorRef.detectChanges();
                this.monthView.init();
            }
        }

        this.stateChanges.next();
    }

    /** Updates today's date after an update of the active date */
    updateTodaysDate() {
        this.monthView.ngAfterContentInit();
    }

    /** Handles date selection in the month view. */
    dateSelected(date: D): void {
        if (!this.adapter.sameDate(date, this.selected)) {
            this.selectedChange.emit(date);
        }
    }

    userSelected(): void {
        this.userSelection.emit();
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    // todo выглядит как костыль от которого нужно избавиться
    private getValidDateOrNull(obj: any): D | null {
        return (this.adapter.isDateInstance(obj) && this.adapter.isValid(obj)) ? obj : null;
    }

    private getActiveDateDefault(): D {
        return this.startAt || this.adapter.today();
    }
}


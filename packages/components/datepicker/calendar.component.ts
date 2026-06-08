import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewEncapsulation,
    inject,
    input,
    output,
    viewChild
} from '@angular/core';
import { DateAdapter } from '@koobiq/components/core';
import { Subject, Subscription } from 'rxjs';
import { KbqCalendarCellCssClasses } from './calendar-body.component';
import { KbqCalendarHeader } from './calendar-header.component';
import { createMissingDateImplError } from './datepicker-errors';
import { KbqDatepickerIntl } from './datepicker-intl';
import { KbqMonthView } from './month-view.component';

/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
@Component({
    selector: 'kbq-calendar',
    imports: [
        KbqCalendarHeader,
        KbqMonthView
    ],
    templateUrl: 'calendar.html',
    styleUrls: ['calendar.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-calendar'
    },
    exportAs: 'kbqCalendar'
})
export class KbqCalendar<D> implements AfterContentInit, OnDestroy, OnChanges {
    private readonly adapter = inject<DateAdapter<D>>(DateAdapter, { optional: true })!;
    private changeDetectorRef = inject(ChangeDetectorRef);

    /** A date representing the period (month or year) to start the calendar in. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get startAt(): D | null {
        return this._startAt;
    }

    set startAt(value: D | null) {
        const deserializedValue = this.getValidDateOrNull(this.adapter.deserialize(value));

        this._startAt =
            deserializedValue !== null ? this.adapter.clampDate(deserializedValue, this.minDate, this.maxDate) : null;
    }

    private _startAt: D | null;

    /** The currently selected date. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get selected(): D | null {
        return this._selected;
    }

    set selected(value: D | null) {
        this._selected = this.adapter.deserialize(value);
    }

    private _selected: D | null;

    /** The minimum selectable date. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    readonly dateFilter = input<(date: D) => boolean>(undefined!);

    /** Function that can be used to add custom CSS classes to dates. */
    readonly dateClass = input<(date: D) => KbqCalendarCellCssClasses>(undefined!);

    /** Emits when the currently selected date changes. */
    readonly selectedChange = output<D>();

    /**
     * Emits the year chosen in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    readonly yearSelected = output<D>();

    /**
     * Emits the month chosen in year view.
     * This doesn't imply a change on the selected date.
     */
    readonly monthSelected = output<D>();

    /** Emits when any date is selected. */
    readonly userSelection = output<void>();

    /** Reference to the current month view component. */
    readonly monthView = viewChild.required(KbqMonthView);

    /**
     * Emits whenever there is a state change that the header may need to respond to.
     */
    stateChanges = new Subject<void>();

    /** The input element this datepicker is associated with. */
    datepickerInput;

    private readonly intlChanges: Subscription;

    /** Subscription to value changes in the associated input element. */
    private inputSubscription = Subscription.EMPTY;

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        const intl = inject(KbqDatepickerIntl);
        const changeDetectorRef = this.changeDetectorRef;

        if (!this.adapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        this.intlChanges = intl.changes.subscribe(() => {
            changeDetectorRef.markForCheck();
            this.stateChanges.next();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        const change = changes.minDate || changes.maxDate || changes.dateFilter;

        if (change && !change.firstChange) {
            const monthView = this.monthView();

            if (monthView) {
                // We need to `detectChanges` manually here, because the `minDate`, `maxDate` etc. are
                // passed down to the view via data bindings which won't be up-to-date when we call `init`.
                this.changeDetectorRef.detectChanges();
                monthView.init();
            }
        }

        this.stateChanges.next();
    }

    ngAfterContentInit() {
        this.activeDate = this.getActiveDateDefault();
    }

    ngOnDestroy() {
        this.intlChanges.unsubscribe();
        this.inputSubscription.unsubscribe();
        this.stateChanges.complete();
    }

    /**
     * Register an input with this calendar.
     * @param input The calendar input to register with this calendar.
     */
    registerInput(input): void {
        if (this.datepickerInput) {
            throw Error('A KbqDatepicker can only be associated with a single input.');
        }

        this.datepickerInput = input;
        this.inputSubscription = this.datepickerInput.valueChange.subscribe((value: D | null) => {
            this.selected = value;

            this.monthView()?.init();
            this.activeDate = value as D;
        });
    }

    /** Updates today's date after an update of the active date */
    updateTodaysDate() {
        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this.monthView().ngAfterContentInit();
    }

    /** Handles date selection in the month view. */
    dateSelected(date: D): void {
        if (!this.adapter.sameDate(date, this.selected)) {
            this.selectedChange.emit(date);
        }
    }

    userSelected(): void {
        // TODO: The 'emit' function requires a mandatory void argument
        this.userSelection.emit();
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    // todo выглядит как костыль от которого нужно избавиться
    private getValidDateOrNull(obj: any): D | null {
        return this.adapter.isDateInstance(obj) && this.adapter.isValid(obj) ? obj : null;
    }

    private getActiveDateDefault(): D {
        return this.startAt || this.adapter.today();
    }
}

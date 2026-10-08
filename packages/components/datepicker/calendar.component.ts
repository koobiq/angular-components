import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewEncapsulation,
    inject,
    input,
    output,
    viewChild
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { KbqCalendarCellCssClasses } from './calendar-body.component';
import { KbqCalendarHeader } from './calendar-header.component';
import { injectRequiredDateAdapter } from './datepicker-errors';
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
    private readonly adapter = injectRequiredDateAdapter<D>();
    private changeDetectorRef = inject(ChangeDetectorRef);

    /** A date representing the period (month or year) to start the calendar in. */
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
    get selected(): D | null {
        return this._selected;
    }

    set selected(value: D | null) {
        this._selected = this.adapter.deserialize(value);
    }

    private _selected: D | null;

    /** The minimum selectable date. */
    get minDate(): D | null {
        return this._minDate;
    }

    set minDate(value: D | null) {
        this._minDate = this.adapter.deserialize(value);

        this.startAt = this._startAt;
    }

    private _minDate: D | null;

    /** The maximum selectable date. */
    get maxDate(): D | null {
        return this._maxDate;
    }

    set maxDate(value: D | null) {
        this._maxDate = this.adapter.deserialize(value);

        this.startAt = this._startAt;
    }

    private _maxDate: D | null;

    /** @docs-private */
    readonly startAtInput = input<D | null | undefined>(undefined, { alias: 'startAt' });

    /** @docs-private */
    readonly selectedInput = input<D | null | undefined>(undefined, { alias: 'selected' });

    /** @docs-private */
    readonly minDateInput = input<D | null | undefined>(undefined, { alias: 'minDate' });

    /** @docs-private */
    readonly maxDateInput = input<D | null | undefined>(undefined, { alias: 'maxDate' });

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

    constructor() {
        // No view of the calendar renders the labels of the intl.
        this.intlChanges = inject(KbqDatepickerIntl).changes.subscribe(() => this.stateChanges.next());
    }

    ngOnChanges(changes: SimpleChanges) {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote. A
        // bound `undefined` is handed over too, as an unset date: a bound that becomes unset lifts its restriction.
        if (changes['minDateInput']) this.minDate = this.minDateInput() ?? null;

        if (changes['maxDateInput']) this.maxDate = this.maxDateInput() ?? null;

        if (changes['selectedInput']) this.selected = this.selectedInput() ?? null;

        // After the bounds, which `startAt` is clamped to.
        if (changes['startAtInput']) this.startAt = this.startAtInput() ?? null;

        const change = changes['minDateInput'] || changes['maxDateInput'] || changes['dateFilter'];

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

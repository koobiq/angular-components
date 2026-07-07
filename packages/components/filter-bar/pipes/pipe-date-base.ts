import { AfterViewInit, Directive, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { DateAdapter, DateFormatter, ENTER, KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqListSelection } from '@koobiq/components/list';
import { KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqDateTimeValue } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';

/**
 * Shared implementation for the `date` and `datetime` pipes. The two pipes differ only in how a range
 * is formatted and in their default start/end values, exposed here as the {@link formatRange},
 * {@link getDefaultStart} and {@link getDefaultEnd} hooks. Everything else — the period list / custom
 * period flow, calendar handling and form group — is common.
 */
@Directive()
export abstract class KbqPipeDateBaseComponent<D> extends KbqBasePipe<KbqDateTimeValue> implements AfterViewInit {
    // The concrete date type `D` is unconstrained, so the adapter/formatter are used loosely here,
    // matching the behaviour the `date`/`datetime` pipes had before this base class was extracted.
    protected readonly adapter: DateAdapter<any> = inject(DateAdapter);
    protected readonly formatter: DateFormatter<any> = inject(DateFormatter);

    /** @docs-private */
    protected readonly placements = PopUpPlacements;
    /** @docs-private */
    protected readonly styles = KbqButtonStyles;
    /** @docs-private */
    protected readonly colors = KbqComponentColors;

    /** Whether the current state is list of periods. When false will displayed control for set custom period */
    protected isListMode = true;

    /** @docs-private */
    protected formGroup: FormGroup;

    /** @docs-private */
    protected showStartCalendar: boolean = false;
    /** @docs-private */
    protected showEndCalendar: boolean = false;

    /** @docs-private */
    readonly popover = viewChild.required<KbqPopoverTrigger>('popover');
    /** @docs-private */
    // Optional: the list only exists while the popover is open in list mode, and it is read
    // in deferred callbacks that may fire after the popover has already closed.
    readonly listSelection = viewChild('listSelection', { read: KbqListSelection });
    /** @docs-private */
    readonly returnButton = viewChild.required('returnButton', { read: KbqButton });

    /** formatted value for period */
    get formattedValue(): string {
        if (this.start && this.end) {
            return this.formatRange(this.start, this.end);
        }

        return this.data.value?.name ?? '';
    }

    /** Whether the current pipe is disabled. */
    get disabled(): boolean {
        return (
            !this.adapter.isDateInstance(this.formGroup.controls.start.value) ||
            !this.adapter.isDateInstance(this.formGroup.controls.end.value) ||
            this.formGroup.controls.start.invalid
        );
    }

    /** parsed start */
    get start(): D {
        return this.adapter.parse(this.data.value?.start, '');
    }

    /** default object for start */
    get defaultStart(): D {
        if (this.data.value?.start) {
            return this.adapter.today().plus(this.data.value?.start);
        }

        return this.getDefaultStart();
    }

    /** parsed end */
    get end(): D {
        return this.adapter.parse(this.data.value?.end, '');
    }

    /** default object for end */
    get defaultEnd(): D {
        if (this.data.value?.start) {
            return this.adapter.today();
        }

        return this.getDefaultEnd();
    }

    /** Whether the current pipe is empty. */
    override get isEmpty(): boolean {
        if (this.data.value === null) return true;

        if (this.data.value?.name) return false;

        return !this.adapter.isDateInstance(this.start) || !this.adapter.isDateInstance(this.end);
    }

    override ngAfterViewInit() {
        super.ngAfterViewInit();

        this.popover()
            .visibleChange.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((visible) => {
                if (visible) {
                    // Move keyboard focus onto the period list so Enter selects a preset
                    // instead of the focus trap landing on the "custom period" row.
                    if (this.isListMode) {
                        setTimeout(() => this.listSelection()?.focus());
                    }
                } else {
                    this.filterBar?.onClosePipe.emit(this.data);
                }
            });
    }

    /** keydown handler
     * @docs-private */
    onKeydown($event: KeyboardEvent) {
        if (($event.ctrlKey || $event.metaKey) && $event.keyCode === ENTER) {
            this.onApplyPeriod();
        }

        if ($event.keyCode === ENTER) {
            $event.preventDefault();
        }
    }

    onApplyPeriod() {
        this.data.value = {
            start: this.formGroup.controls.start.value.toISO(),
            end: this.formGroup.controls.end.value.toISO()
        };
        this.stateChanges.next();

        this.filterBar?.onChangePipe.emit(this.data);

        this.popover().hide();

        setTimeout(() => this.restoreTriggerFocus());
    }

    onSelect(item: KbqDateTimeValue) {
        this.data.value = item;
        this.stateChanges.next();

        this.filterBar?.onChangePipe.emit(this.data);

        this.popover().hide();

        setTimeout(() => this.restoreTriggerFocus());
    }

    showPeriod() {
        this.isListMode = false;
        this.showStartCalendar = false;
        this.showEndCalendar = false;

        this.initFormGroup();

        setTimeout(() => {
            this.popover().updatePosition(true);
            this.returnButton().focus();
        });
    }

    showList() {
        this.isListMode = true;

        setTimeout(() => this.listSelection()?.focus());
        this.popover().updatePosition(true);
    }

    /** opens popover */
    override open() {
        this.popover().show();
    }

    onSelectStartDate(value: D) {
        this.formGroup.controls.start.setValue(value);
    }

    onSelectEndDate(value: D) {
        this.formGroup.controls.end.setValue(value);
    }

    onFocusStartInput() {
        this.showStartCalendar = true;
        this.showEndCalendar = false;

        this.popover().updatePosition(true);
    }

    onFocusEndInput() {
        this.showEndCalendar = true;
        this.showStartCalendar = false;
    }

    hideCalendars() {
        this.showStartCalendar = false;
        this.showEndCalendar = false;
    }

    /** Formats the selected range for display. */
    protected abstract formatRange(start: D, end: D): string;

    /** Default start value used when the pipe has no stored `start`. */
    protected abstract getDefaultStart(): D;

    /** Default end value used when the pipe has no stored `start`. */
    protected abstract getDefaultEnd(): D;

    private initFormGroup() {
        this.formGroup = new FormGroup({
            start: new FormControl(this.start || this.defaultStart),
            end: new FormControl(this.end || this.defaultEnd)
        });
    }
}

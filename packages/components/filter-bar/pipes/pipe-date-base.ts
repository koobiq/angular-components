import { AfterViewInit, Directive, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { DateAdapter, DateFormatter, ENTER, KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqListSelection } from '@koobiq/components/list';
import { KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqDateTimeValue, KbqPipeTemplate } from '../filter-bar.types';
import { getId, KbqBasePipe } from './base-pipe';

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

    // Loosely typed (`any`) so the values bind cleanly to the generic date directives: on a native
    // `<input>`, `[min]`/`[max]` resolve to the DOM property (`string | number`), which a concrete `D`
    // could not satisfy inside this generic component (matching the existing `any` date handling here).
    // The runtime values are adapter-deserialized dates.
    /**
     * Lower bound instant applied to the calendars, date inputs and (datetime) timepickers.
     * @docs-private
     */
    protected min: any;
    /**
     * Upper bound instant applied to the calendars, date inputs and (datetime) timepickers.
     * @docs-private
     */
    protected max: any;

    /** Minimum length of the custom period (`end − start`), resolved from the template as a duration-like object. */
    private minInterval?: unknown;
    /** Maximum length of the custom period (`end − start`), resolved from the template as a duration-like object. */
    private maxInterval?: unknown;

    /** Canonical duration units (largest-first) used to render an interval limit faithfully to its config. */
    private static readonly INTERVAL_UNITS = [
        'years',
        'quarters',
        'months',
        'weeks',
        'days',
        'hours',
        'minutes',
        'seconds'
    ] as const;

    /** @docs-private */
    readonly popover = viewChild.required<KbqPopoverTrigger>('popover');
    /** @docs-private */
    // Optional: the list only exists while the popover is open in list mode, and it is read
    // in deferred callbacks that may fire after the popover has already closed.
    readonly listSelection = viewChild('listSelection', { read: KbqListSelection });
    /** @docs-private */
    readonly returnButton = viewChild.required('returnButton', { read: KbqButton });

    /** Resolves the `minDateTime` / `maxDateTime` bounds from the pipe template matching this pipe. */
    private updateDateBounds = (templates: KbqPipeTemplate[] | null) => {
        const template = templates?.find((item) => getId(item) === getId(this.data) && item.type === this.data.type);

        // Sticky, like the sibling KbqBasePipe.updateTemplates: an emission where this pipe's own
        // template is momentarily absent must not blank out previously resolved bounds.
        if (!template) return;

        const min = template.minDateTime != null ? this.toValidDate(template.minDateTime) : undefined;
        const max = template.maxDateTime != null ? this.toValidDate(template.maxDateTime) : undefined;

        // The date pipe has no clock; pin bounds to day edges so a time in the bound can't strand the value
        // invalid. The datetime pipe keeps the full instant (single absolute window). `.startOf`/`.endOf`
        // mirror the DateTime API the concrete subclasses already use (`adapter.today().startOf('day')`).
        this.min = this.usesTime() ? min : min?.startOf('day');
        this.max = this.usesTime() ? max : max?.endOf('day');

        this.minInterval = this.toValidInterval(template.minInterval);
        this.maxInterval = this.toValidInterval(template.maxInterval);
        // Re-validate an already open editor if the template (hence the interval limits) changes.
        this.formGroup?.updateValueAndValidity();

        this.changeDetectorRef.markForCheck();
    };

    /** Deserializes a `minDateTime` / `maxDateTime` template value, treating unparseable input as "no bound". */
    private toValidDate(value: unknown): any {
        const date = this.adapter.deserialize(value);

        return date != null && this.adapter.isValid(date) ? date : undefined;
    }

    /**
     * Validates a `minInterval` / `maxInterval` template value, treating anything that isn't a genuine
     * duration-like object — or that resolves to an invalid or sub-second span — as "no constraint"
     * instead of letting it crash `validateInterval`/`formatInterval` downstream (both call `.plus()` on
     * it directly). A bare number is rejected too: Luxon would silently read it as milliseconds, which
     * would otherwise disable the constraint without any error (e.g. a `{ days: 5 }` typo'd as `5`).
     */
    private toValidInterval(value: unknown): any {
        if (value == null || typeof value !== 'object' || Array.isArray(value)) return undefined;

        try {
            const today = this.adapter.today();
            const probe = today.plus(value);

            if (!this.adapter.isValid(probe)) return undefined;

            // DurationUnit has no sub-second granularity, so a shorter interval can't be rendered by
            // `durationLong` and would misleadingly show up as "0 seconds" — treat it as unset instead.
            const { seconds = 0 } = this.adapter.durationObjectFromDates(today, probe, ['seconds'], true);

            return Math.abs(seconds) >= 1 ? value : undefined;
        } catch {
            return undefined;
        }
    }

    /** Clamps `value` into the configured `[min, max]` bounds using full-instant comparison. */
    private clampToBounds(value: D): D {
        if (this.min && this.adapter.compareDateTime(value, this.min) < 0) return this.min;
        if (this.max && this.adapter.compareDateTime(value, this.max) > 0) return this.max;

        return value;
    }

    /**
     * Cross-field validator flagging the custom period when its length (`end − start`) is outside the
     * configured `[minInterval, maxInterval]`. Intervals are applied via `DateTime.plus`, so calendar units
     * (months/years) are respected; unset intervals impose no constraint.
     */
    private validateInterval: ValidatorFn = (group) => {
        const start = (group as FormGroup).controls.start?.value;
        const end = (group as FormGroup).controls.end?.value;

        if (!this.adapter.isDateInstance(start) || !this.adapter.isDateInstance(end)) return null;

        if (this.minInterval && this.adapter.compareDateTime(end, start.plus(this.minInterval)) < 0) {
            return { kbqDateIntervalMin: true };
        }

        if (this.maxInterval && this.adapter.compareDateTime(end, start.plus(this.maxInterval)) > 0) {
            return { kbqDateIntervalMax: true };
        }

        return null;
    };

    /** Formats a duration-like interval as a locale-aware human string via the formatter, e.g. "7 дней". */
    private formatInterval(interval: unknown): string {
        const start = this.adapter.today();
        const units = KbqPipeDateBaseComponent.INTERVAL_UNITS.filter(
            (unit) => (interval as any)?.[unit] != null || (interval as any)?.[unit.slice(0, -1)] != null
        );

        return this.formatter.durationLong(start, start.plus(interval), units);
    }

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
            this.formGroup.invalid
        );
    }

    /** parsed start */
    get start(): D {
        return this.adapter.parse(this.data.value?.start, '');
    }

    /** default object for start */
    get defaultStart(): D {
        return this.computeDefaultRange().start;
    }

    /** parsed end */
    get end(): D {
        return this.adapter.parse(this.data.value?.end, '');
    }

    /** default object for end */
    get defaultEnd(): D {
        return this.computeDefaultRange().end;
    }

    /**
     * Computes the default `start`/`end` pair used when the pipe has no stored value, clamped into
     * `[min, max]` and, unlike a plain clamp, also reconciled against `[minInterval, maxInterval]`: `end`
     * is extended or shrunk to fit, falling back to pulling `start` back when `[min, max]` doesn't leave
     * enough room past `start` to satisfy `minInterval`. If `[min, max]` is itself narrower than
     * `minInterval`, the result may still violate it — that's a contradictory host configuration (the
     * same class of issue as `min` configured later than `max`), not something to further engineer around.
     */
    private computeDefaultRange(): { start: D; end: D } {
        let start: any = this.clampToBounds(
            this.data.value?.start ? this.adapter.today().plus(this.data.value.start) : this.getDefaultStart()
        );
        let end: any = this.clampToBounds(this.data.value?.start ? this.adapter.today() : this.getDefaultEnd());

        if (this.minInterval && this.adapter.compareDateTime(end, start.plus(this.minInterval)) < 0) {
            end = this.clampToBounds(start.plus(this.minInterval));

            if (this.adapter.compareDateTime(end, start.plus(this.minInterval)) < 0) {
                start = this.clampToBounds(end.minus(this.minInterval));
            }
        }

        if (this.maxInterval && this.adapter.compareDateTime(end, start.plus(this.maxInterval)) > 0) {
            end = this.clampToBounds(start.plus(this.maxInterval));
        }

        return { start, end };
    }

    /**
     * Upper bound for the START date input: the earlier of the END value and the configured `max`.
     * @docs-private
     */
    get startMax(): any {
        const end = this.formGroup.controls.end.value;

        if (this.max && this.adapter.isDateInstance(end)) {
            return this.adapter.compareDateTime(this.max, end) <= 0 ? this.max : end;
        }

        return this.max ?? end;
    }

    /**
     * Localized "period too short" hint with the `minInterval` limit interpolated and locale-formatted.
     * @docs-private
     */
    get minIntervalErrorHint(): string {
        return this.localeData.datePipe.customPeriodMinIntervalErrorHint.replace(
            '{{ value }}',
            this.formatInterval(this.minInterval)
        );
    }

    /**
     * Localized "period too long" hint with the `maxInterval` limit interpolated and locale-formatted.
     * @docs-private
     */
    get maxIntervalErrorHint(): string {
        return this.localeData.datePipe.customPeriodMaxIntervalErrorHint.replace(
            '{{ value }}',
            this.formatInterval(this.maxInterval)
        );
    }

    /** Whether the current pipe is empty. */
    override get isEmpty(): boolean {
        if (this.data.value === null) return true;

        if (this.data.value?.name) return false;

        return !this.adapter.isDateInstance(this.start) || !this.adapter.isDateInstance(this.end);
    }

    override ngAfterViewInit() {
        // Own subscription — NOT an extension of KbqBasePipe.updateTemplates: bound resolution needs
        // `usesTime()`, which subclasses implement as an override of an abstract method, so it must be
        // safe to call regardless of construction order. Subscribing here (rather than in the
        // constructor) guarantees both this base class's and the leaf subclass's fields are fully
        // initialized first, since ngAfterViewInit only runs once the whole component tree is built.
        this.filterBar?.internalTemplatesChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(this.updateDateBounds);

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
            if (this.destroyed) return;

            this.popover().updatePosition(true);
            // Focus via FocusMonitor (keyboard origin) so the focus ring is preserved; a native
            // `.focus()` bypasses FocusMonitor and drops the `.cdk-keyboard-focused` ring.
            this.returnButton().focusViaKeyboard();
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

    /**
     * Whether this pipe edits the time part (`datetime`) or only the date (`date`). Gates whether the
     * `minDateTime` / `maxDateTime` bounds keep their time or are pinned to day edges.
     */
    protected abstract usesTime(): boolean;

    /** Formats the selected range for display. */
    protected abstract formatRange(start: D, end: D): string;

    /** Default start value used when the pipe has no stored `start`. */
    protected abstract getDefaultStart(): D;

    /** Default end value used when the pipe has no stored `start`. */
    protected abstract getDefaultEnd(): D;

    private initFormGroup() {
        // Read the default pair from a single `computeDefaultRange()` call (not the independent
        // `defaultStart`/`defaultEnd` getters) so `start` and `end` are reconciled against each other
        // using the same `today()` snapshot, rather than two separately-computed instants.
        const defaults = this.start && this.end ? null : this.computeDefaultRange();

        this.formGroup = new FormGroup(
            {
                start: new FormControl(this.start || defaults!.start),
                end: new FormControl(this.end || defaults!.end)
            },
            { validators: this.validateInterval }
        );
    }
}

import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    OnInit,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    ValidationErrors,
    Validator,
    ValidatorFn
} from '@angular/forms';
import { ErrorStateMatcher, KbqTimeRangeLocaleConfiguration } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqError, KbqFieldset, KbqFieldsetItem, KbqHint } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { KbqTimeRangeEditorBridge } from './time-range-editor-bridge';
import { KbqTimeRangeService } from './time-range.service';
import {
    KbqRangeValue,
    KbqTimeRangeOptionContext,
    KbqTimeRangeRange,
    KbqTimeRangeType,
    KbqTimeRangeTypeContext
} from './types';

interface FormValue<T> {
    type: FormControl<KbqTimeRangeType>;
    fromTime: FormControl<T>;
    fromDate: FormControl<T>;
    toTime: FormControl<T>;
    toDate: FormControl<T>;
}

/** One end of the range. Its date and its time are checked together, and revealed together. */
type RangeBorder = 'from' | 'to';

type BorderHalf = 'Date' | 'Time';

const borders: RangeBorder[] = ['from', 'to'];
const halves: BorderHalf[] = ['Time', 'Date'];

/**
 * Errors are reported only once the user has left the border they belong to, and go quiet again as soon
 * as typing resumes. The validators themselves always run, so that `validate()` stays honest about
 * whether the range could be saved - only the painting waits.
 */
class RangeErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null): boolean {
        return !!control?.invalid && !!control.touched;
    }
}

/** @docs-private */
@Component({
    selector: 'kbq-time-range-editor',
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        KbqError,
        KbqFieldset,
        KbqFieldsetItem,
        KbqHint,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqRadioModule,
        KbqIcon
    ],
    templateUrl: './time-range-editor.html',
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: KbqTimeRangeEditor
        },
        {
            multi: true,
            provide: NG_VALIDATORS,
            useExisting: KbqTimeRangeEditor
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-time-range__editor'
    }
})
export class KbqTimeRangeEditor<T> implements ControlValueAccessor, Validator, OnInit {
    private readonly timeRangeService = inject<KbqTimeRangeService<T>>(KbqTimeRangeService);
    private readonly editorBridge = inject(KbqTimeRangeEditorBridge, { optional: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly document = inject(DOCUMENT);

    /** The maximum selectable date. */
    readonly maxDate = input<T | null>(null);
    /** The minimum selectable date. */
    readonly minDate = input<T | null>(null);
    /** Preset of selectable ranges */
    readonly availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.providedDefaultTimeRangeTypes);
    /** Provided value of selected range */
    readonly rangeValue = input<Required<KbqRangeValue<T>>>(this.timeRangeService.getDefaultRangeValue());
    readonly showRangeAsDefault = input.required<boolean>();
    readonly localeConfiguration = input.required<KbqTimeRangeLocaleConfiguration>();
    /** Customizable option output */
    readonly optionTemplate = input<TemplateRef<KbqTimeRangeOptionContext>>();

    /** @docs-private */
    protected readonly isRangeVisible = computed(
        () => this.showRangeAsDefault() || this.availableTimeRangeTypes().includes('range')
    );

    /** @docs-private */
    protected readonly timeRangeTypesWithoutRange = computed<KbqTimeRangeOptionContext[]>(() => {
        const localeConfig = this.localeConfiguration();

        return this.availableTimeRangeTypes()
            .filter((type) => type !== 'range')
            .map((type) => ({
                type,
                translationType: this.timeRangeService.getTimeRangeUnitByType(type),
                units: this.timeRangeService.getTimeRangeTypeUnits(type),
                formattedValue: this.getFormattedOption(type, localeConfig)
            }));
    });

    /**
     * Caption under the "range" option, spelling out the bounds the border has to stay within. Read from
     * the service rather than from this component's own inputs, so that it can never disagree with what
     * the border validators go on to enforce.
     * @docs-private
     */
    protected readonly boundsHint = computed(() => {
        const { dateFormatter } = this.timeRangeService;
        const minDate = this.timeRangeService.minDate();
        const maxDate = this.timeRangeService.maxDate();

        if (!minDate && !maxDate) return '';

        // The time half earns a place in the caption only once a bound actually carries one.
        return [minDate, maxDate].some((bound) => bound && this.carriesTime(bound))
            ? dateFormatter.rangeShortDateTime(minDate, maxDate ?? undefined)
            : dateFormatter.rangeShortDate(minDate, maxDate ?? undefined);
    });

    /**
     * What is said when the range as a whole has left the bounds. Said once, below the last of the two
     * ends, and only when both of them are at fault: a single end out of bounds is already pointed at by
     * the fields painted around it. Silent until the ends have been left, keeping step with that
     * painting.
     * @docs-private
     */
    protected outOfBoundsMessage(): string {
        const bothOutOfBounds = borders.every((border) =>
            halves.some((half) => {
                const control = this.form.controls[`${border}${half}`];

                return control.touched && !!control.errors?.kbqTimeRangeOutOfBounds;
            })
        );

        if (!bothOutOfBounds) return '';

        return this.localeConfiguration().editor.outOfBoundsError.replace('{{ value }}', this.boundsHint());
    }

    /** @docs-private */
    protected readonly form: FormGroup<FormValue<T>>;
    /** @docs-private */
    protected readonly timepickerFormat = TimeFormats.HHmmss;
    /** @docs-private */
    protected readonly rangeStateMatcher = new RangeErrorStateMatcher();

    /** Raised by the first "apply", after which a border left wholly empty counts as an error too. */
    private applyAttempted = false;

    constructor() {
        const defaultRangeValue = this.rangeValue();

        this.form = new FormGroup({
            type: new FormControl<KbqTimeRangeType>(this.timeRangeService.DEFAULT_RANGE_TYPE, {
                nonNullable: true
            }),
            fromTime: new FormControl<T>(defaultRangeValue.fromTime, { nonNullable: true }),
            fromDate: new FormControl<T>(defaultRangeValue.fromDate, { nonNullable: true }),
            toTime: new FormControl<T>(defaultRangeValue.toTime, { nonNullable: true }),
            toDate: new FormControl<T>(defaultRangeValue.toDate, { nonNullable: true })
        });

        borders.forEach((border) =>
            halves.forEach((half) =>
                this.form.controls[`${border}${half}`].addValidators(this.borderValidator(border, half))
            )
        );

        if (this.editorBridge) this.editorBridge.revealErrors = () => this.revealErrors();

        this.form.valueChanges
            .pipe(
                map((formValue) => formValue.type),
                distinctUntilChanged(),
                takeUntilDestroyed()
            )
            .subscribe((type) => {
                const isDisabled = type !== 'range';

                borders.forEach((border) =>
                    halves.forEach((half) => {
                        const control = this.form.controls[`${border}${half}`];

                        if (isDisabled) {
                            control.disable({ emitEvent: false });
                        } else {
                            control.enable({ emitEvent: false });
                        }
                    })
                );
            });

        this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((formValue) => {
            // Each half is checked against its sibling, so editing one has to re-run the other. Silent,
            // or this would re-enter through `valueChanges`.
            borders.forEach((border) =>
                halves.forEach((half) =>
                    this.form.controls[`${border}${half}`].updateValueAndValidity({ emitEvent: false })
                )
            );

            const range = this.mapTimeRange(formValue);

            if (range) this.onChange(range);
        });
    }

    ngOnInit(): void {
        const defaultRangeValue = this.rangeValue();
        const availableTimeRangeTypes = this.availableTimeRangeTypes();

        this.form.setValue({
            type: (availableTimeRangeTypes.length && availableTimeRangeTypes[0]) || 'range',
            fromTime: defaultRangeValue.fromTime,
            fromDate: defaultRangeValue.fromDate,
            toTime: defaultRangeValue.toTime,
            toDate: defaultRangeValue.toDate
        });
    }

    /** @docs-private */
    validate(): ValidationErrors | null {
        return this.concatControlValidationErrors();
    }

    /** Implemented as part of ControlValueAccessor */
    writeValue(value?: KbqTimeRangeRange): void {
        if (!value) return;

        const corrected = this.timeRangeService.checkAndCorrectTimeRangeValue(
            value,
            this.availableTimeRangeTypes(),
            this.form.value
        );

        this.form.controls.type.setValue(corrected.type);

        if (corrected.type === 'range' && corrected.startDateTime && corrected.endDateTime) {
            const { dateAdapter } = this.timeRangeService;
            // An unparseable end leaves its halves empty, which the border validators then report.
            const from = dateAdapter.deserialize(corrected.startDateTime)!;
            const to = dateAdapter.deserialize(corrected.endDateTime)!;

            this.form.patchValue({
                fromTime: from,
                fromDate: from,
                toTime: to,
                toDate: to
            });
        }
    }

    /** @docs-private */
    onChange = (_value: KbqTimeRangeRange) => {};
    /** @docs-private */
    onTouch = () => {};
    /** Implemented as part of ControlValueAccessor */
    registerOnChange(fn: (value: KbqTimeRangeRange) => void): void {
        this.onChange = fn;
    }
    /** Implemented as part of ControlValueAccessor */
    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }

    /**
     * Leaving one border reports what is wrong with it. Angular marks a control touched on its own blur,
     * which is a finer grain than the spec asks for - so moving between a border's own date and time
     * takes the touch back off, and the pair is judged only once focus is out of both.
     * @docs-private
     */
    protected onBorderFocusOut(border: RangeBorder, { currentTarget, relatedTarget }: FocusEvent): void {
        this.setBorderTouched(
            border,
            !this.staysWithin(currentTarget as HTMLElement, relatedTarget as HTMLElement | null)
        );
    }

    /**
     * Typing puts a border back to its neutral state, the way `validation-on-blur` does for a single
     * field. What is wrong with it is said again when focus leaves it.
     * @docs-private
     */
    protected onBorderInput(border: RangeBorder): void {
        this.setBorderTouched(border, false);
    }

    /**
     * Once focus leaves the manual range fields, a reversed range is silently swapped back into order -
     * except on the way to "apply", where the swap is left to the emitted value so that the popover does
     * not visibly reorder itself in the same gesture that closes it.
     * @docs-private
     */
    protected onRangeFocusOut({ currentTarget, relatedTarget }: FocusEvent): void {
        const next = relatedTarget as HTMLElement | null;

        if (this.staysWithin(currentTarget as HTMLElement, next)) return;

        // Safari reports a `null` `relatedTarget` for a click on a button, so the footer is recognised by
        // the pointer gesture it started rather than by where focus went.
        if (this.editorBridge?.applyGestureInProgress || next?.closest('.kbq-time-range__buttons')) return;

        // Focus went nowhere because the whole window lost it - the user is still mid-edit.
        if (!next && !this.document.hasFocus()) return;

        this.swapIfReversed();
    }

    /**
     * Reveals both borders and sends the user to the first field at fault, reporting whether there is
     * anything to fix at all.
     */
    private revealErrors(): boolean {
        this.applyAttempted = true;
        // `applyAttempted` is read by the validators, so they have to be run again before anything is said
        // about the result.
        borders.forEach((border) => {
            halves.forEach((half) =>
                this.form.controls[`${border}${half}`].updateValueAndValidity({ emitEvent: false })
            );
            this.setBorderTouched(border, true);
        });

        const firstInvalid = borders
            .flatMap((border) => halves.map((half) => `${border}${half}` as const))
            .find((name) => this.form.controls[name].invalid);

        if (!firstInvalid) return true;

        this.elementRef.nativeElement
            .querySelector<HTMLInputElement>(`[data-time-range-field="${firstInvalid}"]`)
            ?.focus();

        return false;
    }

    /** Whether a bound is a moment within its day rather than the day itself. */
    private carriesTime(date: T): boolean {
        const { dateAdapter } = this.timeRangeService;

        return !!(dateAdapter.getHours(date) || dateAdapter.getMinutes(date) || dateAdapter.getSeconds(date));
    }

    /** Whether focus is still inside `group`, counting the datepicker calendar as part of it. */
    private staysWithin(group: HTMLElement, next: HTMLElement | null): boolean {
        // The calendar is rendered in a separate overlay, so focus moving into it is still editing.
        return group.contains(next) || !!next?.closest('.kbq-datepicker__popup');
    }

    /** Both halves of a border are painted, or neither: the pair is what the user is judged on. */
    private setBorderTouched(border: RangeBorder, touched: boolean): void {
        halves.forEach((half) => {
            const control = this.form.controls[`${border}${half}`];

            if (touched) {
                control.markAsTouched();
            } else {
                control.markAsUntouched();
            }
        });
    }

    private swapIfReversed(): void {
        if (this.hasBorderProblem()) return;

        const { fromTime, fromDate, toTime, toDate } = this.form.getRawValue();

        if (!this.isReversed(fromDate, fromTime, toDate, toTime)) return;

        this.form.patchValue({ fromTime: toTime, fromDate: toDate, toTime: fromTime, toDate: fromDate });
    }

    /**
     * Whether anything about the borders would stop the range being saved. Deliberately blind to which
     * borders have been revealed: a swap rewrites the user's values, so it has to answer "is this range
     * actually sound", not "has the user been shown the problem yet".
     */
    private hasBorderProblem(): boolean {
        if (this.form.controls.type.value !== 'range') return false;

        // The validators run whether or not the user has been shown the result, so the controls already
        // hold the answer - including the pickers' own format errors.
        return borders.some((border) => halves.some((half) => !!this.form.controls[`${border}${half}`].errors));
    }

    /**
     * What is wrong with each half of a border, whether or not the user has been shown it. A missing half
     * is flagged on its own; a bound is judged in two steps, so that the field actually at fault is the
     * one painted.
     */
    private borderErrors(border: RangeBorder): Record<BorderHalf, ValidationErrors | null> {
        const date = this.form.controls[`${border}Date`].value;
        const time = this.form.controls[`${border}Time`].value;

        if (!date && !time) {
            const error = this.applyAttempted ? { kbqTimeRangeRequired: true } : null;

            return { Date: error, Time: error };
        }

        // Only the missing half is painted, so the user is pointed at the field to fill in.
        if (!date || !time) {
            const error = { kbqTimeRangeIncomplete: true };

            return { Date: date ? null : error, Time: time ? null : error };
        }

        const outOfBounds = this.checkBorderBounds(date, time);

        if (!outOfBounds) return { Date: null, Time: null };

        const error = { kbqTimeRangeOutOfBounds: { bound: outOfBounds.bound } };

        // A day outside the bounds is wrong whatever time sits next to it, so both halves are painted.
        // A day on the boundary itself can only be pushed out by its time, so only the time is.
        return { Date: outOfBounds.scope === 'date' ? error : null, Time: error };
    }

    /** Which bound a border falls outside of, and whether its day or only its time is to blame. */
    private checkBorderBounds(date: T, time: T): { bound: 'min' | 'max'; scope: 'date' | 'time' } | null {
        const service = this.timeRangeService;
        const { dateAdapter } = service;
        const minDate = service.minDate();
        const maxDate = service.maxDate();

        if (minDate && dateAdapter.compareDate(date, minDate) < 0) return { bound: 'min', scope: 'date' };

        if (maxDate && dateAdapter.compareDate(date, maxDate) > 0) return { bound: 'max', scope: 'date' };

        const combined = service.combineDateAndTime(date, time);

        if (minDate && dateAdapter.compareDateTime(combined, minDate) < 0) return { bound: 'min', scope: 'time' };

        if (maxDate && dateAdapter.compareDateTime(combined, maxDate) > 0) return { bound: 'max', scope: 'time' };

        return null;
    }

    private isReversed(fromDate: T, fromTime: T, toDate: T, toTime: T): boolean {
        if (!fromDate || !fromTime || !toDate || !toTime) return false;

        const service = this.timeRangeService;

        return (
            service.dateAdapter.compareDateTime(
                service.combineDateAndTime(fromDate, fromTime),
                service.combineDateAndTime(toDate, toTime)
            ) > 0
        );
    }

    /**
     * A border reports only what the pickers do not: an empty half next to a filled one, a border left
     * wholly empty once "apply" was pressed, and a border outside the bounds. Format is the pickers' own
     * business, and so is the calendar restriction.
     */
    private borderValidator(border: RangeBorder, half: BorderHalf): ValidatorFn {
        return (): ValidationErrors | null => {
            if (this.form.controls.type.value !== 'range') return null;

            return this.borderErrors(border)[half];
        };
    }

    private mapTimeRange({ type }: Partial<KbqTimeRangeTypeContext> & KbqRangeValue<T>): KbqTimeRangeRange | undefined {
        if (!type) return;

        const { fromTime, fromDate, toTime, toDate } = this.form.getRawValue();
        // Ordered here as well as on blur, so that pressing "apply" straight out of a reversed field is
        // safe. A range with something wrong in it is left exactly as typed: it cannot be saved anyway,
        // and reordering it would move the fields out from under the user while they fix it.
        const ordered =
            !this.hasBorderProblem() && this.isReversed(fromDate, fromTime, toDate, toTime)
                ? { fromTime: toTime, fromDate: toDate, toTime: fromTime, toDate: fromDate }
                : { fromTime, fromDate, toTime, toDate };

        return { type, ...this.timeRangeService.calculateTimeRange(type, ordered) };
    }

    private getFormattedOption(type: KbqTimeRangeType, localeConfig: KbqTimeRangeLocaleConfiguration): string {
        const translationType = this.timeRangeService.getTimeRangeUnitByType(type);

        if (translationType === 'other') return '';

        const range = this.timeRangeService.calculateTimeRange(type);

        return this.timeRangeService.dateFormatter.duration(
            this.timeRangeService.dateAdapter.deserialize(range.startDateTime!)!,
            this.timeRangeService.dateAdapter.today(),
            [translationType],
            false,
            localeConfig.durationTemplate.option
        );
    }

    private concatControlValidationErrors(): ValidationErrors | null {
        let result: ValidationErrors | null = null;

        Object.values(this.form.controls).forEach((control: AbstractControl) => {
            if (control.errors) {
                result = {
                    ...result,
                    ...control.errors
                };
            }
        });

        return result;
    }
}

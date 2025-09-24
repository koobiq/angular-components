import { ChangeDetectionStrategy, Component, computed, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { KbqTimeRangeLocaleConfig } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFieldset, KbqFieldsetItem, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { skip } from 'rxjs';
import { take } from 'rxjs/operators';
import { KbqTimeRangeService } from './time-range.service';
import { KbqRangeValue, KbqTimeRangeRange, KbqTimeRangeType } from './types';

interface FormValue<T> {
    type: FormControl<KbqTimeRangeType>;
    fromTime: FormControl<T>;
    fromDate: FormControl<T>;
    toTime: FormControl<T>;
    toDate: FormControl<T>;
}

/** @docs-private */
@Component({
    selector: 'kbq-time-range-editor',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        KbqFieldset,
        KbqFieldsetItem,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqTimepickerModule,
        KbqRadioModule,
        KbqIcon
    ],
    template: `
        <form [formGroup]="form">
            <kbq-radio-group class="kbq-time-range-editor__container" [formControl]="form.controls.type">
                <div class="kbq-time-range-editor__predefined">
                    @for (type of timeRangeTypesWithoutRange(); track type) {
                        <kbq-radio-button class="kbq-time-range-editor__predefined-option" [value]="type">
                            {{ type }}
                        </kbq-radio-button>
                    }
                </div>

                @if (isRangeVisible()) {
                    @let localeConfig = localeConfiguration();

                    <div class="kbq-time-range-editor__range" role="group">
                        <kbq-radio-button [value]="'range'">{{ localeConfig.editor.rangeLabel }}</kbq-radio-button>

                        <div class="kbq-time-range-editor__date-time">
                            <span
                                class="kbq-time-range-editor__date-time-prefix"
                                [attr.aria-label]="localeConfig.editor.from"
                            >
                                {{ localeConfig.editor.from }}
                            </span>
                            <kbq-fieldset>
                                <kbq-form-field kbqFieldsetItem>
                                    <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                                    <input
                                        kbqTimepicker
                                        [format]="timepickerFormat"
                                        [formControl]="form.controls.fromTime"
                                    />
                                </kbq-form-field>

                                <kbq-form-field>
                                    <input [kbqDatepicker]="datepickerFrom" [formControl]="form.controls.fromDate" />
                                    <kbq-datepicker-toggle-icon kbqSuffix [for]="datepickerFrom" />
                                    <kbq-datepicker #datepickerFrom [minDate]="minDate()" [maxDate]="maxDate()" />
                                </kbq-form-field>
                            </kbq-fieldset>
                        </div>

                        <div class="kbq-time-range-editor__date-time">
                            <span
                                class="kbq-time-range-editor__date-time-prefix"
                                [attr.aria-label]="localeConfig.editor.to"
                            >
                                {{ localeConfig.editor.to }}
                            </span>
                            <kbq-fieldset>
                                <kbq-form-field kbqFieldsetItem>
                                    <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                                    <input
                                        kbqTimepicker
                                        [format]="timepickerFormat"
                                        [formControl]="form.controls.toTime"
                                    />
                                </kbq-form-field>

                                <kbq-form-field>
                                    <input [kbqDatepicker]="datepickerTo" [formControl]="form.controls.toDate" />
                                    <kbq-datepicker-toggle-icon kbqSuffix [for]="datepickerTo" />
                                    <kbq-datepicker #datepickerTo [minDate]="minDate()" [maxDate]="maxDate()" />
                                </kbq-form-field>
                            </kbq-fieldset>
                        </div>
                    </div>
                }
            </kbq-radio-group>
        </form>
    `,
    host: {
        class: 'kbq-time-range-editor'
    },
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: KbqTimeRangeEditor,
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTimeRangeEditor<T> implements ControlValueAccessor {
    private readonly timeRangeService = inject(KbqTimeRangeService);

    /** The maximum selectable date. */
    maxDate = input<T | null>(null);
    /** The minimum selectable date. */
    minDate = input<T | null>(null);
    /** Preset of selectable ranges */
    availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.resolvedTimeRangeTypes);
    /** provided value of selected range */
    rangeValue = input<Required<KbqRangeValue<T>>>(this.timeRangeService.getDefaultRangeValue());

    showRangeAsDefault = input(true);
    localeConfiguration = input.required<KbqTimeRangeLocaleConfig>();

    /** @docs-private */
    protected readonly isRangeVisible = computed(
        () => this.showRangeAsDefault() || this.availableTimeRangeTypes().includes('range')
    );

    /** @docs-private */
    protected getTimeRangeTypesWithoutRange = (availableTimeRangeTypes: KbqTimeRangeType[]) =>
        availableTimeRangeTypes.filter((item) => item !== 'range');
    /** @docs-private */
    protected readonly timeRangeTypesWithoutRange = signal(
        this.getTimeRangeTypesWithoutRange(this.availableTimeRangeTypes())
    );
    /** @docs-private */
    protected form: FormGroup<FormValue<T>>;
    /** @docs-private */
    protected readonly timepickerFormat = TimeFormats.HHmmss;

    constructor() {
        toObservable(this.availableTimeRangeTypes)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(this.getTimeRangeTypesWithoutRange);

        toObservable(this.rangeValue)
            .pipe(take(1))
            .subscribe((value) => {
                this.form.patchValue(value);
            });

        const defaultRangeValue = this.timeRangeService.getDefaultRangeValue();

        this.form = new FormGroup({
            type: new FormControl<KbqTimeRangeType>('lastHour', { nonNullable: true }),
            fromTime: new FormControl<T>(defaultRangeValue.fromTime, { nonNullable: true }),
            fromDate: new FormControl<T>(defaultRangeValue.fromDate, { nonNullable: true }),
            toTime: new FormControl<T>(defaultRangeValue.toTime, { nonNullable: true }),
            toDate: new FormControl<T>(defaultRangeValue.toDate, { nonNullable: true })
        });

        this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(({ type, fromTime, fromDate, toTime, toDate }) => {
            const rangeControls = [
                this.form.controls.fromTime,
                this.form.controls.fromDate,
                this.form.controls.toTime,
                this.form.controls.toDate
            ];

            const isDisabled = type !== 'range';

            rangeControls.forEach((control) => {
                if (isDisabled) {
                    control.disable({ emitEvent: false });
                } else {
                    control.enable({ emitEvent: false });
                }
            });

            const range = this.timeRangeService.calculateTimeRange(type, {
                fromTime: fromTime,
                fromDate: fromDate,
                toTime: toTime,
                toDate: toDate
            });

            if (type) {
                this.onChange({
                    type,
                    ...range
                });
            }
        });
    }

    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    writeValue(value: KbqTimeRangeRange | undefined): void {
        if (!value) return;

        const corrected = this.timeRangeService.checkAndCorrectTimeRangeValue(
            value,
            this.availableTimeRangeTypes(),
            this.form.value
        );

        this.form.patchValue({
            type: corrected.type
        });

        if (corrected.type === 'range' && corrected.startDateTime && corrected.endDateTime) {
            const from: T = this.timeRangeService.fromISO(corrected.startDateTime);
            const to: T = this.timeRangeService.fromISO(corrected.endDateTime);

            this.form.patchValue({
                fromTime: from,
                fromDate: from,
                toTime: to,
                toDate: to
            });
        }
    }

    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    onChange = (_value: KbqTimeRangeRange) => {};
    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    onTouch = () => {};
    /** Implemented as part of ControlValueAccessor.
     * @docs-private */
    registerOnChange(fn: (value: KbqTimeRangeRange) => void): void {
        this.onChange = fn;
    }
    /** Implemented as part of ControlValueAccessor.
     * @docs-private */
    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
}

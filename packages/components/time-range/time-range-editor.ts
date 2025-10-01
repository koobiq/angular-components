import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    OnInit,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroup,
    FormGroupDirective,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    NgForm,
    ReactiveFormsModule,
    ValidationErrors,
    Validator
} from '@angular/forms';
import { ErrorStateMatcher, KbqTimeRangeLocaleConfig } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFieldset, KbqFieldsetItem, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepicker, KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { merge } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { rangeValidator } from './constants';
import { KbqTimeRangeService } from './time-range.service';
import { KbqRangeValue, KbqTimeRangeRange, KbqTimeRangeType, KbqTimeRangeTypeContext } from './types';

interface FormValue<T> {
    type: FormControl<KbqTimeRangeType>;
    fromTime: FormControl<T>;
    fromDate: FormControl<T>;
    toTime: FormControl<T>;
    toDate: FormControl<T>;
}

class RangeErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!form?.invalid || !!control?.invalid;
    }
}

/** @docs-private */
@Component({
    selector: 'kbq-time-range-editor',
    standalone: true,
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        KbqFieldset,
        KbqFieldsetItem,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqTimepickerModule,
        KbqRadioModule,
        KbqIcon
    ],
    templateUrl: './time-range-editor.html',
    host: {
        class: 'kbq-time-range__editor'
    },
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
    encapsulation: ViewEncapsulation.None
})
export class KbqTimeRangeEditor<T> implements ControlValueAccessor, Validator, OnInit {
    private readonly timeRangeService = inject(KbqTimeRangeService);

    /** The maximum selectable date. */
    readonly maxDate = input<T | null>(null);
    /** The minimum selectable date. */
    readonly minDate = input<T | null>(null);
    /** Preset of selectable ranges */
    readonly availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.providedDefaultTimeRangeTypes);
    /** Provided value of selected range */
    readonly rangeValue = input<Required<KbqRangeValue<T>>>(this.timeRangeService.getDefaultRangeValue());
    readonly showRangeAsDefault = input.required<boolean>();
    readonly localeConfiguration = input.required<KbqTimeRangeLocaleConfig>();

    /** @docs-private */
    protected readonly isRangeVisible = computed(
        () => this.showRangeAsDefault() || this.availableTimeRangeTypes().includes('range')
    );

    /** @docs-private */
    protected readonly timeRangeTypesWithoutRange = computed(() => {
        const localeConfig = this.localeConfiguration();

        return this.availableTimeRangeTypes()
            .filter((type) => type !== 'range')
            .map((type) => ({
                type,
                translationType: this.timeRangeService.getTimeRangeUnitByType(type),
                formattedValue: this.getFormattedOption(type, localeConfig)
            }));
    });

    /** @docs-private */
    protected readonly timepickerList = viewChildren<KbqTimepicker<T>>(KbqTimepicker);

    /** @docs-private */
    protected readonly form: FormGroup<FormValue<T>>;
    /** @docs-private */
    protected readonly timepickerFormat = TimeFormats.HHmmss;
    /** @docs-private */
    protected readonly rangeStateMatcher = new RangeErrorStateMatcher();

    private lastValidationErrorOnEmit: ValidationErrors | null = null;

    constructor() {
        const defaultRangeValue = this.rangeValue();

        this.form = new FormGroup(
            {
                type: new FormControl<KbqTimeRangeType>(KbqTimeRangeService.DEFAULT_RANGE_TYPE, { nonNullable: true }),
                fromTime: new FormControl<T>(defaultRangeValue.fromTime, { nonNullable: true }),
                fromDate: new FormControl<T>(defaultRangeValue.fromDate, { nonNullable: true }),
                toTime: new FormControl<T>(defaultRangeValue.toTime, { nonNullable: true }),
                toDate: new FormControl<T>(defaultRangeValue.toDate, { nonNullable: true })
            },
            { validators: rangeValidator(this.timeRangeService) }
        );

        const rangeControls = [
            this.form.controls.fromTime,
            this.form.controls.fromDate,
            this.form.controls.toTime,
            this.form.controls.toDate
        ];

        merge(...rangeControls.map((control) => control.statusChanges))
            .pipe(takeUntilDestroyed())
            .subscribe(() => (this.lastValidationErrorOnEmit = this.concatControlValidationErrors()));

        this.form.valueChanges
            .pipe(
                map((formValue) => formValue.type),
                distinctUntilChanged(),
                takeUntilDestroyed()
            )
            .subscribe((type) => {
                const isDisabled = type !== 'range';

                rangeControls.forEach((control) => {
                    if (isDisabled) {
                        control.disable({ emitEvent: false });
                    } else {
                        control.enable({ emitEvent: false });
                    }
                });
            });

        this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((formValue) => {
            const range = this.mapTimeRange(formValue);

            if (range) this.onChange(range);
        });

        this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe((status) => {
            const timepickerList = this.timepickerList();

            if (timepickerList.at(0)) {
                timepickerList.at(0)!.errorState = status === 'INVALID';
            }
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
        return this.form.errors || this.lastValidationErrorOnEmit;
    }

    /** Implemented as part of ControlValueAccessor */
    writeValue(value: KbqTimeRangeRange | undefined): void {
        if (!value) return;

        const corrected = this.timeRangeService.checkAndCorrectTimeRangeValue(
            value,
            this.availableTimeRangeTypes(),
            this.form.value
        );

        this.form.controls.type.setValue(corrected.type);

        if (corrected.type === 'range' && corrected.startDateTime && corrected.endDateTime) {
            const from: T = this.timeRangeService.dateAdapter.deserialize(corrected.startDateTime);
            const to: T = this.timeRangeService.dateAdapter.deserialize(corrected.endDateTime);

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

    private mapTimeRange({ type }: Partial<KbqTimeRangeTypeContext> & KbqRangeValue<T>): KbqTimeRangeRange | undefined {
        if (!type) return undefined;

        return {
            type,
            ...this.timeRangeService.calculateTimeRange(type, {
                // use control.value, since via form.value control values can be undefined
                fromTime: this.form.controls.fromTime.value,
                fromDate: this.form.controls.fromDate.value,
                toDate: this.form.controls.toTime.value,
                toTime: this.form.controls.toTime.value
            })
        };
    }

    private getFormattedOption(type: KbqTimeRangeType, localeConfig: KbqTimeRangeLocaleConfig): string {
        const translationType = this.timeRangeService.getTimeRangeUnitByType(type);

        if (translationType === 'other') return '';

        const range = this.timeRangeService.calculateTimeRange(type);

        return this.timeRangeService.dateFormatter.duration(
            this.timeRangeService.dateAdapter.deserialize(range.startDateTime!),
            this.timeRangeService.dateAdapter.today(),
            [translationType],
            false,
            localeConfig.durationTemplate.option
        );
    }

    private concatControlValidationErrors(): ValidationErrors | null {
        let result: ValidationErrors | null = this.form.errors;

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

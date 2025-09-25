import { NgTemplateOutlet } from '@angular/common';
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
import { distinctUntilChanged } from 'rxjs/operators';
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
    readonly maxDate = input<T | null>(null);
    /** The minimum selectable date. */
    readonly minDate = input<T | null>(null);
    /** Preset of selectable ranges */
    readonly availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.resolvedTimeRangeTypes);
    /** Provided value of selected range */
    readonly rangeValue = input<Required<KbqRangeValue<T>>>(this.timeRangeService.getDefaultRangeValue());

    readonly showRangeAsDefault = input.required<boolean>();
    readonly localeConfiguration = input.required<KbqTimeRangeLocaleConfig>();

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

        const defaultRangeValue = this.rangeValue();

        this.form = new FormGroup({
            type: new FormControl<KbqTimeRangeType>('lastHour', { nonNullable: true }),
            fromTime: new FormControl<T>(defaultRangeValue.fromTime, { nonNullable: true }),
            fromDate: new FormControl<T>(defaultRangeValue.fromDate, { nonNullable: true }),
            toTime: new FormControl<T>(defaultRangeValue.toTime, { nonNullable: true }),
            toDate: new FormControl<T>(defaultRangeValue.toDate, { nonNullable: true })
        });

        const rangeControls = [
            this.form.controls.fromTime,
            this.form.controls.fromDate,
            this.form.controls.toTime,
            this.form.controls.toDate
        ];

        this.form.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe(({ type }) => {
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

            if (range) {
                this.onChange(range);
            }
        });
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

    /** @docs-private */
    protected getTimeRangeOptionTemplateContext(type: KbqTimeRangeType): KbqTimeRangeOptionContext {
        return {
            ...this.timeRangeService.getTimeRangeTypeUnits(type),
            translationType: this.timeRangeService.getTimeRangeUnitByType(type),
            type
        };
    }

    private mapTimeRange({ type }: Partial<KbqTimeRangeTypeContext> & KbqRangeValue<T>): KbqTimeRangeRange | undefined {
        if (!type) {
            return undefined;
        }

        return {
            type,
            ...this.timeRangeService.calculateTimeRange(type, {
                fromTime: this.form.controls.fromTime.value,
                fromDate: this.form.controls.fromDate.value,
                toDate: this.form.controls.toTime.value,
                toTime: this.form.controls.toTime.value
            })
        };
    }

    /** Implemented as part of ControlValueAccessor */
    onChange = (_value: KbqTimeRangeRange) => {};
    /** Implemented as part of ControlValueAccessor */
    onTouch = () => {};
    /** Implemented as part of ControlValueAccessor */
    registerOnChange(fn: (value: KbqTimeRangeRange) => void): void {
        this.onChange = fn;
    }
    /** Implemented as part of ControlValueAccessor */
    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
}

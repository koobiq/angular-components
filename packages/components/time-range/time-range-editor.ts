import { ChangeDetectionStrategy, Component, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFieldset, KbqFieldsetItem, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { skip } from 'rxjs';
import { KbqTimeRangeService } from './time-range.service';
import { KbqTimeRangeType } from './types';

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

                @if (isRangeVisible) {
                    <div class="kbq-time-range-editor__range" role="group">
                        <kbq-radio-button [value]="'Range'">range</kbq-radio-button>

                        <div class="kbq-time-range-editor__date-time">
                            <span class="kbq-time-range-editor__date-time-prefix" [attr.aria-label]="localeConfig.from">
                                {{ localeConfig.from }}
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
                            <span class="kbq-time-range-editor__date-time-prefix" [attr.aria-label]="localeConfig.to">
                                {{ localeConfig.to }}
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTimeRangeEditor<T> {
    private readonly timeRangeService = inject(KbqTimeRangeService);

    /** The maximum selectable date. */
    maxDate = input<T | null>(null);
    /** The minimum selectable date. */
    minDate = input<T | null>(null);
    /** Preset of selectable ranges */
    availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.resolvedTimeRangeTypes);

    /** @docs-private */
    protected getTimeRangeTypesWithoutRange = (availableTimeRangeTypes: KbqTimeRangeType[]) =>
        availableTimeRangeTypes.filter((item) => item !== 'range');
    /** @docs-private */
    protected readonly timeRangeTypesWithoutRange = signal(
        this.getTimeRangeTypesWithoutRange(this.availableTimeRangeTypes())
    );
    /** @docs-private */
    protected readonly form: FormGroup<{
        type: FormControl<KbqTimeRangeType>;
        fromTime: FormControl<T>;
        fromDate: FormControl<T>;
        toTime: FormControl<T>;
        toDate: FormControl<T>;
    }>;

    constructor() {
        toObservable(this.availableTimeRangeTypes)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(this.getTimeRangeTypesWithoutRange);

        const defaultRangeValue = this.timeRangeService.getDefaultRangeValue();

        this.form = new FormGroup({
            type: new FormControl<KbqTimeRangeType>('lastHour', { nonNullable: true }),
            fromTime: new FormControl(defaultRangeValue.fromTime, { nonNullable: true }),
            fromDate: new FormControl(defaultRangeValue.fromDate, { nonNullable: true }),
            toTime: new FormControl(defaultRangeValue.toTime, { nonNullable: true }),
            toDate: new FormControl(defaultRangeValue.toDate, { nonNullable: true })
        });

        this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(({ type, fromTime, fromDate, toTime, toDate }) => {
            const range = this.timeRangeService.calculateTimeRange(type, {
                fromTime,
                fromDate,
                toTime,
                toDate
            });

            console.log(range);
        });
    }

    protected readonly localeConfig = { from: 'c', to: 'по' };
    protected readonly timepickerFormat = TimeFormats.HHmmss;

    get isRangeVisible() {
        return true;
    }
}

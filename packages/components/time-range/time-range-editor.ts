import { ChangeDetectionStrategy, Component, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
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
        KbqFieldset,
        KbqFieldsetItem,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqTimepickerModule,
        KbqRadioModule,
        KbqIcon
    ],
    template: `
        <kbq-radio-group>
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
                                <input kbqTimepicker [format]="timepickerFormat" />
                            </kbq-form-field>

                            <kbq-form-field>
                                <input [kbqDatepicker]="datepickerFrom" />
                                <kbq-datepicker-toggle-icon kbqSuffix [for]="datepickerFrom" />
                                <kbq-datepicker #datepickerFrom [minDate]="minDate()" />
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
                                <input kbqTimepicker [format]="timepickerFormat" />
                            </kbq-form-field>

                            <kbq-form-field>
                                <input [kbqDatepicker]="datepickerTo" />
                                <kbq-datepicker-toggle-icon kbqSuffix [for]="datepickerTo" />
                                <kbq-datepicker #datepickerTo [maxDate]="maxDate()" />
                            </kbq-form-field>
                        </kbq-fieldset>
                    </div>
                </div>
            }
        </kbq-radio-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTimeRangeEditor<T> {
    private readonly timeRangeService = inject(KbqTimeRangeService);

    /** The maximum selectable date. */
    maxDate = input<T>();
    /** The minimum selectable date. */
    minDate = input<T>();
    /** Preset of selectable ranges */
    availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.resolvedTimeRangeTypes);

    protected getTimeRangeTypesWithoutRange = (availableTimeRangeTypes: KbqTimeRangeType[]) =>
        availableTimeRangeTypes.filter((item) => item !== 'range');

    protected readonly timeRangeTypesWithoutRange = signal(
        this.getTimeRangeTypesWithoutRange(this.availableTimeRangeTypes())
    );

    constructor() {
        toObservable(this.availableTimeRangeTypes)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(this.getTimeRangeTypesWithoutRange);
    }

    protected readonly localeConfig = { from: 'c', to: 'по' };
    protected readonly timepickerFormat = TimeFormats.HHmmss;

    get isRangeVisible() {
        return true;
    }
}

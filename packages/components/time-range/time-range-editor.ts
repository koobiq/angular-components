import { ChangeDetectionStrategy, Component, inject, input, ViewEncapsulation } from '@angular/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFieldset, KbqFieldsetItem, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';

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
                @for (type of mockTypes; track type) {
                    <kbq-radio-button class="kbq-time-range-editor__predefined-option" [value]="type">
                        {{ type }}
                    </kbq-radio-button>
                }
            </div>

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
                            <kbq-datepicker #datepickerFrom />
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
                            <kbq-datepicker #datepickerTo />
                        </kbq-form-field>
                    </kbq-fieldset>
                </div>
            </div>
        </kbq-radio-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTimeRangeEditor<T> {
    /** The maximum selectable date. */
    maxDate = input<T>();

    /** The minimum selectable date. */
    minDate = input<T>();

    protected readonly providedDefaultTimeRangeTypes = inject(KBQ_DEFAULT_TIME_RANGE_TYPES, { optional: true });

    protected readonly localeConfig = { from: 'c', to: 'по' };
    protected readonly timepickerFormat = TimeFormats.HHmmss;

    protected readonly mockTypes = Array.from({ length: 10 }, (_, i) => `Option ${i + 1}`);
}

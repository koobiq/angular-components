import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KBQ_LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE, KbqFormsModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DatepickerAndTimepickerExample } from './datepicker-and-timepicker/datepicker-and-timepicker-example';
import { DatepickerInactiveExample } from './datepicker-inactive/datepicker-inactive-example';
import { DatepickerMinimaxExample } from './datepicker-minimax/datepicker-minimax-example';
import { DatepickerOverviewExample } from './datepicker-overview/datepicker-overview-example';
import { DatepickerRangeExample } from './datepicker-range/datepicker-range-example';
import { DatepickerRequiredExample } from './datepicker-required/datepicker-required-example';

export {
    DatepickerAndTimepickerExample,
    DatepickerInactiveExample,
    DatepickerMinimaxExample,
    DatepickerOverviewExample,
    DatepickerRangeExample,
    DatepickerRequiredExample
};

const EXAMPLES = [
    DatepickerAndTimepickerExample,
    DatepickerInactiveExample,
    DatepickerOverviewExample,
    DatepickerRequiredExample,
    DatepickerMinimaxExample,
    DatepickerRangeExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        KbqDatepickerModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqRadioModule,
        KbqToolTipModule,
        KbqTimepickerModule,
        KbqFormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
    providers: [
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
            deps: [KBQ_DATE_LOCALE, KBQ_LUXON_DATE_ADAPTER_OPTIONS, KBQ_LOCALE_SERVICE]
        }
    ]
})
export class DatepickerExamplesModule {}

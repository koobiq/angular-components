import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

import { TimepickerOverviewExample } from './timepicker-overview/timepicker-overview-example';
import { TimepickerRangeExample } from './timepicker-range/timepicker-range-example';
import { TimepickerValidationSymbolsExample } from './timepicker-validation-symbols/timepicker-validation-symbols-example';
import { TimepickerVariationsExample } from './timepicker-variations/timepicker-variations-example';


export {
    TimepickerOverviewExample,
    TimepickerRangeExample,
    TimepickerVariationsExample,
    TimepickerValidationSymbolsExample
};

const EXAMPLES = [
    TimepickerOverviewExample,
    TimepickerRangeExample,
    TimepickerVariationsExample,
    TimepickerValidationSymbolsExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqLuxonDateModule,
        KbqToolTipModule,
        KbqCheckboxModule,
        KbqSelectModule,
        KbqTimepickerModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqRadioModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TimepickerExamplesModule {
}

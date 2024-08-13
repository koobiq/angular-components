import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KBQ_LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DatepickerLanguageExample } from './datepicker-language/datepicker-language-example';
import { DatepickerMinimaxExample } from './datepicker-minimax/datepicker-minimax-example';
import { DatepickerNotEmptyExample } from './datepicker-not-empty/datepicker-not-empty-example';
import { DatepickerOverviewExample } from './datepicker-overview/datepicker-overview-example';

export { DatepickerLanguageExample, DatepickerMinimaxExample, DatepickerNotEmptyExample, DatepickerOverviewExample };

const EXAMPLES = [
    DatepickerLanguageExample,
    DatepickerOverviewExample,
    DatepickerNotEmptyExample,
    DatepickerMinimaxExample
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
        KbqToolTipModule
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

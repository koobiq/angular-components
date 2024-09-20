import { NgModule } from '@angular/core';
import {
    KBQ_LUXON_DATE_ADAPTER_OPTIONS,
    KBQ_LUXON_DATE_FORMATS,
    LuxonDateAdapter
} from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    DateFormatter,
    KBQ_DATE_FORMATS,
    KBQ_DATE_LOCALE,
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule
} from '@koobiq/components/core';
import { AbsoluteDateFormatterExample } from './absolute-date-formatter/absolute-date-formatter-example';
import { DurationDateFormatterExample } from './duration-date-formatter/duration-date-formatter-example';
import { RangeDateFormatterExample } from './range-date-formatter/range-date-formatter-example';
import { RelativeDateFormatterExample } from './relative-date-formatter/relative-date-formatter-example';

export {
    AbsoluteDateFormatterExample,
    DurationDateFormatterExample,
    RangeDateFormatterExample,
    RelativeDateFormatterExample
};

const EXAMPLES = [
    AbsoluteDateFormatterExample,
    RelativeDateFormatterExample,
    RangeDateFormatterExample,
    DurationDateFormatterExample
];

@NgModule({
    imports: [
        KbqFormattersModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
    providers: [
        { provide: KBQ_DATE_FORMATS, useValue: KBQ_LUXON_DATE_FORMATS },
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
            deps: [KBQ_DATE_LOCALE, KBQ_LUXON_DATE_ADAPTER_OPTIONS, KBQ_LOCALE_SERVICE]
        },
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }
    ]
})
export class DateFormatterExamplesModule {}

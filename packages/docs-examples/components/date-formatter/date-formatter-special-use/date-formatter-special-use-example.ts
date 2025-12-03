import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { DateTime } from 'luxon';

/**
 * @title date-formatter-special-use
 */
@Component({
    selector: 'date-formatter-special-use-example',
    template: '{{ date }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
            deps: [KBQ_DATE_LOCALE]
        },
        { provide: DateFormatter, deps: [DateAdapter] }
    ]
})
export class DateFormatterSpecialUseExample {
    date: string;

    constructor(
        private adapter: DateAdapter<DateTime>,
        private dateFormatter: DateFormatter<DateTime>
    ) {
        this.dateFormatter.setLocale('en-US');
        this.dateFormatter.setLocale('ru-RU');

        this.date = this.dateFormatter.absoluteLongDate(this.adapter.today());
    }
}

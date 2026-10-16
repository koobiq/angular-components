import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { DateTime } from 'luxon';

/**
 * @title date-formatter-special-use
 */
@Component({
    selector: 'date-formatter-special-use-example',
    template: '{{ date }}',
    providers: [
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
            deps: [KBQ_DATE_LOCALE]
        },
        { provide: DateFormatter, deps: [DateAdapter] }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFormatterSpecialUseExample {
    private readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);
    private readonly dateFormatter = inject<DateFormatter<DateTime>>(DateFormatter);

    date: string;

    constructor() {
        this.dateFormatter.setLocale('en-US');
        this.dateFormatter.setLocale('ru-RU');

        this.date = this.dateFormatter.absoluteLongDate(this.adapter.today());
    }
}

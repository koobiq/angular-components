import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_LOCALE_SERVICE, KbqFormattersModule } from '@koobiq/components/core';
import { DateTime } from 'luxon';

/**
 * @title date-formatter-typical-use
 */
@Component({
    selector: 'date-formatter-typical-use-example',
    imports: [KbqLuxonDateModule, KbqFormattersModule],
    template: '{{ date }}',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFormatterTypicalUseExample {
    private readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);
    private readonly dateFormatter = inject<DateFormatter<DateTime>>(DateFormatter);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE);

    date: string;

    constructor() {
        this.localeService.setLocale('en-US');

        this.date = this.dateFormatter.absoluteLongDate(this.adapter.today());
    }
}

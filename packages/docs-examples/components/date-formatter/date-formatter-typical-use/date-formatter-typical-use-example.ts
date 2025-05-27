import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    DateFormatter,
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule,
    KbqLocaleService
} from '@koobiq/components/core';
import { DateTime } from 'luxon';

/**
 * @title date-formatter-typical-use
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'date-formatter-typical-use-example',
    template: '{{ date }}',
    imports: [KbqLuxonDateModule, KbqFormattersModule]
})
export class DateFormatterTypicalUseExample {
    date: string;

    constructor(
        private adapter: DateAdapter<DateTime>,
        private dateFormatter: DateFormatter<DateTime>,
        @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService
    ) {
        this.localeService.setLocale('en-US');

        this.date = this.dateFormatter.absoluteLongDate(this.adapter.today());
    }
}

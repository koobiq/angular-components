import { Inject, Injectable, Optional } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter } from '@koobiq/date-adapter';
import { DateFormatter as BaseDateFormatter } from '@koobiq/date-formatter';
import { KBQ_DATE_LOCALE } from '../../datetime';
import { KBQ_LOCALE_SERVICE } from '../../locales';

@Injectable()
export class DateFormatter<D> extends BaseDateFormatter<D> {
    constructor(
        override readonly adapter: DateAdapter<D>,
        @Inject(KBQ_DATE_LOCALE) locale: string,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) protected localeService?
    ) {
        super(adapter, locale);

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe((locale) => this.setLocale(locale));
    }
}

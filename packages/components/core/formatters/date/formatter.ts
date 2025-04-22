import { inject, Inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter } from '@koobiq/date-adapter';
import { DateFormatter as BaseDateFormatter } from '@koobiq/date-formatter';
import { KBQ_DATE_LOCALE } from '../../datetime';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '../../locales';

@Injectable()
export class DateFormatter<D> extends BaseDateFormatter<D> {
    protected localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true });
    constructor(
        override readonly adapter: DateAdapter<D>,
        @Inject(KBQ_DATE_LOCALE) locale: string
    ) {
        super(adapter, locale);

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe((locale) => this.setLocale(locale));
    }
}

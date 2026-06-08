import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter } from '@koobiq/date-adapter';
import { DateFormatter as BaseDateFormatter } from '@koobiq/date-formatter';
import { KBQ_DATE_LOCALE, DateAdapter as KbqDateAdapter } from '../../datetime';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '../../locales';

@Injectable()
export class DateFormatter<D> extends BaseDateFormatter<D> {
    override readonly adapter: DateAdapter<D>;

    protected localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true })!;
    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);
    constructor() {
        const adapter = inject<DateAdapter<D>>(KbqDateAdapter);
        const locale = inject(KBQ_DATE_LOCALE);

        super(adapter, locale);
        this.adapter = adapter;

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe((locale) => this.setLocale(locale));
    }
}

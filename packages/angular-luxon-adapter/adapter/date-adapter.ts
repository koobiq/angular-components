import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { KBQ_DATE_LOCALE, KBQ_DEFAULT_LOCALE_ID, KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { LuxonDateAdapter as BaseLuxonDateAdapter, LuxonDateAdapterOptions } from '@koobiq/luxon-date-adapter';
import { Info } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';

/** Configurable options for {@see LuxonDateAdapter}. */
export type KbqLuxonDateAdapterOptions = LuxonDateAdapterOptions;

/** InjectionToken for moment date adapter to configure options. */
export const KBQ_LUXON_DATE_ADAPTER_OPTIONS = new InjectionToken<KbqLuxonDateAdapterOptions>(
    'KBQ_MOMENT_DATE_ADAPTER_OPTIONS',
    {
        providedIn: 'root',
        factory: KBQ_LUXON_DATE_ADAPTER_OPTIONS_FACTORY,
    },
);

/** @docs-private */
// tslint:disable:naming-convention
export function KBQ_LUXON_DATE_ADAPTER_OPTIONS_FACTORY(): KbqLuxonDateAdapterOptions {
    return { useUtc: false };
}

@Injectable()
export class LuxonDateAdapter extends BaseLuxonDateAdapter {
    /** A stream that emits when the locale changes. */
    get localeChanges(): Observable<any> {
        return this._localeChanges;
    }

    private _localeChanges = new BehaviorSubject<string>(KBQ_DEFAULT_LOCALE_ID);

    constructor(
        @Inject(KBQ_DATE_LOCALE) dateLocale: string,
        @Optional() @Inject(KBQ_LUXON_DATE_ADAPTER_OPTIONS) protected readonly options?: LuxonDateAdapterOptions,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService,
    ) {
        super(dateLocale, options);

        this.setLocale(this.localeService?.id || dateLocale);

        this.localeService?.changes.subscribe(this.setLocale);
    }

    setLocale = (locale: string): void => {
        super.setLocale(locale);

        // try to find locale using angular core utilities
        if (Object.keys(this.localeData).length <= 1) {
            const options = { locale };
            const localeData = {
                ...this.localeData,
                firstDayOfWeek: getLocaleFirstDayOfWeek(locale),
                longMonths: Info.monthsFormat('long', options),
                shortMonths: Info.monthsFormat('short', options),
                narrowDaysOfWeek: Info.weekdaysFormat('narrow', options),
                shortDaysOfWeek: Info.weekdaysFormat('short', options),
                longDaysOfWeek: Info.weekdaysFormat('long', options),
            };

            this.updateLocaleData(localeData);
        }

        this._localeChanges.next(locale);
    };
}

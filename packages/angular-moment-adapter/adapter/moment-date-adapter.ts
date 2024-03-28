import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { KbqLocaleService, KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { MomentDateAdapter as BaseMomentDateAdapter, MomentDateAdapterOptions } from '@koobiq/moment-date-adapter';
import { Observable, Subject } from 'rxjs';


/** Configurable options for {@see MomentDateAdapter}. */
export type IKbqMomentDateAdapterOptions = MomentDateAdapterOptions;

/** InjectionToken for moment date adapter to configure options. */
export const KBQ_MOMENT_DATE_ADAPTER_OPTIONS = new InjectionToken<IKbqMomentDateAdapterOptions>(
    'KBQ_MOMENT_DATE_ADAPTER_OPTIONS', {
        providedIn: 'root',
        factory: KBQ_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY
    });

/** @docs-private */
// tslint:disable:naming-convention
export function KBQ_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY(): IKbqMomentDateAdapterOptions {
    return {
        useUtc: false,
        findDateFormat: false
    };
}


@Injectable()
export class MomentDateAdapter extends BaseMomentDateAdapter {
    constructor(
        @Optional() @Inject(KBQ_DATE_LOCALE) dateLocale: string,
        @Optional() @Inject(KBQ_MOMENT_DATE_ADAPTER_OPTIONS) protected readonly options?: IKbqMomentDateAdapterOptions,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        super(dateLocale, options);

        this.setLocale(this.localeService?.id || dateLocale);

        this.localeService?.changes
            .subscribe(this.setLocale);
    }

    /** A stream that emits when the locale changes. */
    get localeChanges(): Observable<any> {
        return this._localeChanges;
    }

    private _localeChanges = new Subject<void>();

    /**
     * Sets the locale used for all dates.
     * @param locale The new locale.
     */
    setLocale = (locale: any) => {
        super.setLocale(locale);
        this._localeChanges.next();
    }
}

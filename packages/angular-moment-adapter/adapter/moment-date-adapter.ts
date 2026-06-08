import { Injectable, InjectionToken, inject } from '@angular/core';
import { KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { MomentDateAdapter as BaseMomentDateAdapter, MomentDateAdapterOptions } from '@koobiq/moment-date-adapter';
import { Observable, Subject } from 'rxjs';

/** Configurable options for {@see MomentDateAdapter}. */
export type IKbqMomentDateAdapterOptions = MomentDateAdapterOptions;

/** InjectionToken for moment date adapter to configure options. */
export const KBQ_MOMENT_DATE_ADAPTER_OPTIONS = new InjectionToken<IKbqMomentDateAdapterOptions>(
    'KBQ_MOMENT_DATE_ADAPTER_OPTIONS',
    {
        providedIn: 'root',
        factory: KBQ_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY
    }
);

/** @docs-private */
export function KBQ_MOMENT_DATE_ADAPTER_OPTIONS_FACTORY(): IKbqMomentDateAdapterOptions {
    return {
        useUtc: false,
        findDateFormat: false
    };
}

@Injectable()
export class MomentDateAdapter extends BaseMomentDateAdapter {
    protected readonly options?: IKbqMomentDateAdapterOptions;
    private localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true })!;
    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        const dateLocale = inject(KBQ_DATE_LOCALE, { optional: true })!;
        const options =
            inject<IKbqMomentDateAdapterOptions>(KBQ_MOMENT_DATE_ADAPTER_OPTIONS, { optional: true }) ?? undefined;

        super(dateLocale, options);
        this.options = options;

        this.setLocale(this.localeService?.id || dateLocale);

        this.localeService?.changes.subscribe(this.setLocale);
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
    };
}

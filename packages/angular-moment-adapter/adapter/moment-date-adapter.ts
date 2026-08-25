import { Injectable, InjectionToken, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE, KbqDateTimezoneService, KbqLocaleService } from '@koobiq/components/core';
import { MomentDateAdapter as BaseMomentDateAdapter, MomentDateAdapterOptions } from '@koobiq/moment-date-adapter';
import { Moment } from 'moment';
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
    private localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly timezoneService = inject(KbqDateTimezoneService);

    constructor() {
        const dateLocale = inject(KBQ_DATE_LOCALE, { optional: true })!;
        const options =
            inject<IKbqMomentDateAdapterOptions>(KBQ_MOMENT_DATE_ADAPTER_OPTIONS, { optional: true }) ?? undefined;

        super(dateLocale, options);
        this.options = options;

        this.setLocale(this.localeService?.id || dateLocale);

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.setLocale);
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

    override today(): Moment {
        return this.applyTimezone(super.today());
    }

    override format(date: Moment, displayFormat: string): string {
        return super.format(this.applyTimezone(date), displayFormat);
    }

    override deserialize(value: any): Moment | null {
        const date = super.deserialize(value);

        return date ? this.applyTimezone(date) : date;
    }

    override parse(value: any, parseFormat: string | string[]): Moment | null {
        const date = super.parse(value, parseFormat);

        if (!date) return null;

        // Text parsed against a display format is user input: it names wall-clock components in the active
        // zone. Everything else (ISO text, millis, Date) names an instant and must not be shifted.
        const isUserInput = typeof value === 'string' && (!!parseFormat || !!this.options?.findDateFormat);

        return this.applyTimezone(date, isUserInput);
    }

    override createDate(year: number, month?: number, date?: number): Moment {
        // Calendar components name a wall-clock date, so they are kept and only the offset changes -
        // `createDateTime` builds on this method and sets the time components afterwards, in the same zone.
        return this.applyTimezone(super.createDate(year, month, date), true);
    }

    /**
     * Moves a date into the active time zone.
     *
     * Unlike the luxon adapter, the moment one has to do this on the way in: `format()` renders whatever
     * offset the moment itself carries, and the base class builds every date in the host zone.
     *
     * `keepLocalTime` picks between the two meanings a zone change can have - converting an instant
     * (`false`, the default) or reading the same wall-clock components in another zone (`true`).
     */
    private applyTimezone(date: Moment, keepLocalTime = false): Moment {
        // The base constructor builds locale data through `createDate()` before the fields of this class
        // exist, so the very first calls run without a service and are left in the host zone.
        const offset = this.timezoneService?.offsetAt(date.valueOf()) ?? null;

        // Cloned because moment is mutable and the date may be one the application still holds.
        return offset === null ? date : date.clone().utcOffset(offset, keepLocalTime);
    }
}

import { Injectable, InjectionToken, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE, KbqDateTimezoneService, KbqLocaleService } from '@koobiq/components/core';
import { DateUnit, DurationObjectUnits, DurationUnit } from '@koobiq/date-adapter';
import { MomentDateAdapter as BaseMomentDateAdapter, MomentDateAdapterOptions } from '@koobiq/moment-date-adapter';
import { Moment } from 'moment';
import { Observable, Subject } from 'rxjs';

/** Configurable options for {@see MomentDateAdapter}. */
export type IKbqMomentDateAdapterOptions = MomentDateAdapterOptions;

/** An ISO date with no time and no offset: it names a calendar day, not an instant. */
const DATE_ONLY_ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MINUTES_PER_HOUR = 60;

/** An offset in minutes as `±HH:mm`, the form moment reads unambiguously. */
const formatOffset = (minutes: number): string => {
    const magnitude = Math.abs(minutes);
    const pad = (value: number) => `${Math.floor(value)}`.padStart(2, '0');

    return `${minutes < 0 ? '-' : '+'}${pad(magnitude / MINUTES_PER_HOUR)}:${pad(magnitude % MINUTES_PER_HOUR)}`;
};

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

    override startOf(date: Moment, unit: DateUnit): Moment {
        return this.applyTimezone(super.startOf(date, unit), true);
    }

    override addCalendarUnits(
        date: Moment,
        amountOrDurationLikeObject: number | DurationObjectUnits,
        unit?: DurationUnit
    ): Moment {
        return this.applyTimezone(super.addCalendarUnits(date, amountOrDurationLikeObject, unit), true);
    }

    override addCalendarYears(date: Moment, years: number): Moment {
        return this.applyTimezone(super.addCalendarYears(date, years), true);
    }

    override addCalendarMonths(date: Moment, months: number): Moment {
        return this.applyTimezone(super.addCalendarMonths(date, months), true);
    }

    override addCalendarDays(date: Moment, days: number): Moment {
        return this.applyTimezone(super.addCalendarDays(date, days), true);
    }

    override deserialize(value: any): Moment | null {
        const date = super.deserialize(value);

        if (!date) return date;

        return this.applyTimezone(date, this.namesWallClock(value));
    }

    override parse(value: any, parseFormat: string | string[]): Moment | null {
        const date = super.parse(value, parseFormat);

        if (!date) return null;

        // Text parsed against a display format is user input: it names wall-clock components in the active
        // zone. Everything else (ISO text, millis, Date) names an instant and must not be shifted.
        const isUserInput = typeof value === 'string' && !!parseFormat;

        return this.applyTimezone(date, isUserInput || this.namesWallClock(value));
    }

    override createDate(year: number, month?: number, date?: number): Moment {
        // Calendar components name a wall-clock date, so they are kept and only the offset changes.
        // Truncated afterwards because the base builds in the host zone, where the requested midnight may
        // not exist — a DST start at midnight moves it to 01:00 before there is anything to keep.
        return this.applyTimezone(super.createDate(year, month, date), true).startOf('day');
    }

    override createDateTime(
        year: number,
        month: number,
        date: number,
        hours: number,
        minutes: number,
        seconds: number,
        milliseconds: number
    ): Moment {
        // The base sets the time components after `createDate`, so the offset pinned at midnight can be
        // the wrong one for the resulting wall clock on the day of a transition.
        return this.applyTimezone(super.createDateTime(year, month, date, hours, minutes, seconds, milliseconds), true);
    }

    /** Whether `value` names a calendar day rather than an instant. */
    private namesWallClock(value: any): boolean {
        return typeof value === 'string' && DATE_ONLY_ISO_PATTERN.test(value);
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

        if (offset === null) return date;

        // Cloned because moment is mutable and the date may be one the application still holds. The offset
        // goes in as text: moment reads a number below 16 as hours rather than minutes.
        const shifted = date.clone().utcOffset(formatOffset(offset), keepLocalTime);

        if (!keepLocalTime) return shifted;

        // Keeping the wall clock moves the instant, which can cross a transition — the offset resolved
        // above then belongs to an instant this date no longer denotes.
        const settled = this.timezoneService?.offsetAt(shifted.valueOf()) ?? null;

        return settled === null || settled === offset ? shifted : shifted.utcOffset(formatOffset(settled), true);
    }
}

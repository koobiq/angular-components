import { getLocaleFirstDayOfWeek } from '@angular/common';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    KBQ_DATE_LOCALE,
    KBQ_DEFAULT_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqDateTimezoneService,
    KbqLocaleService,
    KbqTimezoneLike,
    kbqResolveTimezoneOffset
} from '@koobiq/components/core';
import { DateUnit } from '@koobiq/date-adapter';
import { LuxonDateAdapter as BaseLuxonDateAdapter, LuxonDateAdapterOptions } from '@koobiq/luxon-date-adapter';
import { DateTime, FixedOffsetZone, Info, Settings, Zone } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';

/** Configurable options for {@see LuxonDateAdapter}. */
export type KbqLuxonDateAdapterOptions = LuxonDateAdapterOptions;

/** An ISO date with no time and no offset: it names a calendar day, not an instant. */
const DATE_ONLY_ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** InjectionToken for moment date adapter to configure options. */
export const KBQ_LUXON_DATE_ADAPTER_OPTIONS = new InjectionToken<KbqLuxonDateAdapterOptions>(
    'KBQ_MOMENT_DATE_ADAPTER_OPTIONS',
    {
        providedIn: 'root',
        factory: KBQ_LUXON_DATE_ADAPTER_OPTIONS_FACTORY
    }
);

/** @docs-private */
export function KBQ_LUXON_DATE_ADAPTER_OPTIONS_FACTORY(): KbqLuxonDateAdapterOptions {
    return { useUtc: false };
}

@Injectable()
export class LuxonDateAdapter extends BaseLuxonDateAdapter {
    protected readonly options?: LuxonDateAdapterOptions;
    private localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly timezoneService = inject(KbqDateTimezoneService);

    /** Time zone {@link resolvedZone} was built from, so an unchanged zone is not resolved twice. */
    private appliedTimezone: KbqTimezoneLike | null = null;
    private resolvedZone: Zone | string | undefined;

    /** A stream that emits when the locale changes. */
    get localeChanges(): Observable<any> {
        return this._localeChanges;
    }

    private _localeChanges = new BehaviorSubject<string>(KBQ_DEFAULT_LOCALE_ID);

    constructor() {
        const dateLocale = inject(KBQ_DATE_LOCALE);
        const options =
            inject<LuxonDateAdapterOptions>(KBQ_LUXON_DATE_ADAPTER_OPTIONS, { optional: true }) ?? undefined;

        super(dateLocale, options);
        this.options = options;

        this.setLocale(this.localeService?.id || dateLocale);

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.setLocale);
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
                longDaysOfWeek: Info.weekdaysFormat('long', options)
            };

            this.updateLocaleData(localeData);
        }

        this._localeChanges.next(locale);
    };

    override today(): DateTime {
        this.syncTimezone();

        return super.today();
    }

    override format(date: DateTime, displayFormat: string): string {
        this.syncTimezone();

        return super.format(date, displayFormat);
    }

    override startOf(date: DateTime, unit: DateUnit): DateTime {
        const zone = this.activeZone();

        // Zoned first, truncated second: the base truncates in the date's own zone and converts only
        // afterwards, which lands on an arbitrary time whenever the two zones differ.
        return super.startOf(zone ? date.setZone(zone) : date, unit);
    }

    override deserialize(value: any): DateTime | null {
        const zone = this.activeZone();
        const date = super.deserialize(value);

        // The base implementation hands a `DateTime` input back in its own zone (it only sets the locale),
        // so a date the application built elsewhere would keep that zone, and `format()` — which does
        // reconfigure — would then disagree with `getHours()` and `daysFromToday()`, which do not.
        return date && zone ? date.setZone(zone) : date;
    }

    override parse(value: any, parseFormat?: string): DateTime | null {
        // A value parsed against a display format is user input, and a date-only ISO string names a
        // calendar day: both name wall-clock components in the active zone. Everything else (a full ISO
        // timestamp, millis, Date) names an instant and must not be shifted.
        if (typeof value === 'string' && (parseFormat || DATE_ONLY_ISO_PATTERN.test(value))) {
            return this.inActiveZone(() => super.parse(value, parseFormat));
        }

        this.syncTimezone();

        return super.parse(value, parseFormat);
    }

    // `createDateTime()` is left to the base class: it builds on this method and sets the time components
    // on the result, which by then is already in the active zone.
    override createDate(year: number, month?: number, day?: number): DateTime {
        return this.inActiveZone(() => super.createDate(year, month, day));
    }

    /**
     * Brings `dateTimeOptions.zone` — the field the base class reconfigures every date it creates, parses
     * and formats with — up to date with {@link KbqDateTimezoneService}.
     *
     * Called from every entry point rather than from an `effect()`: a pipe reading the same signal must
     * not have to rely on the order effects happen to flush in to see the new zone.
     */
    private syncTimezone(): Zone | string | undefined {
        // The base constructor builds locale data through `createDate()` before the fields of this class
        // exist, so the very first calls run without a service and are left in whatever the base set up.
        if (!this.timezoneService) return this.dateTimeOptions?.zone;

        const timezone = this.timezoneService.timezone();

        if (timezone !== this.appliedTimezone) {
            this.appliedTimezone = timezone;
            this.resolvedZone = this.toLuxonZone(timezone);
        }

        // Assigned on every call, not only when the zone changes: `setLocale()` replaces the whole
        // `dateTimeOptions` object, which would otherwise silently drop the zone applied before it.
        this.dateTimeOptions.zone = this.resolvedZone;

        return this.resolvedZone;
    }

    /**
     * The zone dates are built in when one is configured, `undefined` while {@link KBQ_DATE_TIMEZONE} is
     * left at `'system'`.
     *
     * Distinct from {@link syncTimezone}, which also reports the `'UTC'` the `useUtc` option renders in:
     * that option only ever converted instants, so it must not switch `createDate`/`parse` over to the
     * wall-clock semantics the token brings.
     */
    private activeZone(): Zone | string | undefined {
        const zone = this.syncTimezone();

        return this.timezoneService?.timezone() === 'system' ? undefined : zone;
    }

    private toLuxonZone(timezone: KbqTimezoneLike): Zone | string | undefined {
        const hostZone = this.options?.useUtc ? 'UTC' : undefined;

        if (timezone === 'system') return hostZone;

        if (typeof timezone === 'number') {
            return Number.isFinite(timezone) ? FixedOffsetZone.instance(timezone) : hostZone;
        }

        // Luxon resolves IANA names and most fixed specifiers itself, which keeps DST handling with luxon.
        const zone = Info.normalizeZone(timezone);

        if (zone.isValid) return zone;

        // What luxon rejects (GMT+05:30 and the like) still resolves through the core parser, as a fixed zone.
        const offset = kbqResolveTimezoneOffset(timezone, Date.now());

        return offset === null ? hostZone : FixedOffsetZone.instance(offset);
    }

    /**
     * Builds a date directly in the active zone.
     *
     * Calendar components name a wall-clock date: `createDate(2026, 2, 5)` is "5 March", and rendering it
     * in another zone must not turn it into 4 March, which is what converting the instant does.
     *
     * The zone is applied through `Settings.defaultZone` rather than by moving the finished date, because
     * the base builds with `DateTime.fromObject`/`fromFormat` and no zone of its own: a wall clock that
     * does not exist in the host zone — a DST start at midnight, as in `America/Santiago` — would be
     * shifted an hour before there was anything to move.
     */
    private inActiveZone<T extends DateTime | null>(build: () => T): T {
        const zone = this.activeZone();

        if (!zone) return build();

        const { defaultZone } = Settings;

        Settings.defaultZone = zone;

        try {
            return build();
        } finally {
            Settings.defaultZone = defaultZone;
        }
    }
}

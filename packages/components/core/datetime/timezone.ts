import { inject, Injectable, InjectionToken, isDevMode, Provider, signal, Signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Time zone the library renders dates in.
 *
 * Accepts an IANA name (`'Europe/Moscow'`), a fixed offset — in minutes east of UTC (`180`) or as a
 * string (`'+03:00'`, `'UTC+3'`, `'03:00:00'`) — `'utc'`, or `'system'` for the zone of the host the code
 * runs on.
 *
 * The `string & {}` arm keeps IANA names open while still offering the special values as completions.
 */
export type KbqTimezoneLike = 'system' | 'utc' | number | (string & {});

/**
 * InjectionToken for the time zone every date the library formats is rendered in.
 *
 * Read once, by the {@link KbqDateTimezoneService} constructor, out of the injector that created the
 * service — call {@link KbqDateTimezoneService.setTimezone} to change the zone afterwards. Defaults to
 * `'system'`, the zone of the host the code runs on.
 */
export const KBQ_DATE_TIMEZONE = new InjectionToken<KbqTimezoneLike>('KBQ_DATE_TIMEZONE');

const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;

/** The largest offset any zone has ever had; anything beyond it is a typo, not a zone. */
const MAX_OFFSET_HOURS = 14;
const MAX_OFFSET_MINUTES = MAX_OFFSET_HOURS * MINUTES_PER_HOUR;

/** `UTC`/`GMT` with no offset — a valid input on its own, and what `Intl` reports for zero-offset zones. */
const UTC_ALIAS_PATTERN = /^(?:utc|gmt)$/i;

/**
 * A fixed offset written with separators, with or without a `UTC`/`GMT` prefix and with or without a
 * sign: `+03:00`, `UTC+3`, `GMT+05:30`, `03:00:00`. The seconds group matches both the `timeZoneName`
 * `Intl` reports in the `longOffset` style for pre-standard-time instants (`GMT-00:44:30`) and the form
 * `KbqTimezoneZone.offset` is written in.
 */
const FIXED_OFFSET_PATTERN = /^(?:utc|gmt)?([+-])?(\d{1,2})(?::([0-5]\d)(?::([0-5]\d))?)?$/i;

/** The same offset written without separators: `-0530`. Kept apart so `+123` fails instead of backtracking. */
const COMPACT_OFFSET_PATTERN = /^(?:utc|gmt)?([+-])?(\d{2})([0-5]\d)$/i;

/** Offset in minutes east of UTC of a fixed-offset specifier, or `null` when the value is not one. */
const parseFixedOffset = (value: string): number | null => {
    if (UTC_ALIAS_PATTERN.test(value)) return 0;

    const match = COMPACT_OFFSET_PATTERN.exec(value) ?? FIXED_OFFSET_PATTERN.exec(value);

    if (!match) return null;

    const [, sign, hours, minutes = '0', seconds = '0'] = match;

    if (Number(hours) > MAX_OFFSET_HOURS) return null;

    const magnitude = Number(hours) * MINUTES_PER_HOUR + Number(minutes) + Number(seconds) / SECONDS_PER_MINUTE;

    // Rounded because both date libraries expect whole minutes; only pre-1900 zones have a seconds part.
    return (sign === '-' ? -1 : 1) * Math.round(magnitude);
};

/**
 * One `Intl.DateTimeFormat` per IANA zone: building it is the expensive part of resolving an offset, and
 * an application uses a handful of zones at most. A `null` entry marks a name `Intl` rejected, so an
 * invalid zone is reported once instead of throwing on every date.
 *
 * Bounded because the zone can come from unvalidated input — a cookie on the server, a picker in the
 * browser — and this map outlives every request in the process.
 */
const MAX_CACHED_FORMATTERS = 32;
const offsetFormatters = new Map<string, Intl.DateTimeFormat | null>();

const getOffsetFormatter = (timeZone: string): Intl.DateTimeFormat | null => {
    if (!offsetFormatters.has(timeZone)) {
        if (offsetFormatters.size >= MAX_CACHED_FORMATTERS) {
            offsetFormatters.delete(offsetFormatters.keys().next().value!);
        }

        try {
            offsetFormatters.set(timeZone, new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' }));
        } catch {
            if (isDevMode()) {
                // eslint-disable-next-line no-console
                console.warn(`Unknown time zone "${timeZone}", dates are left in the host time zone.`);
            }

            offsetFormatters.set(timeZone, null);
        }
    }

    return offsetFormatters.get(timeZone)!;
};

/**
 * Offset of `timezone` at `timestamp`, in minutes east of UTC. `null` means "leave the date in the host
 * zone" — either because `timezone` is `'system'`, or because it is a name no `Intl` implementation knows.
 *
 * Takes the instant because an IANA zone has no single offset: `'Europe/Berlin'` is +60 in January and
 * +120 in July, and one list of dates can span the change.
 */
export const kbqResolveTimezoneOffset = (timezone: KbqTimezoneLike, timestamp: number): number | null => {
    if (timezone === 'system') return null;

    // Bounded and rounded like the string form: a numeric offset comes from the same unvalidated places,
    // and neither date library reads a fractional minute or a 99-hour offset as anything sensible.
    if (typeof timezone === 'number') {
        return Number.isFinite(timezone) && Math.abs(timezone) <= MAX_OFFSET_MINUTES ? Math.round(timezone) : null;
    }

    const fixedOffset = parseFixedOffset(timezone);

    if (fixedOffset !== null) return fixedOffset;

    // An invalid date has no offset to resolve, and `Intl` throws rather than saying so.
    if (!Number.isFinite(timestamp)) return null;

    const timeZoneName = getOffsetFormatter(timezone)
        ?.formatToParts(new Date(timestamp))
        .find(({ type }) => type === 'timeZoneName')?.value;

    return timeZoneName ? parseFixedOffset(timeZoneName) : null;
};

/**
 * Holds the time zone every date the library creates, parses and formats is rendered in.
 *
 * Provided in root, so {@link KBQ_DATE_TIMEZONE} in the application providers configures the whole
 * application. To scope a zone to one subtree, list {@link kbqDateTimezoneProvider} in that component's
 * `providers` together with the date adapter and the `DateFormatter`: the adapter captures the service of
 * the injector that created it, and keeps using it.
 */
@Injectable({ providedIn: 'root' })
export class KbqDateTimezoneService {
    /** Active time zone. */
    readonly timezone: Signal<KbqTimezoneLike>;

    /**
     * Emits when the active time zone changes.
     *
     * The counterpart of `DateAdapter.localeChanges`, for the surfaces that render a date once instead of
     * through an impure pipe — the date inputs and the calendar.
     */
    readonly changes: Observable<KbqTimezoneLike>;

    private readonly _timezone = signal<KbqTimezoneLike>(inject(KBQ_DATE_TIMEZONE, { optional: true }) ?? 'system');
    private readonly _changes = new Subject<KbqTimezoneLike>();

    constructor() {
        this.timezone = this._timezone.asReadonly();
        this.changes = this._changes.asObservable();
    }

    /** Activates a time zone. */
    setTimezone(timezone: KbqTimezoneLike): void {
        this._timezone.set(timezone);
        this._changes.next(timezone);
    }

    /**
     * Offset of the active zone at `timestamp`, in minutes east of UTC, or `null` when dates are left in
     * the host zone.
     */
    offsetAt(timestamp: number): number | null {
        return kbqResolveTimezoneOffset(this._timezone(), timestamp);
    }
}

/**
 * Utility provider for the time zone dates are rendered in.
 *
 * Provides {@link KbqDateTimezoneService} alongside the token, so listing it in a component's `providers`
 * scopes the zone to that subtree instead of resolving the root service and silently doing nothing.
 *
 * @see KBQ_DATE_TIMEZONE
 */
export const kbqDateTimezoneProvider = (timezone: KbqTimezoneLike): Provider[] => [
    KbqDateTimezoneService,
    { provide: KBQ_DATE_TIMEZONE, useValue: timezone }
];

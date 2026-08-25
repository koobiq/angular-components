import { inject, Injectable, InjectionToken, isDevMode, Provider, signal, Signal } from '@angular/core';

/**
 * Time zone the library renders dates in.
 *
 * Accepts an IANA name (`'Europe/Moscow'`), a fixed offset — in minutes east of UTC (`180`) or as a
 * string (`'+03:00'`, `'UTC+3'`) — `'utc'`, or `'system'` for the zone of the host the code runs on.
 *
 * The `string & {}` arm keeps IANA names open while still offering the special values as completions.
 */
export type KbqTimezoneLike = 'system' | 'utc' | number | (string & {});

/**
 * InjectionToken for the time zone every date the library formats is rendered in.
 *
 * Read once, by the {@link KbqDateTimezoneService} constructor, out of the injector that created the
 * service — call {@link KbqDateTimezoneService.setTimezone} to change the zone afterwards. Defaults to
 * `'system'`, the zone of the host the code runs on, which is what the library did before this token.
 */
export const KBQ_DATE_TIMEZONE = new InjectionToken<KbqTimezoneLike>('KBQ_DATE_TIMEZONE');

/**
 * Utility provider for the time zone dates are rendered in.
 *
 * @see KBQ_DATE_TIMEZONE
 */
export const kbqDateTimezoneProvider = (timezone: KbqTimezoneLike): Provider => ({
    provide: KBQ_DATE_TIMEZONE,
    useValue: timezone
});

const MINUTES_PER_HOUR = 60;

/** `UTC`/`GMT` with no offset — a valid input on its own, and what `Intl` reports for zero-offset zones. */
const UTC_ALIAS_PATTERN = /^(?:utc|gmt)$/i;

/**
 * A fixed offset, with or without a `UTC`/`GMT` prefix: `+03:00`, `-0530`, `UTC+3`, `GMT+05:30`. Also
 * matches the `timeZoneName` `Intl` reports in the `longOffset` style, which is how an IANA zone is
 * resolved below.
 */
const FIXED_OFFSET_PATTERN = /^(?:utc|gmt)?([+-])(\d{1,2})(?::?(\d{2}))?$/i;

/** Offset in minutes east of UTC of a fixed-offset specifier, or `null` when the value is not one. */
const parseFixedOffset = (value: string): number | null => {
    if (UTC_ALIAS_PATTERN.test(value)) return 0;

    const match = FIXED_OFFSET_PATTERN.exec(value);

    if (!match) return null;

    const [, sign, hours, minutes = '0'] = match;

    return (sign === '-' ? -1 : 1) * (Number(hours) * MINUTES_PER_HOUR + Number(minutes));
};

/**
 * One `Intl.DateTimeFormat` per IANA zone: building it is the expensive part of resolving an offset, and
 * an application uses a handful of zones at most. A `null` entry marks a name `Intl` rejected, so an
 * invalid zone is reported once instead of throwing on every date.
 */
const offsetFormatters = new Map<string, Intl.DateTimeFormat | null>();

const getOffsetFormatter = (timeZone: string): Intl.DateTimeFormat | null => {
    if (!offsetFormatters.has(timeZone)) {
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

    if (typeof timezone === 'number') return Number.isFinite(timezone) ? timezone : null;

    const fixedOffset = parseFixedOffset(timezone);

    if (fixedOffset !== null) return fixedOffset;

    const timeZoneName = getOffsetFormatter(timezone)
        ?.formatToParts(new Date(timestamp))
        .find(({ type }) => type === 'timeZoneName')?.value;

    return timeZoneName ? parseFixedOffset(timeZoneName) : null;
};

/**
 * Holds the time zone every date the library creates, parses and formats is rendered in.
 *
 * Provided in root, so {@link KBQ_DATE_TIMEZONE} in the application providers configures the whole
 * application. To scope a zone to one subtree, list this service in that component's `providers`
 * together with {@link kbqDateTimezoneProvider}, the date adapter and the `DateFormatter`: the adapter
 * captures the service of the injector that created it, and keeps using it.
 */
@Injectable({ providedIn: 'root' })
export class KbqDateTimezoneService {
    /** Active time zone. */
    readonly timezone: Signal<KbqTimezoneLike>;

    private readonly _timezone = signal<KbqTimezoneLike>(inject(KBQ_DATE_TIMEZONE, { optional: true }) ?? 'system');

    constructor() {
        this.timezone = this._timezone.asReadonly();
    }

    /** Activates a time zone. */
    setTimezone(timezone: KbqTimezoneLike): void {
        this._timezone.set(timezone);
    }

    /**
     * Offset of the active zone at `timestamp`, in minutes east of UTC, or `null` when dates are left in
     * the host zone.
     */
    offsetAt(timestamp: number): number | null {
        return kbqResolveTimezoneOffset(this._timezone(), timestamp);
    }
}

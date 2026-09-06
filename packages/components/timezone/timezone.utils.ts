import { escapeRegExp, kbqResolveTimezoneOffset } from '@koobiq/components/core';
import { KbqTimezoneGroup, KbqTimezonesByCountry, KbqTimezoneZone } from './timezone.models';

const minusUnicode = 0x2212; // Minus Sign U+2212

const minutesPerHour = 60;

/**
 * Convert string timezone offset (formatted offset) to number (minutes)
 */
export function parseOffset(offset: string): number {
    return kbqResolveTimezoneOffset(offset, Date.now()) ?? NaN;
}

const pad = (value: number): string => `${value}`.padStart(2, '0');

/** Writes an offset in minutes east of UTC the way {@link KbqTimezoneZone.offset} is written. */
function formatOffsetMinutes(minutes: number): string {
    const absolute = Math.abs(minutes);

    return `${minutes < 0 ? '-' : ''}${pad(Math.floor(absolute / minutesPerHour))}:${pad(absolute % minutesPerHour)}:00`;
}

/** Offset of `zone` at `timestamp` in minutes east of UTC, or `NaN` when neither side resolves. */
function resolveZoneOffsetMinutes(zone: KbqTimezoneZone, timestamp: number): number {
    return kbqResolveTimezoneOffset(zone.offset || zone.id, timestamp) ?? NaN;
}

/**
 * Offset `zone` is on at `timestamp`, written the way {@link KbqTimezoneZone.offset} is, or an empty string
 * when the zone identifies neither a fixed offset nor a time zone `Intl` knows.
 *
 * A zone that carries an explicit `offset` keeps that string verbatim. A zone without one has the offset
 * resolved from its IANA `id`, which is what makes a DST zone read `UTC+01:00` in January and `UTC+02:00`
 * in July instead of whichever of the two was written into the data.
 */
export function resolveZoneOffset(zone: KbqTimezoneZone, timestamp: number = Date.now()): string {
    if (zone.offset) return zone.offset;

    const minutes = resolveZoneOffsetMinutes(zone, timestamp);

    return Number.isFinite(minutes) ? formatOffsetMinutes(minutes) : '';
}

/**
 * Groups zones by {@link KbqTimezoneZone.countryCode} — one group per country, ordered by country name,
 * with the zones inside each group ordered by {@link timezonesSortComparator}.
 *
 * Pure: the same input produces the same groups on any machine, which is what makes it safe to run on the
 * server and again in the browser. To put the user's own country first, pass the result through
 * {@link promoteCountry} or {@link collapseOtherCountries}, and read the country itself with
 * {@link kbqResolveHostCountry}.
 */
export function getZonesGroupedByCountry(data: readonly KbqTimezoneZone[]): KbqTimezoneGroup[] {
    const byCountry = data.reduce<KbqTimezonesByCountry>((result: KbqTimezonesByCountry, zone: KbqTimezoneZone) => {
        const countryCode: string = zone.countryCode.toLowerCase();

        if (!Array.isArray(result[countryCode])) {
            result[countryCode] = [];
        }

        result[countryCode].push(zone);

        return result;
    }, {});

    return Object.values(byCountry)
        .map<KbqTimezoneGroup>((zones: KbqTimezoneZone[]) => ({
            countryCode: zones[0].countryCode,
            countryName: zones[0].countryName,
            zones: [...zones].sort(timezonesSortComparator)
        }))
        .sort((first, second) => first.countryName.localeCompare(second.countryName));
}

/** Whether `group` stands for `countryCode`. Both sides are compared case-insensitively. */
function isCountry(group: KbqTimezoneGroup, countryCode: string): boolean {
    return group.countryCode?.toLowerCase() === countryCode.toLowerCase();
}

/**
 * Moves the group of `countryCode` to the front, leaving the rest in their order. Returns a new array; a
 * country the groups do not contain, or no country at all, leaves the order untouched.
 */
export function promoteCountry(
    groups: readonly KbqTimezoneGroup[],
    countryCode: string | null | undefined
): KbqTimezoneGroup[] {
    const index = countryCode ? groups.findIndex((group) => isCountry(group, countryCode)) : -1;

    if (index < 1) return [...groups];

    return [groups[index], ...groups.slice(0, index), ...groups.slice(index + 1)];
}

/**
 * Merges every group other than `countryCode` into one bucket labelled `otherCountriesLabel`, placed after
 * the country it promotes. The bucket spans countries, so its `countryCode` is `null`.
 *
 * This is the shape a world-wide list is usually rendered in: the user's own country first, everything else
 * collapsed behind one label.
 */
export function collapseOtherCountries(
    groups: readonly KbqTimezoneGroup[],
    countryCode: string | null | undefined,
    otherCountriesLabel: string
): KbqTimezoneGroup[] {
    const promoted = countryCode ? groups.find((group) => isCountry(group, countryCode)) : undefined;
    const rest: KbqTimezoneZone[] = groups
        .filter((group) => group !== promoted)
        .flatMap(({ zones }: KbqTimezoneGroup) => zones);

    return [
        ...(promoted ? [promoted] : []),
        ...(rest.length
            ? [{ countryCode: null, countryName: otherCountriesLabel, zones: rest.sort(timezonesSortComparator) }]
            : [])
    ];
}

/**
 * Country code of the zone whose `id` is the time zone of the machine this runs on, or `undefined` when
 * `data` has no row for it.
 *
 * Reads `Intl`, so the answer is the host's: on the server that is the server's zone rather than the user's,
 * and the value it produces there will not match the one the browser produces on hydration. It is kept
 * apart from the grouping for exactly that reason — call it where host-dependence is acceptable and pass
 * the result on.
 */
export function kbqResolveHostCountry(data: readonly KbqTimezoneZone[]): string | undefined {
    const hostTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return data.find((zone: KbqTimezoneZone) => zone.id === hostTimezone)?.countryCode;
}

/** Formats an `HH:MM:SS` offset as a signed `±HH:MM`, with U+2212 for the minus sign. */
export function offset(value: string): string {
    const [hours, minutes] = value.split(':');

    if (!hours || minutes === undefined) return '';

    const isPositiveOffset = /^\d$/.test(hours.charAt(0));
    const preparedHours: string = !isPositiveOffset
        ? `${String.fromCharCode(minusUnicode)}${hours.substring(1)}`
        : parseInt(hours, 10) > 0 || parseInt(minutes, 10) > 0
          ? `+${hours}`
          : hours;

    return [preparedHours, minutes].join(':');
}

/** Formats an `HH:MM:SS` offset the way the option renders it: `UTC+03:00`. */
export function offsetFormatter(value: string): string {
    return `UTC${offset(value)}`;
}

/** The same as {@link offsetFormatter}, split into the `UTC` prefix and the offset for two-column layouts. */
export function offsetFormatterAsObject(value: string): { [UTC: string]: string } {
    return { UTC: offset(value) };
}

/**
 * Comparator for timezone sorting. Orders by the offset each zone is on right now, then by city name — the
 * country cannot discriminate here, since every zone reaching this inside a group already shares one.
 *
 * A zone whose offset resolves to nothing sorts after every zone that has one, rather than as UTC.
 */
export function timezonesSortComparator(first: KbqTimezoneZone, second: KbqTimezoneZone): number {
    const timestamp = Date.now();
    const firstOffset = resolveZoneOffsetMinutes(first, timestamp);
    const secondOffset = resolveZoneOffsetMinutes(second, timestamp);
    const firstResolved = Number.isFinite(firstOffset);
    const secondResolved = Number.isFinite(secondOffset);

    if (firstResolved !== secondResolved) return firstResolved ? -1 : 1;
    if (firstResolved && firstOffset !== secondOffset) return firstOffset - secondOffset;

    return first.city.localeCompare(second.city);
}

/** A bare UTC offset: an optional sign and at least one digit, e.g. `3`, `+3`, `−05:30`. */
const UTC_OFFSET_PATTERN = /^[-—−+]?\d{1,2}(?::\d{1,2})?$/;

/**
 * Filtering timezone cities by search string. Accepts a single pattern or several (matching a
 * city if it satisfies any one of them) — patterns that look like a bare UTC offset (e.g. `+3`)
 * are ignored here, since they describe the zone rather than a city name.
 */
export function filterCitiesBySearchString(cities: string, searchPattern?: string | readonly string[]): string {
    const patterns = (Array.isArray(searchPattern) ? searchPattern : [searchPattern])
        .filter((pattern): pattern is string => typeof pattern === 'string' && pattern.length > 0)
        .filter((pattern) => !UTC_OFFSET_PATTERN.test(pattern));

    if (!patterns.length) {
        return cities;
    }

    const regex: RegExp = RegExp(`(${patterns.map(escapeRegExp).join('|')})`, 'i');

    return cities
        .split(/\s*,\s*/)
        .filter((city: string) => regex.test(city))
        .join(', ');
}

/**
 * Data for the `timezone-grouping-utils` migration.
 *
 * The timezone review split the two exported utilities that every consumer routes its data through:
 *
 * - `getZonesGroupedByCountry(data, otherCountriesLabel?, priorityCountry?)` → `getZonesGroupedByCountry(data)`.
 *   It groups by country now instead of producing "the host's country plus one Other bucket", and it no
 *   longer reads `Intl`. The old behaviour is `collapseOtherCountries(getZonesGroupedByCountry(data),
 *   priorityCountry ?? kbqResolveHostCountry(data), otherCountriesLabel)`.
 * - `timezonesSortComparator` returns the difference of the two offsets instead of the first zone's offset,
 *   and ties break on `city` rather than on `countryName`, which was always equal inside a group.
 * - `KbqTimezoneGroup.countryCode` is `string | null` — the aggregate bucket belongs to no country.
 * - `KbqTimezoneZone.offset` is optional; omitted, it is resolved from the IANA `id` at render time.
 * - `kbq-timezone-select` rejects `multiple` instead of half-rendering it.
 *
 * Warn-only. The replacement for a dropped argument is a composition whose shape depends on what the call
 * site meant by it, and neither the promotion nor the aggregate label can be derived from the call.
 */

/** Import specifier that marks a file as a timezone consumer. */
export const TIMEZONE_PACKAGE = '@koobiq/components/timezone';

/** Identifier and element shapes that mark a consumer without an import. */
export const TIMEZONE_TYPE =
    '\\bKbqTimezone\\w*\\b|\\bkbq-timezone-(?:select|option)\\b|\\bgetZonesGroupedByCountry\\b|\\btimezonesSortComparator\\b';

export interface WarnPattern {
    /** Owner of the member. The pattern is only evaluated for files that also name it. */
    anchor: string;
    /** The call sites the change breaks. */
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        anchor: TIMEZONE_TYPE,
        pattern: '\\bgetZonesGroupedByCountry\\s*\\([^)]*,',
        message:
            'getZonesGroupedByCountry now takes only the zones: the otherCountriesLabel and priorityCountry ' +
            'parameters are gone, and the function groups by country instead of producing the host country ' +
            'plus one "Other" bucket. Compose the old behaviour explicitly — ' +
            'collapseOtherCountries(getZonesGroupedByCountry(zones), priorityCountry, otherCountriesLabel) — ' +
            'and use kbqResolveHostCountry(zones) where the country used to be read from Intl.'
    },
    {
        anchor: TIMEZONE_TYPE,
        pattern: '\\bgetZonesGroupedByCountry\\s*\\(\\s*[A-Za-z_$][\\w$.]*\\s*\\)',
        message:
            'getZonesGroupedByCountry no longer reads the host time zone and no longer collapses anything: ' +
            'it returns one group per country, ordered by country name. A single-argument call used to mean ' +
            '"the host country first, everything else under \'Other\'" — write that as ' +
            "collapseOtherCountries(getZonesGroupedByCountry(zones), kbqResolveHostCountry(zones), 'Other'), " +
            'or keep the per-country grouping and pass it through promoteCountry.'
    },
    {
        anchor: TIMEZONE_TYPE,
        pattern: '\\btimezonesSortComparator\\b',
        message:
            'timezonesSortComparator returns the difference of the two offsets now — it used to return the ' +
            "first zone's offset, which is not a valid comparator, so a list of more than a couple of zones " +
            "came out in an order the engine's sort happened to produce. Ties break on city instead of on " +
            'countryName, and a zone whose offset cannot be resolved sorts last instead of as UTC.'
    },
    {
        anchor: TIMEZONE_TYPE,
        pattern: '\\.\\s*countryCode\\b',
        message:
            'KbqTimezoneGroup.countryCode is `string | null`. The bucket collapseOtherCountries produces ' +
            'spans several countries and says so with null, instead of borrowing the code of an arbitrary ' +
            'member the way the old aggregate group did.'
    },
    {
        anchor: TIMEZONE_TYPE,
        pattern: '\\.\\s*offset\\b',
        message:
            'KbqTimezoneZone.offset is optional. Omit it and the offset is resolved from the IANA id every ' +
            'time the option renders, so a zone that observes DST is labelled correctly on both sides of the ' +
            'change; a string supplied there is still rendered verbatim and never recomputed. Read it with ' +
            'resolveZoneOffset(zone) rather than directly.'
    },
    {
        anchor: TIMEZONE_TYPE,
        pattern: '\\[multiple\\]|\\.\\s*multiple\\s*=(?!=)',
        message:
            'kbq-timezone-select rejects multiple selection with an error instead of accepting it and ' +
            'rendering a trigger that shows one of the selected values. Use kbq-select for multiple selection.'
    }
];

/** Printed once per project, after the per-file reports. */
export const SUMMARY = [
    '  The two grouping helpers are pure: getZonesGroupedByCountry, promoteCountry and ' +
        'collapseOtherCountries produce the same output on any machine, and kbqResolveHostCountry is the ' +
        'one place that reads Intl. That is what makes a server-rendered list match the one the browser ' +
        'computes on hydration.',
    '  The option tooltip carries the same filtered city list the option renders, so a search no longer ' +
        'opens a hint listing the cities it has just filtered out.',
    '  UtcOffsetPipe and CitiesByFilterPipe are exported, and KbqTimezoneModule re-exports KbqOptionModule, ' +
        'so the documented usage with kbq-optgroup works from the module alone.',
    '  filterCitiesBySearchString rejoins on ", " instead of ",", so a filtered list no longer starts with ' +
        'a stray space, and its offset guard requires a digit — a lone sign or a backslash is searched for ' +
        'instead of being silently dropped.'
];

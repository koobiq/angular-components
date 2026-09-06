/** One row of the timezone list: a zone, the city it is named after and the country it belongs to. */
export interface KbqTimezoneZone {
    /** IANA time zone name, e.g. `Europe/Berlin`. Used as the form value and to resolve the offset. */
    id: string;
    /**
     * Fixed offset from UTC, written as `HH:MM:SS` with an optional leading `-` (`03:00:00`, `-02:00:00`).
     *
     * Optional, and omitting it is the safer choice: the offset is then resolved from {@link id} at render
     * time, so a zone that observes DST is labelled correctly on both sides of the change. A string
     * supplied here is rendered verbatim and never recomputed — the consumer owns keeping it current.
     */
    offset?: string;
    /** Name of the city the zone is displayed under. */
    city: string;
    /** ISO 3166-1 alpha-2 code of the country the zone belongs to. Matched case-insensitively. */
    countryCode: string;
    /** Display name of the country the zone belongs to. */
    countryName: string;
    /** Other cities in the zone, joined with `', '`. */
    cities: string;
}

/** A group of zones rendered under one label. */
export interface KbqTimezoneGroup {
    /** Label of the group: a country name, or the "other countries" label of an aggregate bucket. */
    countryName: string;
    /**
     * Country the group stands for, or `null` for an aggregate bucket that spans several countries
     * (the one `collapseOtherCountries` produces).
     */
    countryCode: string | null;
    /** Zones of the group, sorted by offset and then by city. */
    zones: KbqTimezoneZone[];
}

/** Zones bucketed by country code, the intermediate shape of the grouping utilities. */
export interface KbqTimezonesByCountry {
    [countryCode: string]: KbqTimezoneZone[];
}

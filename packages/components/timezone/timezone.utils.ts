import { KbqTimezoneGroup, KbqTimezonesByCountry, KbqTimezoneZone } from './timezone.models';

const minusUnicode = 0x2212; // Minus Sign U+2212

/**
 * Convert string timezone offset (formatted offset) to number (minutes)
 */
export function parseOffset(offset: string): number {
    const minutesPerHour = 60;
    const [hours, minutes] = offset.split(':').map((part: string) => parseInt(part, 10));

    return hours * minutesPerHour + (hours >= 0 ? minutes : minutes * -1);
}

/**
 * Grouping timezones by countries
 */
export function getZonesGroupedByCountry(
    data: KbqTimezoneZone[],
    otherCountriesLabel: string = 'Other',
    priorityCountry?: string
): KbqTimezoneGroup[] {
    const systemTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryCode: string | undefined = priorityCountry
        ? priorityCountry
        : data.find((item: KbqTimezoneZone) => item.id === systemTimezone)?.countryCode;

    // collect data by countries
    const dataByCountries: KbqTimezonesByCountry = data.reduce<KbqTimezonesByCountry>(
        (result: KbqTimezonesByCountry, zone: KbqTimezoneZone) => {
            const countryName: string =
                zone.countryCode.toLowerCase() === countryCode?.toLowerCase() ? zone.countryName : otherCountriesLabel;

            if (!Array.isArray(result[countryName])) {
                result[countryName] = [];
            }

            result[countryName].push({ ...zone, countryName });

            return result;
        },
        {}
    );

    // make data groups
    const groups: KbqTimezoneGroup[] = Object.values(dataByCountries).map<KbqTimezoneGroup>(
        (zones: KbqTimezoneZone[]) => ({
            countryCode: zones[0].countryCode,
            countryName: zones[0].countryName,
            zones: zones.sort(timezonesSortComparator)
        })
    );

    // sort by priority country
    const priorityGroupIndex = groups.findIndex(
        (group) => group.countryCode.toLowerCase() === countryCode?.toLowerCase()
    );

    if (priorityGroupIndex > -1) {
        const priorityGroup = groups[priorityGroupIndex];

        groups.splice(priorityGroupIndex, 1);
        groups.unshift(priorityGroup);
    }

    return groups;
}

export function offset(value) {
    const [hours, minutes] = value.split(':');
    const isPositiveOffset = /^\d$/.test(hours.charAt(0));
    const preparedHours: string = !isPositiveOffset
        ? `${String.fromCharCode(minusUnicode)}${hours.substring(1)}`
        : parseInt(hours, 10) > 0 || parseInt(minutes, 10) > 0
          ? `+${hours}`
          : hours;

    return [preparedHours, minutes].join(':');
}

export function offsetFormatter(value: string): string {
    return `UTC ${offset(value)}`;
}

export function offsetFormatterAsObject(value: string): { [UTC: string]: string } {
    return { UTC: offset(value) };
}

/**
 * Comparator for timezone sorting. Sort by offset and country name
 */
export function timezonesSortComparator(first: KbqTimezoneZone, second: KbqTimezoneZone): number {
    return first.offset !== second.offset
        ? parseOffset(first.offset)
        : first.countryName.localeCompare(second.countryName);
}

/**
 * Filtering timezone cities by search string
 */
export function filterCitiesBySearchString(cities: string, searchPattern?: string): string {
    const onlyUTC: boolean = /^\\?(-|—|−|\+)?(\d{1,2}:?(\d{1,2})?)?$/.test(searchPattern ?? '');

    if (!searchPattern || onlyUTC) {
        return cities;
    }

    const regex: RegExp = RegExp(`(${searchPattern})`, 'gi');

    return cities
        .split(',')
        .filter((city: string) => regex.test(city))
        .join(',');
}

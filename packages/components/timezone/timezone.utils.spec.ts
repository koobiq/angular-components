import { KbqTimezoneGroup, KbqTimezoneZone } from './timezone.models';
import {
    collapseOtherCountries,
    filterCitiesBySearchString,
    getZonesGroupedByCountry,
    kbqResolveHostCountry,
    offsetFormatter,
    parseOffset,
    promoteCountry,
    resolveZoneOffset,
    timezonesSortComparator
} from './timezone.utils';

const zone = (partial: Partial<KbqTimezoneZone> & Pick<KbqTimezoneZone, 'id' | 'city'>): KbqTimezoneZone => ({
    offset: '00:00:00',
    countryCode: 'ru',
    countryName: 'Russia',
    cities: '',
    ...partial
});

const firstTimezone = zone({ id: 'Europe/city3', offset: '03:00:00', city: 'city3', cities: 'city1, city2' });
const secondTimezone = zone({ id: 'Europe/city4', offset: '-02:00:00', city: 'city4', cities: 'city4, city5' });
const thirdTimezone = zone({
    id: 'Europe/city8',
    offset: '-02:00:00',
    city: 'city8',
    countryName: 'Russia2',
    cities: 'city9, city10'
});

/** Deliberately not offset-ordered: a comparator that ignores its second argument reorders it wrongly. */
const worldZones: KbqTimezoneZone[] = [
    zone({
        id: 'America/Los_Angeles',
        offset: '-08:00:00',
        city: 'Los Angeles',
        countryCode: 'us',
        countryName: 'USA'
    }),
    zone({ id: 'America/New_York', offset: '-05:00:00', city: 'New York', countryCode: 'us', countryName: 'USA' }),
    zone({ id: 'Europe/Moscow', offset: '03:00:00', city: 'Moscow' }),
    zone({ id: 'Europe/Berlin', offset: '01:00:00', city: 'Berlin', countryCode: 'de', countryName: 'Germany' }),
    zone({ id: 'Asia/Tokyo', offset: '09:00:00', city: 'Tokyo', countryCode: 'jp', countryName: 'Japan' }),
    zone({ id: 'Asia/Kolkata', offset: '05:30:00', city: 'Mumbai', countryCode: 'in', countryName: 'India' }),
    zone({ id: 'Europe/London', offset: '00:00:00', city: 'London', countryCode: 'gb', countryName: 'Britain' }),
    zone({ id: 'Australia/Sydney', offset: '11:00:00', city: 'Sydney', countryCode: 'au', countryName: 'Australia' })
];

describe('KbqTimezone utils', () => {
    describe('parseOffset', () => {
        it('should parse a positive offset to minutes', () => {
            expect(parseOffset('03:00:00')).toBe(180);
        });

        it('should parse a negative offset to minutes', () => {
            expect(parseOffset('-03:00:00')).toBe(-180);
        });
    });

    describe('offsetFormatter', () => {
        it('should format a positive offset as "UTC+HH:MM"', () => {
            expect(offsetFormatter('03:00:00')).toBe('UTC+03:00');
        });

        it('should format a negative offset with a minus sign', () => {
            expect(offsetFormatter('-03:00:00')).toBe('UTC−03:00');
        });

        it('should render nothing but the prefix for an offset that resolved to nothing', () => {
            expect(offsetFormatter('')).toBe('UTC');
        });
    });

    describe('resolveZoneOffset', () => {
        const berlin = zone({ id: 'Europe/Berlin', city: 'Berlin', countryCode: 'de', countryName: 'Germany' });

        it('should keep an offset the zone carries', () => {
            expect(resolveZoneOffset({ ...berlin, offset: '05:00:00' }, Date.UTC(2026, 6, 15))).toBe('05:00:00');
        });

        it('should resolve standard time from the IANA id', () => {
            expect(offsetFormatter(resolveZoneOffset({ ...berlin, offset: undefined }, Date.UTC(2026, 0, 15)))).toBe(
                'UTC+01:00'
            );
        });

        it('should resolve summer time from the IANA id', () => {
            expect(offsetFormatter(resolveZoneOffset({ ...berlin, offset: undefined }, Date.UTC(2026, 6, 15)))).toBe(
                'UTC+02:00'
            );
        });

        it('should resolve a half-hour offset', () => {
            const kolkata = zone({ id: 'Asia/Kolkata', city: 'Mumbai', countryCode: 'in', countryName: 'India' });

            expect(resolveZoneOffset({ ...kolkata, offset: undefined }, Date.UTC(2026, 0, 15))).toBe('05:30:00');
        });
    });

    describe('timezonesSortComparator', () => {
        it('should order an unsorted world-wide list by offset', () => {
            const sorted = [...worldZones].sort(timezonesSortComparator);

            expect(sorted.map(({ city }) => city)).toEqual([
                'Los Angeles',
                'New York',
                'London',
                'Berlin',
                'Moscow',
                'Mumbai',
                'Tokyo',
                'Sydney'
            ]);
        });

        it('should be antisymmetric for every pair', () => {
            for (const first of worldZones) {
                for (const second of worldZones) {
                    // The two signs have to cancel out: opposite for an ordered pair, both zero for a tie.
                    const forwards = Math.sign(timezonesSortComparator(first, second));
                    const backwards = Math.sign(timezonesSortComparator(second, first));

                    expect(`${first.city} vs ${second.city}: ${forwards + backwards}`).toBe(
                        `${first.city} vs ${second.city}: 0`
                    );
                }
            }
        });

        it('should not treat a zone at UTC as equal to every other zone', () => {
            const [london] = worldZones.filter(({ city }) => city === 'London');
            const [tokyo] = worldZones.filter(({ city }) => city === 'Tokyo');

            expect(timezonesSortComparator(london, tokyo)).toBeLessThan(0);
            expect(timezonesSortComparator(tokyo, london)).toBeGreaterThan(0);
        });

        it('should sort by offset when offsets differ', () => {
            expect(timezonesSortComparator(thirdTimezone, firstTimezone)).toBeLessThan(0);
            expect(timezonesSortComparator(firstTimezone, secondTimezone)).toBeGreaterThan(0);
        });

        it('should sort by city when offsets are equal', () => {
            expect(timezonesSortComparator(secondTimezone, thirdTimezone)).toBeLessThan(0);
            expect(timezonesSortComparator(thirdTimezone, secondTimezone)).toBeGreaterThan(0);
        });

        it('should sort a zone with an unresolvable offset last', () => {
            // `kbqResolveTimezoneOffset` reports an unknown zone once in dev mode, and the suite fails on
            // console output.
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const broken = zone({ id: 'Nowhere/Nothing', offset: 'not-an-offset', city: 'Nowhere' });

            expect(timezonesSortComparator(broken, firstTimezone)).toBeGreaterThan(0);
            expect(timezonesSortComparator(firstTimezone, broken)).toBeLessThan(0);

            warn.mockRestore();
        });
    });

    describe('getZonesGroupedByCountry', () => {
        it('should produce one group per country, ordered by country name', () => {
            const groups = getZonesGroupedByCountry(worldZones);

            expect(groups.map(({ countryName }) => countryName)).toEqual([
                'Australia',
                'Britain',
                'Germany',
                'India',
                'Japan',
                'Russia',
                'USA'
            ]);
        });

        it('should sort the zones inside a group', () => {
            const [usa] = getZonesGroupedByCountry(worldZones).filter(({ countryCode }) => countryCode === 'us');

            expect(usa.zones.map(({ city }) => city)).toEqual(['Los Angeles', 'New York']);
        });

        it('should group case-insensitively by country code', () => {
            const groups = getZonesGroupedByCountry([
                zone({ id: 'Europe/Moscow', offset: '03:00:00', city: 'Moscow', countryCode: 'RU' }),
                zone({ id: 'Asia/Omsk', offset: '06:00:00', city: 'Omsk', countryCode: 'ru' })
            ]);

            expect(groups).toHaveLength(1);
            expect(groups[0].zones).toHaveLength(2);
        });

        it('should not read the host time zone', () => {
            const dateTimeFormat = jest.spyOn(Intl, 'DateTimeFormat');

            getZonesGroupedByCountry(worldZones);

            expect(dateTimeFormat).not.toHaveBeenCalled();

            dateTimeFormat.mockRestore();
        });

        it('should not mutate the zones it is given', () => {
            const source = [firstTimezone, secondTimezone];
            const snapshot = JSON.parse(JSON.stringify(source));

            getZonesGroupedByCountry(source);

            expect(source).toEqual(snapshot);
        });
    });

    describe('promoteCountry', () => {
        const groups: KbqTimezoneGroup[] = getZonesGroupedByCountry(worldZones);

        it('should move the requested country to the front', () => {
            expect(promoteCountry(groups, 'ru')[0].countryName).toBe('Russia');
        });

        it('should keep the order of the remaining groups', () => {
            const promoted = promoteCountry(groups, 'ru');

            expect(promoted.slice(1).map(({ countryName }) => countryName)).toEqual([
                'Australia',
                'Britain',
                'Germany',
                'India',
                'Japan',
                'USA'
            ]);
        });

        it('should leave the order alone for an unknown country or none at all', () => {
            expect(promoteCountry(groups, 'zz')).toEqual(groups);
            expect(promoteCountry(groups, undefined)).toEqual(groups);
        });

        it('should return a new array rather than reorder the one it is given', () => {
            const promoted = promoteCountry(groups, 'ru');

            expect(promoted).not.toBe(groups);
            expect(groups[0].countryName).toBe('Australia');
        });
    });

    describe('collapseOtherCountries', () => {
        const collapsed = collapseOtherCountries(getZonesGroupedByCountry(worldZones), 'ru', 'Other countries');

        it('should keep the promoted country and one bucket for the rest', () => {
            expect(collapsed.map(({ countryName }) => countryName)).toEqual(['Russia', 'Other countries']);
        });

        it('should mark the aggregate bucket as belonging to no country', () => {
            expect(collapsed[1].countryCode).toBeNull();
        });

        it('should order the collapsed zones by offset', () => {
            expect(collapsed[1].zones.map(({ city }) => city)).toEqual([
                'Los Angeles',
                'New York',
                'London',
                'Berlin',
                'Mumbai',
                'Tokyo',
                'Sydney'
            ]);
        });

        it('should keep the country name of every collapsed zone', () => {
            expect(collapsed[1].zones.map(({ countryName }) => countryName)).toContain('Germany');
        });

        it('should collapse everything when no country is promoted', () => {
            const groups = collapseOtherCountries(getZonesGroupedByCountry(worldZones), undefined, 'All');

            expect(groups.map(({ countryName }) => countryName)).toEqual(['All']);
            expect(groups[0].zones).toHaveLength(worldZones.length);
        });
    });

    describe('kbqResolveHostCountry', () => {
        it('should return the country of the zone matching the host time zone', () => {
            const hostTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            expect(
                kbqResolveHostCountry([
                    zone({ id: hostTimezone, city: 'Host', countryCode: 'hz', countryName: 'Host' })
                ])
            ).toBe('hz');
        });

        it('should return undefined when the data has no row for the host time zone', () => {
            expect(kbqResolveHostCountry([zone({ id: 'Nowhere/Nothing', city: 'Nowhere' })])).toBeUndefined();
        });
    });

    describe('filterCitiesBySearchString', () => {
        const cities = 'Kaliningrad, Kazan, Kirov, Moscow';

        it('should not drop matches due to a stateful global regex lastIndex', () => {
            expect(filterCitiesBySearchString('Berlin, Bern', 'ber')).toBe('Berlin, Bern');
            expect(
                filterCitiesBySearchString('Amsterdam, Andorra, Belgrade, Berlin, Bratislava, Brussels', ['ber', 'bra'])
            ).toBe('Berlin, Bratislava');
        });

        it('should keep only cities matching a single pattern, without the separator space', () => {
            expect(filterCitiesBySearchString(cities, 'kazan')).toBe('Kazan');
        });

        it('should keep a city matching any of several patterns', () => {
            expect(filterCitiesBySearchString(cities, ['kazan', 'moscow'])).toBe('Kazan, Moscow');
        });

        it('should return all cities unchanged when the pattern is empty', () => {
            expect(filterCitiesBySearchString(cities, '')).toBe(cities);
            expect(filterCitiesBySearchString(cities)).toBe(cities);
        });

        it('should return all cities unchanged when the pattern looks like a bare UTC offset', () => {
            expect(filterCitiesBySearchString(cities, '+3')).toBe(cities);
            expect(filterCitiesBySearchString(cities, '−05:30')).toBe(cities);
        });

        it('should ignore UTC-offset-like patterns but still apply the rest', () => {
            expect(filterCitiesBySearchString(cities, ['+3', 'kazan'])).toBe('Kazan');
        });

        it('should treat a lone sign as a search pattern rather than as an offset', () => {
            expect(filterCitiesBySearchString('Baden-Baden, Kazan', '-')).toBe('Baden-Baden');
        });

        it('should treat regex special characters in the pattern literally', () => {
            expect(filterCitiesBySearchString('Foo (Bar), Baz', '(Bar)')).toBe('Foo (Bar)');
        });
    });
});

/* tslint:disable:no-magic-numbers */
import { KbqTimezoneGroup, KbqTimezoneZone } from './timezone.models';
import { getZonesGroupedByCountry, offsetFormatter, parseOffset, timezonesSortComparator } from './timezone.utils';

const firstTimezone: KbqTimezoneZone = {
    id: 'Europe/city3',
    offset: '03:00:00',
    city: 'city3',
    countryCode: 'ru',
    countryName: 'Russia',
    cities: 'city1, city2',
};
const secondTimezone: KbqTimezoneZone = {
    id: 'Europe/city4',
    offset: '-02:00:00',
    city: 'city4',
    countryCode: 'ru',
    countryName: 'Russia',
    cities: 'city4, city5',
};
const thirdTimezone: KbqTimezoneZone = {
    id: 'Europe/city8',
    offset: '-02:00:00',
    city: 'city8',
    countryCode: 'ru',
    countryName: 'Russia2',
    cities: 'city9, city10',
};

describe('KbqTimezone utils', () => {
    describe('parseOffset', () => {
        it('positive offset', () => {
            expect(parseOffset('03:00:00')).toBe(180);
        });

        it('negative offset', () => {
            expect(parseOffset('-03:00:00')).toBe(-180);
        });
    });

    describe('offsetFormatter', () => {
        it('positive offset', () => {
            expect(offsetFormatter('03:00:00')).toBe('UTC +03:00');
        });

        it('negative offset', () => {
            expect(offsetFormatter('-03:00:00')).toBe('UTC −03:00');
        });
    });

    describe('timezonesSortComparator', () => {
        it('comparing timezone', () => {
            expect(timezonesSortComparator(thirdTimezone, firstTimezone)).toBeLessThan(0);
            expect(timezonesSortComparator(firstTimezone, secondTimezone)).toBeGreaterThan(0);
            expect(timezonesSortComparator(secondTimezone, thirdTimezone)).toBeLessThan(0);
        });
    });

    describe('getZonesGroupedByCountry', () => {
        it('group timezones', () => {
            const source: KbqTimezoneZone[] = [firstTimezone, secondTimezone];
            const result: KbqTimezoneGroup[] = [
                {
                    countryCode: 'ru',
                    countryName: 'Other',
                    zones: [
                        { ...secondTimezone, countryName: 'Other' },
                        { ...firstTimezone, countryName: 'Other' },
                    ],
                },
            ];

            expect(getZonesGroupedByCountry(source)).toEqual(result);
        });
    });
});

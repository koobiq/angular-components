import { KbqTimezoneGroup, KbqTimezoneZone } from './timezone.models';
import { getZonesGroupedByCountry, offsetFormatter, parseOffset, timezonesSortComparator } from './timezone.utils';

const firstTimezone: KbqTimezoneZone = {
    id: 'Europe/city3',
    offset: '03:00:00',
    city: 'city3',
    countryCode: 'ru',
    countryName: 'Russia',
    cities: 'city1, city2'
};
const secondTimezone: KbqTimezoneZone = {
    id: 'Europe/city4',
    offset: '-02:00:00',
    city: 'city4',
    countryCode: 'ru',
    countryName: 'Russia',
    cities: 'city4, city5'
};
const thirdTimezone: KbqTimezoneZone = {
    id: 'Europe/city8',
    offset: '-02:00:00',
    city: 'city8',
    countryCode: 'ru',
    countryName: 'Russia2',
    cities: 'city9, city10'
};

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
        it('should format a positive offset as "UTC +HH:MM"', () => {
            expect(offsetFormatter('03:00:00')).toBe('UTC +03:00');
        });

        it('should format a negative offset with a minus sign', () => {
            expect(offsetFormatter('-03:00:00')).toBe('UTC −03:00');
        });
    });

    describe('timezonesSortComparator', () => {
        it('should sort by offset when offsets differ', () => {
            expect(timezonesSortComparator(thirdTimezone, firstTimezone)).toBeLessThan(0);
            expect(timezonesSortComparator(firstTimezone, secondTimezone)).toBeGreaterThan(0);
        });

        it('should sort by countryName when offsets are equal', () => {
            expect(timezonesSortComparator(secondTimezone, thirdTimezone)).toBeLessThan(0);
        });
    });

    describe('getZonesGroupedByCountry', () => {
        it('should group timezones by country', () => {
            const source: KbqTimezoneZone[] = [firstTimezone, secondTimezone];
            const result: KbqTimezoneGroup[] = [
                {
                    countryCode: 'ru',
                    countryName: 'Other',
                    zones: [
                        { ...secondTimezone, countryName: 'Other' },
                        { ...firstTimezone, countryName: 'Other' }
                    ]
                }
            ];

            expect(getZonesGroupedByCountry(source)).toEqual(result);
        });
    });
});

import { LOCALE_ID } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import {
    DateAdapter,
    KBQ_DATE_LOCALE,
    KBQ_LOCALE_SERVICE,
    kbqDateTimezoneProvider,
    KbqDateTimezoneService,
    KbqTimezoneLike
} from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { KBQ_LUXON_DATE_ADAPTER_OPTIONS, KbqLuxonDateAdapterOptions, LuxonDateAdapter } from './date-adapter';
import { LuxonDateModule } from './index';

describe('LuxonDateAdapter with KBQ_DATE_LOCALE override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [
                { provide: KBQ_DATE_LOCALE, useValue: 'es-LA' },
                { provide: KBQ_LOCALE_SERVICE, useValue: null }
            ]
        }).compileComponents();
    });

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    it('should take the default locale id from the KBQ_DATE_LOCALE injection token', () => {
        expect(adapter.format(adapter.createDate(2017, 0, 2), 'DD')).toEqual('2 ene 2017');
    });
});

describe('LuxonDateAdapter with LOCALE_ID override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [
                { provide: LOCALE_ID, useValue: 'es-LA' },
                { provide: KBQ_LOCALE_SERVICE, useValue: null }
            ]
        }).compileComponents();
    });

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    it('should cascade locale id from the LOCALE_ID injection token to KBQ_DATE_LOCALE', () => {
        expect(adapter.format(adapter.createDate(2017, 0, 2), 'DD')).toEqual('2 ene 2017');
    });
});

describe('LuxonDateAdapter with KBQ_LUXON_DATE_ADAPTER_OPTIONS override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [
                {
                    provide: KBQ_LUXON_DATE_ADAPTER_OPTIONS,
                    useValue: { useUtc: true }
                },
                { provide: KBQ_LOCALE_SERVICE, useValue: null }
            ]
        }).compileComponents();
    });

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    describe('use UTC', () => {
        it('should create date in UTC', () => {
            expect(adapter.createDate(2017).zone.isUniversal).toBe(true);
        });

        it('should create today in UTC', () => {
            expect(adapter.today().zone.isUniversal).toBe(true);
        });

        it('should parse dates to UTC', () => {
            expect(adapter.parse('1/2/2017', 'L/d/yyyy')!.zone.isUniversal).toBe(true);
        });

        it('should return UTC date when deserializing', () => {
            expect(adapter.deserialize('1985-04-12T23:20:50.52Z')!.zone.isUniversal).toBe(true);
        });

        // `useUtc` converts the instant, and keeps doing so now that `KBQ_DATE_TIMEZONE` also exists:
        // switching it to wall-clock semantics would move every date an existing application persists.
        it('should convert a created date to UTC rather than keep its calendar components', () => {
            expect(adapter.format(adapter.createDate(2017, 0, 5), 'yyyy-MM-dd HH:mm')).toBe(
                DateTime.local(2017, 1, 5).setZone('UTC').toFormat('yyyy-MM-dd HH:mm')
            );
        });
    });
});

describe('LuxonDateAdapter with KBQ_DATE_TIMEZONE override', () => {
    /** 13:00 in Moscow, 15:30 in Kolkata, 11:00 in Berlin (winter time). */
    const instant = '2026-03-05T10:00:00Z';
    const dateTimeFormat = 'yyyy-MM-dd HH:mm';

    const createAdapter = (timezone: KbqTimezoneLike, options?: KbqLuxonDateAdapterOptions): DateAdapter<DateTime> => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [
                { provide: KBQ_LOCALE_SERVICE, useValue: null },
                kbqDateTimezoneProvider(timezone),
                ...(options ? [{ provide: KBQ_LUXON_DATE_ADAPTER_OPTIONS, useValue: options }] : [])
            ]
        });

        return TestBed.inject(DateAdapter);
    };

    const formatInstant = (adapter: DateAdapter<DateTime>, value = instant): string =>
        adapter.format(adapter.deserialize(value)!, dateTimeFormat);

    it('should render dates in an IANA time zone', () => {
        expect(formatInstant(createAdapter('Asia/Kolkata'))).toBe('2026-03-05 15:30');
    });

    it('should render dates at a fixed offset given in minutes', () => {
        expect(formatInstant(createAdapter(-330))).toBe('2026-03-05 04:30');
    });

    it('should render dates at a fixed offset given as a string', () => {
        expect(formatInstant(createAdapter('+03:00'))).toBe('2026-03-05 13:00');
    });

    it('should render dates at a fixed offset luxon does not parse on its own', () => {
        expect(formatInstant(createAdapter('GMT+05:30'))).toBe('2026-03-05 15:30');
    });

    it('should render dates in UTC', () => {
        expect(formatInstant(createAdapter('utc'))).toBe('2026-03-05 10:00');
    });

    it('should follow the DST rules of an IANA zone', () => {
        const adapter = createAdapter('Europe/Berlin');

        expect(formatInstant(adapter, '2026-01-15T12:00:00Z')).toBe('2026-01-15 13:00');
        expect(formatInstant(adapter, '2026-07-15T12:00:00Z')).toBe('2026-07-15 14:00');
    });

    it('should move a date built in another zone into the active one', () => {
        const adapter = createAdapter('Asia/Kolkata');
        const utcDate = DateTime.fromISO(instant, { zone: 'UTC' });

        expect(adapter.format(adapter.deserialize(utcDate)!, dateTimeFormat)).toBe('2026-03-05 15:30');
        expect(adapter.getHours(adapter.deserialize(utcDate)!)).toBe(15);
    });

    it('should keep the calendar components of a created date', () => {
        const adapter = createAdapter('Asia/Kolkata');

        expect(adapter.format(adapter.createDate(2026, 2, 5), dateTimeFormat)).toBe('2026-03-05 00:00');
        expect(adapter.format(adapter.createDateTime(2026, 2, 5, 9, 30, 0, 0), dateTimeFormat)).toBe(
            '2026-03-05 09:30'
        );
    });

    it('should keep the components of a date parsed from user input', () => {
        const adapter = createAdapter('Asia/Kolkata');

        expect(adapter.format(adapter.parse('05.03.2026', 'dd.MM.yyyy')!, dateTimeFormat)).toBe('2026-03-05 00:00');
    });

    it('should render dates in the zone activated at runtime', () => {
        const adapter = createAdapter('utc');

        expect(formatInstant(adapter)).toBe('2026-03-05 10:00');

        TestBed.inject(KbqDateTimezoneService).setTimezone('Asia/Kolkata');

        expect(formatInstant(adapter)).toBe('2026-03-05 15:30');
    });

    it('should fall back to the host time zone when the zone is unknown', () => {
        const adapter = createAdapter('Bad/Zone');

        expect(formatInstant(adapter)).toBe(DateTime.fromISO(instant).toFormat(dateTimeFormat));
    });

    it('should take precedence over the useUtc option', () => {
        expect(formatInstant(createAdapter('Asia/Kolkata', { useUtc: true }))).toBe('2026-03-05 15:30');
    });

    it('should keep the calendar day of a date-only ISO string', () => {
        const adapter = createAdapter('Pacific/Honolulu');

        expect(adapter.format(adapter.deserialize('2026-03-05')!, 'yyyy-MM-dd')).toBe('2026-03-05');
        expect(adapter.getDate(adapter.deserialize('2026-03-05')!)).toBe(5);
    });

    it('should truncate to the start of the unit in the active zone', () => {
        const adapter = createAdapter('Asia/Kolkata');
        const utcDate = DateTime.fromISO('2026-03-05T22:00:00Z', { zone: 'UTC' });

        expect(adapter.format(adapter.startOf(utcDate, 'day'), dateTimeFormat)).toBe('2026-03-06 00:00');
    });

    it('should fall back to the host time zone when the offset is not a number', () => {
        const adapter = createAdapter(Number.NaN);

        expect(formatInstant(adapter)).toBe(DateTime.fromISO(instant).toFormat(dateTimeFormat));
    });

    it('should leave the useUtc option in charge while no zone is configured', () => {
        expect(formatInstant(createAdapter('system', { useUtc: true }))).toBe('2026-03-05 10:00');
    });
});

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
import moment, { Moment } from 'moment';

import { KBQ_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateModule } from './index';
import { IKbqMomentDateAdapterOptions, MomentDateAdapter } from './moment-date-adapter';

const JAN = 0;

describe('MomentDateAdapter with KBQ_DATE_LOCALE override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MomentDateModule],
            providers: [
                { provide: KBQ_DATE_LOCALE, useValue: 'en-US' },
                { provide: KBQ_LOCALE_SERVICE, useValue: null }
            ]
        }).compileComponents();
    });

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    it('should take the default locale id from the KBQ_DATE_LOCALE injection token', () => {
        expect(adapter.format(moment([2017, JAN, 2]), 'll')).toEqual('Jan 2, 2017');
    });
});

describe('MomentDateAdapter with LOCALE_ID override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MomentDateModule],
            providers: [
                { provide: LOCALE_ID, useValue: 'en-US' },
                { provide: KBQ_LOCALE_SERVICE, useValue: null }
            ]
        }).compileComponents();
    });

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    it('should cascade locale id from the LOCALE_ID injection token to KBQ_DATE_LOCALE', () => {
        expect(adapter.format(moment([2017, JAN, 2]), 'll')).toEqual('Jan 2, 2017');
    });
});

describe('MomentDateAdapter with KBQ_MOMENT_DATE_ADAPTER_OPTIONS override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MomentDateModule],
            providers: [
                {
                    provide: KBQ_MOMENT_DATE_ADAPTER_OPTIONS,
                    useValue: { useUtc: true }
                },
                { provide: KBQ_LOCALE_SERVICE, useValue: null }
            ]
        }).compileComponents();
    });

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    describe('use UTC', () => {
        it('should create Moment date in UTC', () => {
            expect(adapter.createDate(2017, JAN, 5).isUTC()).toBe(true);
        });

        it('should create today in UTC', () => {
            expect(adapter.today().isUTC()).toBe(true);
        });

        it('should parse dates to UTC', () => {
            expect(adapter.parse('1/2/2017', 'MM/DD/YYYY')!.isUTC()).toBe(true);
        });

        it('should return UTC date when deserializing', () => {
            expect(adapter.deserialize('1985-04-12T23:20:50.52Z')!.isUTC()).toBe(true);
        });
    });
});

describe('MomentDateAdapter with KBQ_DATE_TIMEZONE override', () => {
    /** 13:00 in Moscow, 15:30 in Kolkata, 11:00 in Berlin (winter time). */
    const instant = '2026-03-05T10:00:00Z';
    const dateTimeFormat = 'YYYY-MM-DD HH:mm';

    const createAdapter = (timezone: KbqTimezoneLike, options?: IKbqMomentDateAdapterOptions): DateAdapter<Moment> => {
        TestBed.configureTestingModule({
            imports: [MomentDateModule],
            providers: [
                { provide: KBQ_LOCALE_SERVICE, useValue: null },
                kbqDateTimezoneProvider(timezone),
                ...(options ? [{ provide: KBQ_MOMENT_DATE_ADAPTER_OPTIONS, useValue: options }] : [])
            ]
        });

        return TestBed.inject(DateAdapter);
    };

    const formatInstant = (adapter: DateAdapter<Moment>, value = instant): string =>
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

    it('should render dates at a fixed offset written in the GMT form', () => {
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
        const utcDate = moment.utc(instant);

        expect(adapter.format(adapter.deserialize(utcDate)!, dateTimeFormat)).toBe('2026-03-05 15:30');
        expect(adapter.getHours(adapter.deserialize(utcDate)!)).toBe(15);
    });

    it('should not mutate the date it is given', () => {
        const adapter = createAdapter('Asia/Kolkata');
        const utcDate = moment.utc(instant);

        adapter.deserialize(utcDate);

        expect(utcDate.format(dateTimeFormat)).toBe('2026-03-05 10:00');
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

        expect(adapter.format(adapter.parse('05.03.2026', 'DD.MM.YYYY')!, dateTimeFormat)).toBe('2026-03-05 00:00');
    });

    it('should render dates in the zone activated at runtime', () => {
        const adapter = createAdapter('utc');

        expect(formatInstant(adapter)).toBe('2026-03-05 10:00');

        TestBed.inject(KbqDateTimezoneService).setTimezone('Asia/Kolkata');

        expect(formatInstant(adapter)).toBe('2026-03-05 15:30');
    });

    it('should fall back to the host time zone when the zone is unknown', () => {
        const adapter = createAdapter('Bad/Zone');

        expect(formatInstant(adapter)).toBe(moment(instant).format(dateTimeFormat));
    });

    it('should take precedence over the useUtc option', () => {
        expect(formatInstant(createAdapter('Asia/Kolkata', { useUtc: true }))).toBe('2026-03-05 15:30');
    });

    it('should keep the calendar day of a date-only ISO string', () => {
        const adapter = createAdapter('Pacific/Honolulu');

        expect(adapter.format(adapter.deserialize('2026-03-05')!, 'YYYY-MM-DD')).toBe('2026-03-05');
        expect(adapter.getDate(adapter.deserialize('2026-03-05')!)).toBe(5);
    });

    it('should read a fixed offset below an hour as minutes', () => {
        expect(formatInstant(createAdapter(10))).toBe('2026-03-05 10:10');
    });

    it('should re-resolve the offset after calendar arithmetic crosses a transition', () => {
        const adapter = createAdapter('Europe/Berlin');
        const july = adapter.createDate(2026, 6, 1);
        const january = adapter.addCalendarMonths(july, 6);

        expect(adapter.getMonth(january)).toBe(0);
        expect(adapter.format(january, 'DD.MM.YYYY')).toBe('01.01.2027');
    });

    it('should truncate to the start of the unit in the active zone', () => {
        const adapter = createAdapter('Europe/Berlin');
        const summer = adapter.deserialize('2026-07-15T12:00:00Z')!;

        expect(adapter.format(adapter.startOf(summer, 'year'), dateTimeFormat)).toBe('2026-01-01 00:00');
    });

    it('should keep the requested time on the day of a transition', () => {
        const adapter = createAdapter('Europe/Berlin');

        expect(adapter.format(adapter.createDateTime(2026, 9, 25, 13, 0, 0, 0), 'HH:mm')).toBe('13:00');
    });

    it('should return an invalid date rather than throw on unparseable input', () => {
        const adapter = createAdapter('Asia/Kolkata');

        expect(adapter.isValid(adapter.deserialize('not a date')!)).toBe(false);
    });

    it('should fall back to the host time zone when the offset is out of range', () => {
        expect(formatInstant(createAdapter(99 * 60))).toBe(moment(instant).format(dateTimeFormat));
    });

    it('should round a fractional offset to whole minutes', () => {
        expect(formatInstant(createAdapter(330.4))).toBe('2026-03-05 15:30');
    });

    it('should leave the useUtc option in charge while no zone is configured', () => {
        expect(formatInstant(createAdapter('system', { useUtc: true }))).toBe('2026-03-05 10:00');
    });
});

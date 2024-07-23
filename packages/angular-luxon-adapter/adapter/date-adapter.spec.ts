import { LOCALE_ID } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { DateAdapter, KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KBQ_LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter } from './date-adapter';
import { LuxonDateModule } from './index';

describe('LuxonDateAdapter with KBQ_DATE_LOCALE override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [
                { provide: KBQ_DATE_LOCALE, useValue: 'es-LA' },
                { provide: KBQ_LOCALE_SERVICE, useValue: null }
            ]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    it('should take the default locale id from the KBQ_DATE_LOCALE injection token', () => {
        expect(adapter.format(adapter.createDate(2017, 0, 2), 'DD')).toEqual('2 ene 2017');
    });
});

describe('LuxonDateAdapter with LOCALE_ID override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [
                { provide: LOCALE_ID, useValue: 'es-LA' },
                { provide: KBQ_LOCALE_SERVICE, useValue: null }
            ]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    it('should cascade locale id from the LOCALE_ID injection token to KBQ_DATE_LOCALE', () => {
        expect(adapter.format(adapter.createDate(2017, 0, 2), 'DD')).toEqual('2 ene 2017');
    });
});

describe('LuxonDateAdapter with KBQ_LUXON_DATE_ADAPTER_OPTIONS override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(waitForAsync(() => {
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
    }));

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
    });
});

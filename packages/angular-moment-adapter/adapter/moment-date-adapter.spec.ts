// tslint:disable:no-magic-numbers
import { LOCALE_ID } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import {
    DateAdapter,
    KBQ_DATE_LOCALE,
    KBQ_LOCALE_SERVICE
} from '@koobiq/components/core';
import moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports

import { KBQ_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateModule } from './index';
import { MomentDateAdapter } from './moment-date-adapter';


// tslint:disable:one-variable-per-declaration
const JAN = 0;

describe('MomentDateAdapter with KBQ_DATE_LOCALE override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
           imports: [ MomentDateModule ],
           providers: [
               { provide: KBQ_DATE_LOCALE, useValue: 'ja-JP' },
               { provide: KBQ_LOCALE_SERVICE, useValue: null }
           ]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    it('should take the default locale id from the KBQ_DATE_LOCALE injection token', () => {
        expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2017年1月2日');
    });
});

describe('MomentDateAdapter with LOCALE_ID override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
           imports: [MomentDateModule],
           providers: [
               { provide: LOCALE_ID, useValue: 'fr' },
               { provide: KBQ_LOCALE_SERVICE, useValue: null }
           ]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    it('should cascade locale id from the LOCALE_ID injection token to KBQ_DATE_LOCALE', () => {
        expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2 janv. 2017');
    });
});

describe('MomentDateAdapter with KBQ_MOMENT_DATE_ADAPTER_OPTIONS override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(waitForAsync(() => {
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
    }));

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

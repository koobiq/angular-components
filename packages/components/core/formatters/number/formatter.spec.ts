import { fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import {
    KBQ_LOCALE_DATA,
    KBQ_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule,
    KbqLocaleService,
    KbqRoundDecimalPipe,
} from '@koobiq/components/core';

// tslint:disable:no-magic-numbers
describe('KbqRoundDecimalPipe', () => {
    let pipe: KbqRoundDecimalPipe;
    let localeService: KbqLocaleService;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqFormattersModule],
            providers: [
                { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService, deps: [KBQ_LOCALE_ID, KBQ_LOCALE_DATA] },
            ],
        }).compileComponents();

        pipe = TestBed.inject(KbqRoundDecimalPipe);
        localeService = TestBed.inject(KBQ_LOCALE_SERVICE);
    }));

    it('should round number', () => {
        const tenThousand = 10000;

        expect(pipe.transform(tenThousand)).toBe('10 К');
    });

    it('should switch rounding options with localization change', fakeAsync(() => {
        const tenThousand = 10000;

        const roundedWithDefaultLocale = pipe.transform(tenThousand);

        localeService.setLocale('en-US');
        flush();

        expect(pipe.transform(tenThousand)).not.toEqual(roundedWithDefaultLocale);
        expect(pipe.transform(tenThousand)).toBe('10K');
    }));

    it('should divide correctly for zh-CN localized dividers', fakeAsync(() => {
        const tenThousand = 10000;
        const million = 1e6;
        const oneHundredMillions = million * 100;
        const trillion = 1e12;

        localeService.setLocale('zh-CN');
        flush();

        expect(pipe.transform(tenThousand)).toBe('1.0 万');
        expect(pipe.transform(million)).toBe('100.0 万');
        expect(pipe.transform(million * 10)).toBe('1000.0 万');
        expect(pipe.transform(oneHundredMillions)).toBe('1.0 亿');
        expect(pipe.transform(trillion)).toBe('1.0 兆');
    }));

    it('should handle intervals in latin numbers', fakeAsync(() => {
        localeService.setLocale('en-US');
        flush();

        const betweenOneAndThousand = 152;
        const betweenThousandAndTenThousand = 1515;
        const betweenThousandAndTenThousandRounded = 2049;
        const betweenTenThousandAndMillion = 152352;
        const betweenMillionAndAndTenMillion = 1.034 * 1e6;
        const betweenTenMillionsAndBillion = 10.434 * 1e6;

        expect(pipe.transform(betweenOneAndThousand)).toEqual('152');
        expect(pipe.transform(betweenThousandAndTenThousand)).toEqual('2K');
        expect(pipe.transform(betweenTenThousandAndMillion)).toEqual('152K');
        expect(pipe.transform(betweenMillionAndAndTenMillion)).toEqual('1.0M');
        expect(pipe.transform(betweenTenMillionsAndBillion)).toEqual('10M');

        ['ru-RU', 'en-US', 'es-LA', 'pt-BR'].forEach((locale) => {
            localeService.setLocale(locale);
            flush();

            const units = [
                localeService.current.formatters.number.rounding.separator,
                localeService.current.formatters.number.rounding.thousand,
                localeService.current.formatters.number.rounding.million,
                localeService.current.formatters.number.rounding.billion,
                localeService.current.formatters.number.rounding.trillion,
            ];

            expect(pipe.transform(betweenOneAndThousand))
                .withContext(locale)
                .toEqual(betweenOneAndThousand.toLocaleString(locale));

            const isNumberWithFraction =
                !units.includes(pipe.transform(betweenThousandAndTenThousandRounded)[1]) &&
                Number.isNaN(+pipe.transform(betweenThousandAndTenThousandRounded)[1]);
            expect(isNumberWithFraction).withContext(locale).toBeTruthy();

            expect(units.includes(pipe.transform(betweenTenThousandAndMillion)[3]))
                .withContext(locale)
                .toBeTruthy();

            expect(!units.includes(pipe.transform(betweenMillionAndAndTenMillion)[1]))
                .withContext(locale)
                .toBeTruthy();

            expect(units.includes(pipe.transform(betweenTenMillionsAndBillion)[2]))
                .withContext(locale)
                .toBeTruthy();
        });
    }));

    /*
     * 2 * 10^3 - number in the interval of [1500...2500)
     * 2,0 * 10^3 - number in the interval of [1950...2050)
     */
    it('should handle 2k and 2,0k case', fakeAsync(() => {
        localeService.setLocale('en-US');
        flush();

        expect(pipe.transform(1051)).toBe('1K');
        expect(pipe.transform(1499)).toBe('1K');
        expect(pipe.transform(1515)).toBe('2K');
        expect(pipe.transform(2015)).toBe('2.0K');

        expect(pipe.transform(2800)).toBe('3K');
        expect(pipe.transform(1750)).toBe('2K');
    }));
});

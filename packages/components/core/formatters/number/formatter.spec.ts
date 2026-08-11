import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import {
    KBQ_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqDecimalPipe,
    KbqFormattersModule,
    KbqLocaleService,
    KbqRoundDecimalPipe
} from '@koobiq/components/core';
import fc from 'fast-check';

describe('KbqRoundDecimalPipe', () => {
    let pipe: KbqRoundDecimalPipe;
    let localeService: KbqLocaleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqFormattersModule],
            providers: [
                { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
            ]
        }).compileComponents();

        pipe = TestBed.inject(KbqRoundDecimalPipe);
        localeService = TestBed.inject(KBQ_LOCALE_SERVICE);
    });

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
                localeService.current.formatters.number.rounding.trillion
            ];

            expect(pipe.transform(betweenOneAndThousand)).toEqual(betweenOneAndThousand.toLocaleString(locale));

            const isNumberWithFraction =
                !units.includes(pipe.transform(betweenThousandAndTenThousandRounded)[1]) &&
                Number.isNaN(+pipe.transform(betweenThousandAndTenThousandRounded)[1]);

            expect(isNumberWithFraction).toBeTruthy();

            expect(units.includes(pipe.transform(betweenTenThousandAndMillion)[3])).toBeTruthy();

            expect(!units.includes(pipe.transform(betweenMillionAndAndTenMillion)[1])).toBeTruthy();

            expect(units.includes(pipe.transform(betweenTenMillionsAndBillion)[2])).toBeTruthy();
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

// `digitsInfo` is a small language parsed with a regular expression, and the pipe is public API that
// applications hand user-controlled values to. These properties cover both halves of that contract:
// a well-formed spec has to be accepted and honoured for any value, and a malformed one has to be
// rejected loudly rather than silently formatted with the defaults.
describe(`${KbqDecimalPipe.name} property-based`, () => {
    let pipe: KbqDecimalPipe;

    // The grammar as documented on `transform`: `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`,
    // followed by an optional `-{useGrouping}` flag. It is spelled out here instead of being derived from
    // the parser's own regexp: a test that asked the regexp what counts as malformed would broaden in
    // lockstep with an accidentally broadened parser and never fail. Digit counts are kept small so that
    // `Intl.NumberFormat` accepts every generated spec.
    const wellFormedDigitsInfo = fc
        .record({
            minIntegerDigits: fc.integer({ min: 1, max: 5 }),
            minFractionDigits: fc.integer({ min: 0, max: 5 }),
            extraFractionDigits: fc.integer({ min: 0, max: 5 }),
            useGrouping: fc.option(fc.boolean(), { nil: undefined })
        })
        .map(({ minIntegerDigits, minFractionDigits, extraFractionDigits, useGrouping }) => {
            const spec = `${minIntegerDigits}.${minFractionDigits}-${minFractionDigits + extraFractionDigits}`;

            return useGrouping === undefined ? spec : `${spec}-${useGrouping}`;
        });

    // Each mutation breaks exactly one rule of that grammar, so the result is malformed according to the
    // documentation rather than according to the implementation.
    const malformations: ((spec: string) => string)[] = [
        // the `.` separator is mandatory...
        (spec) => spec.replace('.', ''),
        // ...and occurs exactly once
        (spec) => spec.replace('.', '..'),
        // digit counts are unsigned integers, written without a sign, surrounding space or letters
        (spec) => `-${spec}`,
        (spec) => ` ${spec}`,
        (spec) => spec.replace(/\d/, '$&x'),
        // the range separator needs an upper bound after it
        (spec) => `${spec}-`,
        // the grouping flag is spelled `true` or `false`
        (spec) => `${spec}-yes`
    ];

    const malformedDigitsInfo = fc.oneof(
        fc.tuple(wellFormedDigitsInfo, fc.constantFrom(...malformations)).map(([spec, mutate]) => mutate(spec)),
        // Free-form strings keep their turn, characterised independently of the parser as well: with no
        // separator in it, a non-empty string cannot be a spec.
        fc.string({ minLength: 1 }).filter((value) => !value.includes('.'))
    );

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqFormattersModule],
            providers: [{ provide: KBQ_LOCALE_ID, useValue: 'en-US' }]
        }).compileComponents();

        pipe = TestBed.inject(KbqDecimalPipe);
    });

    it('should honour the fraction digit bounds given in digitsInfo', () => {
        fc.assert(
            fc.property(
                fc.double({ min: -1e15, max: 1e15, noNaN: true }),
                fc.integer({ min: 0, max: 5 }),
                fc.integer({ min: 0, max: 5 }),
                (value, minFractionDigits, extraDigits) => {
                    const maxFractionDigits = minFractionDigits + extraDigits;
                    const formatted = pipe.transform(value, `1.${minFractionDigits}-${maxFractionDigits}`, 'en-US');
                    // en-US groups with ',' and separates the fraction with '.', so this split is
                    // unambiguous. It would not be for a locale that uses '.' as the group separator,
                    // which is why the locale is pinned rather than generated.
                    const fraction = formatted?.split('.')[1] ?? '';

                    expect(fraction.length).toBeGreaterThanOrEqual(minFractionDigits);
                    expect(fraction.length).toBeLessThanOrEqual(maxFractionDigits);
                }
            )
        );
    });

    // Guards the property below: the malformed specs are built by breaking a well-formed one, which only
    // means anything for as long as the well-formed ones are themselves accepted.
    it('should accept every digitsInfo the documented grammar allows', () => {
        fc.assert(
            fc.property(wellFormedDigitsInfo, (digitsInfo) => {
                expect(() => pipe.transform(1234.5678, digitsInfo, 'en-US')).not.toThrow();
            })
        );
    });

    it('should reject a malformed digitsInfo instead of falling back to the defaults', () => {
        fc.assert(
            fc.property(malformedDigitsInfo, (digitsInfo) => {
                // Matching on the parser's own message, so that a spec slipping through to `Intl` and
                // failing there for an unrelated reason does not read as a rejection.
                expect(() => pipe.transform(1234.5678, digitsInfo, 'en-US')).toThrow('is not a valid digit info');
            })
        );
    });
});

import { inject, TestBed } from '@angular/core/testing';
import {
    KBQ_INVALID_VALUE_ERROR,
    KBQ_LOCALE_ID,
    KBQ_SIZE_UNITS_CONFIG,
    KbqDataSizePipe,
    KbqDecimalPipe,
    KbqFormattersModule,
    KbqLocaleService,
    KbqLocaleServiceModule,
    KbqSizeUnitsConfig,
    ruRUFormattersData
} from '@koobiq/components/core';
import fc from 'fast-check';
import { KBQ_SIZE_UNITS_DEFAULT_CONFIG, KbqMeasurementSystem, KbqUnitSystem } from './config';
import { getFormattedSizeParts, getHumanizedBytes } from './size';

describe('Filesize formatter', () => {
    describe(getHumanizedBytes.name, () => {
        it('SI unit system', () => {
            const raw = 1000000; // 1*1000*1000
            const expectedResult = 1;
            const expectedUnit = 'MB';

            const { result, unit } = getHumanizedBytes(
                raw,
                KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.SI]
            );

            expect(result).toBe(expectedResult);
            expect(unit).toBe(expectedUnit);
        });

        it('IEC unit system', () => {
            const raw = 1048576; // 1*1024*1024
            const expectedResult = 1;
            const expectedUnit = 'MiB';

            const { result, unit } = getHumanizedBytes(
                raw,
                KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.IEC]
            );

            expect(result).toBe(expectedResult);
            expect(unit).toBe(expectedUnit);
        });

        it('with threshold', () => {
            const raw = 1048576; // 1*1024*1024
            const expectedResult = 1024; // 1024 KiB
            const threshold = 10000; // 1024 KiB
            const expectedUnit = 'KiB';

            const { result, unit } = getHumanizedBytes(
                raw,
                KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.IEC],
                threshold
            );

            expect(result).toBe(expectedResult);
            expect(unit).toBe(expectedUnit);
        });

        it.each([
            ['NaN', NaN],
            ['Infinity', Infinity],
            ['-Infinity', -Infinity]
        ])('should throw for a value that is %s', (_, value) => {
            const wrapper = () =>
                getHumanizedBytes(value, KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.IEC]);

            expect(wrapper).toThrow(KBQ_INVALID_VALUE_ERROR);
        });
    });

    describe(getFormattedSizeParts.name, () => {
        const raw = 53094588; // 50.63 MiB
        const selectedUnitSystem = KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.IEC];

        it('should format value to locale-independent numeric string', () => {
            const { value } = getFormattedSizeParts(raw, selectedUnitSystem);

            expect(value).toMatchSnapshot();
        });

        it('should format value to selected unit system', () => {
            const selectedUnitSystem = KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.SI];

            const { value } = getFormattedSizeParts(raw, selectedUnitSystem);

            expect(value).toMatchSnapshot();
        });
    });

    // Property-based tests: the cases above pin down specific inputs, these state invariants and let
    // fast-check search for a counterexample across the whole numeric range. The bug class they exist
    // to catch is the one that keeps showing up in the dependency advisories this repository tracks —
    // an input nobody wrote a test for driving a loop that never terminates or a value that is not a
    // number any more. `getHumanizedBytes` is the natural place to start: it is pure, it takes an
    // unbounded double, and it loops.
    //
    // On failure fast-check shrinks the input to the smallest reproducing value and prints the seed;
    // re-run a specific failure with `fc.assert(..., { seed: <seed>, path: '<path>' })`.
    describe('property-based', () => {
        const systems = [
            KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.SI],
            KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.IEC]
        ];
        const anySystem = fc.constantFrom(...systems);
        const stepOf = (system: KbqUnitSystem, unit: string) => system.abbreviations.indexOf(unit);
        const largestScale = (system: KbqUnitSystem) =>
            Math.pow(Math.pow(system.base, system.power), system.abbreviations.length - 1);
        // Explicit finite bounds are what keeps ±Infinity out; noNaN covers the remaining non-finite
        // value. All three are the documented throw case, asserted by `should throw for a value that
        // is ...` above, so the properties here only have to hold over finite input.
        const anyByteCount = fc.double({ min: 0, max: Number.MAX_VALUE, noNaN: true });
        // Same range, minus the topmost unit step, for the one property that has to scale the result
        // back up: `Number.MAX_VALUE / 1e12 * 1e12` overflows to `Infinity`, so within one step of the
        // top of the double range that check cannot represent its own inverse. `getHumanizedBytes`
        // itself only ever divides and stays exact there — the properties around it still cover it.
        const scalableByteCount = fc.double({
            min: 0,
            max: Number.MAX_VALUE / Math.max(...systems.map(largestScale)),
            noNaN: true
        });

        it('should return a finite value and a unit belonging to the system', () => {
            fc.assert(
                fc.property(anyByteCount, anySystem, (value, system) => {
                    const { result, unit } = getHumanizedBytes(value, system);

                    expect(Number.isFinite(result)).toBe(true);
                    expect(system.abbreviations).toContain(unit);
                })
            );
        });

        it('should preserve the input once the result is scaled back by its unit', () => {
            fc.assert(
                fc.property(scalableByteCount, anySystem, (value, system) => {
                    const { result, unit } = getHumanizedBytes(value, system);
                    const restored = result * Math.pow(Math.pow(system.base, system.power), stepOf(system, unit));

                    // Relative, not absolute: the value spans the whole double range, so a fixed
                    // epsilon would be meaningless at both ends.
                    expect(Math.abs(restored - value)).toBeLessThanOrEqual(Math.abs(value) * 1e-9);
                })
            );
        });

        it('should never pick a smaller unit for a larger byte count', () => {
            fc.assert(
                fc.property(anyByteCount, anyByteCount, anySystem, (a, b, system) => {
                    const [smaller, larger] = a <= b ? [a, b] : [b, a];

                    expect(stepOf(system, getHumanizedBytes(smaller, system).unit)).toBeLessThanOrEqual(
                        stepOf(system, getHumanizedBytes(larger, system).unit)
                    );
                })
            );
        });
    });

    describe(KbqDataSizePipe.name, () => {
        let pipe: KbqDataSizePipe;
        let localeService: KbqLocaleService;

        describe('core', () => {
            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [KbqFormattersModule, KbqLocaleServiceModule],
                    providers: [
                        KbqDataSizePipe,
                        { provide: KBQ_LOCALE_ID, useValue: 'en-US' }
                    ]
                }).compileComponents();
            });

            beforeEach(inject([KbqDataSizePipe, KbqLocaleService], (p: KbqDataSizePipe, l: KbqLocaleService) => {
                pipe = p;
                localeService = l;
            }));

            it('should transform bytes using default config and locale', () => {
                const result = pipe.transform(1500);

                expect(result).toContain('1.5');
                expect(result).toContain(
                    KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KBQ_SIZE_UNITS_DEFAULT_CONFIG.defaultUnitSystem]
                        .abbreviations[1]
                );
            });

            it('should throw error for null source', () => {
                const wrapper = () => pipe.transform(null as any);

                expect(wrapper).toThrow(KBQ_INVALID_VALUE_ERROR);
            });

            it('should apply a specific locale if passed', () => {
                const selectedLocale = 'ru-RU';
                const result = pipe.transform(1500, 2, KbqMeasurementSystem.SI, 'ru-RU');

                expect(result).toContain('1,5');
                expect(result).toContain(
                    ruRUFormattersData.sizeUnits.unitSystems[KbqMeasurementSystem.SI].abbreviations[1]
                );
                expect(localeService.id).not.toEqual(selectedLocale);
            });

            it('should fall back to the active config for a locale that was never registered', () => {
                // The 4th parameter takes any string, and an id nobody registered has no entry to read at all.
                expect(localeService.locales['en-GB']).toBeUndefined();

                expect(() => pipe.transform(1500, 1, KbqMeasurementSystem.SI, 'en-GB')).not.toThrow();
            });
        });

        describe('with localeService is not provided', () => {
            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [KbqFormattersModule],
                    providers: [KbqDataSizePipe]
                }).compileComponents();
            });

            beforeEach(inject([KbqDataSizePipe], (p: KbqDataSizePipe) => (pipe = p)));

            it('should fallback to default config if localeService not provided', () => {
                const result = pipe.transform(1500);

                expect(result).toContain('1,5');
                expect(result).toContain(
                    KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KBQ_SIZE_UNITS_DEFAULT_CONFIG.defaultUnitSystem]
                        .abbreviations[1]
                );
            });
        });

        describe('with externalConfig provided', () => {
            const externalConfig: KbqSizeUnitsConfig = {
                defaultUnitSystem: KbqMeasurementSystem.SI,
                defaultPrecision: 3,
                unitSystems: {
                    SI: {
                        abbreviations: ['BTEST', 'KBTEST', 'MBTEST', 'GBTEST', 'TBTEST'],
                        base: 10,
                        power: 3
                    },
                    IEC: {
                        abbreviations: ['BTEST', 'KiBTEST', 'MiBTEST', 'GiBTEST', 'TiBTEST'],
                        base: 2,
                        power: 10
                    }
                }
            };

            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [KbqFormattersModule],
                    providers: [
                        KbqDataSizePipe,
                        {
                            provide: KBQ_SIZE_UNITS_CONFIG,
                            useValue: externalConfig
                        }
                    ]
                }).compileComponents();
            });

            beforeEach(inject([KbqDataSizePipe], (p: KbqDataSizePipe) => (pipe = p)));

            it('should prioritize external config over localeService', () => {
                const result = pipe.transform(1500);
                const resAbbreviation = externalConfig.unitSystems[externalConfig.defaultUnitSystem].abbreviations[1];
                const localizedConfig: KbqSizeUnitsConfig = localeService.getParams('sizeUnits');

                expect(result).toContain('1,5');
                expect(result).toContain(resAbbreviation);

                expect(resAbbreviation).not.toEqual(
                    localizedConfig.unitSystems[localizedConfig.defaultUnitSystem].abbreviations[1]
                );
            });
        });

        describe('with numberPipe is not provided', () => {
            beforeEach(() => {
                TestBed.configureTestingModule({
                    providers: [
                        KbqDataSizePipe,
                        { provide: KbqDecimalPipe, useValue: null }
                    ]
                }).compileComponents();
            });

            beforeEach(inject([KbqDataSizePipe], (p: KbqDataSizePipe) => (pipe = p)));

            it('should fallback to default config if localeService not provided', () => {
                const result = pipe.transform(1500);
                const { value, unit } = getFormattedSizeParts(
                    1500,
                    KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.SI]
                );

                expect(result).toContain(value);
                expect(result).toContain(unit);
            });
        });
    });
});

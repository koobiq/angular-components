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
import { KBQ_SIZE_UNITS_DEFAULT_CONFIG, KbqMeasurementSystem } from './config';
import { formatDataSize, getFormattedSizeParts, getHumanizedBytes } from './size';

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
    });

    it(formatDataSize.name, () => {
        const raw = 53094588; // 50.63 MiB
        const precision = 2;
        const expected = '50,63';

        const { value } = formatDataSize(
            raw,
            precision,
            KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[KbqMeasurementSystem.IEC]
        );

        expect(value).toBe(expected);
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

    describe(KbqDataSizePipe.name, () => {
        let pipe: KbqDataSizePipe;
        let localeService: KbqLocaleService;

        describe('core', () => {
            beforeEach(() => {
                TestBed.configureTestingModule({
                    imports: [KbqFormattersModule, KbqLocaleServiceModule],
                    providers: [
                        KbqDataSizePipe,
                        { provide: KBQ_LOCALE_ID, useValue: 'en-US' }]
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
                        { provide: KbqDecimalPipe, useValue: null }]
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

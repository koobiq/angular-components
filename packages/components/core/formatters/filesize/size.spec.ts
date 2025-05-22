import { KBQ_SIZE_UNITS_DEFAULT_CONFIG, MeasurementSystem } from './config';
import { formatDataSize, getHumanizedBytes } from './size';

describe('Format utils', () => {
    it('getHumanizedBytes: SI unit system', () => {
        const raw = 1000000; // 1*1000*1000
        const expectedResult = 1;
        const expectedUnit = 'MB';

        const { result, unit } = getHumanizedBytes(
            raw,
            KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[MeasurementSystem.SI]
        );

        expect(result).toBe(expectedResult);
        expect(unit).toBe(expectedUnit);
    });

    it('getHumanizedBytes: IEC unit system', () => {
        const raw = 1048576; // 1*1024*1024
        const expectedResult = 1;
        const expectedUnit = 'MiB';

        const { result, unit } = getHumanizedBytes(
            raw,
            KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[MeasurementSystem.IEC]
        );

        expect(result).toBe(expectedResult);
        expect(unit).toBe(expectedUnit);
    });

    it('getHumanizedBytes: with threshold', () => {
        const raw = 1048576; // 1*1024*1024
        const expectedResult = 1024; // 1024 KiB
        const threshold = 10000; // 1024 KiB
        const expectedUnit = 'KiB';

        const { result, unit } = getHumanizedBytes(
            raw,
            KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[MeasurementSystem.IEC],
            threshold
        );

        expect(result).toBe(expectedResult);
        expect(unit).toBe(expectedUnit);
    });

    it('formatDataSize', () => {
        const raw = 53094588; // 50.63 MiB
        const precision = 2;
        const expected = '50,63';

        const { value } = formatDataSize(
            raw,
            precision,
            KBQ_SIZE_UNITS_DEFAULT_CONFIG.unitSystems[MeasurementSystem.IEC]
        );

        expect(value).toBe(expected);
    });
});

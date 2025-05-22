import { KbqUnitSystem } from './config';

/**
 * Formats bytes into human-readable size (e.g. "1,23 MB").
 * Uses specified precision and unit system (SI/IEC).
 *
 * @param value - size in bytes.
 * @param precision - decimal places to round to (e.g., `2` → "1,02 KB").
 * @param system - unit system  defining abbreviations and base scaling.
 * @returns Object with the formatted size info.
 *
 * @example
 * formatDataSize(1500, 2, 'SI'); // { value: "1,50", unit: "KB" }
 */
export const formatDataSize = (
    value: number,
    precision: number,
    system: KbqUnitSystem
): { value: string; unit: string } => {
    const { result, unit } = getHumanizedBytes(value, system);
    let volume: string;

    if (system.abbreviations[0] === unit) {
        volume = result.toString(); // No precision for bytes (e.g., "512 B")
    } else {
        volume = result.toFixed(precision).replace(/\./g, ',');
    }

    return {
        value: volume,
        unit
    };
};

/**
 * Converts bytes to Kb, Mb, Gb
 *
 * @param value the number of bytes
 * @param system the measurement system
 * @param threshold the lower counting threshold
 */
export const getHumanizedBytes = (
    value: number,
    system: KbqUnitSystem,
    threshold?: number
): { result: number; unit: string } => {
    if (!Number.isFinite(value)) {
        throw new Error('Argument "value" must be number!');
    }

    const calculatedThreshold = Number.isFinite(threshold) ? threshold : Math.pow(system.base, system.power);
    const orderOfMagnitude: number = Math.pow(system.base, system.power);

    let result: number = value;
    let step = 0;
    const len: number = system.abbreviations.length - 1;

    while (step < len) {
        if (calculatedThreshold !== undefined && result < calculatedThreshold) {
            break;
        }

        step++;
        result = value / Math.pow(orderOfMagnitude, step);
    }

    return {
        result,
        unit: system.abbreviations[step]
    };
};

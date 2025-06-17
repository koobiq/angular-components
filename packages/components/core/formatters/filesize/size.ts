import { KbqUnitSystem } from './config';

export const KBQ_INVALID_VALUE_ERROR = 'Argument "value" must be a finite number!';

/**
 * @deprecated Will be removed in next major release. Use `getFormattedSizeParts` instead.
 * @docs-private
 */
export const formatDataSize = (
    value: number,
    precision: number,
    system: KbqUnitSystem
): { value: string; unit: string } => {
    const { result, unit } = getHumanizedBytes(value, system);
    let volume: string;

    if (system.abbreviations[0] === unit) {
        volume = result.toString();
    } else {
        volume = result.toFixed(precision).replace(/\./g, ',');
    }

    return {
        value: volume,
        unit
    };
};

/**
 * Converts a byte value into locale-independent file size parts: numeric value and unit abbreviation.
 *
 * @param value - size in bytes.
 * @param system - unit system defining abbreviations and base scaling (SI/IEC).
 * @returns Object with the formatted size info.
 *
 * @example
 * getFormattedSizeParts(1500, 2, 'SI'); // { value: "1.50", unit: "KB" }
 */
export function getFormattedSizeParts(value: number, system: KbqUnitSystem): { value: string; unit: string };
/**
 * Converts a byte value into locale-independent file size parts: numeric value and unit abbreviation.
 *
 * @param value - size in bytes.
 * @param _precision param is deprecated, use `Intl.NumberFormat` rounding options instead.
 * @param system - unit system defining abbreviations and base scaling (SI/IEC).
 * @returns Object with the formatted size info.
 * @deprecated `_precision` - this param will be remove in next major version.
 * @TODO remove deprecated (#DS-3849).
 *
 * @example
 * getFormattedSizeParts(1500, 2, 'SI'); // { value: "1.50", unit: "KB" }
 */
export function getFormattedSizeParts(
    value: number,
    _precision: number,
    system: KbqUnitSystem
): { value: string; unit: string };
export function getFormattedSizeParts(
    value: number,
    _precision: number | KbqUnitSystem,
    system?: KbqUnitSystem
): { value: string; unit: string } {
    let resolvedSystem: KbqUnitSystem | null = null;

    if (arguments.length === 2 && typeof _precision === 'object') {
        resolvedSystem = _precision satisfies KbqUnitSystem;
    }

    if (arguments.length === 3 && typeof _precision === 'number' && system) {
        resolvedSystem = system;
    }

    if (!resolvedSystem) {
        throw new Error('Unexpected arguments size');
    }

    const { result, unit } = getHumanizedBytes(value, resolvedSystem);

    return {
        value: result.toString(),
        unit
    };
}

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
        throw new Error(KBQ_INVALID_VALUE_ERROR);
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

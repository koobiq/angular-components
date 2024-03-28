import { MeasurementSystem, sizeUnitsConfig } from './config';


export const formatDataSize = (
    value: number,
    systemCode: MeasurementSystem = sizeUnitsConfig.defaultUnitSystem,
    precision: number = sizeUnitsConfig.defaultPrecision
): { value: string; unit: string } => {
    const system = sizeUnitsConfig.unitSystems[systemCode];
    const { result, unit } = getHumanizedBytes(value, systemCode);
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
 * Переводит байты в Кб, Мб, Гб
 *
 * @param value количество байт
 * @param systemCode система измерения
 * @param threshold нижний порог подсчета
 */
export const getHumanizedBytes = (
    value: number,
    systemCode: MeasurementSystem = sizeUnitsConfig.defaultUnitSystem,
    threshold?: number
): { result: number; unit: string } => {
    const system = sizeUnitsConfig.unitSystems[systemCode];

    if (!system) {
        throw new Error(`Unit system "${systemCode}" not configured!`);
    }

    if (!Number.isFinite(value)) {
        throw new Error('Argument "value" must be number!');
    }

    const caculatedThreshold = Number.isFinite(threshold)
        ? threshold : Math.pow(system.base, system.power);
    const orderOfMagnitude: number = Math.pow(system.base, system.power);

    let result: number = value;
    let step = 0;
    const len: number = system.abbreviations.length - 1;

    while (step < len) {
        if (caculatedThreshold !== undefined && result < caculatedThreshold) {
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

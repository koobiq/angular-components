export const formatDataSize = (value: number, precision: number, system): { value: string; unit: string } => {
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
 * Переводит байты в Кб, Мб, Гб
 *
 * @param value количество байт
 * @param system система измерения
 * @param threshold нижний порог подсчета
 */
export const getHumanizedBytes = (value: number, system, threshold?: number): { result: number; unit: string } => {
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

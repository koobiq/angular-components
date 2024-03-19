export enum MeasurementSystem {
    SI = 'SI',
    IEC = 'IEC'
}

export const sizeUnitsConfig = {
    defaultUnitSystem: MeasurementSystem.SI,
    defaultPrecision: 2,
    unitSystems: {
        [MeasurementSystem.SI]: {
            abbreviations: ['B', 'KB', 'MB', 'GB', 'TB'],
            base: 10,
            power: 3
        },
        [MeasurementSystem.IEC]: {
            abbreviations: ['B', 'KiB', 'MiB', 'GiB', 'TiB'],
            base: 2,
            power: 10
        }
    }
};

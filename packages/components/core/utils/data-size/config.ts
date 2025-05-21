import { InjectionToken } from '@angular/core';
import { enUSFormattersData } from '../../locales';

export enum MeasurementSystem {
    SI = 'SI',
    IEC = 'IEC'
}

export enum KbqMeasurementSystem {
    SI = 'SI',
    IEC = 'IEC'
}

export interface KbqUnitSystem {
    abbreviations: string[];
    base: number;
    power: number;
}

export interface SizeUnitsConfig {
    defaultUnitSystem: string;
    defaultPrecision: number;
    unitSystems: {
        [MeasurementSystem.SI]: KbqUnitSystem;
        [MeasurementSystem.IEC]: KbqUnitSystem;
    };
}

export const KBQ_SIZE_UNITS_DEFAULT_CONFIG = enUSFormattersData.sizeUnits;

export const KBQ_SIZE_UNITS_CONFIG = new InjectionToken<SizeUnitsConfig>('KbqSizeUnitsConfig');

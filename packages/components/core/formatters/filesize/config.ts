import { InjectionToken, Provider } from '@angular/core';
import { enUSFormattersData } from '../../locales';

/**
 * @deprecated Will be removed in next major release. Use `KbqMeasurementSystem` instead.
 * @docs-private
 */
export enum MeasurementSystem {
    SI = 'SI',
    IEC = 'IEC'
}

/**
 * Available unit systems for file size formatting.
 * - SI (Metric): 1 KB = 1000 bytes
 * - IEC (Binary): 1 KiB = 1024 bytes
 */
export enum KbqMeasurementSystem {
    SI = 'SI',
    IEC = 'IEC'
}

/** Unit systems as union type */
export type KbqMeasurementSystemType = keyof typeof KbqMeasurementSystem;

export interface KbqUnitSystem {
    abbreviations: string[];
    base: number;
    power: number;
}

/**
 * @deprecated Will be removed in next major release. Use `KbqSizeUnitsConfig` instead.
 * @docs-private
 */
export interface SizeUnitsConfig {
    defaultUnitSystem: string;
    defaultPrecision: number;
    unitSystems: {
        [MeasurementSystem.SI]: KbqUnitSystem;
        [MeasurementSystem.IEC]: KbqUnitSystem;
    };
}

/**
 * Configuration for file size formatting options.
 * Defines the default unit system, precision, and available unit systems.
 */
export interface KbqSizeUnitsConfig {
    /**
     * Default unit system to use (e.g., 'SI' or 'IEC').
     * @see KbqMeasurementSystem
     */
    defaultUnitSystem: KbqMeasurementSystemType;
    /**
     * Default number of decimal places to display in formatted output.
     * @example
     * `2` → "1.23 KB"
     */
    defaultPrecision: number;
    /** @see KbqMeasurementSystem */
    unitSystems: {
        [KbqMeasurementSystem.SI]: KbqUnitSystem;
        [KbqMeasurementSystem.IEC]: KbqUnitSystem;
    };
}

export const KBQ_SIZE_UNITS_DEFAULT_CONFIG: KbqSizeUnitsConfig = enUSFormattersData.sizeUnits;

/**
 * Configuration for converting sizes in different unit systems.
 */
export const KBQ_SIZE_UNITS_CONFIG = new InjectionToken<KbqSizeUnitsConfig>('KbqSizeUnitsConfig');

/** Utility provider for `KBQ_SIZE_UNITS_CONFIG`. */
export const kbqFilesizeFormatterConfigurationProvider = (configuration: Partial<KbqSizeUnitsConfig>): Provider => ({
    provide: KBQ_SIZE_UNITS_CONFIG,
    useValue: { ...KBQ_SIZE_UNITS_DEFAULT_CONFIG, ...configuration }
});

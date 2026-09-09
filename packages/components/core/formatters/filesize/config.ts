import { InjectionToken, Provider } from '@angular/core';
import { enUSFormattersData, kbqLocaleConfigurationOverrideProvider } from '../../locales';
import { KbqDeepPartial } from '../../utils';

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
 * Configuration for converting sizes in different unit systems. Supplies the defaults only — the active
 * locale wins over it, and {@link kbqFilesizeFormatterConfigurationProvider} wins over both.
 */
export const KBQ_SIZE_UNITS_CONFIG = new InjectionToken<KbqSizeUnitsConfig>('KbqSizeUnitsConfig', {
    factory: () => KBQ_SIZE_UNITS_DEFAULT_CONFIG
});

/**
 * Utility provider. Only the units you pass are overridden; the rest keep following the active locale.
 *
 * @see KBQ_SIZE_UNITS_CONFIG
 */
export const kbqFilesizeFormatterConfigurationProvider = (
    configuration: KbqDeepPartial<KbqSizeUnitsConfig>
): Provider => kbqLocaleConfigurationOverrideProvider('sizeUnits', configuration);

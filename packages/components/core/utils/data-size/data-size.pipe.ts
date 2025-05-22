import { inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE } from '../../locales';
import {
    KBQ_SIZE_UNITS_CONFIG,
    KBQ_SIZE_UNITS_DEFAULT_CONFIG,
    KbqMeasurementSystemType,
    KbqSizeUnitsConfig,
    KbqUnitSystem
} from './config';
import { formatDataSize } from './size';

@Pipe({
    name: 'kbqDataSize',
    standalone: true,
    pure: false
})
export class KbqDataSizePipe implements PipeTransform {
    /** Injects the external configuration for size units, if available. */
    readonly externalConfig = inject(KBQ_SIZE_UNITS_CONFIG, { optional: true });

    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    private config: KbqSizeUnitsConfig;

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.config = this.externalConfig || KBQ_SIZE_UNITS_DEFAULT_CONFIG;
        }
    }

    /** Transforms bytes into localized size string */
    transform(source: number, precision?: number, unitSystemName?: KbqMeasurementSystemType, locale?: string): string {
        const selectedUnitSystemsConfig: Record<KbqMeasurementSystemType, KbqUnitSystem> = locale
            ? this.localeService?.locales[locale].sizeUnits.unitSystems
            : this.config.unitSystems;
        const unitSystem = selectedUnitSystemsConfig[unitSystemName || this.config.defaultUnitSystem];

        const { value, unit } = formatDataSize(source, precision || this.config.defaultPrecision, unitSystem);

        return `${value} ${unit}`;
    }

    private updateLocaleParams = () => {
        this.config = this.externalConfig || this.localeService?.getParams('sizeUnits');
    };
}

import { inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_DEFAULT_LOCALE_ID, KBQ_LOCALE_SERVICE } from '../../locales';
import { KbqDecimalPipe } from '../number/formatter';
import {
    KBQ_SIZE_UNITS_CONFIG,
    KBQ_SIZE_UNITS_DEFAULT_CONFIG,
    KbqMeasurementSystem,
    KbqMeasurementSystemType,
    KbqSizeUnitsConfig,
    KbqUnitSystem
} from './config';
import { getFormattedSizeParts } from './size';

@Pipe({
    name: 'kbqDataSize',
    standalone: true,
    pure: false
})
export class KbqDataSizePipe implements PipeTransform {
    /** Injects the external configuration for size units, if available. */
    readonly externalConfig = inject(KBQ_SIZE_UNITS_CONFIG, { optional: true });

    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly numberPipe = inject(KbqDecimalPipe, { optional: true });
    private config: KbqSizeUnitsConfig;

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.config = this.externalConfig || KBQ_SIZE_UNITS_DEFAULT_CONFIG;
        }
    }

    /** Transforms bytes into localized size string */
    transform(source: number, precision?: number, unitSystemName?: KbqMeasurementSystemType, locale?: string): string {
        const currentLocale = locale || this.localeService?.id || KBQ_DEFAULT_LOCALE_ID;
        const selectedPrecision = precision ?? this.config.defaultPrecision;

        const resolvedUnitSystems: Record<KbqMeasurementSystem, KbqUnitSystem> = locale
            ? this.localeService?.locales[locale].sizeUnits.unitSystems
            : this.config.unitSystems;

        const unitSystem = resolvedUnitSystems[unitSystemName || this.config.defaultUnitSystem];

        const { value, unit } = getFormattedSizeParts(source, selectedPrecision, unitSystem);
        const formattedValue = this.numberPipe?.transform(value, undefined, currentLocale) || value;

        return formattedValue ? `${formattedValue}\xa0${unit}` : '';
    }

    private updateLocaleParams = () => {
        this.config = this.externalConfig || this.localeService?.getParams('sizeUnits');
    };
}

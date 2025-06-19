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
    private readonly nonBreakingSpace = '\u00a0';
    private config: KbqSizeUnitsConfig;

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.config = this.externalConfig || KBQ_SIZE_UNITS_DEFAULT_CONFIG;
        }
    }

    /** Transforms bytes into localized size string */
    transform(
        source: number,
        precision: number = this.config.defaultPrecision,
        unitSystemName: KbqMeasurementSystemType = this.config.defaultUnitSystem,
        locale: string = this.localeService?.id || KBQ_DEFAULT_LOCALE_ID
    ): string {
        const resolvedUnitSystems: Record<KbqMeasurementSystem, KbqUnitSystem> = this.localeService
            ? this.localeService.locales[locale].sizeUnits.unitSystems
            : this.config.unitSystems;

        const { value, unit } = getFormattedSizeParts(source, resolvedUnitSystems[unitSystemName]);

        const formattedValue = this.numberPipe?.transform(value, `1.0-${precision}`, locale) || value;

        return formattedValue ? `${formattedValue}${this.nonBreakingSpace}${unit}` : '';
    }

    private updateLocaleParams = () => {
        this.config = this.externalConfig || this.localeService?.getParams('sizeUnits');
    };
}

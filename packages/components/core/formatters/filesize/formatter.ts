import { inject, Pipe, PipeTransform } from '@angular/core';
import { KBQ_DEFAULT_LOCALE_ID, KBQ_LOCALE_SERVICE, kbqInjectLocaleConfiguration } from '../../locales';
import { KbqDecimalPipe } from '../number/formatter';
import {
    KBQ_SIZE_UNITS_LOCALE_CONFIGURATION,
    KbqMeasurementSystem,
    KbqMeasurementSystemType,
    KbqUnitSystem
} from './config';
import { getFormattedSizeParts } from './size';

@Pipe({
    name: 'kbqDataSize',
    pure: false
})
export class KbqDataSizePipe implements PipeTransform {
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly numberPipe = inject(KbqDecimalPipe, { optional: true });
    private readonly nonBreakingSpace = '\u00a0';
    private readonly config = kbqInjectLocaleConfiguration('sizeUnits', KBQ_SIZE_UNITS_LOCALE_CONFIGURATION);

    /** Transforms bytes into localized size string */
    transform(
        source: number,
        precision: number = this.config().defaultPrecision,
        unitSystemName: KbqMeasurementSystemType = this.config().defaultUnitSystem,
        locale: string = this.localeService?.id || KBQ_DEFAULT_LOCALE_ID
    ): string {
        const config = this.config();
        // `config` already carries the active locale with the overrides merged in. A caller that asks for
        // another locale explicitly is asking for that locale's units — a locale id that was never
        // registered has no entry at all, so guard the lookup, not just the service.
        const resolvedUnitSystems: Record<KbqMeasurementSystem, KbqUnitSystem> =
            locale === (this.localeService?.id || KBQ_DEFAULT_LOCALE_ID)
                ? config.unitSystems
                : (this.localeService?.locales[locale]?.sizeUnits.unitSystems ?? config.unitSystems);

        const { value, unit } = getFormattedSizeParts(source, resolvedUnitSystems[unitSystemName]);

        const formattedValue = this.numberPipe?.transform(value, `1.0-${precision}`, locale) || value;

        return formattedValue ? `${formattedValue}${this.nonBreakingSpace}${unit}` : '';
    }
}

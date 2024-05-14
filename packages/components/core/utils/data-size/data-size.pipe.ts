import { ChangeDetectorRef, Inject, Optional, Pipe, PipeTransform } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '../../locales';

import {
    KBQ_DATA_SIZE_CONFIG,
    KBQ_SIZE_UNITS_DEFAULT_CONFIG,
    SizeUnitsConfig
} from './config';
import { formatDataSize } from './size';

@Pipe({
    name: 'kbqDataSize',
    standalone: true
})
export class KbqDataSizePipe implements PipeTransform {
    private config: SizeUnitsConfig;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(KBQ_DATA_SIZE_CONFIG) public readonly externalConfig: SizeUnitsConfig,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        this.localeService?.changes
            .subscribe(this.updateLocaleParams);

        if (!localeService) {
            this.config = KBQ_SIZE_UNITS_DEFAULT_CONFIG;
        }
    }

    transform(
        source: number,
        precision?: number,
        unitSystemName?: string
    ): string {
        const unitSystem = this.config.unitSystems[unitSystemName || this.config.defaultUnitSystem];

        const { value, unit } = formatDataSize(
            source,
            precision || this.config.defaultPrecision,
            unitSystem
        );

        return `${value} ${unit}`;
    }

    private updateLocaleParams = () => {
        this.config = this.externalConfig || this.localeService?.getParams('sizeUnits');

        this.changeDetectorRef.markForCheck();
    }
}

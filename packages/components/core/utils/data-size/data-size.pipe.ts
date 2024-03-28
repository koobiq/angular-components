import { NgModule, Pipe, PipeTransform } from '@angular/core';

import { MeasurementSystem } from './config';
import { formatDataSize } from './size';


@Pipe({
    name: 'kbqDataSize'
})
export class KbqDataSizePipe implements PipeTransform {
    transform(
        source: number,
        precision = 2,
        measurementSystem = MeasurementSystem.SI
    ): string {
        const { value, unit } = formatDataSize(source, measurementSystem, precision);

        return `${value} ${unit}`;
    }
}

@NgModule({
    imports: [],
    exports: [KbqDataSizePipe],
    declarations: [KbqDataSizePipe]
})
export class KbqDataSizeModule {}

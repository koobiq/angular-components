import { Pipe, PipeTransform } from '@angular/core';
import { offsetFormatterAsObject } from './timezone.utils';

@Pipe({
    name: 'utcOffset'
})
export class UtcOffsetPipe implements PipeTransform {
    transform(value: string): { [UTC: string]: string } {
        return offsetFormatterAsObject(value);
    }
}

import { Pipe, PipeTransform } from '@angular/core';
import { offsetFormatterAsObject } from './timezone.utils';

/** Splits an `HH:MM:SS` offset into the `UTC` prefix and the signed offset, for a two-column layout. */
@Pipe({
    name: 'utcOffset'
})
export class UtcOffsetPipe implements PipeTransform {
    transform(value: string): { [UTC: string]: string } {
        return offsetFormatterAsObject(value);
    }
}

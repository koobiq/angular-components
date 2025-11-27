import { Pipe, PipeTransform } from '@angular/core';
import { filterCitiesBySearchString } from './timezone.utils';

@Pipe({
    name: 'citiesByFilter',
    standalone: true
})
export class CitiesByFilterPipe implements PipeTransform {
    transform(value: string, searchPattern?: string): string {
        return filterCitiesBySearchString(value, searchPattern);
    }
}

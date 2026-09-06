import { Pipe, PipeTransform } from '@angular/core';
import { filterCitiesBySearchString } from './timezone.utils';

/** Narrows a `', '`-joined city list to the entries matching the search pattern(s). */
@Pipe({
    name: 'citiesByFilter'
})
export class CitiesByFilterPipe implements PipeTransform {
    transform(value: string, searchPattern?: string | readonly string[]): string {
        return filterCitiesBySearchString(value, searchPattern);
    }
}

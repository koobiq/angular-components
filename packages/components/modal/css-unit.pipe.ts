import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'toCssUnit'
})
export class CssUnitPipe implements PipeTransform {
    /** Returns `null` for a value that was never set, so the style binding it feeds is cleared. */
    transform(value: number | string | null | undefined, defaultUnit: string = 'px'): string | null {
        if (value === null || value === undefined) return null;

        const formatted = +value;

        return isNaN(formatted) ? `${value}` : `${formatted}${defaultUnit}`;
    }
}

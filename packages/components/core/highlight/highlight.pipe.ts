import { Pipe, PipeTransform } from '@angular/core';

export function escapeRegExp(value: string) {
    if (value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return value;
}

@Pipe({ name: 'mcHighlight' })
export class KbqHighlightPipe implements PipeTransform {
    transform(value: any, args: any): any {
        if (!args || typeof args !== 'string') {
            return value;
        }

        return value.replace(new RegExp(`(${escapeRegExp(args)})`, 'gi'), '<mark class="kbq-highlight">$1</mark>');
    }
}

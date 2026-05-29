import { Pipe, PipeTransform } from '@angular/core';

import { highlight } from './highlight-base';

/** @docs-private */
export const kbqHighlightMark = (text: string): string => `<mark class="kbq-highlight">${text}</mark>`;

@Pipe({ name: 'mcHighlight' })
export class KbqHighlightPipe implements PipeTransform {
    transform(value: any, args: any): any {
        return highlight(value, args, kbqHighlightMark);
    }
}

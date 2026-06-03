import { Pipe, PipeTransform } from '@angular/core';

import { highlight } from './highlight-base';

/** @docs-private */
export const kbqHighlightMark = (text: string): string => `<mark class="kbq-highlight">${text}</mark>`;

@Pipe({ name: 'mcHighlight' })
export class KbqHighlightPipe implements PipeTransform {
    transform(value: unknown, keyword: unknown): string {
        return highlight(value, keyword, kbqHighlightMark);
    }
}

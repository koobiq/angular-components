import { Pipe, PipeTransform } from '@angular/core';

import { highlight } from './highlight-base';

/** @docs-private */
export const kbqHighlightBackgroundMark = (text: string): string =>
    `<mark class="kbq-highlight-background">${text}</mark>`;

@Pipe({ name: 'kbqHighlightBackground' })
export class KbqHighlightBackgroundPipe implements PipeTransform {
    transform(value: unknown, keyword: unknown): string {
        return highlight(value, keyword, kbqHighlightBackgroundMark);
    }
}

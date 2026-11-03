import { Pipe, PipeTransform } from '@angular/core';

import { highlight } from './highlight-base';

/** @internal */
export const kbqHighlightBackgroundMark = (text: string): string =>
    `<mark class="kbq-highlight-background">${text}</mark>`;

/** Wraps the matches of a search in a `<mark class="kbq-highlight-background">`. */
@Pipe({ name: 'kbqHighlightBackground' })
export class KbqHighlightBackgroundPipe implements PipeTransform {
    transform(value: unknown, keyword: unknown, foldDiacritics = false): string {
        return highlight(value, keyword, kbqHighlightBackgroundMark, foldDiacritics);
    }
}

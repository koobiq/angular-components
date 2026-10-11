import { Pipe, PipeTransform } from '@angular/core';

import { highlight } from './highlight-base';

/** @internal */
export const kbqHighlightMark = (text: string): string => `<mark class="kbq-highlight">${text}</mark>`;

/** @deprecated Use the `kbqHighlightBold` pipe (`KbqHighlightBoldPipe`). Will be removed in 22.0.0. */
@Pipe({ name: 'mcHighlight' })
export class KbqHighlightPipe implements PipeTransform {
    transform(value: unknown, keyword: unknown, foldDiacritics = false): string {
        return highlight(value, keyword, kbqHighlightMark, foldDiacritics);
    }
}

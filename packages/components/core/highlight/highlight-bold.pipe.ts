import { Pipe, PipeTransform } from '@angular/core';

import { highlight } from './highlight-base';
import { kbqHighlightMark } from './highlight.pipe';

/** Wraps the matches of a search in a bold `<mark class="kbq-highlight">`. */
@Pipe({ name: 'kbqHighlightBold' })
export class KbqHighlightBoldPipe implements PipeTransform {
    /**
     * Returns `value` as HTML with every match of `keyword` marked, or `''` when `value` is not a string.
     * With `foldDiacritics`, a keyword matches regardless of diacritics: `creme` marks `Crème`.
     */
    transform(
        value: string | null | undefined,
        keyword: string | readonly string[] | null | undefined,
        foldDiacritics = false
    ): string {
        return highlight(value, keyword, kbqHighlightMark, foldDiacritics);
    }
}

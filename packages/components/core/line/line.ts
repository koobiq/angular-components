import { Directive } from '@angular/core';

/**
 * Shared directive to count lines inside a text area, such as a list item.
 * Line elements can be extracted with a `contentChildren(KbqLine)` query, then
 * counted by checking the number of results.
 */
@Directive({
    selector: '[kbq-line]',
    host: { class: 'kbq-line' }
})
export class KbqLine {}

import { Directive } from '@angular/core';

/** Element to be placed at the end of the form field. */
@Directive({
    selector: '[kbqSuffix]',
    host: {
        class: 'kbq-suffix'
    }
})
export class KbqSuffix {}

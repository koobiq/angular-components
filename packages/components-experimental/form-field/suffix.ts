import { Directive } from '@angular/core';

/** KbqSuffix to be placed at the end of the form field. */
@Directive({
    selector: '[kbqSuffix]',
    host: {
        class: 'kbq-suffix___EXPERIMENTAL'
    }
})
export class KbqSuffix {}

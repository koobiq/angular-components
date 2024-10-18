import { Directive } from '@angular/core';

/** KbqSuffix to be placed at the end of the form field. */
@Directive({
    standalone: true,
    selector: '[kbqSuffix]',
    host: {
        class: 'kbq-suffix'
    }
})
export class KbqSuffix {}

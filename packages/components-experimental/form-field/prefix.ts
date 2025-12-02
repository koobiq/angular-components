import { Directive } from '@angular/core';

/** KbqPrefix to be placed in front of the form field. */
@Directive({
    selector: '[kbqPrefix]',
    host: {
        class: 'kbq-prefix___EXPERIMENTAL'
    }
})
export class KbqPrefix {}

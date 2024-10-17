import { Directive } from '@angular/core';

/** KbqPrefix to be placed in front of the form field. */
@Directive({
    standalone: true,
    selector: '[kbqPrefix]',
    host: {
        class: 'kbq-prefix'
    }
})
export class KbqPrefix {}

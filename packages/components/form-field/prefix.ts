import { Directive } from '@angular/core';

/** Element to be placed in front of the form field. */
@Directive({
    selector: '[kbqPrefix]',
    exportAs: 'kbqPrefix',
    host: {
        class: 'kbq-prefix'
    }
})
export class KbqPrefix {}

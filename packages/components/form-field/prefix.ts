import { Directive } from '@angular/core';

/** Element to be placed in front of the form field. */
@Directive({
    selector: '[kbqPrefix]',
    host: {
        class: 'kbq-prefix'
    },
    exportAs: 'kbqPrefix'
})
export class KbqPrefix {}

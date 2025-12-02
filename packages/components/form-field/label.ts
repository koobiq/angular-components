import { Directive } from '@angular/core';

/** Label for the form field. */
@Directive({
    selector: 'kbq-label',
    exportAs: 'kbqLabel',
    host: {
        class: 'kbq-label'
    }
})
export class KbqLabel {}

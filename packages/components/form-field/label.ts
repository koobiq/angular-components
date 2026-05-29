import { Directive } from '@angular/core';

/** Label for the form field. */
@Directive({
    selector: 'kbq-label',
    host: {
        class: 'kbq-label'
    },
    exportAs: 'kbqLabel'
})
export class KbqLabel {}

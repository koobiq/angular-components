import { Directive } from '@angular/core';

/** Label for the form field. */
@Directive({
    selector: 'kbq-label',
    exportAs: 'kbqLabel',
    standalone: true,
    host: {
        class: 'kbq-label'
    }
})
export class KbqLabel {}

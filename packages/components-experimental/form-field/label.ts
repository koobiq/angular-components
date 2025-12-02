import { Directive, Input } from '@angular/core';

let nextUniqueId = 0;

/** Label for the form field. */
@Directive({
    selector: 'kbq-label',
    host: {
        class: 'kbq-label___EXPERIMENTAL',
        '[attr.id]': 'id'
    }
})
export class KbqLabel {
    /** Unique id for the label. */
    @Input() id: string = `kbq-label-${nextUniqueId++}`;
}

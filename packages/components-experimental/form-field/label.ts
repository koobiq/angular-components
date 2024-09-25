import { Directive, Input } from '@angular/core';

let nextUniqueId = 0;

/** Label for the form field. */
@Directive({
    selector: 'kbq-label',
    standalone: true,
    host: {
        class: 'kbq-label',
        '[attr.id]': 'id'
    }
})
export class KbqLabel {
    /** @docs-private */
    @Input() id: string = `kbq-label-${nextUniqueId++}`;
}

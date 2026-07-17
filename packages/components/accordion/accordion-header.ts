import { Directive, inject } from '@angular/core';
import { KbqAccordion } from './accordion';
import { KbqAccordionItem } from './accordion-item';

@Directive({
    selector: 'kbq-accordion-header, [kbq-accordion-header]',
    host: {
        class: 'kbq-accordion-header',
        '[attr.role]': '"heading"',
        '[attr.aria-level]': 'accordion.level()',
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation'
    }
})
export class KbqAccordionHeader {
    /** @docs-private */
    protected readonly item = inject(KbqAccordionItem);
    /** @docs-private */
    protected readonly accordion = inject(KbqAccordion);
}

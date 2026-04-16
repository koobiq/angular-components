import { Directive, inject } from '@angular/core';
import { KbqAccordionItem } from './accordion-item';

@Directive({
    selector: '[kbqAccordionHeader]',
    host: {
        '[attr.role]': '"heading"',
        '[attr.aria-level]': '2',
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation'
    }
})
export class KbqAccordionHeaderDirective {
    protected readonly item = inject(KbqAccordionItem);
}

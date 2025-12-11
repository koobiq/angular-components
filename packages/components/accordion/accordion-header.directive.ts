import { Directive, inject } from '@angular/core';
import { KbqAccordionItem } from './accordion-item';

@Directive({
    selector: '[kbqAccordionHeader]',
    host: {
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation'
    }
})
export class KbqAccordionHeaderDirective {
    protected readonly item = inject(KbqAccordionItem);
}

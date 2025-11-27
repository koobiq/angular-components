import { Directive, inject } from '@angular/core';
import { KbqAccordionItemDirective } from './accordion-item.directive';

@Directive({
    selector: '[kbqAccordionHeader]',
    standalone: true,
    host: {
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation'
    }
})
export class KbqAccordionHeaderDirective {
    protected readonly item = inject(KbqAccordionItemDirective);
}

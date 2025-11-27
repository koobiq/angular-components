import { Directive } from '@angular/core';
import { KbqAccordionHeaderDirective } from './accordion-header.directive';

@Directive({
    selector: 'kbq-accordion-header, [kbq-accordion-header]',
    hostDirectives: [KbqAccordionHeaderDirective],
    host: {
        class: 'kbq-accordion-header'
    },
    standalone: false
})
export class KbqAccordionHeader {}

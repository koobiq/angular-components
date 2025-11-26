import { Directive } from '@angular/core';
import { KbqAccordionHeaderDirective } from './accordion-header.directive';

@Directive({
    selector: 'kbq-accordion-header, [kbq-accordion-header]',
    hostDirectives: [KbqAccordionHeaderDirective],
    host: {
        class: 'kbq-accordion-header'
    }
})
export class KbqAccordionHeader {}

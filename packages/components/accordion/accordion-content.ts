import { Directive } from '@angular/core';
import { KbqAccordionContentDirective } from './accordion-content.directive';

@Directive({
    selector: 'kbq-accordion-content, [kbq-accordion-content]',
    hostDirectives: [KbqAccordionContentDirective],
    host: {
        class: 'kbq-accordion-content'
    }
})
export class KbqAccordionContent {}

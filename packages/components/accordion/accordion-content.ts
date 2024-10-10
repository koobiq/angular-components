import { Directive } from '@angular/core';
import { RdxAccordionContentDirective } from '@radix-ng/primitives/accordion';

@Directive({
    selector: 'kbq-accordion-content, [kbq-accordion-content]',
    hostDirectives: [RdxAccordionContentDirective],
    host: {
        class: 'kbq-accordion-content'
    }
})
export class KbqAccordionContent {}

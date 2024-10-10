import { Directive } from '@angular/core';
import { RdxAccordionHeaderDirective } from '@radix-ng/primitives/accordion';

@Directive({
    selector: 'kbq-accordion-header, [kbq-accordion-header]',
    hostDirectives: [RdxAccordionHeaderDirective],
    host: {
        class: 'kbq-accordion-header'
    }
})
export class KbqAccordionHeader {}

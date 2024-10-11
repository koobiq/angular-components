import { Directive } from '@angular/core';
import { RdxAccordionItemDirective } from '@radix-ng/primitives/accordion';

@Directive({
    selector: 'kbq-accordion-item, [kbq-accordion-item]',
    hostDirectives: [
        {
            directive: RdxAccordionItemDirective,
            inputs: ['expanded', 'disabled', 'value'],
            outputs: ['closed', 'opened', 'expandedChange']
        }
    ],
    host: {
        class: 'kbq-accordion-item'
    }
})
export class KbqAccordionItem {}

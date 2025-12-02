import { Directive } from '@angular/core';
import { KbqAccordionItemDirective } from './accordion-item.directive';

@Directive({
    selector: 'kbq-accordion-item, [kbq-accordion-item]',
    hostDirectives: [
        {
            directive: KbqAccordionItemDirective,
            inputs: ['expanded', 'disabled', 'value'],
            outputs: ['closed', 'opened', 'expandedChange']
        }
    ],
    host: {
        class: 'kbq-accordion-item'
    }
})
export class KbqAccordionItem {}

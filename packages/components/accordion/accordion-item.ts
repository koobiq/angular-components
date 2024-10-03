import { Directive, inject } from '@angular/core';
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
        class: 'kbq-accordion-item',
        // '[attr.tabindex]': 'tabIndex',
    }
})
export class KbqAccordionItem {
    protected itemDirective: RdxAccordionItemDirective = inject(RdxAccordionItemDirective);
    get tabIndex(): number {
        return this.itemDirective.disabled ? -1 : 0;
    }
}

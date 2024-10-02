import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RdxAccordionItemDirective } from '@radix-ng/primitives/accordion';

@Component({
    selector: 'kbq-accordion-item, [kbq-accordion-item]',
    template: '<ng-content />',
    styleUrls: ['accordion-item.component.scss', 'accordion-tokens.scss'],
    hostDirectives: [
        {
            directive: RdxAccordionItemDirective,
            inputs: ['expanded', 'disabled', 'value'],
            outputs: ['closed', 'opened', 'expandedChange']
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion-item'
    }
})
export class KbqAccordionItem {}

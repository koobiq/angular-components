import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RdxAccordionTriggerDirective } from '@radix-ng/primitives/accordion';

@Component({
    selector: 'kbq-accordion-trigger, [kbq-accordion-trigger]',
    template: '<ng-content />',
    styleUrls: ['accordion-trigger.component.scss', 'accordion-tokens.scss'],
    hostDirectives: [RdxAccordionTriggerDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion-trigger'
    }
})
export class KbqAccordionTrigger {}

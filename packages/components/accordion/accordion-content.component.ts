import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RdxAccordionContentDirective } from '@radix-ng/primitives/accordion';

@Component({
    selector: 'kbq-accordion-content, [kbq-accordion-content]',
    template: '<ng-content />',
    styleUrls: ['accordion-content.component.scss', 'accordion-tokens.scss'],
    hostDirectives: [RdxAccordionContentDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion-content'
    }
})
export class KbqAccordionContent {}

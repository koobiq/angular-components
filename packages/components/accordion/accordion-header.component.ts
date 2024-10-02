import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RdxAccordionHeaderDirective } from '@radix-ng/primitives/accordion';

@Component({
    selector: 'kbq-accordion-header, [kbq-accordion-header]',
    template: '<ng-content />',
    styleUrls: ['accordion-header.component.scss', 'accordion-tokens.scss'],
    hostDirectives: [RdxAccordionHeaderDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion-header'
    }
})
export class KbqAccordionHeader {}

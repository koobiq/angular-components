import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RdxAccordionRootDirective } from '@radix-ng/primitives/accordion';

@Component({
    selector: 'kbq-accordion, [kbq-accordion]',
    template: '<ng-content />',
    styleUrls: ['accordion.component.scss', 'accordion-tokens.scss'],
    hostDirectives: [
        {
            directive: RdxAccordionRootDirective,
            inputs: ['orientation', 'disabled', 'type', 'defaultValue', 'collapsible', 'value'],
            outputs: ['onValueChange']
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-accordion'
    }
})
export class KbqAccordion {}

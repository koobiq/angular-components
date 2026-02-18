import { Component } from '@angular/core';
import { KbqAccordionContentDirective } from './accordion-content.directive';

@Component({
    selector: 'kbq-accordion-content, [kbq-accordion-content]',
    hostDirectives: [KbqAccordionContentDirective],
    template: `<p><ng-content /></p>`,
    host: {
        class: 'kbq-accordion-content'
    }
})
export class KbqAccordionContent {}

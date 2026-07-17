import { Component } from '@angular/core';
import { KbqAccordionContentDirective } from './accordion-content.directive';

@Component({
    selector: 'kbq-accordion-content, [kbq-accordion-content]',
    // A `<div>` wrapper (not `<p>`) carries the content padding: `<p>` is invalid for projected
    // block content (a `<div>` would auto-close it), and keeping padding off the animated
    // `.kbq-accordion-content` host lets it collapse cleanly to `height: 0`.
    template: '<div class="kbq-accordion-content__body"><ng-content /></div>',
    host: {
        class: 'kbq-accordion-content'
    },
    hostDirectives: [KbqAccordionContentDirective]
})
export class KbqAccordionContent {}

import { Directive, TemplateRef, inject } from '@angular/core';

/** Decorates the `ng-template` tags and reads out the template from it. */
@Directive({
    selector: '[kbqTabContent]'
})
export class KbqTabContent {
    // TODO: the library reads the template with `{ read: TemplateRef }`; kept as public API at the DS-2196 review.
    template = inject<TemplateRef<any>>(TemplateRef);
}

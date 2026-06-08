import { Directive, TemplateRef, inject } from '@angular/core';

/** Decorates the `ng-template` tags and reads out the template from it. */
@Directive({
    selector: '[kbqTabContent]'
})
export class KbqTabContent {
    template = inject<TemplateRef<any>>(TemplateRef);
}

import { Directive, TemplateRef } from '@angular/core';

/** Decorates the `ng-template` tags and reads out the template from it. */
@Directive({
    selector: '[kbqTabContent]'
})
export class KbqTabContent {
    constructor(public template: TemplateRef<any>) {}
}

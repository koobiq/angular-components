import { Directive, TemplateRef, inject } from '@angular/core';

/** Decorates the `ng-template` tags and reads out the template from it. */
@Directive({
    selector: '[kbqTabContent]'
})
export class KbqTabContent {
    template = inject<TemplateRef<any>>(TemplateRef);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {}
}

import { ChangeDetectorRef, Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
    selector: '[kbqTreeNodeOutlet]'
})
export class KbqTreeNodeOutlet {
    viewContainer = inject(ViewContainerRef);
    changeDetectorRef = inject(ChangeDetectorRef);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {}
}

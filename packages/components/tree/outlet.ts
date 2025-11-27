import { ChangeDetectorRef, Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[kbqTreeNodeOutlet]',
    standalone: true
})
export class KbqTreeNodeOutlet {
    constructor(
        public viewContainer: ViewContainerRef,
        public changeDetectorRef: ChangeDetectorRef
    ) {}
}

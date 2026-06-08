import { ChangeDetectorRef, Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
    selector: '[kbqTreeNodeOutlet]'
})
export class KbqTreeNodeOutlet {
    viewContainer = inject(ViewContainerRef);
    changeDetectorRef = inject(ChangeDetectorRef);
}

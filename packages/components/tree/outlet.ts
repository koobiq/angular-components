import { Directive, inject, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[kbqTreeNodeOutlet]'
})
export class KbqTreeNodeOutlet {
    viewContainer = inject(ViewContainerRef);
}

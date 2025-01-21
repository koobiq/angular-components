import { Directive, ElementRef, inject } from '@angular/core';
import { DocStates } from '../../services/doc-states';

@Directive({
    standalone: true,
    selector: '[docsRegisterHeader]'
})
export class DocsRegisterHeaderDirective {
    private readonly docStates = inject(DocStates);
    private readonly elementRef = inject(ElementRef);

    constructor() {
        this.docStates.registerHeader(this.elementRef.nativeElement);
    }
}

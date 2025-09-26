import { Directive, ElementRef, inject } from '@angular/core';
import { DocsDocStates } from '../../services/doc-states';

@Directive({
    standalone: true,
    selector: '[docsRegisterHeader]'
})
export class DocsRegisterHeaderDirective {
    private readonly docStates = inject(DocsDocStates);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        this.docStates.registerHeader(this.elementRef.nativeElement);
    }
}

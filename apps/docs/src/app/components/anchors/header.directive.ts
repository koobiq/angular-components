import { Directive, ElementRef } from '@angular/core';
import { DocStates } from '../doс-states';

@Directive({
    selector: '[docs-header]',
    host: {
        class: 'docs-header',
    },
})
export class HeaderDirective {
    constructor(
        private docStates: DocStates,
        private elementRef: ElementRef,
    ) {
        this.docStates.registerHeader(this.elementRef.nativeElement);
    }
}

import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Directive applied to an element to make it usable
 * as a connection point for a select panel.
 */
@Directive({
    selector: '[kbqSelectOrigin]',
    exportAs: 'kbqSelectOrigin'
})
export class KbqSelectOrigin {
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}

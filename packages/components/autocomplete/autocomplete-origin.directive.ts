import { Directive, ElementRef } from '@angular/core';

/**
 * Directive applied to an element to make it usable
 * as a connection point for an autocomplete panel.
 */
@Directive({
    selector: '[kbqAutocompleteOrigin]',
    exportAs: 'kbqAutocompleteOrigin',
    standalone: true
})
export class KbqAutocompleteOrigin {
    constructor(public elementRef: ElementRef<HTMLElement>) {}
}

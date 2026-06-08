import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Directive applied to an element to make it usable
 * as a connection point for an autocomplete panel.
 */
@Directive({
    selector: '[kbqAutocompleteOrigin]',
    exportAs: 'kbqAutocompleteOrigin'
})
export class KbqAutocompleteOrigin {
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {}
}

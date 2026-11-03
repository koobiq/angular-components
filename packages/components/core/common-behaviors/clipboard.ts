import { Directive, ElementRef, inject } from '@angular/core';

/** Replaces thin spaces with regular ones in copied text, for fields with formatted numbers. */
@Directive({
    selector: '[kbqNormalizeWhitespace]',
    host: {
        '(copy)': 'onCopy($event)'
    }
})
export class KbqNormalizeWhitespace {
    /** @docs-private */
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Replace thin-space with space on copy event
     */
    onCopy($event: ClipboardEvent) {
        const value =
            (this.elementRef.nativeElement as HTMLInputElement).value || this.elementRef.nativeElement.textContent;

        if ($event.type === 'copy' && value) {
            $event.preventDefault();
            $event.clipboardData?.setData('text', value?.replace(/\u2009/g, ' '));
        }
    }
}

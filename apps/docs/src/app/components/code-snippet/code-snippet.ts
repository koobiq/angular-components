import { Directive, ElementRef, inject } from '@angular/core';
import { DocsClipboardService } from 'src/app/services/clipboard';

@Directive({
    selector: '[docsCodeSnippet]',
    host: {
        class: 'docs-code-snippet',
        '(click)': 'copy()'
    }
})
export class DocsCodeSnippetDirective {
    private readonly clipboard = inject(DocsClipboardService);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    copy() {
        this.clipboard.copyWithToast(this.elementRef.nativeElement.textContent || '');
    }
}

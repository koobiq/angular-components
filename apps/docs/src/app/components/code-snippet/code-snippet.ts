import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ElementRef, inject, Input } from '@angular/core';
import { KbqToastModule, KbqToastService } from '@koobiq/components/toast';

@Component({
    standalone: true,
    imports: [KbqToastModule],
    template: ``,
    // @TODO should be renamed to `docsCodeSnippet`
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[kbq-code-snippet]',
    host: {
        class: 'docs-code-snippet',
        '(click)': 'copy()'
    }
})
export class DocsCodeSnippetComponent {
    @Input() tooltip = 'Скопировать';

    private readonly clipboard = inject(Clipboard);
    private readonly toastService = inject(KbqToastService);
    private readonly elementRef = inject(ElementRef);

    copy() {
        this.clipboard.copy(this.elementRef.nativeElement.textContent);
        this.showSuccessfullyCopiedToast();
    }

    private showSuccessfullyCopiedToast() {
        this.toastService.show({ style: 'success', title: 'Скопировано' });
    }
}

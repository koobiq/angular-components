import { Clipboard } from '@angular/cdk/clipboard';
import { Directive, ElementRef, inject, Input } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';

@Directive({
    standalone: true,
    // @TODO should be renamed to `docsCodeSnippet`
    // eslint-disable-next-line @angular-eslint/directive-selector
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
    private readonly element = inject(ElementRef);

    copy() {
        this.clipboard.copy(this.element.nativeElement.textContent);
        this.showSuccessfullyCopiedToast();
    }

    private showSuccessfullyCopiedToast() {
        this.toastService.show({ style: 'success', title: 'Скопировано' });
    }
}

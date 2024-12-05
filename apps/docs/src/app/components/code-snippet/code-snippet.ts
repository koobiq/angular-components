import { Clipboard } from '@angular/cdk/clipboard';
import { Directive, ElementRef, inject, Input } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';

@Directive({
    standalone: true,
    selector: '[kbq-code-snippet]',
    host: {
        class: 'kbq-docs-code-snippet',
        '(click)': 'copy()'
    }
})
export class CodeSnippet {
    @Input() tooltip = 'Скопировать';

    private clipboard = inject(Clipboard);
    private toastService = inject(KbqToastService);
    private element = inject(ElementRef);

    copy() {
        this.clipboard.copy(this.element.nativeElement.textContent);
        this.showSuccessfullyCopiedToast();
    }

    private showSuccessfullyCopiedToast() {
        this.toastService.show({ style: 'success', title: 'Скопировано' });
    }
}

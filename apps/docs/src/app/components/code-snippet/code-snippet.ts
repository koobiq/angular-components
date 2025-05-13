import { Clipboard } from '@angular/cdk/clipboard';
import { Directive, ElementRef, inject } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';
import { DocsLocaleState } from 'src/app/services/locale';

@Directive({
    standalone: true,
    selector: '[docsCodeSnippet]',
    host: {
        class: 'docs-code-snippet',
        '(click)': 'copy()'
    }
})
export class DocsCodeSnippetDirective extends DocsLocaleState {
    private readonly clipboard = inject(Clipboard);
    private readonly toastService = inject(KbqToastService);
    private readonly elementRef = inject(ElementRef);

    copy() {
        if (!this.clipboard.copy(this.elementRef.nativeElement.textContent)) {
            return;
        }

        this.toastService.show({
            style: 'success',
            title: this.isRuLocale() ? 'Скопировано' : 'Copied'
        });
    }
}

import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ElementRef, inject } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';
import { DocsLocaleState } from 'src/app/services/locale';

@Component({
    standalone: true,
    imports: [],
    template: ``,
    // @TODO should be renamed to `docsCodeSnippet`
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[kbq-code-snippet]',
    host: {
        class: 'docs-code-snippet',
        '(click)': 'copy()'
    }
})
export class DocsCodeSnippetComponent extends DocsLocaleState {
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

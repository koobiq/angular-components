import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ElementRef, inject } from '@angular/core';
import { KbqToastModule, KbqToastService } from '@koobiq/components/toast';
import { DocsLocale } from 'src/app/constants/locale';
import { DocsLocaleService } from 'src/app/services/locale.service';

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
    private readonly clipboard = inject(Clipboard);
    private readonly toastService = inject(KbqToastService);
    private readonly elementRef = inject(ElementRef);
    private readonly docsLocaleService = inject(DocsLocaleService);

    copy() {
        if (this.clipboard.copy(this.elementRef.nativeElement.textContent)) {
            this.toastService.show({
                style: 'success',
                title: this.docsLocaleService.locale === DocsLocale.Ru ? 'Скопировано' : 'Copied'
            });
        }
    }
}

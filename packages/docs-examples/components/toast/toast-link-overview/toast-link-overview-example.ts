import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService } from '@koobiq/components/toast';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Toast link
 */
@Component({
    selector: 'toast-link-overview-example',
    imports: [
        KbqLink,
        KbqButtonModule
    ],
    templateUrl: 'toast-link-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastLinkOverviewExample extends BaseLocalizedExample<ExampleText> {
    readonly toastService = inject(KbqToastService);

    showToastWithInlineLink(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ caption, actions });
    }

    constructor() {
        super(TEXT);
    }
}

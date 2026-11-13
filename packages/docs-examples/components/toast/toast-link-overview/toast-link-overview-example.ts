import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService } from '@koobiq/components/toast';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
export class ToastLinkOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly toastService = inject(KbqToastService);

    showToastWithInlineLink(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ caption, actions });
    }
}

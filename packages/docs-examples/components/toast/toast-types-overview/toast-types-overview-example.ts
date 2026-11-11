import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { injectExampleText } from '../l10n';

/**
 * @title Toast types
 */
@Component({
    selector: 'toast-types-overview-example',
    imports: [
        KbqLink,
        NgTemplateOutlet,
        KbqButtonModule
    ],
    templateUrl: 'toast-types-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastTypesOverviewExample {
    protected readonly text = injectExampleText();

    readonly toastService = inject(KbqToastService);

    showContrastToast(actions: TemplateRef<any>) {
        this.toastService.show({
            title: this.text().agentUpdateAvailable,
            caption: this.text().version20315,
            actions
        });
    }

    showSuccessToast() {
        this.toastService.show({ style: KbqToastStyle.Success, caption: this.text().deleted13Records });
    }

    showWarningToast(actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Warning, caption: this.text().passwordExpires, actions });
    }

    showErrorToast(actions: TemplateRef<any>) {
        this.toastService.show({
            style: KbqToastStyle.Error,
            caption: this.text().failedToAuthorize,
            actions
        });
    }
}

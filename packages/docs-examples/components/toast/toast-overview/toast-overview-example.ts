import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-overview-example',
    imports: [
        KbqLink,
        KbqButtonModule
    ],
    template: `
        <ng-template #toastAction let-toast>
            <a kbqLink pseudo (click)="toast.close()">{{ t().refresh }}</a>
        </ng-template>

        <div class="demo-block">
            <button class="example-button" kbq-button (click)="showToast(toastAction)">{{ t().showToast }}</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly toastService = inject(KbqToastService);

    showToast(actions: TemplateRef<any>) {
        this.toastService.show({
            style: KbqToastStyle.Success,
            title: this.t().agentUpdateAvailable,
            caption: this.t().version20315,
            actions,
            closeButton: true
        });
    }
}

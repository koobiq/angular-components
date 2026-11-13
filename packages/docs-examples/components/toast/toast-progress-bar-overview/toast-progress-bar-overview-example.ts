import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqToastService } from '@koobiq/components/toast';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Toast progress bar
 */
@Component({
    selector: 'toast-progress-bar-overview-example',
    imports: [
        KbqProgressBarModule,
        KbqLink,
        KbqButtonModule
    ],
    template: `
        <ng-template #toastStickyContentTemplate let-toast>
            <kbq-progress-bar class="layout-margin-top-m layout-margin-bottom-m" [mode]="'indeterminate'" />
        </ng-template>

        <ng-template #toastStickyActionsTemplate let-toast>
            <a kbqLink pseudo (click)="toast.close()">{{ t().cancel }}</a>
        </ng-template>

        <button kbq-button (click)="showStickyToast(toastStickyContentTemplate, toastStickyActionsTemplate)">
            {{ t().toastWithProgress }}
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastProgressBarOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly toastService = inject(KbqToastService);

    showStickyToast(content: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show(
            {
                title: this.t().importFiles,
                caption: this.t().importProgress,
                closeButton: false,
                content,
                actions
            },
            0
        );
    }
}

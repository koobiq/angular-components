import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqToastService } from '@koobiq/components/toast';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
            <a kbqLink pseudo (click)="toast.close()">{{ text().cancel }}</a>
        </ng-template>

        <button kbq-button (click)="showStickyToast(toastStickyContentTemplate, toastStickyActionsTemplate)">
            {{ text().toastWithProgress }}
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastProgressBarOverviewExample extends BaseLocalizedExample<ExampleText> {
    readonly toastService = inject(KbqToastService);

    showStickyToast(content: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show(
            {
                title: this.text().importFiles,
                caption: this.text().importProgress,
                closeButton: false,
                content,
                actions
            },
            0
        );
    }

    constructor() {
        super(TEXT);
    }
}

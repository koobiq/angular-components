import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Toast report
 */
@Component({
    selector: 'toast-report-overview-example',
    imports: [
        KbqLink,
        KbqButtonModule
    ],
    template: `
        <ng-template #toastContentTemplate>
            {{ t().report }}&nbsp;
            <span class="kbq-text-normal-strong">{{ t().perimeterProtection }}</span>
            &nbsp;{{ t().deleted }}
        </ng-template>

        <ng-template #toastActionsTemplate let-toast>
            <a kbqLink pseudo (click)="toast.close()">{{ t().restore }}</a>
        </ng-template>

        <button kbq-button (click)="showToast(toastContentTemplate, toastActionsTemplate)">{{ t().report }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastReportOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly toastService = inject(KbqToastService);

    showToast(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Success, caption, actions }, 0);
    }

    constructor() {
        super(TRANSLATIONS);
    }
}

import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { injectExampleText } from './l10n';

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
            {{ text().report }}&nbsp;
            <span class="kbq-text-normal-strong">{{ text().perimeterProtection }}</span>
            &nbsp;{{ text().deleted }}
        </ng-template>

        <ng-template #toastActionsTemplate let-toast>
            <a kbqLink pseudo (click)="toast.close()">{{ text().restore }}</a>
        </ng-template>

        <button kbq-button (click)="showToast(toastContentTemplate, toastActionsTemplate)">{{ text().report }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastReportOverviewExample {
    protected readonly text = injectExampleText();

    readonly toastService = inject(KbqToastService);

    showToast(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Success, caption, actions }, 0);
    }
}

import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

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
            Отчет&nbsp;
            <span class="kbq-text-normal-strong">Защита периметра</span>
            &nbsp;удален
        </ng-template>

        <ng-template #toastActionsTemplate let-toast>
            <a kbqLink pseudo (click)="toast.close()">Восстановить</a>
        </ng-template>

        <button kbq-button (click)="showToast(toastContentTemplate, toastActionsTemplate)">Отчет</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastReportOverviewExample {
    readonly toastService = inject(KbqToastService);

    showToast(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Success, caption, actions }, 0);
    }
}

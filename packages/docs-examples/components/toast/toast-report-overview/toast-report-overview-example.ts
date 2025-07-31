import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Toast report
 */
@Component({
    standalone: true,
    imports: [
        KbqLinkModule,
        KbqButtonModule
    ],
    selector: 'toast-report-overview-example',
    template: `
        <ng-template #toastContentTemplate>
            Отчет&nbsp;
            <span class="kbq-text-normal-strong">Защита периметра</span>
            &nbsp;удален
        </ng-template>

        <ng-template #toastActionsTemplate let-toast>
            <a kbq-link pseudo (click)="toast.close()" (keydown.enter)="toast.close()">Восстановить</a>
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

import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Basic Toast
 */
@Component({
    standalone: true,
    imports: [
        KbqLinkModule,
        KbqButtonModule
    ],
    selector: 'toast-overview-example',
    template: `
        <ng-template #toastAction let-toast>
            <a (click)="toast.close()" (keydown.enter)="toast.close()" kbq-link pseudo>Обновить</a>
        </ng-template>

        <div class="demo-block">
            <button class="example-button" (click)="showToast(toastAction)" kbq-button>Показать тост</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastOverviewExample {
    readonly toastService = inject(KbqToastService);

    showToast(actions: TemplateRef<any>) {
        this.toastService.show({
            style: KbqToastStyle.Success,
            title: 'Доступно обновление агента',
            caption: 'Версия 2.03.15 от 15 мая 2022',
            actions,
            closeButton: true
        });
    }
}

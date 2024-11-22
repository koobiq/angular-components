import { Component, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Basic Toast
 */
@Component({
    standalone: true,
    selector: 'toast-overview-example',
    imports: [
        KbqLinkModule,
        KbqButtonModule
    ],
    template: `
        <ng-template #toastAction let-toast>
            <a (click)="toast.close()" (keydown.enter)="toast.close()" kbq-link pseudo>Обновить</a>
        </ng-template>

        <div class="demo-block">
            <button class="example-button" (click)="showToast(toastAction)" kbq-button>Показать тост</button>
        </div>
    `
})
export class ToastOverviewExample {
    constructor(private toastService: KbqToastService) {}

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

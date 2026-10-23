import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title toast-multiline
 */
@Component({
    selector: 'toast-multiline-example',
    imports: [
        KbqLink,
        KbqButtonModule
    ],
    template: `
        <ng-template #toastAction let-toast>
            <a kbqLink pseudo (click)="toast.close()">Обновить</a>
        </ng-template>

        <div class="demo-block">
            <button class="example-button" kbq-button (click)="showToast(toastAction)">Показать тост</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastMultilineExample {
    readonly toastService = inject(KbqToastService);

    showToast(actions: TemplateRef<any>) {
        this.toastService.show({
            style: KbqToastStyle.Success,
            title: 'Доступно \nобновление \nагента',
            caption: 'Версия: \n2.03.15 от 15 мая 2022',
            content:
                'Содержит: \n№1 - Очень важные изменения\n№2 - Менее важные изменения\n№3 - Совсем неважные изменения',
            actions,
            closeButton: true
        });
    }
}

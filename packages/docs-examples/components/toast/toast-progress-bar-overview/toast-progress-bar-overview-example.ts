import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqToastService } from '@koobiq/components/toast';

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
            <a kbqLink pseudo (click)="toast.close()">Отмена</a>
        </ng-template>

        <button kbq-button (click)="showStickyToast(toastStickyContentTemplate, toastStickyActionsTemplate)">
            Тост с прогресс-баром, кнопкой Отмена и без крестика
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastProgressBarOverviewExample {
    readonly toastService = inject(KbqToastService);

    showStickyToast(content: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show(
            {
                title: 'Импорт файлов',
                caption: '12,1 МБ из 85 МБ — осталось 15 мин  ',
                closeButton: false,
                content,
                actions
            },
            0
        );
    }
}

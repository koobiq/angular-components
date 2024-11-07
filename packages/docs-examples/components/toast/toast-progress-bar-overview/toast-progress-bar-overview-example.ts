import { Component, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqToastService } from '@koobiq/components/toast';

/**
 * @title Toast progress bar
 */
@Component({
    standalone: true,
    selector: 'toast-progress-bar-overview-example',
    imports: [
        KbqProgressBarModule,
        KbqLinkModule,
        KbqButtonModule
    ],
    template: `
        <ng-template
            #toastStickyContentTemplate
            let-toast
        >
            <kbq-progress-bar
                class="layout-margin-top-m layout-margin-bottom-m"
                [mode]="'indeterminate'"
            />
        </ng-template>

        <ng-template
            #toastStickyActionsTemplate
            let-toast
        >
            <a
                (click)="toast.close()"
                (keydown.enter)="toast.close()"
                kbq-link
                pseudo
            >
                Отмена
            </a>
        </ng-template>

        <button
            (click)="showStickyToast(toastStickyContentTemplate, toastStickyActionsTemplate)"
            kbq-button
        >
            Тост с прогресс-баром, кнопкой Отмена и без крестика
        </button>
    `
})
export class ToastProgressBarOverviewExample {
    constructor(private toastService: KbqToastService) {}

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

/* tslint:disable:no-console */
import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';

/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-progress-bar-overview-example',
    templateUrl: 'toast-progress-bar-overview-example.html',
    styleUrls: ['toast-progress-bar-overview-example.css'],
    encapsulation: ViewEncapsulation.None
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

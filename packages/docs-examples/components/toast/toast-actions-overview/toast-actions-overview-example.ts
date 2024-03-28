/* tslint:disable:no-console */
import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';


/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-actions-overview-example',
    templateUrl: 'toast-actions-overview-example.html',
    styleUrls: ['toast-actions-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ToastActionsOverviewExample {
    constructor(private toastService: KbqToastService) {}

    showSingleActonToast(title: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ title, actions }, 0);
    }

    showTwoActonToast(actions: TemplateRef<any>) {
        this.toastService.show({ title: 'Доступно обновление компонентов', actions });
    }

    showManyActonToast(actions: TemplateRef<any>) {
        this.toastService.show({ style: 'error', title: 'Заголовок', caption: 'Подзаголовок, подробности', actions }, 0);
    }
}

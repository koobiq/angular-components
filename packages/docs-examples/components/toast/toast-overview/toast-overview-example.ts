/* tslint:disable:no-console */
import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';


/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-overview-example',
    templateUrl: 'toast-overview-example.html',
    styleUrls: ['toast-overview-example.css'],
    encapsulation: ViewEncapsulation.None
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

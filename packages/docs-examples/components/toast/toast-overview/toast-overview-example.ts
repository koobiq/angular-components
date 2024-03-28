/* tslint:disable:no-console */
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';


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

    showToast() {
        this.toastService.show({ title: 'Доступно обновление агента' });
    }
}

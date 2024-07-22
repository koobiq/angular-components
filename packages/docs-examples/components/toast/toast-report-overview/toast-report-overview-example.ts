/* tslint:disable:no-console */
import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-report-overview-example',
    templateUrl: 'toast-report-overview-example.html',
    styleUrls: ['toast-report-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ToastReportOverviewExample {
    constructor(private toastService: KbqToastService) {}

    showToast(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Success, caption, actions }, 0);
    }
}

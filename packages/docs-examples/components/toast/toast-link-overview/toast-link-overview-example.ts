/* tslint:disable:no-console */
import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';


/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-link-overview-example',
    templateUrl: 'toast-link-overview-example.html',
    styleUrls: ['toast-link-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ToastLinkOverviewExample {
    constructor(private toastService: KbqToastService) {}

    showToastWithInlineLink(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ caption, actions });
    }
}

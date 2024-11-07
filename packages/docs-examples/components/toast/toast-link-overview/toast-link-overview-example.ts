import { Component, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastService } from '@koobiq/components/toast';

/**
 * @title Toast link
 */
@Component({
    standalone: true,
    selector: 'toast-link-overview-example',
    templateUrl: 'toast-link-overview-example.html',
    imports: [
        KbqLinkModule,
        KbqButtonModule
    ]
})
export class ToastLinkOverviewExample {
    constructor(private toastService: KbqToastService) {}

    showToastWithInlineLink(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ caption, actions });
    }
}

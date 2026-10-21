import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService } from '@koobiq/components/toast';

/**
 * @title Toast link
 */
@Component({
    selector: 'toast-link-overview-example',
    imports: [
        KbqLink,
        KbqButtonModule
    ],
    templateUrl: 'toast-link-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastLinkOverviewExample {
    readonly toastService = inject(KbqToastService);

    showToastWithInlineLink(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ caption, actions });
    }
}

import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastService } from '@koobiq/components/toast';

/**
 * @title Toast link
 */
@Component({
    standalone: true,
    imports: [
        KbqLinkModule,
        KbqButtonModule
    ],
    selector: 'toast-link-overview-example',
    templateUrl: 'toast-link-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastLinkOverviewExample {
    readonly toastService = inject(KbqToastService);

    showToastWithInlineLink(caption: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ caption, actions });
    }
}

import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title toast-multiline
 */
@Component({
    selector: 'toast-multiline-example',
    imports: [
        KbqLink,
        KbqButtonModule
    ],
    template: `
        <ng-template #toastAction let-toast>
            <a kbqLink pseudo (click)="toast.close()">{{ t().refresh }}</a>
        </ng-template>

        <div class="demo-block">
            <button class="example-button" kbq-button (click)="showToast(toastAction)">{{ t().showToast }}</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastMultilineExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly toastService = inject(KbqToastService);

    showToast(actions: TemplateRef<any>) {
        this.toastService.show({
            style: KbqToastStyle.Success,
            title: this.t().multilineTitle,
            caption: this.t().multilineCaption,
            content: this.t().multilineContent,
            actions,
            closeButton: true
        });
    }

    constructor() {
        super(TRANSLATIONS);
    }
}

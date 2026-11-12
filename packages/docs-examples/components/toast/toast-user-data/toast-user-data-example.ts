import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqToastData, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Toast user data
 */
@Component({
    selector: 'toast-user-data-example',
    imports: [
        KbqLink,
        KbqButtonModule
    ],
    templateUrl: 'toast-user-data-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastUserDataExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly toastService = inject(KbqToastService);

    showToast(actions: TemplateRef<any>) {
        interface ExtendedUserData extends KbqToastData {
            userData: string;
            userButtonName: string;
        }

        this.toastService.show(<ExtendedUserData>{
            style: KbqToastStyle.Success,
            title: this.t().agentUpdateAvailable,
            caption: this.t().version20315,
            actions,
            closeButton: true,
            userData: 'AnyUserData',
            userButtonName: this.t().update
        });
    }

    constructor() {
        super(TRANSLATIONS);
    }
}

import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastData, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Toast user data
 */
@Component({
    selector: 'toast-user-data-example',
    imports: [
        KbqLinkModule,
        KbqButtonModule
    ],
    templateUrl: 'toast-user-data-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastUserDataExample {
    readonly toastService = inject(KbqToastService);

    showToast(actions: TemplateRef<any>) {
        interface ExtendedUserData extends KbqToastData {
            userData: string;
            userButtonName: string;
        }

        this.toastService.show(<ExtendedUserData>{
            style: KbqToastStyle.Success,
            title: 'Agent update available',
            caption: 'Version 2.03.15 from May 15, 2022',
            actions,
            closeButton: true,
            userData: 'AnyUserData',
            userButtonName: 'Update'
        });
    }
}

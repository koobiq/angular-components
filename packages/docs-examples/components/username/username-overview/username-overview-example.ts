import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqUserInfo, KbqUsername } from '@koobiq/components/username';
import { injectExampleText } from '../l10n';

/**
 * @title Username overview
 */
@Component({
    selector: 'username-overview-example',
    imports: [KbqUsername],
    template: `
        <kbq-username [userInfo]="userInfo" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class UsernameOverviewExample {
    protected readonly text = injectExampleText();

    userInfo: KbqUserInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot',
        site: 'corp'
    };
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqUserInfo, KbqUsername } from '@koobiq/components/username';

/**
 * @title Username overview
 */
@Component({
    selector: 'username-overview-example',
    imports: [KbqUsername],
    template: `
        <kbq-username [userInfo]="userInfo" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsernameOverviewExample {
    userInfo: KbqUserInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot',
        site: 'corp'
    };
}

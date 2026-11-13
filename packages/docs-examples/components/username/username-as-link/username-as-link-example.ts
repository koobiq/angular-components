import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';
import { type KbqUserInfo, KbqUsername } from '@koobiq/components/username';

/**
 * @title Username as link
 */
@Component({
    selector: 'username-as-link-example',
    imports: [KbqUsername, KbqLink],
    template: `
        <a kbqLink><kbq-username type="inherit" [userInfo]="userInfo" /></a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class UsernameAsLinkExample {
    userInfo: KbqUserInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot'
    };
}

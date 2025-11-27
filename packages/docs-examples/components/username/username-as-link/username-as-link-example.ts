import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqUserInfo, KbqUsername } from '@koobiq/components/username';

/**
 * @title Username as link
 */
@Component({
    selector: 'username-as-link-example',
    imports: [KbqUsername, KbqLinkModule],
    template: `
        <a kbq-link><kbq-username [userInfo]="userInfo" [type]="'inherit'" /></a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsernameAsLinkExample {
    userInfo: KbqUserInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot'
    };
}

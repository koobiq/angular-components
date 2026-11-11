import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqUserInfo, KbqUsername } from '@koobiq/components/username';
import { injectExampleText } from '../l10n';

/**
 * @title Username as link
 */
@Component({
    selector: 'username-as-link-example',
    imports: [KbqUsername, KbqLink],
    template: `
        <a kbqLink><kbq-username [userInfo]="userInfo" [type]="'inherit'" /></a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class UsernameAsLinkExample {
    protected readonly text = injectExampleText();

    userInfo: KbqUserInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot'
    };
}

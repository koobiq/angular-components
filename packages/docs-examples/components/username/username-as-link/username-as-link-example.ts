import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqUsername } from '@koobiq/components/username';

type ExampleUser = {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    login?: string;
};

/**
 * @title Username as link
 */
@Component({
    selector: 'username-as-link-example',
    standalone: true,
    imports: [KbqUsername, KbqLinkModule],
    template: `
        <a kbq-link><kbq-username [userInfo]="userInfo" [type]="'inherit'" /></a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsernameAsLinkExample {
    userInfo: ExampleUser = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot'
    };
}

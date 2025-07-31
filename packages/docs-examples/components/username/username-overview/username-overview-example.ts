import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqUsername } from '@koobiq/components/username';

/**
 * @title Username overview
 */
@Component({
    selector: 'username-overview-example',
    standalone: true,
    imports: [KbqUsername],
    template: `
        <kbq-username [userInfo]="userInfo" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsernameOverviewExample {
    userInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot',
        site: 'corp'
    };
}

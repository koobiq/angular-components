import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqUserInfo, KbqUsername } from '@koobiq/components/username';

/**
 * @title Username compact
 */
@Component({
    selector: 'username-compact-example',
    imports: [KbqUsername],
    template: `
        @for (user of users; track user) {
            <kbq-username isCompact [userInfo]="user" />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-gap-s layout-padding-m'
    }
})
export class UsernameCompactExample {
    protected readonly users: KbqUserInfo[] = [
        { firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot', site: 'corp' },
        { firstName: 'Madonna', login: 'madonna' },
        { login: 'efox', site: 'dev' }
    ];
}

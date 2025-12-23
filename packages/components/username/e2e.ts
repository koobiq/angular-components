import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqUsernameMode, KbqUsernameStyle } from './types';
import { KbqUserInfo, KbqUsername } from './username';

type UsernameState = {
    mode: KbqUsernameMode;
    type: KbqUsernameStyle;
};

@Component({
    selector: 'e2e-username-state-and-style',
    imports: [
        KbqUsername
    ],
    template: `
        <div>
            <table data-testid="e2eUsernameTable">
                @for (row of states(); track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <kbq-username [userInfo]="userInfo" [mode]="cell.mode" [type]="cell.type" />
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    styles: `
        :host {
            td {
                vertical-align: top;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eUsernameStateAndStyle'
    }
})
export class E2eUsernameStateAndStyle {
    userInfo: KbqUserInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot',
        site: 'corp'
    };

    constructor() {}

    protected readonly states = signal<UsernameState[][]>([
        [
            ...(<KbqUsernameMode[]>['inline', 'stacked', 'text']).map((mode) => ({
                type: <KbqUsernameStyle>'default',
                mode
            }))

        ],
        [
            { mode: 'inline', type: 'default' },
            { mode: 'inline', type: 'accented' },
            { mode: 'inline', type: 'error' },
            { mode: 'inline', type: 'inherit' }
        ]

    ]);
}

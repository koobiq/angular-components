import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqUserInfo, KbqUsernameMode, KbqUsernameStyle } from './types';
import { KbqUsername } from './username';

type UsernameState = {
    mode: KbqUsernameMode;
    type: KbqUsernameStyle;
    userInfo: KbqUserInfo;
    isCompact?: boolean;
    /** Fixed cell width, which is the only way to make the layout clip a name. */
    width?: string;
    dir?: 'rtl';
};

const fullProfile: KbqUserInfo = {
    firstName: 'Maxwell',
    middleName: 'Alan',
    lastName: 'Root',
    login: 'mroot',
    site: 'corp'
};

const longProfile: KbqUserInfo = {
    firstName: 'Maximilian',
    middleName: 'Alexander',
    lastName: 'Rootenberger-Wittgenstein',
    login: 'mrootenberger',
    site: 'corp'
};

const rtlProfile: KbqUserInfo = {
    firstName: 'משה',
    lastName: 'רוט',
    login: 'mroot',
    site: 'corp'
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
                            <td [style.width]="cell.width" [attr.dir]="cell.dir">
                                <kbq-username
                                    [userInfo]="cell.userInfo"
                                    [isCompact]="!!cell.isCompact"
                                    [mode]="cell.mode"
                                    [type]="cell.type"
                                />
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
    protected readonly states = signal<UsernameState[][]>([
        [
            { mode: 'inline', type: 'default', userInfo: fullProfile },
            { mode: 'stacked', type: 'default', userInfo: fullProfile },
            { mode: 'text', type: 'default', userInfo: fullProfile }
        ],
        [
            { mode: 'inline', type: 'default', userInfo: fullProfile },
            { mode: 'inline', type: 'accented', userInfo: fullProfile },
            { mode: 'inline', type: 'error', userInfo: fullProfile },
            { mode: 'inline', type: 'inherit', userInfo: fullProfile }
        ],
        // A profile missing one of the name fields still renders the name it has, and a login with no
        // name in front of it keeps the secondary color.
        [
            { mode: 'inline', type: 'default', userInfo: { lastName: 'Root', login: 'mroot' } },
            { mode: 'inline', type: 'default', userInfo: { firstName: 'Maxwell', middleName: 'Alan' } },
            { mode: 'inline', type: 'default', userInfo: { login: 'mroot', site: 'corp' } },
            { mode: 'stacked', type: 'default', userInfo: { login: 'mroot', site: 'corp' } }
        ],
        [
            { mode: 'inline', type: 'default', userInfo: fullProfile, isCompact: true },
            { mode: 'stacked', type: 'default', userInfo: fullProfile, isCompact: true },
            { mode: 'inline', type: 'default', userInfo: { lastName: 'Root', login: 'mroot' }, isCompact: true },
            { mode: 'inline', type: 'default', userInfo: { login: 'mroot' }, isCompact: true }
        ],
        [
            { mode: 'inline', type: 'default', userInfo: longProfile, width: '120px' },
            { mode: 'stacked', type: 'default', userInfo: longProfile, width: '120px' },
            { mode: 'text', type: 'default', userInfo: longProfile, width: '120px' }
        ],
        [
            { mode: 'inline', type: 'default', userInfo: rtlProfile, dir: 'rtl' },
            { mode: 'stacked', type: 'default', userInfo: rtlProfile, dir: 'rtl' },
            { mode: 'text', type: 'default', userInfo: rtlProfile, dir: 'rtl' }
        ]
    ]);
}

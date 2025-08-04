import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqUserInfo, KbqUsername, KbqUsernameMode, KbqUsernameStyle } from '@koobiq/components/username';

/**
 * @title Username playground
 */
@Component({
    selector: 'username-playground-example',
    standalone: true,
    imports: [
        FormsModule,
        KbqUsername,
        KbqTextareaModule,
        KbqFormFieldModule,
        KbqCheckboxModule,
        KbqRadioModule
    ],
    template: `
        <div class="example-result">
            <kbq-username
                [userInfo]="userInfo"
                [fullNameFormat]="fullNameFormat"
                [isCompact]="isCompact"
                [mode]="selectedMode"
                [type]="selectedType"
            />
        </div>
        <div class="layout-row layout-gap-l">
            <kbq-form-field style="width: 100px">
                <kbq-label>Name format</kbq-label>
                <textarea kbqTextarea rows="1" [maxRows]="1" [(ngModel)]="fullNameFormat"></textarea>
            </kbq-form-field>

            <kbq-checkbox [(ngModel)]="isCompact">isCompact</kbq-checkbox>
            <kbq-radio-group [(ngModel)]="selectedMode">
                @for (usernameMode of modes; track usernameMode) {
                    <kbq-radio-button [value]="usernameMode">
                        {{ usernameMode }}
                    </kbq-radio-button>
                }
            </kbq-radio-group>
            <kbq-radio-group [(ngModel)]="selectedType">
                @for (usernameType of types; track usernameType) {
                    <kbq-radio-button [value]="usernameType">
                        {{ usernameType }}
                    </kbq-radio-button>
                }
            </kbq-radio-group>
        </div>
    `,
    styles: `
        .example-result {
            padding: var(--kbq-size-m);
            margin-bottom: var(--kbq-size-m);
            background: var(--kbq-background-theme-less);
            border-radius: var(--kbq-size-border-radius);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsernamePlaygroundExample {
    userInfo: KbqUserInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot'
    };
    selectedMode: KbqUsernameMode = 'inline';
    selectedType: KbqUsernameStyle = 'default';
    isCompact = false;
    fullNameFormat = 'f.m.l';

    modes: KbqUsernameMode[] = ['inline', 'stacked', 'text'];
    types: KbqUsernameStyle[] = ['default', 'error', 'accented', 'inherit'];
}

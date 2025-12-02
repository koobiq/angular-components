import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTitleModule } from '@koobiq/components/title';
import {
    KBQ_PROFILE_MAPPING,
    KbqFormatKeyToProfileMappingExtended,
    KbqUserInfo,
    KbqUsernameFormatKey,
    KbqUsernameMode,
    KbqUsernameModule,
    KbqUsernameStyle
} from '@koobiq/components/username';

const mapping: KbqFormatKeyToProfileMappingExtended = {
    [KbqUsernameFormatKey.FirstNameShort]: 'firstName',
    [KbqUsernameFormatKey.FirstNameFull]: 'firstName',

    [KbqUsernameFormatKey.MiddleNameShort]: 'middleName',
    [KbqUsernameFormatKey.MiddleNameFull]: 'middleName',

    [KbqUsernameFormatKey.LastNameShort]: 'lastName',
    [KbqUsernameFormatKey.LastNameFull]: 'lastName',

    [KbqUsernameFormatKey.Dot]: undefined
};

/**
 * @title Username custom
 */
@Component({
    selector: 'username-custom-example',
    imports: [
        FormsModule,
        KbqUsernameModule,
        KbqTextareaModule,
        KbqFormFieldModule,
        KbqLinkModule,
        KbqRadioModule,
        KbqTitleModule
    ],
    template: `
        <div class="example-result">
            <kbq-username [mode]="selectedMode" [type]="selectedType">
                <kbq-username-custom-view>
                    @let fullName = userInfo | kbqUsernameCustom: fullNameFormat : customMapping;
                    <span kbqUsernamePrimary>{{ fullName }}</span>

                    @if (userInfo?.login) {
                        <span kbqUsernameSecondary kbq-title class="kbq-mono-normal">[{{ userInfo?.login }}]</span>
                    }
                </kbq-username-custom-view>
            </kbq-username>
        </div>
        <div class="layout-row layout-gap-l">
            <kbq-form-field style="width: 100px">
                <kbq-label>Name format</kbq-label>
                <textarea kbqTextarea rows="1" [maxRows]="1" [(ngModel)]="fullNameFormat"></textarea>
            </kbq-form-field>

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
    providers: [
        { provide: KBQ_PROFILE_MAPPING, useValue: mapping }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsernameCustomExample {
    userInfo: KbqUserInfo = {
        firstName: 'Maxwell',
        middleName: 'Alan',
        lastName: 'Root',
        login: 'mroot'
    };
    selectedMode: KbqUsernameMode = 'inline';
    selectedType: KbqUsernameStyle = 'default';
    fullNameFormat = 'F m. l.';

    modes: KbqUsernameMode[] = ['inline', 'stacked', 'text'];
    types: KbqUsernameStyle[] = ['default', 'error', 'accented', 'inherit'];

    readonly customMapping = mapping;
}

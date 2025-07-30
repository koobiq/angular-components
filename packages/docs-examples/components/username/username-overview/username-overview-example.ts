import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import {
    KBQ_PROFILE_MAPPING,
    KbqFormatKeyToProfileMapping,
    KbqUsernameFormatKey,
    KbqUsernameModule
} from '@koobiq/components/username';

type ExampleUser = {
    firstName?: string;
    lastName?: string;
    middleName?: string;
};

const mapping: KbqFormatKeyToProfileMapping<ExampleUser> = {
    [KbqUsernameFormatKey.FirstNameShort]: 'firstName',
    [KbqUsernameFormatKey.FirstNameFull]: 'firstName',

    [KbqUsernameFormatKey.MiddleNameShort]: 'middleName',
    [KbqUsernameFormatKey.MiddleNameFull]: 'middleName',

    [KbqUsernameFormatKey.LastNameShort]: 'lastName',
    [KbqUsernameFormatKey.LastNameFull]: 'lastName'
};

/**
 * @title Username overview
 */
@Component({
    selector: 'username-overview-example',
    standalone: true,
    imports: [KbqUsernameModule, KbqTextareaModule, FormsModule, KbqFormField, KbqLinkModule],
    template: `
        <div class="layout-column layout-gap-xxl">
            <div>{{ profile | kbqUsername: 'L f. m.' }}</div>
            <div>{{ profile | kbqUsername: 'L f. m.' }}</div>

            <div>
                <a kbq-link>
                    {{ profile | kbqUsername }}
                </a>
            </div>

            <div>
                <span class="example-error-text">
                    {{ profile | kbqUsername }}
                </span>
            </div>

            <div>
                <span class="kbq-text-normal-strong">
                    {{ profile | kbqUsername }}
                </span>
            </div>

            <div>
                <span>{{ profile | kbqUsername: format }}</span>
            </div>
        </div>

        <kbq-form-field style="width: 100px">
            <textarea [(ngModel)]="format" [maxRows]="1" kbqTextarea rows="1"></textarea>
        </kbq-form-field>
    `,
    styles: `
        .example-error-text {
            color: var(--kbq-foreground-error);
        }
    `,
    providers: [
        { provide: KBQ_PROFILE_MAPPING, useValue: mapping }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsernameOverviewExample {
    profile: ExampleUser = { firstName: 'First name', lastName: 'LastName', middleName: 'MiddleName' };
    format = 'L f. m.';
}

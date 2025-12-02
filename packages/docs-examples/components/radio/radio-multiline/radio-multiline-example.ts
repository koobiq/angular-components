import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';

type ExampleOption = { label: string; hint: string };

/**
 * @title Radio multiline example
 */
@Component({
    selector: 'radio-multiline-example',
    imports: [KbqRadioModule, KbqFormFieldModule],
    template: `
        <kbq-radio-group>
            @for (option of options; track option) {
                <kbq-radio-button [checked]="$first" [value]="$index">
                    {{ option.label }}
                    <kbq-hint>{{ option.hint }}</kbq-hint>
                </kbq-radio-button>
            }
        </kbq-radio-group>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
        }

        .kbq-radio-group {
            max-width: 255px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioMultilineExample {
    readonly options: ExampleOption[] = [
        {
            label: 'Regular software and operating system updates',
            hint: 'Updating software and operating systems regularly helps to patch vulnerabilities and enhance security measures against potential threats'
        },
        {
            label: 'Using strong and unique passwords',
            hint: 'Creating strong and unique passwords for each online account can enhance cybersecurity, as cyber attacks often exploit weak or stolen passwords'
        },
        {
            label: 'Implementing multi-factor authentication (MFA)',
            hint: 'Multi-factor authentication involves multiple identification forms before account access, reducing the risk of unauthorized access'
        }
    ];
}

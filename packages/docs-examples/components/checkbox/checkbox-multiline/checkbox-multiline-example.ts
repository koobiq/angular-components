import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

/**
 * @title Checkbox multiline example
 */
@Component({
    standalone: true,
    selector: 'checkbox-multiline-example',
    imports: [KbqCheckboxModule, KbqFormFieldModule],
    template: `
        <kbq-checkbox>
            I accept the security policy terms and acknowledge the responsibility to safeguard sensitive information
            <kbq-hint>
                Please review our security policy for detailed information about data protection and privacy standards.
                By checking this box, you confirm that you understand and agree to comply with all security
                requirements.
            </kbq-hint>
        </kbq-checkbox>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
        }

        .kbq-checkbox {
            max-width: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxMultilineExample {}

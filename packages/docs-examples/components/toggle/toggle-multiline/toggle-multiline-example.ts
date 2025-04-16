import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle multiline example
 */
@Component({
    standalone: true,
    selector: 'toggle-multiline-example',
    imports: [KbqToggleModule, KbqFormFieldModule],
    template: `
        <kbq-toggle>
            I accept the security policy terms and acknowledge the responsibility to safeguard sensitive information
            <kbq-hint>
                Please review our security policy for detailed information about data protection and privacy standards.
                By checking this box, you confirm that you understand and agree to comply with all security
                requirements.
            </kbq-hint>
        </kbq-toggle>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
        }

        .kbq-toggle {
            max-width: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleMultilineExample {}

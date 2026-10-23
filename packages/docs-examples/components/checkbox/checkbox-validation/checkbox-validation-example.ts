import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqError, KbqHint } from '@koobiq/components/form-field';

/**
 * @title Checkbox validation
 */
@Component({
    selector: 'checkbox-validation-example',
    imports: [FormsModule, KbqCheckboxModule, KbqHint, KbqError, KbqButtonModule],
    template: `
        <form class="example-checkbox-validation layout-column layout-align-start-start layout-gap-l">
            <kbq-checkbox name="agreement" required [(ngModel)]="agreement">
                I accept the terms of the license agreement
                <kbq-hint>Continue without accepting to see the error</kbq-hint>
                <kbq-error>Accept the terms to continue</kbq-error>
            </kbq-checkbox>

            <button color="contrast" kbq-button type="submit">Continue</button>
        </form>
    `,
    // A fixed width keeps the centered example in place whatever the width of the error that appears.
    styles: `
        .example-checkbox-validation {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-padding-l'
    }
})
export class CheckboxValidationExample {
    protected readonly agreement = signal(false);
}

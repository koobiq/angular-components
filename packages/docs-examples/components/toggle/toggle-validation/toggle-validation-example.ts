import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqError, KbqHint } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle validation
 */
@Component({
    selector: 'toggle-validation-example',
    imports: [ReactiveFormsModule, KbqToggleModule, KbqHint, KbqError],
    template: `
        <kbq-toggle class="example-toggle-validation" [formControl]="backup">
            Automatic backup
            <kbq-hint>Turn it off to see the error</kbq-hint>
            <kbq-error>Required by the security policy of your organization</kbq-error>
        </kbq-toggle>
    `,
    // A fixed width keeps the centered example in place when the error, wider than the label, appears.
    styles: `
        .example-toggle-validation {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-padding-l'
    }
})
export class ToggleValidationExample {
    protected readonly backup = new FormControl(true, { nonNullable: true, validators: Validators.requiredTrue });
}

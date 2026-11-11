import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqError, KbqHint } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';
import { injectExampleText } from './l10n';

/**
 * @title Radio validation
 */
@Component({
    selector: 'radio-validation-example',
    imports: [ReactiveFormsModule, KbqRadioModule, KbqHint, KbqError, KbqButtonModule],
    template: `
        <form class="example-radio-validation layout-column layout-align-start-start layout-gap-l" [formGroup]="form">
            <div>
                <div id="radio-validation-label" class="layout-margin-bottom-m kbq-form__label">
                    Second sign-in factor
                </div>
                <kbq-radio-group
                    aria-labelledby="radio-validation-label"
                    formControlName="secondFactor"
                    [errorStateMatcher]="errorStateMatcher"
                >
                    <kbq-radio-button value="authenticator">{{ text().authenticatorApp }}</kbq-radio-button>
                    <kbq-radio-button value="security-key">{{ text().hardwareKey }}</kbq-radio-button>
                    <kbq-radio-button value="sms">{{ text().smsCode }}</kbq-radio-button>
                    <kbq-hint>{{ text().saveWithoutChoosing }}</kbq-hint>
                    <kbq-error>{{ text().chooseSecondFactor }}</kbq-error>
                </kbq-radio-group>
            </div>

            <button color="contrast" kbq-button type="submit">{{ text().save }}</button>
        </form>
    `,
    // A fixed width keeps the centered example in place when the error, wider than the options, appears.
    styles: `
        .example-radio-validation {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-padding-l'
    }
})
export class RadioValidationExample {
    protected readonly text = injectExampleText();

    protected readonly form = new FormGroup({
        secondFactor: new FormControl<string | null>(null, Validators.required)
    });
    // Shows the error only after the form is submitted, not as soon as focus leaves the group.
    protected readonly errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
}

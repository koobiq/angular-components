import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { PasswordValidators } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field password overview */
@Component({
    selector: 'experimental-form-field-password-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <input placeholder="Password" kbqInputPassword [formControl]="formControl" />

            <kbq-password-toggle />

            <kbq-password-hint [hasError]="formControl.hasError('minLength')">
                Min length
                @let minLength = formControl.getError('minLength');
                @if (minLength) {
                    ({{ minLength.actual }}/{{ minLength.min }})
                }
            </kbq-password-hint>

            <kbq-password-hint [hasError]="formControl.hasError('minUppercase')">
                Uppercase characters
                @let minUppercaseError = formControl.getError('minUppercase');
                @if (minUppercaseError) {
                    ({{ minUppercaseError.actual }}/{{ minUppercaseError.min }})
                }
            </kbq-password-hint>

            <kbq-password-hint [hasError]="formControl.hasError('minLowercase')">
                Lowercase characters
                @let minLowercaseError = formControl.getError('minLowercase');
                @if (minLowercaseError) {
                    ({{ minLowercaseError?.actual }}/{{ minLowercaseError?.min }})
                }
            </kbq-password-hint>

            <kbq-password-hint [hasError]="formControl.hasError('minNumber')">
                Number characters
                @let minNumberError = formControl.getError('minNumber');
                @if (minNumberError) {
                    ({{ minNumberError.actual }}/{{ minNumberError.min }})
                }
            </kbq-password-hint>

            <kbq-password-hint [hasError]="formControl.hasError('minSpecial')">
                Special characters
                @let minSpecialError = formControl.getError('minSpecial');
                @if (minSpecialError) {
                    ({{ minSpecialError.actual }}/{{ minSpecialError.min }})
                }
            </kbq-password-hint>

            @if (formControl.hasError('required')) {
                <kbq-error>Should enter password</kbq-error>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormFieldPasswordOverviewExample {
    readonly formControl = new FormControl('', [
        Validators.required,
        PasswordValidators.minLength(8),
        PasswordValidators.minUppercase(2),
        PasswordValidators.minLowercase(2),
        PasswordValidators.minNumber(2),
        PasswordValidators.minSpecial(2)
    ]);
}

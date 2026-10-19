import { ChangeDetectionStrategy, Component, Directive, signal } from '@angular/core';
import { AbstractControl, FormsModule, NG_VALIDATORS, ValidationErrors, Validator, Validators } from '@angular/forms';
import { PasswordValidators } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

/** Template-driven forms take validators from directives, so this one hands `PasswordValidators` to `ngModel`. */
@Directive({
    selector: '[examplePasswordRules]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ExamplePasswordRules, multi: true }]
})
class ExamplePasswordRules implements Validator {
    private readonly rules = Validators.compose([
        PasswordValidators.minLength(8),
        PasswordValidators.maxLength(15),
        PasswordValidators.minUppercase(1),
        PasswordValidators.minLowercase(1),
        PasswordValidators.minNumber(1),
        PasswordValidators.minSpecial(1)
    ]);

    validate(control: AbstractControl): ValidationErrors | null {
        return this.rules?.(control) ?? null;
    }
}

/**
 * @title Input password with template-driven forms
 */
@Component({
    selector: 'input-password-template-driven-example',
    imports: [
        KbqInputModule,
        FormsModule,
        ExamplePasswordRules
    ],
    template: `
        <kbq-form-field style="width: 250px">
            <kbq-label>Password</kbq-label>

            <input #passwordModel="ngModel" examplePasswordRules kbqInputPassword [(ngModel)]="password" />

            <kbq-password-toggle />

            <kbq-reactive-password-hint
                [hasError]="passwordModel.hasError('minLength') || passwordModel.hasError('maxLength')"
            >
                8 to 15 characters
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minUppercase')">
                An uppercase letter
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minLowercase')">
                A lowercase letter
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minNumber')">
                A digit
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minSpecial')">
                A special character
            </kbq-reactive-password-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPasswordTemplateDrivenExample {
    protected readonly password = signal('');
}

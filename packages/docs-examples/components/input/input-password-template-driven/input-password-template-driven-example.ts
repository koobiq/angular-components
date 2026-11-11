import { ChangeDetectionStrategy, Component, Directive, signal } from '@angular/core';
import { AbstractControl, FormsModule, NG_VALIDATORS, ValidationErrors, Validator, Validators } from '@angular/forms';
import { PasswordValidators } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { injectExampleText } from '../l10n';

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
            <kbq-label>{{ text().password }}</kbq-label>

            <input #passwordModel="ngModel" examplePasswordRules kbqInputPassword [(ngModel)]="password" />

            <kbq-password-toggle />

            <kbq-reactive-password-hint
                [hasError]="passwordModel.hasError('minLength') || passwordModel.hasError('maxLength')"
            >
                {{ text().from8to15 }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minUppercase')">
                {{ text().uppercaseLatin }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minLowercase')">
                {{ text().lowercaseLatin }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minNumber')">
                {{ text().digit }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minSpecial')">
                {{ text().special }}
            </kbq-reactive-password-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPasswordTemplateDrivenExample {
    protected readonly text = injectExampleText();

    protected readonly password = signal('');
}

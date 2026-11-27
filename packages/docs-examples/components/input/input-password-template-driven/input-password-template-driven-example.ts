import { ChangeDetectionStrategy, Component, Directive, signal } from '@angular/core';
import {
    type AbstractControl,
    FormsModule,
    NG_VALIDATORS,
    type ValidationErrors,
    type Validator,
    Validators
} from '@angular/forms';
import { PasswordValidators } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** Allows printable ASCII only and rejects an empty password, which Angular's pattern validator ignores. */
const latinAndSpecialSymbols = ({ value }: AbstractControl): ValidationErrors | null =>
    typeof value === 'string' && !/^[\x20-\x7E]+$/.test(value) ? { latinAndSpecialSymbols: true } : null;

/** Template-driven forms take validators from directives, so this one hands `PasswordValidators` to `ngModel`. */
@Directive({
    selector: '[examplePasswordRules]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ExamplePasswordRules, multi: true }]
})
class ExamplePasswordRules implements Validator {
    private readonly rules = Validators.compose([
        PasswordValidators.minLength(8),
        PasswordValidators.maxLength(128),
        PasswordValidators.minUppercase(1),
        PasswordValidators.minLowercase(1),
        PasswordValidators.minNumber(1),
        latinAndSpecialSymbols
    ]);

    validate(control: AbstractControl): ValidationErrors | null {
        return this.rules?.(control) ?? null;
    }
}

/** @title Input password with template-driven forms */
@Component({
    selector: 'input-password-template-driven-example',
    imports: [KbqInputModule, FormsModule, ExamplePasswordRules],
    template: `
        <kbq-form-field style="width: 250px">
            <kbq-label>{{ t().password }}</kbq-label>

            <input #passwordModel="ngModel" examplePasswordRules kbqInputPassword [(ngModel)]="password" />

            <kbq-password-toggle />

            <kbq-reactive-password-hint
                [hasError]="passwordModel.hasError('minLength') || passwordModel.hasError('maxLength')"
            >
                {{ t().length }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minUppercase')">
                {{ t().uppercaseLatin }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minLowercase')">
                {{ t().lowercaseLatin }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('minNumber')">
                {{ t().digit }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="passwordModel.hasError('latinAndSpecialSymbols')">
                {{ t().allowedCharacters }}
            </kbq-reactive-password-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class InputPasswordTemplateDrivenExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly password = signal('');
}

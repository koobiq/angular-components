import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { PasswordValidators } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

/** Allows printable ASCII only: latin letters, digits, spaces and special characters. */
const latinAndSpecialSymbols = ({ value }: AbstractControl): ValidationErrors | null =>
    typeof value === 'string' && /[^\x20-\x7E]/.test(value) ? { latinAndSpecialSymbols: true } : null;

/**
 * @title Input password
 */
@Component({
    selector: 'input-password-overview-example',
    imports: [
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field style="width: 250px">
            <input kbqInputPassword [formControl]="control" />

            <kbq-password-toggle [kbqTooltipHidden]="'Показать пароль'" [kbqTooltipNotHidden]="'Скрыть пароль'" />

            <kbq-reactive-password-hint [hasError]="control.hasError('minLength') || control.hasError('maxLength')">
                От 8 до 15 символов
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="control.hasError('minUppercase')">
                Заглавная латинская буква
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="control.hasError('minLowercase')">
                Строчная латинская буква
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="control.hasError('minNumber')">Цифра</kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="control.hasError('latinAndSpecialSymbols')">
                Только латинские буквы, цифры, пробелы и спецсимволы
            </kbq-reactive-password-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPasswordOverviewExample {
    readonly control = new FormControl('', [
        PasswordValidators.minLength(8),
        PasswordValidators.maxLength(15),
        PasswordValidators.minUppercase(1),
        PasswordValidators.minLowercase(1),
        PasswordValidators.minNumber(1),
        latinAndSpecialSymbols
    ]);
}

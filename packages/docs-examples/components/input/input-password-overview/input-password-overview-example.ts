import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule, PasswordRules } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Input password
 */
@Component({
    standalone: true,
    selector: 'input-password-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field style="width: 250px">
            <input [(ngModel)]="value" kbqInputPassword />

            <kbq-password-toggle [kbqTooltipHidden]="'Показать пароль'" [kbqTooltipNotHidden]="'Скрыть пароль'" />

            <kbq-password-hint [max]="15" [min]="8" [rule]="passwordRules.Length">
                От 8 до 15 символов
            </kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.UpperLatin">Заглавная латинская буква</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.LowerLatin">Строчная латинская буква</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.Digit">Цифра</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.LatinAndSpecialSymbols">
                Только латинские буквы, цифры, пробелы и спецсимволы
            </kbq-password-hint>

            <kbq-password-hint [checkRule]="atLeastNCapitalLetters(5)" [rule]="passwordRules.Custom">
                не менее 5 заглавных букв
            </kbq-password-hint>
        </kbq-form-field>
    `
})
export class InputPasswordOverviewExample {
    passwordRules = PasswordRules;

    value = '';

    atLeastNCapitalLetters = (n: number): ((value: string) => boolean) => {
        return (value: string) => {
            const found = value.match(/[A-Z]/g);

            return !!found && found!.length >= n;
        };
    };
}

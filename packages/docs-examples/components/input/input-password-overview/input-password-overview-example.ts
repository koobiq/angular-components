import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { PasswordValidators } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * Allows printable ASCII only: latin letters, digits, spaces and special characters. An empty password fails too,
 * as it fails the other rules.
 */
const latinAndSpecialSymbols = ({ value }: AbstractControl): ValidationErrors | null =>
    typeof value === 'string' && !/^[\x20-\x7E]+$/.test(value) ? { latinAndSpecialSymbols: true } : null;

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

            <kbq-password-toggle [kbqTooltipHidden]="t().showPassword" [kbqTooltipNotHidden]="t().hidePassword" />

            <kbq-reactive-password-hint [hasError]="control.hasError('minLength') || control.hasError('maxLength')">
                {{ t().from8to15 }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="control.hasError('minUppercase')">
                {{ t().uppercaseLatin }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="control.hasError('minLowercase')">
                {{ t().lowercaseLatin }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="control.hasError('minNumber')">
                {{ t().digit }}
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="control.hasError('latinAndSpecialSymbols')">
                {{ t().latinOnly }}
            </kbq-reactive-password-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPasswordOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly control = new FormControl('', [
        PasswordValidators.minLength(8),
        PasswordValidators.maxLength(15),
        PasswordValidators.minUppercase(1),
        PasswordValidators.minLowercase(1),
        PasswordValidators.minNumber(1),
        latinAndSpecialSymbols
    ]);

    constructor() {
        super(TRANSLATIONS);
    }
}

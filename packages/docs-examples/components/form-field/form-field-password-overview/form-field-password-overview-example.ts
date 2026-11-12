import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordValidators } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/** @title Form field password overview */
@Component({
    selector: 'form-field-password-overview-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [placeholder]="t().password" [formControl]="formControl" />

            <kbq-password-toggle />

            <kbq-reactive-password-hint [hasError]="formControl.hasError('minLength')">
                {{ t().minLength }}
                @let minLength = formControl.getError('minLength');
                @if (minLength) {
                    ({{ minLength.actual }}/{{ minLength.min }})
                }
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="formControl.hasError('minUppercase')">
                {{ t().uppercase }}
                @let minUppercaseError = formControl.getError('minUppercase');
                @if (minUppercaseError) {
                    ({{ minUppercaseError.actual }}/{{ minUppercaseError.min }})
                }
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="formControl.hasError('minLowercase')">
                {{ t().lowercase }}
                @let minLowercaseError = formControl.getError('minLowercase');
                @if (minLowercaseError) {
                    ({{ minLowercaseError.actual }}/{{ minLowercaseError.min }})
                }
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="formControl.hasError('minNumber')">
                {{ t().number }}
                @let minNumberError = formControl.getError('minNumber');
                @if (minNumberError) {
                    ({{ minNumberError.actual }}/{{ minNumberError.min }})
                }
            </kbq-reactive-password-hint>

            <kbq-reactive-password-hint [hasError]="formControl.hasError('minSpecial')">
                {{ t().special }}
                @let minSpecialError = formControl.getError('minSpecial');
                @if (minSpecialError) {
                    ({{ minSpecialError.actual }}/{{ minSpecialError.min }})
                }
            </kbq-reactive-password-hint>

            @if (formControl.hasError('required')) {
                <kbq-error>{{ t().shouldEnterPassword }}</kbq-error>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldPasswordOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly formControl = new FormControl('', [
        Validators.required,
        PasswordValidators.minLength(8),
        PasswordValidators.minUppercase(2),
        PasswordValidators.minLowercase(2),
        PasswordValidators.minNumber(2),
        PasswordValidators.minSpecial(2)
    ]);

    constructor() {
        super(TRANSLATIONS);
    }
}

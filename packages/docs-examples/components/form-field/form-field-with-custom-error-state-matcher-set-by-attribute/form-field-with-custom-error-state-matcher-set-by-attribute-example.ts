import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ErrorStateMatcher } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * Error state matcher that matches when a control is invalid and form is submitted.
 * Copy ShowOnFormSubmitErrorStateMatcher: https://github.com/koobiq/angular-components/blob/main/packages/components/core/error/error-state-matcher.ts
 */
class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && form?.submitted);
    }
}

/** @title Form field with CustomErrorStateMatcher which set by `errorStateMatcher` attribute */
@Component({
    selector: 'form-field-with-custom-error-state-matcher-set-by-attribute-example',
    imports: [KbqInputModule, ReactiveFormsModule, KbqButtonModule],
    template: `
        <form [formGroup]="formGroup">
            <kbq-form-field>
                <kbq-label>{{ t().email }}</kbq-label>
                <input
                    formControlName="email"
                    kbqInput
                    placeholder="mail@koobiq.io"
                    [errorStateMatcher]="customErrorStateMatcher"
                />
                <kbq-hint>{{ t().errorShownOnSubmit }}</kbq-hint>
                <kbq-error>
                    @if (formGroup.get('email')?.hasError('required')) {
                        {{ t().shouldEnterValue }}
                    } @else {
                        {{ t().invalidEmail }}
                    }
                </kbq-error>
            </kbq-form-field>

            <button class="layout-margin-top-l" kbq-button type="submit">Submit form</button>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithCustomErrorStateMatcherSetByAttributeExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly formGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });
    readonly customErrorStateMatcher = new CustomErrorStateMatcher();

    constructor() {
        super(TRANSLATIONS);
    }
}

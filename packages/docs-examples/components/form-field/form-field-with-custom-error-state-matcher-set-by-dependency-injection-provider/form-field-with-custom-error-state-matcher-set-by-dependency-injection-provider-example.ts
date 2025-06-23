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
import {
    ErrorStateMatcher,
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * Error state matcher that matches when a control is invalid and form is submitted.
 * Copy ShowOnFormSubmitErrorStateMatcher: https://github.com/koobiq/angular-components/blob/main/packages/components/core/error/error-state-matcher.ts
 */
class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && form?.submitted);
    }
}

/** @title Form field with CustomErrorStateMatcher which set by DI provider */
@Component({
    standalone: true,
    selector: 'form-field-with-custom-error-state-matcher-set-by-dependency-injection-provider-example',
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule, KbqButtonModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider(), kbqErrorStateMatcherProvider(CustomErrorStateMatcher)],
    template: `
        <form [formGroup]="formGroup">
            <kbq-form-field>
                <kbq-label>Email</kbq-label>
                <input formControlName="email" kbqInput placeholder="mail@koobiq.io" />
                <kbq-hint>Error will be shown when the control is invalid and the form is submitted</kbq-hint>
                <kbq-error>
                    @if (formGroup.get('email')?.hasError('required')) {
                        Should enter a value
                    } @else {
                        Invalid email
                    }
                </kbq-error>
            </kbq-form-field>

            <button class="layout-margin-top-l" kbq-button type="submit">Submit form</button>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithCustomErrorStateMatcherSetByDependencyInjectionProviderExample {
    readonly formGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });
}

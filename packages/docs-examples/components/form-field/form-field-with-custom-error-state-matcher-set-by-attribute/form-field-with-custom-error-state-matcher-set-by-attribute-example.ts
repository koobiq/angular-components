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
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqButtonModule } from '@koobiq/components/button';
import { ErrorStateMatcher } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * Error state matcher that matches when a control is invalid and form is submitted.
 * Copy from: https://github.com/koobiq/angular-components/blob/main/packages/components/core/error/error-state-matcher.ts
 * @see ShowOnFormSubmitErrorStateMatcher
 */
class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && form?.submitted);
    }
}

/** @title Form field with CustomErrorStateMatcher which set by `errorStateMatcher` attribute */
@Component({
    standalone: true,
    selector: 'form-field-with-custom-error-state-matcher-set-by-attribute-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqButtonModule
    ],
    template: `
        <form [formGroup]="formGroup">
            <kbq-form-field>
                <kbq-label>Email</kbq-label>
                <input
                    [errorStateMatcher]="customErrorStateMatcher"
                    formControlName="email"
                    kbqInput
                    placeholder="mail@koobiq.io"
                />
                <kbq-hint>Enter email</kbq-hint>
                <kbq-error>
                    @if (formGroup.get('email')?.hasError('required')) {
                        Should enter a value
                    } @else {
                        Invalid email
                    }
                </kbq-error>
            </kbq-form-field>

            <button
                kbq-button
                type="submit"
            >
                Submit form
            </button>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithCustomErrorStateMatcherSetByAttributeExample {
    readonly formGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });
    readonly customErrorStateMatcher = new CustomErrorStateMatcher();
}

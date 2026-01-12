import { ChangeDetectionStrategy, Component, DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    ReactiveFormsModule,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    ErrorStateMatcher,
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider
} from '@koobiq/components/core';
import { KbqFormFieldModule, KbqPasswordToggle } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

@Injectable()
class RequiredErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(
            (control?.hasError('required') && form?.submitted) ||
            (control?.invalid && !control.hasError('required'))
        );
    }
}

/**
 * @title Input change password
 */
@Component({
    selector: 'input-change-password-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqPasswordToggle,
        KbqButtonModule
    ],
    template: `
        <form class="layout-column layout-gap-m" [formGroup]="form">
            <kbq-form-field style="width: 250px">
                <input formControlName="newPassword" kbqInputPassword placeholder="Enter new password" />

                <kbq-password-toggle [kbqTooltipHidden]="'Show password'" [kbqTooltipNotHidden]="'Hide password'" />

                <kbq-hint>Password must not exceed 5 characters</kbq-hint>

                @if (newPasswordControl.errors?.required) {
                    <kbq-error>Required</kbq-error>
                }

                @if (newPasswordControl.errors?.maxlength) {
                    <kbq-error>Max Length</kbq-error>
                }
            </kbq-form-field>

            <kbq-form-field style="width: 250px">
                <input formControlName="confirmNewPassword" kbqInputPassword placeholder="Confirm new password" />

                <kbq-password-toggle [kbqTooltipHidden]="'Show password'" [kbqTooltipNotHidden]="'Hide password'" />

                @if (confirmNewPasswordControl.errors?.required) {
                    <kbq-error>Required</kbq-error>
                }

                @if (confirmNewPasswordControl.errors?.maxlength) {
                    <kbq-error>Max Length</kbq-error>
                }

                @if (confirmNewPasswordControl.errors?.passwordsNotMatch) {
                    <kbq-error>Not Match</kbq-error>
                }
            </kbq-form-field>

            <div>
                <button kbq-button type="submit">ChangePassword</button>
            </div>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(RequiredErrorStateMatcher)
    ]
})
export class InputChangePasswordExample {
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly form: FormGroup<{
        newPassword: FormControl<string | null>;
        confirmNewPassword: FormControl<string | null>;
    }>;

    protected get newPasswordControl(): AbstractControl {
        return this.form.controls.newPassword;
    }

    protected get confirmNewPasswordControl(): AbstractControl {
        return this.form.controls.confirmNewPassword;
    }

    constructor() {
        this.form = this.createForm();
    }

    createForm() {
        const compareWith =
            (compareControlName: string): ValidatorFn =>
            (control: AbstractControl) => {
                const controlToCompareWith = control.parent?.get(compareControlName);
                const isValid = !control.value || controlToCompareWith?.value === control.value;

                return isValid ? null : { passwordsNotMatch: { value: control.value } };
            };

        const loginForm = new FormGroup({
            newPassword: new FormControl<string>('', [Validators.required, Validators.maxLength(5)]),
            confirmNewPassword: new FormControl<string>('', [
                Validators.required,
                Validators.maxLength(5),
                compareWith('newPassword')
            ])
        });

        // run validation for confirmNewPassword after newPassword changed
        loginForm
            .get('newPassword')
            ?.statusChanges.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                loginForm.get('confirmNewPassword')?.updateValueAndValidity();
            });

        return loginForm;
    }
}

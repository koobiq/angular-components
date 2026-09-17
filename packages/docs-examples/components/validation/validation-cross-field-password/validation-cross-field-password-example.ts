import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormGroupDirective,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
    type ValidatorFn
} from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    PasswordValidators,
    ShowOnCrossFieldErrorStateMatcher,
    ShowRequiredOnSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * Payload every cross-field validator below publishes, so that a single `ErrorStateMatcher` can tell which
 * controls a group-level error belongs to. The names are relative to the group holding the error.
 */
type ExampleCrossFieldError = { controls: string[] };

const isExampleCrossFieldError = (value: unknown): value is ExampleCrossFieldError =>
    typeof value === 'object' && value !== null && 'controls' in value && Array.isArray(value.controls);

/**
 * Compares two control values for equality — both rules below only ever ask "same or not", never "which is
 * greater". The default (`===`) is enough for the strings here; an ordering comparator, needed for the date
 * pair in `validation-cross-field-dates-example.ts`, is a different job with a different default.
 */
type ExampleCompare = (a: unknown, b: unknown) => boolean;

const exampleValuesEqual: ExampleCompare = (a, b) => a === b;

// A control that is missing or still empty is not a cross-field problem: `Validators.required` owns that
// case, and reporting a mismatch against an empty field only gets in the user's way.
const isExampleValueEmpty = (value: unknown): boolean => value === null || value === undefined || value === '';

/** All the listed controls must hold the same value. */
const exampleMatchAll =
    (controls: string[], compare: ExampleCompare = exampleValuesEqual): ValidatorFn =>
    (group: AbstractControl): ValidationErrors | null => {
        const values = controls.map((name) => group.get(name)?.value);

        if (values.some(isExampleValueEmpty)) {
            return null;
        }

        const matches = values.every((value) => compare(value, values[0]));

        return matches ? null : { matchAll: { controls } satisfies ExampleCrossFieldError };
    };

/** All the listed controls must hold different values. */
const exampleDistinct =
    (controls: string[], compare: ExampleCompare = exampleValuesEqual): ValidatorFn =>
    (group: AbstractControl): ValidationErrors | null => {
        const values = controls.map((name) => group.get(name)?.value);

        if (values.some(isExampleValueEmpty)) {
            return null;
        }

        const distinct = values.every((value, index) =>
            values.every((other, otherIndex) => index === otherIndex || !compare(value, other))
        );

        return distinct ? null : { distinct: { controls } satisfies ExampleCrossFieldError };
    };

/**
 * The library matcher does the display half: it shows a group-level error on the controls that error concerns,
 * once every one of them is touched. All it needs is a way to map an error to its controls — here the
 * validators publish that list themselves, so the scope is a single lookup.
 *
 * `ShowRequiredOnSubmitErrorStateMatcher` as the second argument keeps the validation guide's rule for
 * `required` — an empty field shouldn't turn red on blur — without affecting the cross-field errors above,
 * which still reveal once every control they name has been touched, or on submit.
 */
const exampleCrossFieldMatcher = new ShowOnCrossFieldErrorStateMatcher(
    (_key, value) => (isExampleCrossFieldError(value) ? value.controls : null),
    new ShowRequiredOnSubmitErrorStateMatcher()
);

/**
 * @title Validation: cross-field
 */
@Component({
    selector: 'validation-cross-field-password-example',
    imports: [ReactiveFormsModule, KbqInputModule, KbqButtonModule, KbqFormsModule],
    template: `
        <form #formDirective="ngForm" class="kbq-form-vertical" [formGroup]="form" (ngSubmit)="onSubmit(formDirective)">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Current password</kbq-label>
                        <input formControlName="currentPassword" kbqInputPassword />
                        <kbq-password-toggle />

                        @if (form.controls.currentPassword.hasError('required')) {
                            <kbq-error>Required</kbq-error>
                        }
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>New password</kbq-label>
                        <input formControlName="newPassword" kbqInputPassword />
                        <kbq-password-toggle />

                        @if (form.controls.newPassword.hasError('required')) {
                            <kbq-error>Required</kbq-error>
                        } @else if (form.controls.newPassword.hasError('minLength')) {
                            <kbq-error>Minimum 8 characters</kbq-error>
                        } @else if (form.hasError('distinct')) {
                            <kbq-error>The new password must differ from the current one</kbq-error>
                        }
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Confirm new password</kbq-label>
                        <input formControlName="confirmPassword" kbqInputPassword />
                        <kbq-password-toggle />

                        @if (form.controls.confirmPassword.hasError('required')) {
                            <kbq-error>Required</kbq-error>
                        } @else if (form.hasError('matchAll')) {
                            <kbq-error>Passwords do not match</kbq-error>
                        }
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <button color="contrast" kbq-button type="submit">Change password</button>
                </div>
            </div>
        </form>
    `,
    styles: `
        form {
            width: 320px;
        }
    `,
    providers: [
        kbqErrorStateMatcherProvider(exampleCrossFieldMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationCrossFieldPasswordExample {
    protected readonly form = new FormGroup(
        {
            currentPassword: new FormControl('', Validators.required),
            newPassword: new FormControl('', [Validators.required, PasswordValidators.minLength(8)]),
            confirmPassword: new FormControl('', Validators.required)
        },
        {
            // Both rules live on the group and both are served by the same matcher. Their control sets differ
            // and overlap on `newPassword`, so the highlight follows the error payload rather than lighting
            // up the whole group.
            validators: [
                exampleDistinct(['currentPassword', 'newPassword']),
                exampleMatchAll(['newPassword', 'confirmPassword'])
            ]
        }
    );

    private readonly formFieldList = viewChildren(KbqFormField);

    protected onSubmit(formDirective: FormGroupDirective): void {
        if (this.form.invalid) {
            this.focusFirstInvalidControl();

            return;
        }

        // `FormGroupDirective.resetForm()`, not `this.form.reset()`: the latter only resets the model, not
        // the directive's own `submitted` flag, which would otherwise stay `true` forever and make every
        // cross-field error reveal immediately on the next attempt instead of waiting for both fields touched.
        formDirective.resetForm();
    }

    private focusFirstInvalidControl(): void {
        // The matcher re-evaluates `errorState` on the next change detection, triggered by the submit event
        // itself — deferred a tick so `formFieldList()` reports each field's post-submit invalid state.
        setTimeout(() => {
            const invalidControl = this.formFieldList().find((control) => control.invalid);

            invalidControl?.focus();
        });
    }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
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
    ShowOnCrossFieldErrorStateMatcher
} from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * Payload every cross-field validator below publishes, so that a single `ErrorStateMatcher` can tell which
 * controls a group-level error belongs to. The names are relative to the group holding the error.
 */
type ExampleCrossFieldError = { controls: string[] };

/** Orders two control values, the way `Array.prototype.sort` expects: negative, zero or positive. */
type ExampleCompare = (a: unknown, b: unknown) => number;

/**
 * Enough for the strings below, and not for anything carrying an identity: two Luxon `DateTime`s standing for
 * the same moment are different references, so `===` never reports them as equal. Those need a comparator of
 * their own — see how the date pair in the form below passes `DateAdapter.compareDate`.
 */
const exampleCompareValues: ExampleCompare = (a, b) => {
    if (a === b) {
        return 0;
    }

    // `<` orders two strings or two numbers correctly; the cast only satisfies the compiler.
    return (a as string) < (b as string) ? -1 : 1;
};

/** Builds a group validator checking the values of the listed controls against `isValid`. */
const exampleCrossFieldValidator =
    (errorKey: string, isValid: (values: unknown[], compare: ExampleCompare) => boolean) =>
    (controls: string[], compare: ExampleCompare = exampleCompareValues): ValidatorFn =>
    (group: AbstractControl): ValidationErrors | null => {
        const values = controls.map((name) => group.get(name)?.value);

        // A control that is missing or still empty is not a cross-field problem: `Validators.required` owns
        // that case, and reporting a mismatch against an empty field only gets in the user's way.
        if (values.some((value) => value === null || value === undefined || value === '')) {
            return null;
        }

        return isValid(values, compare) ? null : { [errorKey]: { controls } satisfies ExampleCrossFieldError };
    };

/** All the listed controls must hold the same value. */
const exampleMatchAll = exampleCrossFieldValidator('matchAll', (values, compare) =>
    values.every((value) => compare(value, values[0]) === 0)
);

/** All the listed controls must hold different values. */
const exampleDistinct = exampleCrossFieldValidator('distinct', (values, compare) =>
    values.every((value, index) =>
        values.every((other, otherIndex) => index === otherIndex || compare(value, other) !== 0)
    )
);

/**
 * The library matcher does the display half: it shows a group-level error on the controls that error concerns,
 * once every one of them is touched. All it needs is a way to map an error to its controls — here the
 * validators publish that list themselves, so the scope is a single lookup.
 */
const exampleCrossFieldMatcher = new ShowOnCrossFieldErrorStateMatcher(
    (_key, value) => (value as ExampleCrossFieldError | undefined)?.controls ?? null
);

/**
 * @title Validation: cross-field
 */
@Component({
    selector: 'validation-cross-field-password-example',
    imports: [ReactiveFormsModule, KbqInputModule, KbqButtonModule, KbqFormsModule],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form" (ngSubmit)="onSubmit()">
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

    protected onSubmit(): void {
        if (this.form.valid) {
            this.form.reset();
        }
    }
}

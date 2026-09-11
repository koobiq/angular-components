import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
    type ValidatorFn
} from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    ErrorStateMatcher,
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    PasswordValidators
} from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * Payload every cross-field validator below publishes, so that a single `ErrorStateMatcher` can tell which
 * controls a group-level error belongs to. The names are relative to the group holding the error.
 */
type ExampleCrossFieldError = { controls: string[] };

/** Decides whether two control values count as equal. */
type ExampleEquals = (a: unknown, b: unknown) => boolean;

/**
 * Strict equality is right for the strings and numbers below, but never for object values: two `Date`s, Luxon
 * `DateTime`s or Moment objects standing for the same moment are still different references. Comparing dates
 * means passing a comparator of your own, `(a, b) => adapter.sameDate(a, b)` for instance.
 */
const exampleStrictEquals: ExampleEquals = (a, b) => a === b;

/** Builds a group validator checking the values of the listed controls against `isValid`. */
const exampleCrossFieldValidator =
    (errorKey: string, isValid: (values: unknown[], equals: ExampleEquals) => boolean) =>
    (controls: string[], equals: ExampleEquals = exampleStrictEquals): ValidatorFn =>
    (group: AbstractControl): ValidationErrors | null => {
        const values = controls.map((name) => group.get(name)?.value);

        // A control that is missing or still empty is not a cross-field problem: `Validators.required` owns
        // that case, and reporting a mismatch against an empty field only gets in the user's way.
        if (values.some((value) => value === null || value === undefined || value === '')) {
            return null;
        }

        return isValid(values, equals) ? null : { [errorKey]: { controls } satisfies ExampleCrossFieldError };
    };

/** All the listed controls must hold the same value. */
const exampleMatchAll = exampleCrossFieldValidator('matchAll', (values, equals) =>
    values.every((value) => equals(value, values[0]))
);

/** All the listed controls must hold different values. */
const exampleDistinct = exampleCrossFieldValidator('distinct', (values, equals) =>
    values.every((value, index) => values.every((other, otherIndex) => index === otherIndex || !equals(value, other)))
);

/**
 * Shows group-level errors on the controls they name, on top of the default per-control behavior.
 *
 * A `FormGroup` error is invisible to `kbq-form-field` by default: the red border and `<kbq-error>` are driven
 * by the *control's* `errorState`, which is this matcher's return value.
 */
@Injectable()
class ExampleCrossFieldErrorStateMatcher extends ErrorStateMatcher {
    override isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return super.isErrorState(control, form) || this.isCrossFieldErrorState(control, form);
    }

    private isCrossFieldErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const parent = control?.parent;

        // A group's own `errors` only ever holds errors set by validators attached to the group itself, never
        // its children's, so this is exactly the cross-field error set. Bailing out here also keeps the check
        // cheap: the matcher runs on every change detection pass, for every control.
        if (!parent?.errors) {
            return false;
        }

        const siblings = parent.controls as Record<string, AbstractControl>;
        const name = Object.keys(siblings).find((key) => siblings[key] === control);

        if (!name) {
            return false;
        }

        return Object.values(parent.errors).some((error: unknown) => {
            const { controls } = (error ?? {}) as Partial<ExampleCrossFieldError>;

            // Waiting for every named control to be touched is what makes the group light up on blur rather
            // than on the first keystroke — while the user is still typing the second value, the pair is
            // always "wrong" and highlighting it would be noise.
            return controls?.includes(name) && (form?.submitted || controls.every((key) => siblings[key]?.touched));
        });
    }
}

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
        kbqErrorStateMatcherProvider(ExampleCrossFieldErrorStateMatcher)
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

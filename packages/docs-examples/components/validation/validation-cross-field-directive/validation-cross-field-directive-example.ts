import { ChangeDetectionStrategy, Component, Directive, forwardRef, input, Provider } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    ReactiveFormsModule,
    ValidationErrors,
    Validator,
    Validators
} from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { switchMap } from 'rxjs/operators';

const EXAMPLE_MATCH_WITH_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => ExampleMatchWith),
    multi: true
};

/**
 * Requires the host control to have the same value as the control passed to `exampleMatchWith`.
 *
 * Unlike a validator on the group, this one puts the error on the host control itself, so the default
 * `ErrorStateMatcher` highlights the field and renders `<kbq-error>` with no extra wiring.
 */
@Directive({
    selector: '[exampleMatchWith]',
    providers: [EXAMPLE_MATCH_WITH_VALIDATOR]
})
export class ExampleMatchWith implements Validator {
    /** Control the host control is compared against. */
    readonly source = input.required<AbstractControl>({ alias: 'exampleMatchWith' });

    private onValidatorChange?: () => void;

    constructor() {
        // The other half of a cross-field rule is a control this one does not own, so editing it has to
        // re-run this validator. `registerOnValidatorChange` is the sanctioned hook for that: the callback
        // Angular hands over revalidates the host control, which keeps the link declarative and tears it down
        // with the directive, instead of an `updateValueAndValidity()` subscription living in the component.
        toObservable(this.source)
            .pipe(
                switchMap((source) => source.valueChanges),
                takeUntilDestroyed()
            )
            .subscribe(() => this.onValidatorChange?.());
    }

    validate(control: AbstractControl): ValidationErrors | null {
        const { value } = control;

        // An empty field is `Validators.required`'s business, not a mismatch.
        if (value === null || value === undefined || value === '') {
            return null;
        }

        return value === this.source().value ? null : { matchWith: true };
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChange = fn;
    }
}

/**
 * @title Validation: cross-field with a validator directive
 */
@Component({
    selector: 'validation-cross-field-directive-example',
    imports: [ReactiveFormsModule, KbqInputModule, KbqFormsModule, ExampleMatchWith],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>New password</kbq-label>
                        <input formControlName="newPassword" kbqInputPassword />
                        <kbq-password-toggle />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Confirm new password</kbq-label>
                        <input
                            formControlName="confirmPassword"
                            kbqInputPassword
                            [exampleMatchWith]="form.controls.newPassword"
                        />
                        <kbq-password-toggle />

                        @if (form.controls.confirmPassword.hasError('matchWith')) {
                            <kbq-error>Passwords do not match</kbq-error>
                        }
                    </kbq-form-field>
                </div>
            </div>
        </form>
    `,
    styles: `
        form {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationCrossFieldDirectiveExample {
    protected readonly form = new FormGroup({
        newPassword: new FormControl('', Validators.required),
        confirmPassword: new FormControl('', Validators.required)
    });
}

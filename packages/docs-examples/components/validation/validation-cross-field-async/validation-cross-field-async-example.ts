import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    type AsyncValidatorFn,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import {
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    ShowOnCrossFieldErrorStateMatcher
} from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { map, Observable, of, timer } from 'rxjs';

/**
 * Payload the cross-field validator publishes, so that the `ErrorStateMatcher` can tell which controls a
 * group-level error belongs to. The names are relative to the group holding the error.
 */
type ExampleCrossFieldError = { controls: string[] };

/**
 * Stands in for a policy check only the server can make — it is the side holding the password history and the
 * rules. A real implementation would call `HttpClient` here.
 */
const exampleCheckOnServer = (current: string, next: string): Observable<boolean> =>
    timer(800).pipe(map(() => !next.toLowerCase().includes(current.toLowerCase().slice(0, 4))));

/** Asks the server whether the pair of values is acceptable. */
const exampleAsyncRule =
    (controls: string[], check: (values: string[]) => Observable<boolean>): AsyncValidatorFn =>
    (group: AbstractControl): Observable<ValidationErrors | null> => {
        const values = controls.map((name) => group.get(name)?.value);

        // Never spend a request on a half-filled form. `0`/`false` would be real values here, but every
        // control in this example is a password, so the string check stays consistent with the other examples.
        if (values.some((value) => value === null || value === undefined || value === '')) {
            return of(null);
        }

        return check(values as string[]).pipe(
            map((accepted) => (accepted ? null : { tooSimilar: { controls } satisfies ExampleCrossFieldError }))
        );
    };

/**
 * The library matcher does the display half. While the group is PENDING its `errors` are null, so nothing is
 * shown until the answer arrives — which is what keeps the fields from flashing red and back on every round
 * trip.
 */
const exampleCrossFieldMatcher = new ShowOnCrossFieldErrorStateMatcher(
    (_key, value) => (value as ExampleCrossFieldError | undefined)?.controls ?? null
);

/**
 * @title Validation: asynchronous cross-field
 */
@Component({
    selector: 'validation-cross-field-async-example',
    imports: [ReactiveFormsModule, KbqInputModule, KbqFormsModule],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Current password</kbq-label>
                        <input formControlName="currentPassword" kbqInputPassword />
                        <kbq-password-toggle />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>New password</kbq-label>
                        <input formControlName="newPassword" kbqInputPassword />
                        <kbq-password-toggle />

                        <!--
                            Reading a signal fed by the group's status is also what makes this OnPush view
                            re-check itself when the answer arrives: the child controls' own status does not
                            change when the error lands on the group, so nothing else would mark the view dirty.
                        -->
                        @if (pending()) {
                            <kbq-hint>Checking with the server&hellip;</kbq-hint>
                        }

                        @if (form.hasError('tooSimilar')) {
                            <kbq-error>The new password is too similar to the current one</kbq-error>
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
    providers: [
        kbqErrorStateMatcherProvider(exampleCrossFieldMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationCrossFieldAsyncExample {
    protected readonly form = new FormGroup(
        {
            currentPassword: new FormControl('', Validators.required),
            newPassword: new FormControl('', Validators.required)
        },
        {
            asyncValidators: exampleAsyncRule(['currentPassword', 'newPassword'], ([current, next]) =>
                exampleCheckOnServer(current, next)
            ),
            // Without this the request would leave on every keystroke. It also means the model lags behind the
            // input until the field is left.
            updateOn: 'blur'
        }
    );

    private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });

    protected readonly pending = computed(() => this.status() === 'PENDING');
}

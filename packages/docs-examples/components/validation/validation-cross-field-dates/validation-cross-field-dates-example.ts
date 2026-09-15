import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    type ValidatorFn
} from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    ShowOnCrossFieldErrorStateMatcher
} from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { DateTime } from 'luxon';

/**
 * Payload the cross-field validator publishes, so that the `ErrorStateMatcher` can tell which controls a
 * group-level error belongs to. The names are relative to the group holding the error.
 */
type ExampleCrossFieldError = { controls: string[] };

/**
 * Compares two control values. The default below is enough for strings and numbers; a date needs a comparator
 * of its own, which is the whole point of this example.
 */
type ExampleCompare = (a: unknown, b: unknown) => number;

/** The listed controls must hold values in ascending order. */
const exampleOrder =
    (controls: string[], compare: ExampleCompare): ValidatorFn =>
    (group: AbstractControl): ValidationErrors | null => {
        const values = controls.map((name) => group.get(name)?.value);

        // An empty control is `Validators.required`'s business, not an ordering problem.
        if (values.some((value) => value === null || value === undefined || value === '')) {
            return null;
        }

        const ordered = values.every((value, index) => index === 0 || compare(values[index - 1], value) <= 0);

        return ordered ? null : { order: { controls } satisfies ExampleCrossFieldError };
    };

/**
 * The library matcher does the display half: it shows a group-level error on the controls that error concerns,
 * once every one of them is touched. All it needs is a way to map an error to its controls — here the
 * validators publish that list themselves, so the scope is a single lookup.
 */
const exampleCrossFieldMatcher = new ShowOnCrossFieldErrorStateMatcher(
    (_key, value) => (value as ExampleCrossFieldError | undefined)?.controls ?? null
);

/**
 * @title Validation: cross-field over dates
 */
@Component({
    selector: 'validation-cross-field-dates-example',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqFormsModule, KbqDatepickerModule, LuxonDateModule],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Valid from</kbq-label>
                        <input formControlName="validFrom" [kbqDatepicker]="validFromPicker" />
                        <kbq-datepicker-toggle-icon kbqSuffix [for]="validFromPicker" />
                        <kbq-datepicker #validFromPicker />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Valid until</kbq-label>
                        <input formControlName="validUntil" [kbqDatepicker]="validUntilPicker" />
                        <kbq-datepicker-toggle-icon kbqSuffix [for]="validUntilPicker" />
                        <kbq-datepicker #validUntilPicker />

                        @if (form.hasError('order')) {
                            <kbq-error>The end of the period must not precede its start</kbq-error>
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
export class ValidationCrossFieldDatesExample {
    private readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);

    protected readonly form = new FormGroup(
        {
            validFrom: new FormControl<DateTime | null>(null),
            validUntil: new FormControl<DateTime | null>(null)
        },
        {
            // `<` happens to order dates correctly, because they coerce to a number, but `===` never reports
            // two of them as equal. Comparing them by hand would reject a period that starts and ends on the
            // same day; the adapter compares them properly, whichever date library is installed.
            validators: exampleOrder(['validFrom', 'validUntil'], (a, b) =>
                this.adapter.compareDate(a as DateTime, b as DateTime)
            )
        }
    );
}

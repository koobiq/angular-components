import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    ReactiveFormsModule,
    ValidationErrors,
    type ValidatorFn
} from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, ErrorStateMatcher, kbqErrorStateMatcherProvider, KbqFormsModule } from '@koobiq/components/core';
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
 * Shows group-level errors on the controls they name, on top of the default per-control behavior. Identical to
 * the one in the password example — the contract between a cross-field validator and the matcher is just the
 * `controls` array, so the same matcher serves any rule that publishes it.
 */
@Injectable()
class ExampleCrossFieldErrorStateMatcher extends ErrorStateMatcher {
    override isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return super.isErrorState(control, form) || this.isCrossFieldErrorState(control, form);
    }

    private isCrossFieldErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const parent = control?.parent;

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

            return controls?.includes(name) && (form?.submitted || controls.every((key) => siblings[key]?.touched));
        });
    }
}

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
        kbqErrorStateMatcherProvider(ExampleCrossFieldErrorStateMatcher)
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

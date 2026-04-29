import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Validation: single validator
 */
@Component({
    selector: 'validation-basic-single-validator-example',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule, KbqButtonModule, KbqFormsModule],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Name</kbq-label>
                        <input formControlName="name" kbqInput />

                        <kbq-error>Required</kbq-error>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <button color="contrast" kbq-button type="submit">Submit</button>
                </div>
            </div>
        </form>
    `,
    styles: `
        form {
            width: 320px;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationBasicSingleValidatorExample {
    protected readonly form = new FormGroup({
        name: new FormControl('', [Validators.required])
    });

    private readonly formFieldList = viewChildren(KbqFormField);

    onSubmit(): void {
        setTimeout(() => {
            this.formFieldList()
                .find((f) => f.invalid)
                ?.focus();
        });
    }
}

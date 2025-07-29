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
 * @title Validation message for specific field
 */
@Component({
    selector: 'validation-message-for-specific-field-example',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule
    ],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>The error message appears above the hint</kbq-label>
                        <input formControlName="first" kbqInput />

                        <kbq-error>Required</kbq-error>

                        <kbq-hint>Hint under the field</kbq-hint>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row layout-margin-bottom-xxl">
                    <kbq-form-field>
                        <kbq-label>The error message replaces the hint</kbq-label>
                        <input #input="kbqInput" formControlName="last" kbqInput />

                        @if (input.errorState) {
                            <kbq-error>Required</kbq-error>
                        } @else {
                            <kbq-hint>Hint under the field</kbq-hint>
                        }
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <button class="flex-25" color="contrast" kbq-button type="submit">Send</button>
                </div>
            </div>
        </form>
    `,
    styles: `
        form {
            width: 320px;
            padding: 1px;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationMessageForSpecificFieldExample {
    protected readonly form = new FormGroup({
        first: new FormControl('', [Validators.required]),
        last: new FormControl('', [Validators.required])
    });

    private readonly formFieldList = viewChildren(KbqFormField);

    onSubmit(): void {
        this.focusFirstInvalidControl();
    }

    private focusFirstInvalidControl(): void {
        setTimeout(() => {
            const invalidControl = this.formFieldList().find((control) => control.invalid);

            invalidControl?.focus();
        });
    }
}

import { ChangeDetectionStrategy, Component, signal, viewChildren } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    ShowRequiredOnSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { timer } from 'rxjs';

/**
 * @title Validation on submit with custom matcher
 */
@Component({
    selector: 'validation-on-submit-custom-matcher-example',
    imports: [
        ReactiveFormsModule,
        KbqFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule
    ],
    template: `
        <form class="kbq-form-vertical" [formGroup]="globalErrorForm" (ngSubmit)="submitForm()">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Name</kbq-label>
                        <input formControlName="firstName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row layout-margin-bottom-xxl">
                    <kbq-form-field>
                        <kbq-label>Last name</kbq-label>
                        <input formControlName="lastName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <button
                        class="flex-25"
                        color="contrast"
                        kbq-button
                        type="submit"
                        [class.kbq-progress]="inProgress()"
                        [disabled]="inProgress()"
                    >
                        Send
                    </button>
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
        class: 'layout-margin-5xl layout-align-center-center layout-column'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(ShowRequiredOnSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationOnSubmitCustomMatcherExample {
    protected readonly inProgress = signal(false);
    protected readonly globalErrorForm = new FormGroup({
        firstName: new FormControl('', [Validators.minLength(5), Validators.required]),
        lastName: new FormControl('')
    });

    private readonly formFieldList = viewChildren(KbqFormField);

    protected submitForm(): void {
        if (this.globalErrorForm.invalid) {
            this.focusFirstInvalidControl();

            return;
        }

        this.inProgress.set(true);
        timer(1000).subscribe(() => {
            this.inProgress.set(false);
        });
    }

    private focusFirstInvalidControl(): void {
        setTimeout(() => {
            const invalidControl = this.formFieldList().find((control) => control.invalid);

            invalidControl?.focus();
        });
    }
}

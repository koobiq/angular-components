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
 * @title Validation optional label
 */
@Component({
    selector: 'validation-optional-label-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule
    ],
    template: `
        <form class="kbq-form-vertical" novalidate [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <div class="kbq-form__label">Name</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="firstName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <div class="kbq-form__label">Last name</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="lastName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row layout-margin-bottom-xxl">
                    <div class="kbq-form__label">Patronymic</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="patronymic" kbqInput placeholder="Optional" />
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
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationOptionalLabelExample {
    protected readonly form = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        patronymic: new FormControl('')
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

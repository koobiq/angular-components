import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { injectExampleText } from '../l10n';

/**
 * @title Validation optional label
 */
@Component({
    selector: 'validation-optional-label-example',
    imports: [
        ReactiveFormsModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule
    ],
    template: `
        <form class="kbq-form-vertical" novalidate [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <div class="kbq-form__label">{{ text().name }}</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="firstName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <div class="kbq-form__label">{{ text().lastName }}</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="lastName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row layout-margin-bottom-xxl">
                    <div class="kbq-form__label">{{ text().patronymic }}</div>
                    <kbq-form-field class="kbq-form__control">
                        <input formControlName="patronymic" kbqInput [placeholder]="text().optional" />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row layout-align-start-start">
                    <button color="contrast" kbq-button type="submit">{{ text().submit }}</button>
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
    providers: [
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationOptionalLabelExample {
    protected readonly text = injectExampleText();

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

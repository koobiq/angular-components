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
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Validation: single validator
 */
@Component({
    selector: 'validation-basic-single-validator-example',
    imports: [ReactiveFormsModule, KbqInputModule, KbqButtonModule, KbqFormsModule],
    template: `
        <form class="kbq-form-vertical" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>{{ t().name }}</kbq-label>
                        <input formControlName="name" kbqInput />

                        <kbq-error>{{ t().required }}</kbq-error>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row layout-align-start-start">
                    <button color="contrast" kbq-button type="submit">{{ t().submit }}</button>
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
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationBasicSingleValidatorExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

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

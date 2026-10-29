import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    kbqErrorStateMatcherProvider,
    KbqFormsModule,
    KbqOptionModule,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField, kbqFormFieldDefaultOptionsProvider } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Validation required label
 */
@Component({
    selector: 'validation-required-label-example',
    imports: [
        ReactiveFormsModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule,
        KbqOptionModule,
        KbqSelectModule,
        KbqTextareaModule
    ],
    template: `
        <form class="kbq-form-horizontal" novalidate [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field horizontal labelClass="flex-25" contentClass="flex-75">
                        <kbq-label>Name</kbq-label>
                        <input formControlName="firstName" kbqInput />

                        <kbq-error>Required</kbq-error>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field horizontal labelClass="flex-25" contentClass="flex-75">
                        <kbq-label>Last name</kbq-label>
                        <input formControlName="lastName" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field horizontal labelClass="flex-25" contentClass="flex-75">
                        <kbq-label>Patronymic</kbq-label>
                        <input formControlName="thirdName" kbqInput placeholder="Optional" />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field horizontal labelClass="flex-25" contentClass="flex-75">
                        <kbq-label>Email</kbq-label>
                        <input formControlName="email" kbqInput type="email" />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field horizontal labelClass="flex-25" contentClass="flex-75">
                        <kbq-label>Request reason</kbq-label>
                        <kbq-select formControlName="reason">
                            @for (option of docsReasons; track option.value) {
                                <kbq-option [value]="option.value">
                                    {{ option.label }}
                                </kbq-option>
                            }
                        </kbq-select>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field horizontal labelClass="flex-25" contentClass="flex-75">
                        <kbq-label>Estimation</kbq-label>
                        <kbq-select formControlName="estimation">
                            @for (option of estimation; track option.value) {
                                <kbq-option [value]="option.value">
                                    {{ option.label }}
                                </kbq-option>
                            }
                        </kbq-select>

                        <kbq-error>Required</kbq-error>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row layout-margin-bottom-xxl">
                    <kbq-form-field horizontal labelClass="flex-25" contentClass="flex-75">
                        <kbq-label>Comment</kbq-label>
                        <textarea formControlName="comment" kbqTextarea></textarea>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <div class="flex-25"></div>
                    <div class="flex-75">
                        <button color="contrast" kbq-button type="submit">Send</button>
                    </div>
                </div>
            </div>
        </form>
    `,
    styles: `
        .kbq-form__row:has(> .kbq-form-field-type-select) {
            --kbq-forms-size-vertical-row-margin-bottom: var(--kbq-size-xl);
        }

        form {
            width: 574px;
            padding: 1px;
        }
    `,
    providers: [
        kbqErrorStateMatcherProvider(ShowOnFormSubmitErrorStateMatcher),
        kbqFormFieldDefaultOptionsProvider({ showRequiredMarker: true })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationRequiredLabelExample {
    protected readonly docsReasons = [
        { value: 1, label: 'Parenting issues' },
        { value: 2, label: 'Depression, anxiety, fear' },
        { value: 3, label: 'Life crises' },
        { value: 4, label: 'Low self-confidence' },
        { value: 5, label: 'Relationships' },
        { value: 6, label: 'Psychosomatic illnesses' },
        { value: 7, label: 'Recurring unpleasant situations' },
        { value: 8, label: 'Difficult life situation' },
        { value: 9, label: 'Emotional disorders' },
        { value: 10, label: 'Other' }
    ];

    protected readonly estimation = [
        { value: 1, label: 'Bad' },
        { value: 2, label: 'Satisfactory' },
        { value: 3, label: 'Good' },
        { value: 4, label: 'Best of all' }
    ];

    protected readonly form = new FormGroup({
        firstName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        lastName: new FormControl<string>('', { nonNullable: true }),
        thirdName: new FormControl<string>('', { nonNullable: true }),
        email: new FormControl<string>('', { nonNullable: true, validators: [Validators.email] }),
        reason: new FormControl<number>(this.docsReasons[2].value, { nonNullable: true }),
        estimation: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        comment: new FormControl<string>('', { nonNullable: true })
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

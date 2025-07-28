import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule, KbqOptionModule } from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Validation required label
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-required-label-example',
    template: `
        <div class="layout-margin" style="width: 400px">
            <form class="kbq-form-horizontal" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                <div class="kbq-form__fieldset">
                    <div class="kbq-form__row">
                        <label class="kbq-form__label flex-20">Name</label>
                        <kbq-form-field class="kbq-form__control flex-80">
                            <input [required]="true" formControlName="firstName" kbqInput />

                            @if (form.get('firstName')?.hasError('required')) {
                                <kbq-error>Required</kbq-error>
                            }
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <label class="kbq-form__label flex-20">Last name</label>
                        <kbq-form-field class="kbq-form__control flex-80">
                            <input formControlName="lastName" kbqInput />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <label class="kbq-form__label flex-20">Patronymic</label>
                        <kbq-form-field class="kbq-form__control flex-80">
                            <input formControlName="thirdName" kbqInput placeholder="Optional" />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <label class="kbq-form__label flex-20">Email</label>
                        <kbq-form-field class="kbq-form__control flex-80">
                            <input formControlName="email" kbqInput type="email" />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <label class="kbq-form__label flex-20">Request reason</label>
                        <kbq-form-field class="kbq-form__control flex-80">
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
                        <label class="kbq-form__label flex-20">Estimation</label>
                        <kbq-form-field class="kbq-form__control flex-80">
                            <kbq-select [required]="true" formControlName="estimation">
                                @for (option of estimation; track option.value) {
                                    <kbq-option [value]="option.value">
                                        {{ option.label }}
                                    </kbq-option>
                                }
                            </kbq-select>

                            @if (form.get('estimation')?.hasError('required')) {
                                <kbq-error>Required</kbq-error>
                            }
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <label class="kbq-form__label flex-20">Comment</label>
                        <kbq-form-field class="kbq-form__control flex-80">
                            <textarea formControlName="comment" kbqTextarea></textarea>
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <div class="kbq-form__label flex-20"></div>
                        <div class="kbq-form__control flex-25">
                            <button color="contrast" kbq-button type="submit" style="width: 100%;">Send</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule,
        KbqOptionModule,
        KbqSelectModule,
        KbqTextareaModule
    ],
    styles: `
        :host {
            label:has(+ .kbq-form-field input:required, + .kbq-form-field .kbq-select[required])::after {
                content: ' *';
                color: var(--kbq-foreground-error);
            }
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationRequiredLabelExample {
    protected readonly form = new FormGroup({
        firstName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        lastName: new FormControl<string>('', { nonNullable: true }),
        thirdName: new FormControl<string>('', { nonNullable: true }),
        email: new FormControl<string>('', { nonNullable: true, validators: [Validators.email] }),
        reason: new FormControl<number>(3, { nonNullable: true }),
        estimation: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        comment: new FormControl<string>('', { nonNullable: true })
    });

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

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    KBQ_FORM_FIELD_DEFAULT_OPTIONS,
    KbqFormFieldDefaultOptions,
    KbqFormFieldModule
} from '@koobiq/components-experimental/form-field';
import {
    ErrorStateMatcher,
    KbqLocaleServiceModule,
    PasswordValidators,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

@Component({
    standalone: true,
    selector: 'validate-on-form-submit',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    providers: [{ provide: ErrorStateMatcher, useClass: ShowOnFormSubmitErrorStateMatcher }],
    template: `
        <h3>Show validation error on form submit, using ShowOnFormSubmitErrorStateMatcher by DI provider</h3>

        <form [formGroup]="formGroup">
            <kbq-form-field>
                <kbq-label>Form field with custom ErrorStateMatcher</kbq-label>
                <input formControlName="email" kbqInput placeholder="mail@koobiq.io" />
                <kbq-hint>Enter email</kbq-hint>
                <kbq-error>
                    @if (formGroup.get('email')?.hasError('required')) {
                        Should enter a value
                    } @else {
                        Invalid email
                    }
                </kbq-error>
            </kbq-form-field>

            <button type="submit">Submit form</button>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowValidationErrorOnFormSubmit {
    readonly formGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });
}

@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    providers: [{ provide: ErrorStateMatcher, useClass: ShowOnControlDirtyErrorStateMatcher }],
    selector: 'validate-on-control-dirty',
    template: `
        <h3>Show validation error on control is dirty (changed), using ShowOnControlDirtyErrorStateMatcher</h3>

        <form [formGroup]="formGroup">
            <kbq-form-field>
                <input formControlName="field1" kbqInput />
                <kbq-hint>should be filled</kbq-hint>
                <kbq-error>required</kbq-error>
            </kbq-form-field>

            <kbq-form-field>
                <input formControlName="field2" kbqInput />
                <kbq-hint>should contain max 2 chars</kbq-hint>
                <kbq-error>max 2 chars</kbq-error>
            </kbq-form-field>

            <input type="submit" />

            <input type="reset" />
        </form>
    `,

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowValidationErrorOnControlDirty {
    readonly formGroup = new FormGroup({
        field1: new FormControl('', [Validators.required]),
        field2: new FormControl('koobiq', [Validators.maxLength(2)])
    });
}

@Component({
    standalone: true,
    selector: 'field-without-borders',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    providers: [
        {
            provide: KBQ_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                // noBorders: true
            } satisfies KbqFormFieldDefaultOptions
        }
    ],
    template: `
        <kbq-form-field noBorders>
            <input [formControl]="formControl" placeholder="Form field without borders" kbqInput />
            <kbq-error>Should enter a value</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldWithoutBorders {
    readonly formControl = new FormControl('', [Validators.required]);
}

@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqLocaleServiceModule,
        KbqSelectModule,
        KbqIconModule,

        // Components with providers
        ShowValidationErrorOnFormSubmit,
        ShowValidationErrorOnControlDirty,
        FieldWithoutBorders
    ],
    selector: 'app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormField {
    readonly formControl1 = new FormControl('', [Validators.required, Validators.email]);
    readonly formControl2 = new FormControl();
    readonly formControl3 = new FormControl('', [
        Validators.required,
        PasswordValidators.minLength(8),
        PasswordValidators.minUppercase(2),
        PasswordValidators.minLowercase(2),
        PasswordValidators.minNumber(2),
        PasswordValidators.minSpecial(2)]);
    readonly formControl4 = new FormControl();
    readonly formControl5 = new FormControl();
    readonly formControl6 = new FormControl('This field can be cleaned');
    readonly formGroup1 = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });
    errorStateMatcher1 = new ShowOnControlDirtyErrorStateMatcher();
}

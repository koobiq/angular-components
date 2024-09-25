import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    KBQ_FORM_FIELD_DEFAULT_OPTIONS,
    KbqFormFieldDefaultOptions,
    KbqFormFieldModule
} from '@koobiq/components-experimental/form-field';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    ErrorStateMatcher,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

@Component({
    standalone: true,
    selector: 'validate-on-form-submit',
    template: `
        <h3>Show validation error on form submit, using ShowOnFormSubmitErrorStateMatcher</h3>

        <form [formGroup]="formGroup">
            <kbq-form-field>
                <kbq-label>Form field with custom ErrorStateMatcher</kbq-label>
                <input
                    formControlName="email"
                    kbqInput
                    placeholder="mail@koobiq.io"
                />
                <kbq-hint>Enter email</kbq-hint>
                <kbq-error>
                    @if (formGroup.get('email')?.hasError('required')) {
                        Should enter a value
                    } @else {
                        Invalid email
                    }
                </kbq-error>
            </kbq-form-field>

            <button
                kbq-button
                type="submit"
            >
                Submit form
            </button>
        </form>
    `,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqButtonModule
    ],
    providers: [{ provide: ErrorStateMatcher, useClass: ShowOnFormSubmitErrorStateMatcher }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowValidationErrorOnFormSubmit {
    readonly formGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });
}

@Component({
    standalone: true,
    selector: 'validate-on-control-dirty',
    template: `
        <h3>Show validation error on control is dirty (changed), using ShowOnControlDirtyErrorStateMatcher</h3>

        <form [formGroup]="formGroup">
            <kbq-form-field>
                <input
                    formControlName="field1"
                    kbqInput
                />
                <kbq-hint>should be filled</kbq-hint>
                <kbq-error>required</kbq-error>
            </kbq-form-field>

            <kbq-form-field>
                <input
                    formControlName="field2"
                    kbqInput
                />
                <kbq-hint>should contain max 2 chars</kbq-hint>
                <kbq-error>max 2 chars</kbq-error>
            </kbq-form-field>

            <input type="submit" />

            <input type="reset" />
        </form>
    `,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    providers: [{ provide: ErrorStateMatcher, useClass: ShowOnControlDirtyErrorStateMatcher }],
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
    selector: 'field-with-cleaner',
    template: `
        <kbq-form-field>
            <kbq-label>Form field with cleaner</kbq-label>
            <input
                [formControl]="formControl"
                kbqInput
                placeholder="Enter some input"
            />
            <kbq-cleaner />
        </kbq-form-field>
    `,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldWithCleaner {
    readonly formControl = new FormControl('This field can be cleaned');
}

@Component({
    standalone: true,
    selector: 'field-with-prefix-and-suffix',
    template: `
        <kbq-form-field>
            <kbq-label>Form field with prefix and suffix</kbq-label>
            <i
                kbqPrefix
                kbq-icon="mc-search_16"
            ></i>
            <input
                [formControl]="formControl"
                kbqInput
                placeholder="Search"
            />
            <i
                kbq-icon="mc-info-o_16"
                kbqSuffix
            ></i>
            <kbq-cleaner />
        </kbq-form-field>
    `,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldWithPrefixAndSuffix {
    readonly formControl = new FormControl();
}

@Component({
    standalone: true,
    selector: 'field-with-hint',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Article title</kbq-label>
            <input
                [formControl]="formControl"
                [maxlength]="maxLength"
                kbqInput
                placeholder="Enter the title of the article"
            />
            <kbq-hint>Max {{ maxLength }} chars ({{ count }}/{{ maxLength }})</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldWithHint {
    readonly formControl = new FormControl();
    readonly maxLength = 25;

    get count(): number {
        return this.formControl.value?.length || 0;
    }
}

@Component({
    standalone: true,
    selector: 'select-field',
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Select an option</kbq-label>
            <kbq-select placeholder="Select an option">
                <kbq-option [value]="null">None</kbq-option>
                <kbq-option value="option1">Option 1</kbq-option>
                <kbq-option value="option2">Option 2</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectField {}

@Component({
    standalone: true,
    selector: 'field-with-error',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Email</kbq-label>
            <input
                [formControl]="formControl"
                kbqInput
                placeholder="mail@koobiq.io"
            />
            <kbq-hint>Enter email</kbq-hint>
            <kbq-error>
                @if (formControl.hasError('required')) {
                    Should enter a value
                } @else {
                    Invalid email
                }
            </kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldWithError {
    readonly formControl = new FormControl('', [Validators.required, Validators.email]);
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
            <input
                [formControl]="formControl"
                placeholder="Form field without borders"
                kbqInput
            />
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
    selector: 'app',
    template: `
        <validate-on-form-submit />
        <hr />

        <validate-on-control-dirty />
        <hr />

        <field-with-cleaner />
        <hr />

        <field-with-prefix-and-suffix />
        <hr />

        <field-with-hint />
        <hr />

        <field-with-error />
        <hr />

        <field-without-borders />
        <hr />

        <select-field />
        <hr />
    `,
    styleUrl: './styles.scss',
    imports: [
        ShowValidationErrorOnFormSubmit,
        ShowValidationErrorOnControlDirty,
        FieldWithCleaner,
        FieldWithPrefixAndSuffix,
        FieldWithHint,
        FieldWithError,
        FieldWithoutBorders,
        SelectField
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormField {}

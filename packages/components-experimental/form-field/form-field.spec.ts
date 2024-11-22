import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ErrorStateMatcher, PasswordValidators, ShowOnFormSubmitErrorStateMatcher } from '@koobiq/components/core';
import { KbqInput, KbqInputModule, KbqInputPassword } from '@koobiq/components/input';
import { KbqCleaner } from './cleaner';
import {
    KBQ_FORM_FIELD_DEFAULT_OPTIONS,
    KbqFormField,
    KbqFormFieldDefaultOptions,
    getKbqFormFieldMissingControlError
} from './form-field';
import { KbqFormFieldModule } from './form-field.module';
import { KbqError, KbqHint, KbqPasswordHint } from './hint';
import { KbqLabel } from './label';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqSuffix } from './suffix';

const createComponent = async <T>(component: Type<T>, providers: any[] = []): Promise<ComponentFixture<T>> => {
    await TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);
    fixture.autoDetectChanges();
    return fixture;
};

const getErrorDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqError));
};

const getHintDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqHint));
};

const getCleanerDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqCleaner));
};

const getFormFieldDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqFormField));
};

const getLabelDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqLabel));
};

const getSuffixDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqSuffix));
};

const getPasswordToggleDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqPasswordToggle));
};

const getPasswordHintDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqPasswordHint));
};

const getLabelNativeElement = (debugElement: DebugElement): HTMLLabelElement | null => {
    return debugElement.query(By.css('label')).nativeElement;
};

const getPrefixDebugElement = (debugElement: DebugElement): DebugElement | null => {
    return debugElement.query(By.directive(KbqPrefix));
};

const getInputNativeElement = (debugElement: DebugElement): HTMLInputElement | null => {
    return debugElement.query(By.directive(KbqInput)).nativeElement;
};

const getPasswordInputNativeElement = (debugElement: DebugElement): HTMLInputElement | null => {
    return debugElement.query(By.directive(KbqInputPassword)).nativeElement;
};

const getSubmitButtonNativeElement = (debugElement: DebugElement): HTMLInputElement | null => {
    return debugElement.query(By.css('[type="submit"]')).nativeElement;
};

@Component({
    selector: 'input-form-field-with-hint-and-error',
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <input [formControl]="control" kbqInput />
            <kbq-hint>Hint</kbq-hint>
            <kbq-error>Error</kbq-error>
        </kbq-form-field>
    `
})
export class InputFormFieldWithHintAndError {
    readonly control = new FormControl('', [Validators.required]);
}

@Component({
    selector: 'input-form-field-with-prefix-and-suffix',
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput />
            <span kbqPrefix>Prefix</span>
            <span kbqSuffix>Suffix</span>
        </kbq-form-field>
    `
})
export class InputFormFieldWithPrefixAndSuffix {}

@Component({
    selector: 'input-form-field-with-cleaner',
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <input [formControl]="control" kbqInput />
            <kbq-cleaner />
        </kbq-form-field>
    `
})
export class InputFormFieldWithCleaner {
    readonly control = new FormControl();
}

@Component({
    selector: 'input-form-field-without-form-field-control',
    standalone: true,
    imports: [
        KbqFormFieldModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <input [formControl]="control" />
        </kbq-form-field>
    `
})
export class InputFormFieldWithoutFormFieldControl {
    readonly control = new FormControl();
}

@Component({
    selector: 'input-form-field-with-label',
    standalone: true,
    imports: [
        KbqFormFieldModule,
        ReactiveFormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <input [id]="id" kbqInput />
        </kbq-form-field>
    `
})
export class InputFormFieldWithLabel {
    readonly id = 'UNIQUE_TEST_ID';
}

class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, _form: FormGroupDirective | NgForm | null): boolean {
        return !!control?.invalid;
    }
}

@Component({
    selector: 'input-form-field-with-custom-error-state-matcher',
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <form [formGroup]="formGroup">
            <kbq-form-field>
                <input [errorStateMatcher]="errorStateMatcher" formControlName="email" kbqInput />
                <kbq-error>Error</kbq-error>
                <input type="submit" />
            </kbq-form-field>
        </form>
    `
})
export class FormGroupWithCustomErrorStateMatcher {
    readonly formGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });
    errorStateMatcher = new CustomErrorStateMatcher();
}

@Component({
    selector: 'input-form-field-with-border-customization',
    standalone: true,
    imports: [
        KbqFormFieldModule,
        ReactiveFormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field [noBorders]="noBorders">
            <input kbqInput />
        </kbq-form-field>
    `
})
export class InputFormFieldWithBorderCustomization {
    noBorders: boolean = true;
}

@Component({
    selector: 'password-form-field',
    standalone: true,
    imports: [
        KbqFormFieldModule,
        ReactiveFormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input [formControl]="formControl" kbqInputPassword />
            <kbq-password-toggle />
            <kbq-password-hint [hasError]="formControl.hasError('minLength')">
                Min length
                @let minLength = formControl.getError('minLength');
                @if (minLength) {
                    ({{ minLength.actual }}/{{ minLength.min }})
                }
            </kbq-password-hint>
        </kbq-form-field>
    `
})
export class PasswordFormField {
    readonly formControl = new FormControl('', [PasswordValidators.minLength(8)]);
}

describe(KbqFormField.name, () => {
    it('should display kbq-hint', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        expect(getHintDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display kbq-error', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        const input = getInputNativeElement(debugElement);
        input?.focus();
        input?.blur();
        expect(getErrorDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should hide kbq-error', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        expect(getErrorDebugElement(debugElement)).toBeNull();
    });

    it('should display kbqPrefix', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithPrefixAndSuffix);
        expect(getPrefixDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display kbqSuffix', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithPrefixAndSuffix);
        expect(getSuffixDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should hide kbq-cleaner', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithCleaner);
        expect(getCleanerDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display kbq-cleaner', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithCleaner);
        const input = getInputNativeElement(debugElement);
        input!.value = 'koobiq';
        input?.dispatchEvent(new Event('input'));
        expect(getCleanerDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should clean field by kbq-cleaner', async () => {
        const { debugElement, componentInstance } = await createComponent(InputFormFieldWithCleaner);
        const input = getInputNativeElement(debugElement);
        input!.value = 'koobiq';
        input?.dispatchEvent(new Event('input'));
        expect(componentInstance.control.value).toBe('koobiq');
        const cleaner = getCleanerDebugElement(debugElement);
        cleaner?.nativeElement.click();
        expect(componentInstance.control.value).toBeNull();
    });

    it('should throw Error for kbq-form-field without KbqFormFieldControl', async () => {
        let caught = false;
        try {
            await createComponent(InputFormFieldWithoutFormFieldControl);
        } catch (error) {
            expect(error.message).toBe(getKbqFormFieldMissingControlError().message);
            caught = true;
        }
        expect(caught).toBeTruthy();
    });

    it('should add ng-untouched selector for kbq-form-field initially', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        expect(getFormFieldDebugElement(debugElement)?.classes['ng-untouched']).toBeTruthy();
    });

    it('should add ng-touched selector for kbq-form-field after blur', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        const formField = getFormFieldDebugElement(debugElement);
        expect(formField?.classes['ng-touched']).toBeFalsy();
        const input = getInputNativeElement(debugElement);
        input?.focus();
        input?.blur();
        expect(formField?.classes['ng-touched']).toBeTruthy();
    });

    it('should add ng-pristine selector for kbq-form-field initially', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        expect(getFormFieldDebugElement(debugElement)?.classes['ng-pristine']).toBeTruthy();
    });

    it('should add ng-dirty selector for kbq-form-field after form control change', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        const formField = getFormFieldDebugElement(debugElement);
        expect(formField?.classes['ng-dirty']).toBeFalsy();
        const input = getInputNativeElement(debugElement);
        input!.value = 'koobiq';
        input?.dispatchEvent(new Event('input'));
        expect(formField?.classes['ng-dirty']).toBeTruthy();
    });

    it('should add ng-valid selector for kbq-form-field when form control is valid', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        const input = getInputNativeElement(debugElement);
        input!.value = 'koobiq';
        input?.dispatchEvent(new Event('input'));
        expect(getFormFieldDebugElement(debugElement)?.classes['ng-valid']).toBeTruthy();
    });

    it('should add ng-invalid selector for kbq-form-field initially', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        expect(getFormFieldDebugElement(debugElement)?.classes['ng-invalid']).toBeTruthy();
    });

    it('should add ng-pending selector for kbq-form-field when form control is pending', async () => {
        const fixture = await createComponent(InputFormFieldWithHintAndError);
        const { debugElement, componentInstance } = fixture;
        const formField = getFormFieldDebugElement(debugElement);
        expect(formField?.classes['ng-pending']).toBeFalsy();
        componentInstance.control.markAsPending();
        fixture.detectChanges();
        expect(formField?.classes['ng-pending']).toBeTruthy();
    });

    it('should add kbq-form-field_focused selector for kbq-form-field when form control is focused', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithHintAndError);
        const formField = getFormFieldDebugElement(debugElement);
        expect(formField?.classes['kbq-form-field_focused']).toBeFalsy();
        getInputNativeElement(debugElement)?.focus();
        expect(formField?.classes['kbq-form-field_focused']).toBeTruthy();
    });

    it('should add kbq-form-field_disabled selector for kbq-form-field when form control is disabled', async () => {
        const fixture = await createComponent(InputFormFieldWithHintAndError);
        const { debugElement, componentInstance } = fixture;
        const formField = getFormFieldDebugElement(debugElement);
        expect(formField?.classes['kbq-form-field_disabled']).toBeFalsy();
        componentInstance.control.disable();
        fixture.detectChanges();
        expect(formField?.classes['kbq-form-field_disabled']).toBeTruthy();
    });

    it('should add kbq-form-field_invalid selector for kbq-form-field initially', async () => {
        const { debugElement } = await createComponent(FormGroupWithCustomErrorStateMatcher);
        expect(getFormFieldDebugElement(debugElement)?.classes['kbq-form-field_invalid']).toBeTruthy();
    });

    it('should add kbq-form-field_invalid selector for kbq-form-field initially', async () => {
        const { debugElement } = await createComponent(FormGroupWithCustomErrorStateMatcher);
        expect(getFormFieldDebugElement(debugElement)?.classes['kbq-form-field_invalid']).toBeTruthy();
    });

    it('should display kbq-error initially', async () => {
        const { debugElement } = await createComponent(FormGroupWithCustomErrorStateMatcher);
        expect(getErrorDebugElement(debugElement)).toBeTruthy();
    });

    it('should add kbq-form-field_invalid selector for kbq-form-field on form submission', async () => {
        const fixture = await createComponent(FormGroupWithCustomErrorStateMatcher);
        const { debugElement, componentInstance } = fixture;
        componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
        fixture.detectChanges();
        const formField = getFormFieldDebugElement(debugElement);
        expect(formField?.classes['kbq-form-field_invalid']).toBeFalsy();
        getSubmitButtonNativeElement(debugElement)?.click();
        expect(formField?.classes['kbq-form-field_invalid']).toBeTruthy();
    });

    it('should display kbq-error on form submission', async () => {
        const fixture = await createComponent(FormGroupWithCustomErrorStateMatcher);
        const { debugElement, componentInstance } = fixture;
        componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
        fixture.detectChanges();
        expect(getErrorDebugElement(debugElement)).toBeFalsy();
        getSubmitButtonNativeElement(debugElement)?.click();
        expect(getErrorDebugElement(debugElement)).toBeTruthy();
    });

    it('should display kbq-label', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithLabel);
        expect(getLabelDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should add attribute.for for label', async () => {
        const { debugElement, componentInstance } = await createComponent(InputFormFieldWithLabel);
        expect(getLabelNativeElement(debugElement)?.getAttribute('for')).toBe(componentInstance.id);
    });

    it('should focus input by click on label', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithLabel);
        const input = getInputNativeElement(debugElement);
        expect(document.activeElement).not.toBe(input);
        getLabelDebugElement(debugElement)?.nativeElement.click();
        expect(document.activeElement).toBe(input);
    });

    it('should add kbq-form-field_no-borders selector for kbq-form-field by attribute', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithBorderCustomization);
        expect(getFormFieldDebugElement(debugElement)?.classes['kbq-form-field_no-borders']).toBeTruthy();
    });

    it('should remove kbq-form-field_no-borders selector for kbq-form-field by attribute', async () => {
        const fixture = await createComponent(InputFormFieldWithBorderCustomization);
        const { debugElement, componentInstance } = fixture;
        expect(getFormFieldDebugElement(debugElement)?.classes['kbq-form-field_no-borders']).toBeTruthy();
        componentInstance.noBorders = false;
        fixture.detectChanges();
        expect(getFormFieldDebugElement(debugElement)?.classes['kbq-form-field_no-borders']).toBeFalsy();
    });

    it('should add kbq-form-field_no-borders selector for kbq-form-field by KBQ_FORM_FIELD_DEFAULT_OPTIONS', async () => {
        const { debugElement } = await createComponent(InputFormFieldWithLabel, [
            {
                provide: KBQ_FORM_FIELD_DEFAULT_OPTIONS,
                useValue: {
                    noBorders: true
                } satisfies KbqFormFieldDefaultOptions
            }
        ]);
        expect(getFormFieldDebugElement(debugElement)?.classes['kbq-form-field_no-borders']).toBeTruthy();
    });

    it('should hide kbq-password-toggle initially', async () => {
        const { debugElement } = await createComponent(PasswordFormField);
        expect(getPasswordToggleDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display kbq-password-toggle by input', async () => {
        const { debugElement } = await createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);
        input!.value = 'koobiq';
        input?.dispatchEvent(new Event('input'));
        expect(getPasswordToggleDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display password by click on kbq-password-toggle', async () => {
        const { debugElement } = await createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);
        input!.value = 'koobiq';
        input?.dispatchEvent(new Event('input'));
        expect(input!.type).toBe('password');
        getPasswordToggleDebugElement(debugElement)?.nativeElement.click();
        expect(input!.type).toBe('text');
    });

    it('should change kbq-password-toggle icon by click', async () => {
        const { debugElement } = await createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);
        input!.value = 'koobiq';
        input?.dispatchEvent(new Event('input'));
        const passwordToggle = getPasswordToggleDebugElement(debugElement);
        passwordToggle?.nativeElement.click();
        expect(passwordToggle).toMatchSnapshot();
    });

    it('should display kbq-password-hint initially', async () => {
        const { debugElement } = await createComponent(PasswordFormField);
        expect(getPasswordHintDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display kbq-password-hint error for invalid password', async () => {
        const { debugElement } = await createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);
        input!.value = 'koobiq';
        input?.dispatchEvent(new Event('input'));
        input?.dispatchEvent(new Event('blur'));
        expect(getPasswordHintDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display kbq-password-hint success for valid password', async () => {
        const { debugElement } = await createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);
        input!.value = 'koobiq-is-awesome';
        input?.dispatchEvent(new Event('input'));
        input?.dispatchEvent(new Event('blur'));
        expect(getPasswordHintDebugElement(debugElement)).toMatchSnapshot();
    });
});

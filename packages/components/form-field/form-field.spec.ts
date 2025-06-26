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
import {
    ErrorStateMatcher,
    kbqDisableLegacyValidationDirectiveProvider,
    PasswordValidators,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqInput, KbqInputModule, KbqInputPassword } from '@koobiq/components/input';
import { KbqCleaner } from './cleaner';
import { KbqError } from './error';
import { getKbqFormFieldMissingControlError, KbqFormField, kbqFormFieldDefaultOptionsProvider } from './form-field';
import { KbqFormFieldModule } from './form-field.module';
import { KbqHint } from './hint';
import { KbqLabel } from './label';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqReactivePasswordHint } from './reactive-password-hint';
import { KbqSuffix } from './suffix';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getErrorDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqError));
};

const getHintDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqHint));
};

const getCleanerDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqCleaner));
};

const getFormFieldDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqFormField));
};

const getLabelDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqLabel));
};

const getSuffixDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqSuffix));
};

const getPasswordToggleDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqPasswordToggle));
};

const getReactivePasswordHintDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqReactivePasswordHint));
};

const getLabelNativeElement = (debugElement: DebugElement): HTMLLabelElement => {
    return debugElement.query(By.css('label')).nativeElement;
};

const getPrefixDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqPrefix));
};

const getInputDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqInput));
};

const getInputNativeElement = (debugElement: DebugElement): HTMLInputElement => {
    return getInputDebugElement(debugElement).nativeElement;
};

const getPasswordInputNativeElement = (debugElement: DebugElement): HTMLInputElement => {
    return debugElement.query(By.directive(KbqInputPassword)).nativeElement;
};

const getSubmitButtonNativeElement = (debugElement: DebugElement): HTMLInputElement => {
    return debugElement.query(By.css('[type="submit"]')).nativeElement;
};

@Component({
    selector: 'input-form-field-with-hint-and-error',
    standalone: true,
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <input [formControl]="control" kbqInput />
            <kbq-hint id="test-hint-id">Hint</kbq-hint>
            <kbq-error id="test-error-id">Error</kbq-error>
        </kbq-form-field>
    `
})
export class InputFormFieldWithHintAndError {
    readonly control = new FormControl('', [Validators.required]);
}

@Component({
    selector: 'input-form-field-with-prefix-and-suffix',
    standalone: true,
    imports: [KbqFormFieldModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
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
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
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
    imports: [KbqFormFieldModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
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
    imports: [KbqFormFieldModule, ReactiveFormsModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-label id="test-label-id">Label</kbq-label>
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
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <form [formGroup]="formGroup">
            <kbq-form-field>
                <input [errorStateMatcher]="errorStateMatcher" formControlName="email" kbqInput />
                <kbq-error id="test-error-id">Error</kbq-error>
            </kbq-form-field>
            <input type="submit" />
        </form>
    `
})
export class InputFormFieldWithCustomErrorStateMatcher {
    readonly formGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email])
    });
    errorStateMatcher = new CustomErrorStateMatcher();
}

@Component({
    selector: 'input-form-field-with-border-customization',
    standalone: true,
    imports: [KbqFormFieldModule, ReactiveFormsModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
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
    imports: [KbqFormFieldModule, ReactiveFormsModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <input [formControl]="formControl" kbqInputPassword />
            <kbq-password-toggle />
            <kbq-reactive-password-hint
                id="test-reactive-password-hint-id"
                [hasError]="formControl.hasError('minLength')"
            >
                Min length
                @let minLength = formControl.getError('minLength');
                @if (minLength) {
                    ({{ minLength.actual }}/{{ minLength.min }})
                }
            </kbq-reactive-password-hint>
        </kbq-form-field>
    `
})
export class PasswordFormField {
    readonly formControl = new FormControl('', [PasswordValidators.minLength(8)]);
}

@Component({
    selector: 'input-form-field-with-legacy-validation-directive',
    standalone: true,
    imports: [KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqInput />
        </kbq-form-field>
    `
})
export class InputFormFieldWithLegacyValidationDirective {}

describe(KbqFormField.name, () => {
    it('should display KbqHint', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);

        expect(getHintDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display KbqError', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const input = getInputNativeElement(debugElement);

        input.focus();
        input.blur();
        expect(getErrorDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should hide KbqError', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);

        expect(getErrorDebugElement(debugElement)).toBeNull();
    });

    it('should display KbqPrefix', () => {
        const { debugElement } = createComponent(InputFormFieldWithPrefixAndSuffix);

        expect(getPrefixDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display KbqSuffix', async () => {
        const { debugElement } = createComponent(InputFormFieldWithPrefixAndSuffix);

        expect(getSuffixDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should hide KbqCleaner', () => {
        const { debugElement } = createComponent(InputFormFieldWithCleaner);

        expect(getCleanerDebugElement(debugElement)).toBeNull();
    });

    it('should display KbqCleaner', () => {
        const { debugElement } = createComponent(InputFormFieldWithCleaner);
        const input = getInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        expect(getCleanerDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should clean field by KbqCleaner', () => {
        const { debugElement, componentInstance } = createComponent(InputFormFieldWithCleaner);
        const input = getInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        expect(componentInstance.control.value).toBe('koobiq');
        const cleaner = getCleanerDebugElement(debugElement);

        cleaner.nativeElement.click();
        expect(componentInstance.control.value).toBeNull();
    });

    it('should throw Error for KbqFormField without KbqFormFieldControl', () => {
        let caught = false;

        try {
            createComponent(InputFormFieldWithoutFormFieldControl);
        } catch (error) {
            expect(error.message).toBe(getKbqFormFieldMissingControlError().message);
            caught = true;
        }

        expect(caught).toBeTruthy();
    });

    it('should add ng-untouched selector for KbqFormField initially', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);

        expect(getFormFieldDebugElement(debugElement).classes['ng-untouched']).toBeTruthy();
    });

    it('should add ng-touched selector for KbqFormField after blur', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.classes['ng-touched']).toBeFalsy();
        const input = getInputNativeElement(debugElement);

        input.focus();
        input.blur();
        expect(formField.classes['ng-touched']).toBeTruthy();
    });

    it('should add ng-pristine selector for KbqFormField initially', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);

        expect(getFormFieldDebugElement(debugElement).classes['ng-pristine']).toBeTruthy();
    });

    it('should add ng-dirty selector for KbqFormField after form control change', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.classes['ng-dirty']).toBeFalsy();
        const input = getInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        expect(formField.classes['ng-dirty']).toBeTruthy();
    });

    it('should add ng-valid selector for KbqFormField when form control is valid', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const input = getInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        expect(getFormFieldDebugElement(debugElement).classes['ng-valid']).toBeTruthy();
    });

    it('should add ng-invalid selector for KbqFormField initially', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);

        expect(getFormFieldDebugElement(debugElement).classes['ng-invalid']).toBeTruthy();
    });

    it('should add ng-pending selector for KbqFormField when form control is pending', () => {
        const fixture = createComponent(InputFormFieldWithHintAndError);
        const { debugElement, componentInstance } = fixture;
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.classes['ng-pending']).toBeFalsy();
        componentInstance.control.markAsPending();
        fixture.detectChanges();
        expect(formField.classes['ng-pending']).toBeTruthy();
    });

    it('should add cdk-focused selector for form-field by calling focus() method', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.classes['cdk-focused']).toBeFalsy();
        getFormFieldDebugElement(debugElement).componentInstance.focus();
        expect(formField.classes['cdk-focused']).toBeTruthy();
    });

    it('should add cdk-focused selector for form-field by calling native input focus() method', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.classes['cdk-focused']).toBeFalsy();
        getInputNativeElement(debugElement).focus();
        expect(formField.classes['cdk-focused']).toBeTruthy();
    });

    it('should add KbqFormField_disabled selector for KbqFormField when form control is disabled', () => {
        const fixture = createComponent(InputFormFieldWithHintAndError);
        const { debugElement, componentInstance } = fixture;
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.classes['kbq-form-field_disabled']).toBeFalsy();
        componentInstance.control.disable();
        fixture.detectChanges();
        expect(formField.classes['kbq-form-field_disabled']).toBeTruthy();
    });

    it('should add kbq-form-field_invalid selector for KbqFormField initially', () => {
        const { debugElement } = createComponent(InputFormFieldWithCustomErrorStateMatcher);

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_invalid']).toBeTruthy();
    });

    it('should add kbq-form-field_invalid selector for KbqFormField initially', () => {
        const { debugElement } = createComponent(InputFormFieldWithCustomErrorStateMatcher);

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_invalid']).toBeTruthy();
    });

    it('should display KbqError initially', async () => {
        const { debugElement } = createComponent(InputFormFieldWithCustomErrorStateMatcher);

        expect(getErrorDebugElement(debugElement)).toBeTruthy();
    });

    it('should add kbq-form-field_invalid selector for KbqFormField on form submission', () => {
        const fixture = createComponent(InputFormFieldWithCustomErrorStateMatcher);
        const { debugElement, componentInstance } = fixture;

        componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
        fixture.detectChanges();
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.classes['kbq-form-field_invalid']).toBeFalsy();
        getSubmitButtonNativeElement(debugElement).click();
        expect(formField.classes['kbq-form-field_invalid']).toBeTruthy();
    });

    it('should display KbqError on form submission', () => {
        const fixture = createComponent(InputFormFieldWithCustomErrorStateMatcher);
        const { debugElement, componentInstance } = fixture;

        componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
        fixture.detectChanges();
        expect(getErrorDebugElement(debugElement)).toBeFalsy();
        getSubmitButtonNativeElement(debugElement).click();
        expect(getErrorDebugElement(debugElement)).toBeTruthy();
    });

    it('should display KbqLabel', () => {
        const { debugElement } = createComponent(InputFormFieldWithLabel);

        expect(getLabelDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should add attribute.for for label', () => {
        const { debugElement, componentInstance } = createComponent(InputFormFieldWithLabel);

        expect(getLabelNativeElement(debugElement).getAttribute('for')).toBe(componentInstance.id);
    });

    it('should focus input by click on label', () => {
        const { debugElement } = createComponent(InputFormFieldWithLabel);
        const input = getInputNativeElement(debugElement);

        expect(document.activeElement).not.toBe(input);
        getLabelDebugElement(debugElement).nativeElement.click();
        expect(document.activeElement).toBe(input);
    });

    it('should add kbq-form-field_no-borders selector for KbqFormField by attribute', () => {
        const { debugElement } = createComponent(InputFormFieldWithBorderCustomization);

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_no-borders']).toBeTruthy();
    });

    it('should remove kbq-form-field_no-borders selector for KbqFormField by attribute', () => {
        const fixture = createComponent(InputFormFieldWithBorderCustomization);
        const { debugElement, componentInstance } = fixture;

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_no-borders']).toBeTruthy();
        componentInstance.noBorders = false;
        fixture.detectChanges();
        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_no-borders']).toBeFalsy();
    });

    it('should add kbq-form-field_no-borders selector for KbqFormField by KBQ_FORM_FIELD_DEFAULT_OPTIONS', () => {
        const { debugElement } = createComponent(InputFormFieldWithLabel, [
            kbqFormFieldDefaultOptionsProvider({ noBorders: true })
        ]);

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_no-borders']).toBeTruthy();
    });

    it('should hide KbqPasswordToggle initially', () => {
        const { debugElement } = createComponent(PasswordFormField);

        expect(getPasswordToggleDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display KbqPasswordToggle by input', () => {
        const { debugElement } = createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        expect(getPasswordToggleDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display password by click on KbqPasswordToggle', () => {
        const { debugElement } = createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        expect(input.type).toBe('password');
        getPasswordToggleDebugElement(debugElement).nativeElement.click();
        expect(input.type).toBe('text');
    });

    it('should change KbqPasswordToggle icon by click', () => {
        const { debugElement } = createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        const passwordToggle = getPasswordToggleDebugElement(debugElement);

        passwordToggle.nativeElement.click();
        expect(passwordToggle).toMatchSnapshot();
    });

    it('should display KbqReactivePasswordHint initially', () => {
        const { debugElement } = createComponent(PasswordFormField);

        expect(getReactivePasswordHintDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display KbqReactivePasswordHint error for invalid password', () => {
        const { debugElement } = createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        expect(getReactivePasswordHintDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should display KbqReactivePasswordHint success for valid password', () => {
        const { debugElement } = createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);

        input.value = 'koobiq-is-awesome';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        expect(getReactivePasswordHintDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should apply legacy KbqValidateDirective by default', () => {
        const { debugElement } = createComponent(InputFormFieldWithLegacyValidationDirective);

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_has-validate-directive']).toBeTruthy();
        expect(getInputDebugElement(debugElement).classes['kbq-control_has-validate-directive']).toBeTruthy();
    });

    it('should disable legacy KbqValidateDirective by kbqDisableLegacyValidationDirective() provider', () => {
        const { debugElement } = createComponent(InputFormFieldWithLegacyValidationDirective, [
            kbqDisableLegacyValidationDirectiveProvider()
        ]);

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_has-validate-directive']).toBeFalsy();
        expect(getInputDebugElement(debugElement).classes['kbq-control_has-validate-directive']).toBeFalsy();
    });
});

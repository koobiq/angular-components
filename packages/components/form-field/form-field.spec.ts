import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
    ESCAPE,
    KBQ_FORM_FIELD_REF,
    PasswordValidators,
    ShowOnFormSubmitErrorStateMatcher,
    ShowRequiredOnSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqInput, KbqInputModule, KbqInputPassword } from '@koobiq/components/input';
import { Subject } from 'rxjs';
import { KbqCleaner } from './cleaner';
import { KbqError } from './error';
import {
    getKbqFormFieldMissingControlError,
    KBQ_FORM_FIELD,
    KbqFormField,
    kbqFormFieldDefaultOptionsProvider
} from './form-field';
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

const getContentNativeElement = (debugElement: DebugElement): HTMLDivElement => {
    return debugElement.query(By.css('.kbq-form-field__content')).nativeElement;
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
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" />
            <kbq-hint id="test-hint-id">Hint</kbq-hint>
            <kbq-error id="test-error-id">Error</kbq-error>
        </kbq-form-field>
    `
})
export class InputFormFieldWithHintAndError {
    readonly control = new FormControl('', [Validators.required]);
}

@Component({
    selector: 'input-form-field-with-hint-customization',
    imports: [KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqInput />
            <kbq-hint compact fillTextOff>Hint</kbq-hint>
        </kbq-form-field>
    `
})
export class InputFormFieldWithHintCustomization {}

@Component({
    selector: 'input-form-field-with-prefix-and-suffix',
    imports: [KbqInputModule],
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
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" />
            <kbq-cleaner />
        </kbq-form-field>
    `
})
export class InputFormFieldWithCleaner {
    readonly control = new FormControl();
}

@Component({
    selector: 'input-form-field-without-form-field-control',
    imports: [KbqFormFieldModule, ReactiveFormsModule],
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
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <input kbqInput [id]="id" />
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
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <form [formGroup]="formGroup">
            <kbq-form-field>
                <input formControlName="email" kbqInput [errorStateMatcher]="errorStateMatcher" />
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
    selector: 'input-form-field-with-cleaner-and-custom-error-state-matcher',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" [errorStateMatcher]="errorStateMatcher" />
            <kbq-cleaner />
        </kbq-form-field>
    `
})
export class InputFormFieldWithCleanerAndCustomErrorStateMatcher {
    readonly control = new FormControl('koobiq', [Validators.required, Validators.minLength(10)]);
    errorStateMatcher = new CustomErrorStateMatcher();
}

@Component({
    selector: 'input-form-field-with-border-customization',
    imports: [ReactiveFormsModule, KbqInputModule],
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
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [formControl]="formControl" />
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
    selector: 'input-form-field-in-overlay',
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <kbq-form-field [inOverlay]="inOverlay">
            <input kbqInput />
        </kbq-form-field>
    `
})
export class InputFormFieldInOverlay {
    inOverlay: boolean;
}

@Component({
    selector: 'input-form-field-horizontal',
    imports: [KbqInputModule],
    template: `
        <kbq-form-field [horizontal]="horizontal">
            <kbq-label>Label</kbq-label>
            <input kbqInput />
        </kbq-form-field>
    `
})
export class InputFormFieldHorizontal {
    horizontal: boolean = false;
}

@Component({
    selector: 'input-form-field-with-class-customization',
    imports: [KbqInputModule],
    template: `
        <kbq-form-field [labelClass]="labelClass" [contentClass]="contentClass">
            <kbq-label>Label</kbq-label>
            <input kbqInput />
        </kbq-form-field>
    `
})
export class InputFormFieldWithClassCustomization {
    labelClass: string | undefined;
    contentClass: string | undefined;
}

@Component({
    selector: 'input-form-field-with-invalid-or-submit-matcher',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <form [formGroup]="formGroup" (ngSubmit)="submitted = true">
            <kbq-form-field>
                <input kbqInput formControlName="value" [errorStateMatcher]="errorStateMatcher" />
                <kbq-error id="test-error-id">Error</kbq-error>
            </kbq-form-field>
            <button type="submit">Submit</button>
        </form>
    `
})
class InputFormFieldWithInvalidOrSubmitMatcher {
    readonly errorStateMatcher = new ShowRequiredOnSubmitErrorStateMatcher();
    formGroup = new FormGroup({
        value: new FormControl('', [Validators.required])
    });
    submitted = false;
}

@Component({
    selector: 'password-form-field-with-conditional-content',
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [formControl]="formControl" />
            @if (visible) {
                <kbq-password-toggle />
                <kbq-reactive-password-hint [hasError]="false">Hint</kbq-reactive-password-hint>
            }
        </kbq-form-field>
    `
})
class PasswordFormFieldWithConditionalContent {
    readonly formControl = new FormControl('');
    visible = true;
}

describe(KbqFormField.name, () => {
    it('should provide typed and legacy form-field tokens', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.injector.get(KBQ_FORM_FIELD)).toBe(formField.componentInstance);
        expect(formField.injector.get(KBQ_FORM_FIELD_REF)).toBe(formField.componentInstance);
    });

    it('should display KbqHint', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const hint = getHintDebugElement(debugElement).nativeElement;

        expect(hint.classList.contains('kbq-hint')).toBe(true);
        expect(hint.getAttribute('id')).toBe('test-hint-id');
        expect(hint.textContent?.trim()).toBe('Hint');
        expect(hint.closest('.kbq-form-field__hint')).toBeTruthy();
    });

    it('should NOT set kbq-hint_fill-text-off and kbq-hint_compact for KbqHint by default', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const hint = getHintDebugElement(debugElement).nativeElement;

        expect(hint.classList.contains('kbq-hint_fill-text-off')).toBe(false);
        expect(hint.classList.contains('kbq-hint_compact')).toBe(false);
    });

    it('should set kbq-hint_fill-text-off and kbq-hint_compact for KbqHint by attribute', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintCustomization);
        const hint = getHintDebugElement(debugElement).nativeElement;

        expect(hint.classList.contains('kbq-hint_fill-text-off')).toBe(true);
        expect(hint.classList.contains('kbq-hint_compact')).toBe(true);
    });

    it('should display KbqError', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);
        const input = getInputNativeElement(debugElement);

        input.focus();
        input.blur();
        const error = getErrorDebugElement(debugElement).nativeElement;

        expect(error.classList.contains('kbq-error')).toBe(true);
        expect(error.getAttribute('id')).toBe('test-error-id');
        expect(error.textContent?.trim()).toBe('Error');
    });

    it('should hide KbqError', () => {
        const { debugElement } = createComponent(InputFormFieldWithHintAndError);

        expect(getErrorDebugElement(debugElement)).toBeNull();
    });

    it('should display KbqPrefix', () => {
        const { debugElement } = createComponent(InputFormFieldWithPrefixAndSuffix);
        const prefix = getPrefixDebugElement(debugElement).nativeElement;

        expect(prefix.classList.contains('kbq-prefix')).toBe(true);
        expect(prefix.closest('.kbq-form-field__prefix')).toBeTruthy();
    });

    it('should display KbqSuffix', () => {
        const { debugElement } = createComponent(InputFormFieldWithPrefixAndSuffix);
        const suffix = getSuffixDebugElement(debugElement).nativeElement;

        expect(suffix.classList.contains('kbq-suffix')).toBe(true);
        expect(suffix.closest('.kbq-form-field__suffix')).toBeTruthy();
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

    it('should clean field by KbqCleaner on Space', () => {
        const { debugElement, componentInstance } = createComponent(InputFormFieldWithCleaner);
        const input = getInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));

        getCleanerDebugElement(debugElement).nativeElement.dispatchEvent(
            new KeyboardEvent('keydown', { key: ' ', bubbles: true })
        );

        expect(componentInstance.control.value).toBeNull();
    });

    it('should clean focused field by KbqCleaner on Escape', () => {
        const { debugElement, componentInstance } = createComponent(InputFormFieldWithCleaner);
        const input = getInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        input.focus();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: ESCAPE, bubbles: true }));

        expect(componentInstance.control.value).toBeNull();
    });

    it('should apply kbq-error class to KbqCleaner icon when control is invalid', () => {
        const { debugElement } = createComponent(InputFormFieldWithCleanerAndCustomErrorStateMatcher);

        const cleaner = getCleanerDebugElement(debugElement);

        expect(cleaner.nativeElement.classList.contains('kbq-error')).toBe(true);
    });

    it('should throw Error for KbqFormField without KbqFormFieldControl', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => createComponent(InputFormFieldWithoutFormFieldControl)).toThrow(
            getKbqFormFieldMissingControlError().message
        );
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

    it('should add kbq-disabled selector for KbqFormField when form control is disabled', () => {
        const fixture = createComponent(InputFormFieldWithHintAndError);
        const { debugElement, componentInstance } = fixture;
        const formField = getFormFieldDebugElement(debugElement);

        expect(formField.classes['kbq-disabled']).toBeFalsy();
        componentInstance.control.disable();
        fixture.detectChanges();
        expect(formField.classes['kbq-disabled']).toBeTruthy();
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

    it('should display KbqReactivePasswordHint error for invalid password', fakeAsync(() => {
        const fixture = createComponent(PasswordFormField);
        const { debugElement } = fixture;
        const input = getPasswordInputNativeElement(debugElement);

        input.value = 'koobiq';
        input.dispatchEvent(new Event('input'));
        // `hasError` stays true for an already invalid control, so the color is escalated by the `delay(0)`
        // handler instead of the effect that follows `hasError`.
        tick();
        fixture.detectChanges();

        const hint = getReactivePasswordHintDebugElement(debugElement);

        expect(hint.nativeElement.classList).toContain('kbq-error');
        expect(hint).toMatchSnapshot();
    }));

    it('should display KbqReactivePasswordHint success for valid password', () => {
        const { debugElement } = createComponent(PasswordFormField);
        const input = getPasswordInputNativeElement(debugElement);

        input.value = 'koobiq-is-awesome';
        input.dispatchEvent(new Event('input'));

        expect(getReactivePasswordHintDebugElement(debugElement)).toMatchSnapshot();
    });

    it('should add .kbq-form-field_in-overlay for KbqFormField', () => {
        const fixture = createComponent(InputFormFieldInOverlay);
        const { debugElement, componentInstance } = fixture;

        componentInstance.inOverlay = false;
        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_in-overlay']).toBeFalsy();

        componentInstance.inOverlay = true;
        fixture.detectChanges();
        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_in-overlay']).toBeTruthy();
    });

    it('should add .kbq-form-field_in-overlay for KbqFormField by KBQ_FORM_FIELD_DEFAULT_OPTIONS', () => {
        const { debugElement } = createComponent(InputFormFieldWithLabel, [
            kbqFormFieldDefaultOptionsProvider({ inOverlay: true })
        ]);

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_in-overlay']).toBeTruthy();
    });

    it('should add kbq-form-field_horizontal selector when horizontal input is true', () => {
        const fixture = createComponent(InputFormFieldHorizontal);
        const { debugElement, componentInstance } = fixture;

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_horizontal']).toBeFalsy();
        componentInstance.horizontal = true;
        fixture.detectChanges();
        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_horizontal']).toBeTruthy();
    });

    it('should add kbq-form-field_horizontal selector by KBQ_FORM_FIELD_DEFAULT_OPTIONS', () => {
        const { debugElement } = createComponent(InputFormFieldWithLabel, [
            kbqFormFieldDefaultOptionsProvider({ horizontal: true })
        ]);

        expect(getFormFieldDebugElement(debugElement).classes['kbq-form-field_horizontal']).toBeTruthy();
    });

    it('should apply labelClass to the label element', () => {
        const fixture = createComponent(InputFormFieldWithClassCustomization);
        const { debugElement, componentInstance } = fixture;

        componentInstance.labelClass = 'test-label';
        fixture.detectChanges();
        expect(getLabelNativeElement(debugElement).classList.contains('test-label')).toBeTruthy();
    });

    it('should apply contentClass to the content wrapper element', () => {
        const fixture = createComponent(InputFormFieldWithClassCustomization);
        const { debugElement, componentInstance } = fixture;

        componentInstance.contentClass = 'test-content';
        fixture.detectChanges();
        expect(getContentNativeElement(debugElement).classList.contains('test-content')).toBeTruthy();
    });

    it('should apply labelClass and contentClass by KBQ_FORM_FIELD_DEFAULT_OPTIONS', () => {
        const { debugElement } = createComponent(InputFormFieldWithLabel, [
            kbqFormFieldDefaultOptionsProvider({ labelClass: 'test-label', contentClass: 'test-content' })
        ]);

        expect(getLabelNativeElement(debugElement).classList.contains('test-label')).toBeTruthy();
        expect(getContentNativeElement(debugElement).classList.contains('test-content')).toBeTruthy();
    });

    describe('lifecycle', () => {
        const getStateChangesObserverCount = (debugElement: DebugElement): number => {
            const control = debugElement.query(By.directive(KbqInputPassword)).injector.get(KbqInputPassword);

            return (control.stateChanges as Subject<void>).observers.length;
        };

        it('should unsubscribe the projected content from the control stateChanges on destroy', () => {
            const fixture = createComponent(PasswordFormFieldWithConditionalContent);
            const { debugElement, componentInstance } = fixture;
            const initial = getStateChangesObserverCount(debugElement);

            componentInstance.visible = false;
            fixture.detectChanges();
            const afterDestroy = getStateChangesObserverCount(debugElement);

            componentInstance.visible = true;
            fixture.detectChanges();

            expect(afterDestroy).toBeLessThan(initial);
            expect(getStateChangesObserverCount(debugElement)).toBe(initial);
        });

        it('should unsubscribe the form field from the control stateChanges on destroy', () => {
            const fixture = createComponent(PasswordFormFieldWithConditionalContent);
            const control = fixture.debugElement.query(By.directive(KbqInputPassword)).injector.get(KbqInputPassword);

            expect((control.stateChanges as Subject<void>).observers.length).toBeGreaterThan(0);
            fixture.destroy();
            expect((control.stateChanges as Subject<void>).observers.length).toBe(0);
        });
    });

    describe('accessibility', () => {
        const getDescribedByIds = (debugElement: DebugElement): string[] => {
            return (getInputNativeElement(debugElement).getAttribute('aria-describedby') || '')
                .split(/\s+/)
                .filter(Boolean);
        };

        it('should link KbqHint to the control by aria-describedby', () => {
            const { debugElement } = createComponent(InputFormFieldWithHintAndError);

            expect(getDescribedByIds(debugElement)).toEqual(['test-hint-id']);
        });

        it('should add KbqError to aria-describedby when the control becomes invalid', () => {
            const { debugElement } = createComponent(InputFormFieldWithHintAndError);
            const input = getInputNativeElement(debugElement);

            expect(getDescribedByIds(debugElement)).not.toContain('test-error-id');
            input.focus();
            input.blur();
            expect(getDescribedByIds(debugElement)).toEqual(['test-error-id', 'test-hint-id']);
        });

        it('should remove KbqError from aria-describedby when the control becomes valid', () => {
            const fixture = createComponent(InputFormFieldWithHintAndError);
            const { debugElement } = fixture;
            const input = getInputNativeElement(debugElement);

            input.focus();
            input.blur();
            expect(getDescribedByIds(debugElement)).toContain('test-error-id');

            input.value = 'koobiq';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(getDescribedByIds(debugElement)).not.toContain('test-error-id');
        });

        it('should only reference ids that are present in the DOM', () => {
            const { debugElement } = createComponent(InputFormFieldWithHintAndError);

            getDescribedByIds(debugElement).forEach((id) => {
                expect(debugElement.nativeElement.querySelector(`#${id}`)).toBeTruthy();
            });
        });

        it('should link KbqReactivePasswordHint to the control by aria-describedby', () => {
            const { debugElement } = createComponent(PasswordFormField);
            const input = getPasswordInputNativeElement(debugElement);

            expect(input.getAttribute('aria-describedby')).toBe('test-reactive-password-hint-id');
        });

        it('should NOT set aria-describedby when there is nothing to describe', () => {
            const { debugElement } = createComponent(InputFormFieldWithLabel);

            expect(getInputNativeElement(debugElement).hasAttribute('aria-describedby')).toBe(false);
        });

        it('should set aria-invalid on the control according to the error state', () => {
            const { debugElement } = createComponent(InputFormFieldWithHintAndError);
            const input = getInputNativeElement(debugElement);

            expect(input.getAttribute('aria-invalid')).toBe('false');
            input.focus();
            input.blur();
            expect(input.getAttribute('aria-invalid')).toBe('true');
        });

        it('should announce KbqError as an alert', () => {
            const { debugElement } = createComponent(InputFormFieldWithCustomErrorStateMatcher);
            const error = getErrorDebugElement(debugElement).nativeElement;

            expect(error.getAttribute('role')).toBe('alert');
            expect(error.getAttribute('aria-atomic')).toBe('true');
        });

        it('should expose KbqCleaner as a named button', () => {
            const { debugElement } = createComponent(InputFormFieldWithCleaner);
            const input = getInputNativeElement(debugElement);

            input.value = 'koobiq';
            input.dispatchEvent(new Event('input'));
            const cleaner = getCleanerDebugElement(debugElement).nativeElement;

            expect(cleaner.getAttribute('role')).toBe('button');
            expect(cleaner.getAttribute('aria-label')).toBeTruthy();
            expect(cleaner.getAttribute('tabindex')).toBe('0');
        });

        it.each(['Enter', ' '])('should clean field by KbqCleaner on %s', (key) => {
            const { debugElement, componentInstance } = createComponent(InputFormFieldWithCleaner);
            const input = getInputNativeElement(debugElement);

            input.value = 'koobiq';
            input.dispatchEvent(new Event('input'));
            expect(componentInstance.control.value).toBe('koobiq');

            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

            getCleanerDebugElement(debugElement).nativeElement.dispatchEvent(event);
            expect(componentInstance.control.value).toBeNull();
            expect(event.defaultPrevented).toBe(true);
        });

        it('should expose KbqPasswordToggle as a named toggle button', () => {
            const { debugElement } = createComponent(PasswordFormField);
            const toggle = getPasswordToggleDebugElement(debugElement).nativeElement.querySelector('i');

            expect(toggle.getAttribute('role')).toBe('button');
            expect(toggle.getAttribute('aria-label')).toBeTruthy();
            expect(toggle.getAttribute('aria-pressed')).toBe('false');
        });

        it('should reflect the shown password in KbqPasswordToggle aria-pressed and aria-label', () => {
            const { debugElement } = createComponent(PasswordFormField);
            const passwordToggle = getPasswordToggleDebugElement(debugElement);
            const toggle = () => passwordToggle.nativeElement.querySelector('i');
            const hiddenLabel = toggle().getAttribute('aria-label');

            passwordToggle.nativeElement.click();
            expect(toggle().getAttribute('aria-pressed')).toBe('true');
            expect(toggle().getAttribute('aria-label')).not.toBe(hiddenLabel);
        });

        it.each(['Enter', ' '])('should display password by %s on KbqPasswordToggle', (key) => {
            const { debugElement } = createComponent(PasswordFormField);
            const input = getPasswordInputNativeElement(debugElement);

            expect(input.type).toBe('password');
            getPasswordToggleDebugElement(debugElement).nativeElement.dispatchEvent(
                new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
            );
            expect(input.type).toBe('text');
        });
    });

    describe(ShowRequiredOnSubmitErrorStateMatcher.name, () => {
        const setup = () => {
            const fixture = createComponent(InputFormFieldWithInvalidOrSubmitMatcher);
            const { debugElement, componentInstance } = fixture;
            const input = getInputNativeElement(debugElement);
            const submit = getSubmitButtonNativeElement(debugElement);

            return { fixture, debugElement, componentInstance, input, submit };
        };

        it('should NOT show required error before form is submitted', () => {
            const { debugElement } = setup();

            expect(getErrorDebugElement(debugElement)).toBeFalsy();
        });

        it('should NOT show required error after the control is touched but form is not submitted', () => {
            const { input, debugElement, fixture } = setup();

            input.focus();
            input.blur();
            fixture.detectChanges();

            expect(getErrorDebugElement(debugElement)).toBeFalsy();
        });

        it('should show required error after the form is submitted', () => {
            const { submit, debugElement, fixture } = setup();

            submit.click();
            fixture.detectChanges();

            expect(getErrorDebugElement(debugElement)).toBeTruthy();
        });

        it('should show non-required error as soon as the control is invalid and touched', () => {
            const { componentInstance, input, debugElement, fixture } = setup();

            componentInstance.formGroup.setValue({ value: 'x' });
            componentInstance.formGroup.controls.value.addValidators(Validators.email);
            componentInstance.formGroup.controls.value.updateValueAndValidity();
            fixture.detectChanges();

            input.focus();
            input.blur();
            fixture.detectChanges();

            expect(getErrorDebugElement(debugElement)).toBeTruthy();
        });

        it('should NOT show non-required error before the control is touched', () => {
            const { componentInstance, debugElement, fixture } = setup();

            componentInstance.formGroup.setValue({ value: 'x' });
            componentInstance.formGroup.controls.value.addValidators(Validators.email);
            componentInstance.formGroup.controls.value.updateValueAndValidity();
            fixture.detectChanges();

            expect(getErrorDebugElement(debugElement)).toBeFalsy();
        });

        it('should stop showing required error after the form value becomes valid', () => {
            const { componentInstance, submit, debugElement, fixture } = setup();

            submit.click();
            fixture.detectChanges();

            expect(getErrorDebugElement(debugElement)).toBeTruthy();

            componentInstance.formGroup.setValue({ value: 'any value' });
            fixture.detectChanges();

            expect(getErrorDebugElement(debugElement)).toBeFalsy();
        });
    });
});

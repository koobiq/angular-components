import { Component, DebugElement, Directive, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    KBQ_TEXT_FIELD_INPUTS,
    KBQ_TEXT_FIELD_VALUE_ACCESSOR,
    KbqTextField,
    KbqTextFieldValueAccessor
} from './text-field';

const createComponent = async <T>(component: Type<T>, providers: any[] = []): Promise<ComponentFixture<T>> => {
    await TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);
    fixture.autoDetectChanges();
    return fixture;
};

const getTextFieldDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(CustomTextField));
};

const getTextFieldInstance = (debugElement: DebugElement): KbqTextField => {
    return getTextFieldDebugElement(debugElement)!.injector.get(KbqTextField);
};

const getInputNativeElement = (debugElement: DebugElement): HTMLInputElement => {
    return debugElement.query(By.css('input')).nativeElement;
};

const getTextareaNativeElement = (debugElement: DebugElement): HTMLInputElement => {
    return debugElement.query(By.css('textarea')).nativeElement;
};

@Directive({
    standalone: true,
    selector: 'input[customTextField], textarea[customTextField]',
    hostDirectives: [{ directive: KbqTextField, inputs: KBQ_TEXT_FIELD_INPUTS }]
})
class CustomTextField {}

@Directive({
    standalone: true,
    selector: 'input[customTextFieldValueAccessor], textarea[customTextFieldValueAccessor]',
    providers: [{ provide: KBQ_TEXT_FIELD_VALUE_ACCESSOR, useExisting: CustomTextFieldValueAccessor }]
})
class CustomTextFieldValueAccessor implements KbqTextFieldValueAccessor {
    get value() {
        return this._value;
    }
    set value(value: string) {
        this._value = value?.toUpperCase();
    }
    private _value: string;
}

@Component({
    standalone: true,
    imports: [CustomTextField],
    template: `
        <textarea customTextField></textarea>
    `
})
class TextareaTextField {}

@Component({
    standalone: true,
    imports: [CustomTextField, ReactiveFormsModule],
    template: `
        <input
            [formControl]="control"
            customTextField
        />
    `
})
class InputTextFieldWithFormControl {
    readonly control = new FormControl();
}

@Component({
    standalone: true,
    imports: [CustomTextField, CustomTextFieldValueAccessor],
    template: `
        <input
            customTextField
            customTextFieldValueAccessor
        />
    `
})
class InputTextFieldWithCustomValueAccessor {
    readonly control = new FormControl();
}

describe(KbqTextField.name, () => {
    it('should set attr.id', async () => {
        const fixture = await createComponent(TextareaTextField);
        const { debugElement } = fixture;
        const textarea = getTextareaNativeElement(debugElement);
        expect(textarea.id).toMatch(/^kbq-text-field-\d+$/);
        getTextFieldInstance(debugElement).id = 'test-id';
        fixture.detectChanges();
        expect(textarea.id).toBe('test-id');
    });

    it('should set attr.placeholder', async () => {
        const fixture = await createComponent(TextareaTextField);
        const { debugElement } = fixture;
        const textarea = getTextareaNativeElement(debugElement);
        expect(textarea.placeholder).toBeFalsy();
        getTextFieldInstance(debugElement).placeholder = 'test-placeholder';
        fixture.detectChanges();
        expect(textarea.placeholder).toBe('test-placeholder');
    });

    it('should set attr.name', async () => {
        const fixture = await createComponent(TextareaTextField);
        const { debugElement } = fixture;
        const textarea = getTextareaNativeElement(debugElement);
        expect(textarea.name).toBeFalsy();
        getTextFieldInstance(debugElement).name = 'test-name';
        fixture.detectChanges();
        expect(textarea.name).toBe('test-name');
    });

    it('should set attr.disabled', async () => {
        const fixture = await createComponent(TextareaTextField);
        const { debugElement } = fixture;
        const textarea = getTextareaNativeElement(debugElement);
        expect(textarea.disabled).toBeFalsy();
        getTextFieldInstance(debugElement).disabled = true;
        fixture.detectChanges();
        expect(textarea.disabled).toBeTruthy();
    });

    it('should set attr.disabled by FormControl', async () => {
        const fixture = await createComponent(InputTextFieldWithFormControl);
        const { debugElement, componentInstance } = fixture;
        const input = getInputNativeElement(debugElement);
        expect(input.disabled).toBeFalsy();
        componentInstance.control.disable();
        fixture.detectChanges();
        expect(input.disabled).toBeTruthy();
    });

    it('should set attr.readonly', async () => {
        const fixture = await createComponent(TextareaTextField);
        const { debugElement } = fixture;
        const textarea = getTextareaNativeElement(debugElement);
        expect(textarea.readOnly).toBeFalsy();
        getTextFieldInstance(debugElement).readonly = true;
        fixture.detectChanges();
        expect(textarea.readOnly).toBeTruthy();
    });

    it('should set attr.required', async () => {
        const fixture = await createComponent(TextareaTextField);
        const { debugElement } = fixture;
        const textarea = getTextareaNativeElement(debugElement);
        expect(textarea.required).toBeFalsy();
        getTextFieldInstance(debugElement).required = true;
        fixture.detectChanges();
        expect(textarea.required).toBeTruthy();
    });

    it('should set attr.required by FormControl', async () => {
        const fixture = await createComponent(InputTextFieldWithFormControl);
        const { debugElement, componentInstance } = fixture;
        const input = getInputNativeElement(debugElement);
        expect(input.required).toBeFalsy();
        componentInstance.control.setValidators(Validators.required);
        fixture.detectChanges();
        expect(input.required).toBeTruthy();
    });

    it('should add kbq-text-field_focused selector', async () => {
        const { debugElement } = await createComponent(TextareaTextField);
        const textarea = getTextareaNativeElement(debugElement);
        const textField = getTextFieldDebugElement(debugElement);
        expect(textField.classes['kbq-text-field_focused']).toBeFalsy();
        textarea.focus();
        expect(textField.classes['kbq-text-field_focused']).toBeTruthy();
        textarea.blur();
        expect(textField.classes['kbq-text-field_focused']).toBeFalsy();
    });

    it('should focus field by onContainerClick', async () => {
        const { debugElement } = await createComponent(TextareaTextField);
        const textFieldInstance = getTextFieldInstance(debugElement);
        expect(textFieldInstance.focused).toBeFalsy();
        getTextFieldInstance(debugElement).onContainerClick();
        expect(textFieldInstance.focused).toBeTruthy();
    });

    it('should emit stateChanges on focus change', async () => {
        const { debugElement } = await createComponent(TextareaTextField);
        const textFieldInstance = getTextFieldInstance(debugElement);
        const stateChangeNextSpy = jest.spyOn(textFieldInstance.stateChanges, 'next');
        textFieldInstance.focus();
        expect(stateChangeNextSpy).toHaveBeenCalledTimes(1);
    });

    it('should unfocus field when disabled', async () => {
        const { debugElement } = await createComponent(TextareaTextField);
        const textFieldInstance = getTextFieldInstance(debugElement);
        expect(textFieldInstance.focused).toBeFalsy();
        textFieldInstance.focus();
        expect(textFieldInstance.focused).toBeTruthy();
        textFieldInstance.disabled = true;
        expect(textFieldInstance.focused).toBeFalsy();
    });

    it('should set value', async () => {
        const { debugElement } = await createComponent(TextareaTextField);
        const textarea = getTextareaNativeElement(debugElement);
        expect(textarea.value).toBeFalsy();
        getTextFieldInstance(debugElement).value = 'test-value';
        expect(textarea.value).toBe('test-value');
    });

    it('should change value by custom KBQ_TEXT_FIELD_VALUE_ACCESSOR', async () => {
        const { debugElement } = await createComponent(InputTextFieldWithCustomValueAccessor);
        const textFieldInstance = getTextFieldInstance(debugElement);
        expect(textFieldInstance.value).toBeFalsy();
        textFieldInstance.value = 'test-value';
        expect(textFieldInstance.value).toBe('TEST-VALUE');
    });

    it('should set value by FormControl', async () => {
        const { debugElement, componentInstance } = await createComponent(InputTextFieldWithFormControl);
        const input = getInputNativeElement(debugElement);
        expect(input.value).toBeFalsy();
        componentInstance.control.setValue('test-value');
        expect(input.value).toBe('test-value');
    });

    it('should emit stateChanges on value change', async () => {
        const { debugElement } = await createComponent(TextareaTextField);
        const textFieldInstance = getTextFieldInstance(debugElement);
        const stateChangeNextSpy = jest.spyOn(textFieldInstance.stateChanges, 'next');
        textFieldInstance.value = 'new value';
        expect(stateChangeNextSpy).toHaveBeenCalledTimes(1);
    });

    it('should detect empty state on value change', async () => {
        const { debugElement } = await createComponent(TextareaTextField);
        const textFieldInstance = getTextFieldInstance(debugElement);
        expect(textFieldInstance.value).toBeFalsy();
        expect(textFieldInstance.empty).toBeTruthy();
        textFieldInstance.value = 'not-empty';
        expect(textFieldInstance.empty).toBeFalsy();
    });

    it('should detect empty state on FormControl change', async () => {
        const { debugElement, componentInstance } = await createComponent(InputTextFieldWithFormControl);
        const textFieldInstance = getTextFieldInstance(debugElement);
        expect(componentInstance.control.value).toBeFalsy();
        expect(textFieldInstance.empty).toBeTruthy();
        componentInstance.control.setValue('not-empty');
        expect(textFieldInstance.empty).toBeFalsy();
    });
});

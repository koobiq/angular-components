import { Component, DebugElement, Directive, Type, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqInputModule, KbqInputPassword } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTrim } from './form-field';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const type = (element: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
    element.value = value;
    element.dispatchEvent(new Event('input'));
};

const getNativeElement = (debugElement: DebugElement, selector: string): HTMLInputElement => {
    return debugElement.query(By.css(selector)).nativeElement;
};

@Component({
    selector: 'trim-test',
    imports: [ReactiveFormsModule, KbqInputModule, KbqTextareaModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="input" />
        </kbq-form-field>

        <kbq-form-field>
            <input kbqInput no-trim [formControl]="noTrimInput" />
        </kbq-form-field>

        <kbq-form-field>
            <textarea kbqTextarea [formControl]="textarea"></textarea>
        </kbq-form-field>

        <kbq-form-field>
            <input kbqInputPassword [formControl]="password" />
        </kbq-form-field>
    `
})
class TrimTest {
    readonly input = new FormControl('');
    readonly noTrimInput = new FormControl('');
    readonly textarea = new FormControl('');
    readonly password = new FormControl('');
}

/** A custom accessor, which `selectValueAccessor` prefers over the built-in `DefaultValueAccessor`. */
@Directive({
    selector: 'input[testAccessor]',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TestAccessor), multi: true }]
})
class TestAccessor implements ControlValueAccessor {
    onChange: (value: unknown) => void = () => {};

    writeValue(): void {}

    registerOnChange(fn: (value: unknown) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(): void {}
}

@Component({
    selector: 'custom-accessor-test',
    imports: [ReactiveFormsModule, KbqInputModule, TestAccessor],
    template: `
        <kbq-form-field>
            <input kbqInput testAccessor [formControl]="control" />
        </kbq-form-field>
    `
})
class CustomAccessorTest {
    readonly control = new FormControl('');
}

@Component({
    selector: 'no-control-test',
    imports: [KbqInputModule, TestAccessor],
    template: `
        <kbq-form-field>
            <input kbqInput testAccessor />
        </kbq-form-field>
    `
})
class NoControlTest {}

describe(KbqTrim.name, () => {
    it('should trim the value of kbqInput', () => {
        const fixture = createComponent(TrimTest);

        type(getNativeElement(fixture.debugElement, 'input[kbqInput]'), '  koobiq  ');

        expect(fixture.componentInstance.input.value).toBe('koobiq');
    });

    it('should trim the value of kbqTextarea', () => {
        const fixture = createComponent(TrimTest);

        type(fixture.debugElement.query(By.css('textarea')).nativeElement, '  koobiq  ');

        expect(fixture.componentInstance.textarea.value).toBe('koobiq');
    });

    it('should NOT trim the value with the no-trim attribute', () => {
        const fixture = createComponent(TrimTest);

        type(getNativeElement(fixture.debugElement, 'input[no-trim]'), '  koobiq  ');

        expect(fixture.componentInstance.noTrimInput.value).toBe('  koobiq  ');
    });

    it('should NOT trim the value of kbqInputPassword', () => {
        const fixture = createComponent(TrimTest);

        type(fixture.debugElement.query(By.directive(KbqInputPassword)).nativeElement, '  koobiq  ');

        expect(fixture.componentInstance.password.value).toBe('  koobiq  ');
    });

    it('should NOT change the value displayed in the control', () => {
        const fixture = createComponent(TrimTest);
        const input = getNativeElement(fixture.debugElement, 'input[kbqInput]');

        type(input, '  koobiq  ');

        expect(input.value).toBe('  koobiq  ');
    });

    it('should pass a non-string value through', () => {
        const { debugElement } = createComponent(TrimTest);
        const trim: KbqTrim = debugElement.query(By.directive(KbqTrim)).injector.get(KbqTrim);

        expect(trim.trim(42)).toBe(42);
        expect(trim.trim(null)).toBeNull();
        expect(trim.trim(undefined)).toBeUndefined();
    });

    it('should add the kbq-trim class', () => {
        const { debugElement } = createComponent(TrimTest);

        expect(getNativeElement(debugElement, 'input[kbqInput]').classList.contains('kbq-trim')).toBe(true);
    });

    it('should trim through the accessor the form selects over the default one', () => {
        const fixture = createComponent(CustomAccessorTest);
        const accessor = fixture.debugElement.query(By.directive(TestAccessor)).injector.get(TestAccessor);

        accessor.onChange('  koobiq  ');

        expect(fixture.componentInstance.control.value).toBe('koobiq');
    });

    it('should leave the accessors untouched when the host has no form control', () => {
        const fixture = createComponent(NoControlTest);
        const accessor = fixture.debugElement.query(By.directive(TestAccessor)).injector.get(TestAccessor);
        const onChange = jest.fn();

        accessor.registerOnChange(onChange);
        accessor.onChange('  koobiq  ');

        expect(onChange).toHaveBeenCalledWith('  koobiq  ');
    });
});

import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
});

import { Component, DebugElement, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqInput, KbqInputModule, KbqInputPassword } from '@koobiq/components/input';
import { KbqTagList, KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextarea, KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqFormField } from './form-field';
import { KbqFormFieldModule } from './form-field.module';

/**
 * The CDK detects autofill by running a zero-length keyframe animation on `:-webkit-autofill` and
 * listening for `animationstart`. jsdom implements neither the pseudo-class nor CSS animations, so
 * the event is dispatched by hand — the same technique the CDK's own tests use. `AnimationEvent` is
 * not constructible everywhere, hence the plain `Event` with `animationName` defined on it.
 *
 * Only the TypeScript half is testable here. The styling keys on `:autofill` in CSS and is covered
 * by `e2e.playwright-spec.ts`, which forces the pseudo-class over CDP.
 */
const dispatchAutofill = (element: HTMLElement, isAutofilled: boolean): void => {
    const event = new Event('animationstart');

    Object.defineProperty(event, 'animationName', {
        get: () => (isAutofilled ? 'cdk-text-field-autofill-start' : 'cdk-text-field-autofill-end')
    });

    element.dispatchEvent(event);
};

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] }).compileComponents();

    const fixture = TestBed.createComponent<T>(component);

    fixture.detectChanges();

    return fixture;
};

const getFormFieldElement = (debugElement: DebugElement): HTMLElement =>
    debugElement.query(By.directive(KbqFormField)).nativeElement;

// No `ngModel` here: with an `NgControl` attached, `KbqInput.disabled` reads the control instead of
// the binding, and the `disabled` case below would never turn on.
@Component({
    selector: 'input-form-field',
    imports: [KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqInput [disabled]="disabled" />
        </kbq-form-field>
    `
})
class InputFormField {
    @ViewChild(KbqInput, { static: true }) input: KbqInput;

    disabled = false;
}

// `KbqInputPassword` is a directive of its own, not a subclass of `KbqInput` — and a password field
// is the most common autofill target there is, so it gets its own case.
@Component({
    selector: 'password-form-field',
    imports: [KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword />
        </kbq-form-field>
    `
})
class PasswordFormField {
    @ViewChild(KbqInputPassword, { static: true }) input: KbqInputPassword;
}

@Component({
    selector: 'textarea-form-field',
    imports: [KbqFormFieldModule, KbqTextareaModule, FormsModule],
    template: `
        <kbq-form-field>
            <textarea kbqTextarea [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `
})
class TextareaFormField {
    @ViewChild(KbqTextarea, { static: true }) textarea: KbqTextarea;

    value = '';
}

@Component({
    selector: 'tag-list-form-field',
    imports: [KbqFormFieldModule, KbqInputModule, KbqTagsModule, FormsModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList>
                <input kbqInput [kbqTagInputFor]="tagList" />
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class TagListFormField {
    @ViewChild(KbqTagList, { static: true }) tagList: KbqTagList;
}

describe('autofill', () => {
    describe(KbqInput.name, () => {
        it('should report autofilled and add the form field class', () => {
            const fixture = createComponent(InputFormField);
            const { debugElement, componentInstance } = fixture;
            const input = debugElement.query(By.css('input')).nativeElement;

            expect(componentInstance.input.autofilled()).toBe(false);
            expect(getFormFieldElement(debugElement).classList).not.toContain('kbq-form-field_autofilled');

            dispatchAutofill(input, true);
            fixture.detectChanges();

            expect(componentInstance.input.autofilled()).toBe(true);
            expect(getFormFieldElement(debugElement).classList).toContain('kbq-form-field_autofilled');
        });

        it('should stop reporting autofilled once the browser fill is undone', () => {
            const fixture = createComponent(InputFormField);
            const { debugElement, componentInstance } = fixture;
            const input = debugElement.query(By.css('input')).nativeElement;

            dispatchAutofill(input, true);
            fixture.detectChanges();
            dispatchAutofill(input, false);
            fixture.detectChanges();

            expect(componentInstance.input.autofilled()).toBe(false);
            expect(getFormFieldElement(debugElement).classList).not.toContain('kbq-form-field_autofilled');
        });

        it('should keep the form field disabled state alongside autofill', () => {
            const fixture = createComponent(InputFormField);
            const { debugElement, componentInstance } = fixture;
            const input = debugElement.query(By.css('input')).nativeElement;

            dispatchAutofill(input, true);
            componentInstance.disabled = true;
            fixture.detectChanges();

            const formField = getFormFieldElement(debugElement);

            // Both classes are present: autofill is orthogonal to the state, not weaker than it.
            expect(formField.classList).toContain('kbq-form-field_autofilled');
            expect(formField.classList).toContain('kbq-disabled');
        });

        it('should stop monitoring on destroy', () => {
            const fixture = createComponent(InputFormField);
            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            dispatchAutofill(input, true);
            fixture.detectChanges();

            expect(input.classList).toContain('cdk-text-field-autofill-monitored');

            fixture.destroy();

            // `AutofillMonitor` is `providedIn: 'root'`, so without an explicit `stopMonitoring()`
            // the element stays registered with an app-lifetime service and keeps these classes.
            expect(input.classList).not.toContain('cdk-text-field-autofill-monitored');
            expect(input.classList).not.toContain('cdk-text-field-autofilled');
        });
    });

    describe(KbqInputPassword.name, () => {
        it('should report autofilled and add the form field class', () => {
            const fixture = createComponent(PasswordFormField);
            const { debugElement, componentInstance } = fixture;
            const input = debugElement.query(By.css('input')).nativeElement;

            dispatchAutofill(input, true);
            fixture.detectChanges();

            expect(componentInstance.input.autofilled()).toBe(true);
            expect(getFormFieldElement(debugElement).classList).toContain('kbq-form-field_autofilled');
        });
    });

    describe(KbqTextarea.name, () => {
        it('should report autofilled and add the form field class', () => {
            const fixture = createComponent(TextareaFormField);
            const { debugElement, componentInstance } = fixture;
            const textarea = debugElement.query(By.css('textarea')).nativeElement;

            dispatchAutofill(textarea, true);
            fixture.detectChanges();

            expect(componentInstance.textarea.autofilled()).toBe(true);
            expect(getFormFieldElement(debugElement).classList).toContain('kbq-form-field_autofilled');
        });
    });

    describe(KbqTagList.name, () => {
        it('should forward the autofilled state of the registered tag input', () => {
            const fixture = createComponent(TagListFormField);
            const { debugElement, componentInstance } = fixture;
            const input = debugElement.query(By.css('input')).nativeElement;

            expect(componentInstance.tagList.autofilled()).toBe(false);

            dispatchAutofill(input, true);
            fixture.detectChanges();

            // The tag list is the `KbqFormFieldControl`, but the browser autofills the inner input.
            expect(componentInstance.tagList.autofilled()).toBe(true);
            expect(getFormFieldElement(debugElement).classList).toContain('kbq-form-field_autofilled');
        });
    });
});

import { Component, inject, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KbqFormFieldModule } from './form-field.module';
import { kbqHintParentFactoryProvider } from './hint';

const COMPACT = 'kbq-hint_compact';
const FILL_TEXT_OFF = 'kbq-hint_fill-text-off';
const DISABLED = 'kbq-hint_disabled';

@Component({
    selector: 'test-parent',
    template: '<ng-content />',
    providers: [
        kbqHintParentFactoryProvider(() => inject(TestParent).config)
    ]
})
class TestParent {
    readonly config = { compact: signal(false), fillTextOff: signal(false), disabled: signal(false) };
}

@Component({
    imports: [KbqFormFieldModule, TestParent],
    template: `
        <kbq-hint id="standalone">Hint</kbq-hint>
        <test-parent>
            <kbq-hint id="hint">Hint</kbq-hint>
            <kbq-hint id="own-inputs" compact fillTextOff>Hint</kbq-hint>
            <kbq-error id="error">Error</kbq-error>
            <kbq-reactive-password-hint id="password">Password</kbq-reactive-password-hint>
        </test-parent>
    `
})
class TestHints {}

@Component({
    imports: [KbqCheckboxModule, KbqFormFieldModule],
    template: `
        <kbq-checkbox [big]="big()" [disabled]="disabled()">
            Label
            <kbq-hint id="hint">Hint</kbq-hint>
        </kbq-checkbox>
    `
})
class TestCheckbox {
    readonly big = signal(false);
    readonly disabled = signal(false);
}

@Component({
    imports: [KbqToggleModule, KbqFormFieldModule],
    template: `
        <kbq-toggle [big]="big()" [disabled]="disabled()" [loading]="loading()">
            Label
            <kbq-hint id="hint">Hint</kbq-hint>
        </kbq-toggle>
    `
})
class TestToggle {
    readonly big = signal(false);
    readonly disabled = signal(false);
    readonly loading = signal(false);
}

@Component({
    imports: [KbqRadioModule, KbqFormFieldModule],
    template: `
        <kbq-radio-group [big]="big()" [disabled]="disabled()">
            <kbq-radio-button value="1">
                One
                <kbq-hint id="hint">Hint</kbq-hint>
            </kbq-radio-button>
            <kbq-hint id="group-hint">Hint</kbq-hint>
        </kbq-radio-group>
    `
})
class TestRadioGroup {
    readonly big = signal(false);
    readonly disabled = signal(false);
}

@Component({
    imports: [KbqRadioModule, KbqFormFieldModule],
    template: `
        <kbq-radio-group>
            <kbq-radio-button value="1" [disabled]="disabled()">
                One
                <kbq-hint id="hint">Hint</kbq-hint>
            </kbq-radio-button>
            <kbq-radio-button value="2">
                Two
                <kbq-hint id="enabled-hint">Hint</kbq-hint>
            </kbq-radio-button>
        </kbq-radio-group>
    `
})
class TestRadioButton {
    readonly disabled = signal(false);
}

@Component({
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" />
            <kbq-hint id="hint">Hint</kbq-hint>
        </kbq-form-field>
    `
})
class TestFormField {
    readonly control = new FormControl('');
}

@Component({
    imports: [KbqFormFieldModule],
    template: `
        <kbq-fieldset>
            <kbq-hint id="hint">Hint</kbq-hint>
        </kbq-fieldset>
    `
})
class TestFieldset {}

@Component({
    imports: [KbqFileUploadModule, KbqFormFieldModule, ReactiveFormsModule],
    template: `
        <kbq-single-file-upload [formControl]="control">
            <kbq-hint id="hint">Hint</kbq-hint>
        </kbq-single-file-upload>
    `
})
class TestSingleFileUpload {
    readonly control = new FormControl(null);
}

@Component({
    imports: [KbqFileUploadModule, KbqFormFieldModule, ReactiveFormsModule],
    template: `
        <kbq-multiple-file-upload [formControl]="control">
            <kbq-hint id="hint">Hint</kbq-hint>
        </kbq-multiple-file-upload>
    `
})
class TestMultipleFileUpload {
    readonly control = new FormControl([]);
}

const render = <T>(component: Type<T>): ComponentFixture<T> => {
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const classesOf = (fixture: ComponentFixture<unknown>, id: string): DOMTokenList =>
    fixture.nativeElement.querySelector(`#${id}`).classList;

describe('KbqHint', () => {
    describe('on its own', () => {
        it('should have no state by default', () => {
            const classes = classesOf(render(TestHints), 'standalone');

            expect(classes.contains(COMPACT)).toBe(false);
            expect(classes.contains(FILL_TEXT_OFF)).toBe(false);
            expect(classes.contains(DISABLED)).toBe(false);
        });
    });

    describe('under KBQ_HINT_PARENT', () => {
        let fixture: ComponentFixture<TestHints>;
        let config: TestParent['config'];

        beforeEach(() => {
            fixture = TestBed.createComponent(TestHints);
            config = fixture.debugElement.children
                .find((child) => child.name === 'test-parent')!
                .injector.get(TestParent).config;
            fixture.detectChanges();
        });

        it('should follow the config', () => {
            const classes = classesOf(fixture, 'hint');

            expect(classes.contains(COMPACT)).toBe(false);
            expect(classes.contains(FILL_TEXT_OFF)).toBe(false);
            expect(classes.contains(DISABLED)).toBe(false);

            config.compact.set(true);
            config.fillTextOff.set(true);
            config.disabled.set(true);
            fixture.detectChanges();

            expect(classes.contains(COMPACT)).toBe(true);
            expect(classes.contains(FILL_TEXT_OFF)).toBe(true);
            expect(classes.contains(DISABLED)).toBe(true);

            config.compact.set(false);
            config.fillTextOff.set(false);
            config.disabled.set(false);
            fixture.detectChanges();

            expect(classes.contains(COMPACT)).toBe(false);
            expect(classes.contains(FILL_TEXT_OFF)).toBe(false);
            expect(classes.contains(DISABLED)).toBe(false);
        });

        // The stylesheet keeps the error color under a disabled control, which `07-hint` of the form field e2e checks.
        it('should pass the config to an error too', () => {
            const classes = classesOf(fixture, 'error');

            config.compact.set(true);
            config.fillTextOff.set(true);
            config.disabled.set(true);
            fixture.detectChanges();

            expect(classes.contains(COMPACT)).toBe(true);
            expect(classes.contains(FILL_TEXT_OFF)).toBe(true);
            expect(classes.contains(DISABLED)).toBe(true);
        });

        it('should keep its own inputs while the config leaves them off', () => {
            const classes = classesOf(fixture, 'own-inputs');

            expect(classes.contains(COMPACT)).toBe(true);
            expect(classes.contains(FILL_TEXT_OFF)).toBe(true);
            expect(classes.contains(DISABLED)).toBe(false);
        });

        it('should keep the size of a password hint and pass the rest to it', () => {
            const classes = classesOf(fixture, 'password');

            config.compact.set(true);
            config.disabled.set(true);
            fixture.detectChanges();

            expect(classes.contains(COMPACT)).toBe(false);
            expect(classes.contains(DISABLED)).toBe(true);
        });
    });

    describe('in a control', () => {
        it.each<[string, Type<TestCheckbox | TestRadioGroup>, string]>([
            ['kbq-checkbox', TestCheckbox, 'hint'],
            ['kbq-toggle', TestToggle, 'hint'],
            ['kbq-radio-button', TestRadioGroup, 'hint'],
            ['kbq-radio-group', TestRadioGroup, 'group-hint']
        ])('should be compact unless %s is big', (_, component, id) => {
            const fixture = render(component);
            const classes = classesOf(fixture, id);

            expect(classes.contains(COMPACT)).toBe(true);

            fixture.componentInstance.big.set(true);
            fixture.detectChanges();

            expect(classes.contains(COMPACT)).toBe(false);
        });

        it.each<[string, Type<TestCheckbox | TestRadioGroup>, string]>([
            ['kbq-checkbox', TestCheckbox, 'hint'],
            ['kbq-toggle', TestToggle, 'hint'],
            ['kbq-radio-group', TestRadioGroup, 'hint'],
            ['kbq-radio-group', TestRadioGroup, 'group-hint']
        ])('should follow the disabled state of %s', (_, component, id) => {
            const fixture = render(component);
            const classes = classesOf(fixture, id);

            expect(classes.contains(DISABLED)).toBe(false);

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();

            expect(classes.contains(DISABLED)).toBe(true);

            fixture.componentInstance.disabled.set(false);
            fixture.detectChanges();

            expect(classes.contains(DISABLED)).toBe(false);
        });

        it('should be disabled while kbq-toggle is loading', () => {
            const fixture = render(TestToggle);

            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();

            expect(classesOf(fixture, 'hint').contains(DISABLED)).toBe(true);
        });

        it('should follow its own kbq-radio-button and not the others of the group', () => {
            const fixture = render(TestRadioButton);

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();

            expect(classesOf(fixture, 'hint').contains(DISABLED)).toBe(true);
            expect(classesOf(fixture, 'enabled-hint').contains(DISABLED)).toBe(false);
        });

        it.each<[string, Type<TestFormField | TestSingleFileUpload | TestMultipleFileUpload>]>([
            ['kbq-form-field', TestFormField],
            ['kbq-single-file-upload', TestSingleFileUpload],
            ['kbq-multiple-file-upload', TestMultipleFileUpload]
        ])('should be compact in %s and follow the disabled state of its form control', (_, component) => {
            const fixture = render(component);
            const classes = classesOf(fixture, 'hint');

            expect(classes.contains(COMPACT)).toBe(true);
            expect(classes.contains(DISABLED)).toBe(false);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(classes.contains(DISABLED)).toBe(true);

            fixture.componentInstance.control.enable();
            fixture.detectChanges();

            expect(classes.contains(DISABLED)).toBe(false);
        });

        it('should be compact in kbq-fieldset', () => {
            expect(classesOf(render(TestFieldset), 'hint').contains(COMPACT)).toBe(true);
        });
    });
});

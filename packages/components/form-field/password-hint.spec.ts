import { Component, DebugElement, signal, Type, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqInputModule, KbqInputPassword } from '@koobiq/components/input';
import { Subject } from 'rxjs';
import { KbqFormField } from './form-field';
import { KbqFormFieldModule } from './form-field.module';
import { hasPasswordStrengthError, KbqPasswordHint, PasswordRules, regExpPasswordValidator } from './password-hint';

/**
 * The rule is resolved once in `ngAfterContentInit`, so the inputs have to be set before the first change
 * detection run.
 */
const createComponent = <T>(component: Type<T>, inputs: Partial<T> = {}): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    Object.assign(fixture.componentInstance as object, inputs);
    fixture.autoDetectChanges();

    return fixture;
};

const getHintNativeElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqPasswordHint)).nativeElement;
};

const getInputNativeElement = (debugElement: DebugElement): HTMLInputElement => {
    return debugElement.query(By.directive(KbqInputPassword)).nativeElement;
};

/** Types a value into the password input and blurs it, which is what makes the legacy engine check the rule. */
const enterValue = (fixture: ComponentFixture<unknown>, value: string): void => {
    const input = getInputNativeElement(fixture.debugElement);

    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.blur();
    fixture.detectChanges();
};

@Component({
    selector: 'password-form-field-with-hint',
    imports: [ReactiveFormsModule, KbqInputModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [formControl]="control" />
            <kbq-password-hint [max]="max" [min]="min" [rule]="rule">Hint</kbq-password-hint>
        </kbq-form-field>
    `
})
class PasswordFormFieldWithHint {
    @ViewChild(KbqPasswordHint) readonly hint: KbqPasswordHint;
    readonly control = new FormControl('');
    rule: PasswordRules | undefined = PasswordRules.Length;
    min: number | undefined = 4;
    max: number | undefined = 8;
}

@Component({
    selector: 'password-form-field-with-custom-hint',
    imports: [ReactiveFormsModule, KbqInputModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [formControl]="control" />
            <kbq-password-hint [checkRule]="checkRule" [regex]="regex" [rule]="rule">Hint</kbq-password-hint>
        </kbq-form-field>
    `
})
class PasswordFormFieldWithCustomHint {
    readonly control = new FormControl('');
    rule: PasswordRules | undefined = PasswordRules.Custom;
    regex: RegExp | null = null;
    checkRule: ((value: string) => boolean) | undefined = undefined;
}

/**
 * A control reports `T | null` and is free to return `null` — a custom `KBQ_INPUT_VALUE_ACCESSOR` is typed
 * `{ value: any }` — while every rule is typed for a string. `required` keeps `checkValue` from resetting the
 * state for an empty value, so the rule result stays observable.
 */
@Component({
    selector: 'password-hint-with-null-value',
    imports: [KbqFormFieldModule],
    template: `
        <kbq-password-hint [max]="8" [min]="4" [rule]="rule" [viewFormField]="formField">Hint</kbq-password-hint>
    `
})
class PasswordHintWithNullValue {
    @ViewChild(KbqPasswordHint) readonly hint: KbqPasswordHint;
    readonly stateChanges = new Subject<void>();
    readonly formField = {
        control: signal({
            value: null,
            focused: false,
            required: true,
            ngControl: null,
            stateChanges: this.stateChanges
        })
    } as unknown as KbqFormField;
    rule: PasswordRules | undefined = PasswordRules.Length;
}

/** Mirrors the e2e fixture: the control already holds a password that satisfies the rule. */
@Component({
    selector: 'password-form-field-with-prefilled-control',
    imports: [ReactiveFormsModule, KbqInputModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [formControl]="control" />
            <kbq-password-hint [max]="15" [min]="8" [rule]="rule">Hint</kbq-password-hint>
        </kbq-form-field>
    `
})
class PasswordFormFieldWithPrefilledControl {
    @ViewChild(KbqPasswordHint) readonly hint: KbqPasswordHint;
    readonly control = new FormControl('P@a$$w0rd');
    rule: PasswordRules | undefined = PasswordRules.Length;
}

@Component({
    selector: 'password-form-field-with-validators',
    imports: [ReactiveFormsModule, KbqInputModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [formControl]="control" />
            <kbq-password-hint [max]="8" [min]="4" [rule]="rule">Hint</kbq-password-hint>
        </kbq-form-field>
    `
})
class PasswordFormFieldWithValidators {
    readonly control = new FormControl('', [Validators.minLength(10)]);
    rule: PasswordRules | undefined = PasswordRules.Length;
}

describe(KbqPasswordHint.name, () => {
    describe('rules', () => {
        it.each([
            [PasswordRules.Length, 'koobiq', true],
            [PasswordRules.Length, 'kbq', false],
            [PasswordRules.Length, 'koobiq-is-awesome', false],
            [PasswordRules.LowerLatin, 'koobiq', true],
            [PasswordRules.LowerLatin, 'KOOBIQ', false],
            [PasswordRules.UpperLatin, 'Koobiq', true],
            [PasswordRules.UpperLatin, 'koobiq', false],
            [PasswordRules.Digit, 'koobiq1', true],
            [PasswordRules.Digit, 'koobiq', false],
            [PasswordRules.LatinAndSpecialSymbols, 'koobiq!', true],
            [PasswordRules.LatinAndSpecialSymbols, 'кубик', false]
        ])('should check %s against "%s"', (rule, value, expected) => {
            const fixture = createComponent(PasswordFormFieldWithHint, { rule });

            enterValue(fixture, value);

            expect(fixture.componentInstance.hint.checked).toBe(expected);
            expect(fixture.componentInstance.hint.hasError).toBe(!expected);
        });

        it('should treat a missing min as no lower bound', () => {
            const fixture = createComponent(PasswordFormFieldWithHint, { min: undefined });

            enterValue(fixture, 'k');

            expect(fixture.componentInstance.hint.checked).toBe(true);
        });

        it('should treat a missing max as no upper bound', () => {
            const fixture = createComponent(PasswordFormFieldWithHint, { max: undefined });

            enterValue(fixture, 'koobiq-is-awesome');

            expect(fixture.componentInstance.hint.checked).toBe(true);
        });

        it('should check PasswordRules.Custom against the regex', () => {
            const fixture = createComponent(PasswordFormFieldWithCustomHint, { regex: /koobiq/ });

            enterValue(fixture, 'koobiq');

            expect(getHintNativeElement(fixture.debugElement).classList.contains('kbq-success')).toBe(true);
        });

        it('should check PasswordRules.Custom against checkRule', () => {
            const fixture = createComponent(PasswordFormFieldWithCustomHint, {
                checkRule: (value: string) => value === 'koobiq'
            });

            enterValue(fixture, 'not-koobiq');

            expect(getHintNativeElement(fixture.debugElement).classList.contains('kbq-error')).toBe(true);
        });

        it('should NOT throw for PasswordRules.Length when the control reports null', () => {
            const fixture = createComponent(PasswordHintWithNullValue, { rule: PasswordRules.Length });

            fixture.componentInstance.stateChanges.next();

            expect(fixture.componentInstance.hint.hasError).toBe(true);
        });

        it('should NOT satisfy a regex rule when the control reports null', () => {
            const fixture = createComponent(PasswordHintWithNullValue, { rule: PasswordRules.LowerLatin });

            fixture.componentInstance.stateChanges.next();

            expect(fixture.componentInstance.hint.hasError).toBe(true);
        });
    });

    describe('configuration errors', () => {
        it('should throw when PasswordRules.Custom has neither regex nor checkRule', () => {
            expect(() => createComponent(PasswordFormFieldWithCustomHint)).toThrow(
                'You should set [regex] or [checkRule] for PasswordRules.Custom'
            );
        });

        it('should throw when PasswordRules.Length has neither min nor max', () => {
            expect(() => createComponent(PasswordFormFieldWithHint, { min: undefined, max: undefined })).toThrow(
                'For [rule] "Length" need set [min] and [max]'
            );
        });

        it('should throw for an unknown rule', () => {
            expect(() => createComponent(PasswordFormFieldWithHint, { rule: undefined })).toThrow(
                'Unknown [rule]=undefined'
            );
        });
    });

    describe('state', () => {
        it('should NOT report an error while the value is being typed', () => {
            const fixture = createComponent(PasswordFormFieldWithHint);
            const input = getInputNativeElement(fixture.debugElement);

            input.focus();
            input.value = 'k';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            expect(fixture.componentInstance.hint.hasError).toBe(false);
        });

        it('should reset the state for an empty value of an optional control', () => {
            const fixture = createComponent(PasswordFormFieldWithHint);

            enterValue(fixture, 'kbq');
            expect(fixture.componentInstance.hint.hasError).toBe(true);

            enterValue(fixture, '');
            expect(fixture.componentInstance.hint.hasError).toBe(false);
            expect(fixture.componentInstance.hint.checked).toBe(false);
        });

        it('should report a rule satisfied by the value the control already holds', () => {
            const fixture = createComponent(PasswordFormFieldWithPrefilledControl);

            expect(fixture.componentInstance.hint.checked).toBe(true);
            expect(fixture.componentInstance.hint.hasError).toBe(false);
        });

        it('should re-check the rule when the value is set programmatically', () => {
            const fixture = createComponent(PasswordFormFieldWithPrefilledControl);
            const { control, hint } = fixture.componentInstance;

            control.setValue('kbq');
            fixture.detectChanges();

            expect(hint.checked).toBe(false);
            expect(hint.hasError).toBe(true);

            control.setValue('koobiq!!');
            fixture.detectChanges();

            expect(hint.checked).toBe(true);
            expect(hint.hasError).toBe(false);
        });

        it('should generate a unique id for aria-describedby', () => {
            const { debugElement } = createComponent(PasswordFormFieldWithHint);
            const hintId = getHintNativeElement(debugElement).getAttribute('id');

            expect(hintId).toMatch(/^kbq-password-hint-\d+$/);
            expect(getInputNativeElement(debugElement).getAttribute('aria-describedby')).toBe(hintId);
        });

        it('should disable the hint text color by default', () => {
            const { debugElement } = createComponent(PasswordFormFieldWithHint);

            expect(getHintNativeElement(debugElement).classList.contains('kbq-hint_fill-text-off')).toBe(true);
        });
    });

    describe('password strength error', () => {
        it('should keep the errors of the other validators', fakeAsync(() => {
            const fixture = createComponent(PasswordFormFieldWithValidators);

            enterValue(fixture, 'kbq');
            // The form field applies the strength error from a `delay(0)` handler.
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.errors).toEqual({
                minlength: { requiredLength: 10, actualLength: 3 },
                passwordStrength: true
            });
        }));

        it('should clear the error once the password satisfies the rule', fakeAsync(() => {
            const fixture = createComponent(PasswordFormFieldWithHint);
            const { control } = fixture.componentInstance;

            enterValue(fixture, 'kbq');
            tick();
            fixture.detectChanges();

            expect(control.errors).toEqual({ passwordStrength: true });

            enterValue(fixture, 'koobiq');
            tick();
            fixture.detectChanges();

            expect(control.errors).toBeNull();
        }));
    });

    describe(hasPasswordStrengthError.name, () => {
        it('should report an error when any hint has one', () => {
            const fixture = createComponent(PasswordFormFieldWithHint);

            enterValue(fixture, 'kbq');
            expect(hasPasswordStrengthError([fixture.componentInstance.hint])).toBe(true);
        });

        it('should NOT report an error when every hint is satisfied', () => {
            const fixture = createComponent(PasswordFormFieldWithHint);

            enterValue(fixture, 'koobiq');
            expect(hasPasswordStrengthError([fixture.componentInstance.hint])).toBe(false);
        });
    });

    describe('regExpPasswordValidator', () => {
        it.each([
            [PasswordRules.LowerLatin, 'a', 'A'],
            [PasswordRules.UpperLatin, 'A', 'a'],
            [PasswordRules.Digit, '1', 'a']
        ])('should match %s', (rule, matching, notMatching) => {
            expect(regExpPasswordValidator[rule]!.test(matching)).toBe(true);
            expect(regExpPasswordValidator[rule]!.test(notMatching)).toBe(false);
        });

        it('should match the characters that are not latin or special symbols', () => {
            const regex = regExpPasswordValidator[PasswordRules.LatinAndSpecialSymbols]!;

            expect(regex.test('кириллица')).toBe(true);
            expect(regex.test('latin!')).toBe(false);
        });
    });
});

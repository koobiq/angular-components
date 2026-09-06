import { F8 } from '@angular/cdk/keycodes';
import { Component, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '@koobiq/components/core';
import { KbqFormFieldModule, KbqPasswordHint, KbqPasswordToggle, PasswordRules } from '@koobiq/components/form-field';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { axe } from 'jest-axe';
import { KbqInputModule, KbqInputPassword } from './index';

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            ReactiveFormsModule,
            KbqFormFieldModule,
            KbqInputModule,
            KbqToolTipModule,
            ...imports,
            component
        ],
        providers: [
            { provide: ComponentFixtureAutoDetect, useValue: true },
            ...providers
        ]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [disabled]="disabled" [(ngModel)]="value" />
            <kbq-password-toggle
                [kbqTooltipNotHidden]="'Скрыть пароль'"
                [kbqTooltipDisabled]="disabled"
                [kbqTooltipHidden]="'Показать пароль'"
            />

            <kbq-password-hint [rule]="passwordRules.Length" [min]="8" [max]="64">
                От 8 до 64 символов
            </kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.UpperLatin">Заглавная латинская буква</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.LowerLatin">Строчная латинская буква</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.Digit">Цифра</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.LatinAndSpecialSymbols">
                Только латинские буквы, цифры, пробелы и спецсимволы
            </kbq-password-hint>
        </kbq-form-field>
    `
})
class PasswordInputDefault {
    disabled = false;
    passwordRules = PasswordRules;

    value: any = '1';
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [(ngModel)]="value" />
            <kbq-password-toggle [kbqTooltipNotHidden]="'Скрыть пароль'" [kbqTooltipHidden]="'Показать пароль'" />

            <kbq-password-hint [rule]="passwordRules.Custom" [regex]="regex" [checkRule]="checkFunc">
                Не менее 5 букв
            </kbq-password-hint>
        </kbq-form-field>
    `
})
class PasswordInputCustomPasswordRulesUndefined {
    value = '1';
    passwordRules = PasswordRules;
    regex;
    checkFunc;
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [disabled]="disabled" [(ngModel)]="value" />
            <kbq-password-toggle [kbqTooltipNotHidden]="'Скрыть пароль'" [kbqTooltipHidden]="'Показать пароль'" />

            <kbq-password-hint [rule]="passwordRules.Custom" [regex]="regex" [checkRule]="checkFunc">
                Не менее 5 букв
            </kbq-password-hint>
        </kbq-form-field>
    `
})
class PasswordInputCustomPasswordRule {
    readonly passwordHint = viewChild.required(KbqPasswordHint);

    disabled = false;

    passwordRules = PasswordRules;

    value: any = '1';

    regex;

    checkFunc = (value: string): boolean => {
        const found = value.match(/[A-Z]/g);

        return !!found && found!.length >= 5;
    };
}

@Component({
    imports: [
        ReactiveFormsModule,
        KbqInputModule
    ],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <input kbqInputPassword [formControl]="form.controls.control" />
            </kbq-form-field>
        </form>
    `
})
class PasswordInputWithReactiveControl {
    form = new FormGroup({
        control: new FormControl('', [Validators.required, Validators.maxLength(5)])
    });
}

@Component({
    imports: [KbqInputModule, FormsModule],
    template: `
        <kbq-form-field>
            <input kbqInputPassword [(ngModel)]="value" />
            @if (showToggle) {
                <kbq-password-toggle />
            }
        </kbq-form-field>
    `
})
class PasswordInputWithDynamicToggle {
    value = 'password';
    showToggle = false;
}

@Component({
    imports: [
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Password</kbq-label>

            <input kbqInputPassword [formControl]="control" />
            <kbq-password-toggle />

            <kbq-password-hint [rule]="passwordRules.Length" [min]="8" [max]="64">
                От 8 до 64 символов
            </kbq-password-hint>

            <kbq-error>Required</kbq-error>
        </kbq-form-field>
    `
})
class PasswordInputWithLabel {
    readonly control = new FormControl('', Validators.required);
    passwordRules = PasswordRules;
}

describe('KbqPasswordInput', () => {
    it('should handle Alt+F8 only when KbqPasswordToggle is present', () => {
        const fixture = createComponent(PasswordInputWithDynamicToggle);
        const input = fixture.debugElement.query(By.directive(KbqInputPassword)).nativeElement as HTMLInputElement;
        const togglePassword = () =>
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'F8', keyCode: F8, altKey: true, bubbles: true }));

        fixture.detectChanges();
        togglePassword();
        expect(input.type).toBe('password');

        fixture.componentInstance.showToggle = true;
        fixture.detectChanges();
        togglePassword();
        expect(input.type).toBe('text');
    });

    it('should have toggle', fakeAsync(() => {
        const fixture = createComponent(PasswordInputDefault);

        fixture.detectChanges();

        const kbqPasswordToggle = fixture.debugElement.query(By.css('.kbq-password-toggle'));

        expect(kbqPasswordToggle).not.toBeNull();
        flush();
    }));

    it('should change visibility of toggle if form field disabled and empty', fakeAsync(() => {
        const fixture = createComponent(PasswordInputDefault);
        const kbqPasswordToggle = fixture.debugElement.query(By.css('.kbq-password-toggle'));

        fixture.componentInstance.disabled = true;
        fixture.componentInstance.value = '';
        fixture.detectChanges();
        tick(1000);

        expect(kbqPasswordToggle.styles.visibility).toEqual('hidden');

        fixture.componentInstance.disabled = false;
        fixture.componentInstance.value = '123';
        fixture.detectChanges();
        tick(1000);

        expect(kbqPasswordToggle.styles.visibility).toEqual('visible');

        flush();
    }));

    it('toggle should change input type', () => {
        const fixture = createComponent(PasswordInputDefault);

        fixture.detectChanges();

        const passwordToggle = fixture.debugElement.query(By.directive(KbqPasswordToggle)).nativeElement;
        const passwordInput = fixture.debugElement.query(By.directive(KbqInputPassword)).nativeElement;

        expect(passwordInput.getAttribute('type')).toBe('password');

        dispatchFakeEvent(passwordToggle, 'click');
        fixture.detectChanges();

        expect(passwordInput.getAttribute('type')).toBe('text');

        dispatchFakeEvent(passwordToggle, 'click');
        fixture.detectChanges();

        expect(passwordInput.getAttribute('type')).toBe('password');
    });

    it('should have password hints', () => {
        const fixture = createComponent(PasswordInputDefault);

        fixture.detectChanges();

        const kbqPasswordHints = fixture.debugElement.queryAll(By.css('.kbq-password-hint'));

        expect(kbqPasswordHints.length).toBe(5);
    });

    it('should throw Error if custom password rule selected and verification method not provided', () => {
        // Same Angular-20 pattern as input-number's stepper test: turn off
        // ComponentFixtureAutoDetect so the lifecycle throw originates from our
        // explicit detectChanges() call inside the expect-to-throw wrapper.
        jest.spyOn(console, 'error').mockImplementation(() => {});

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                KbqFormFieldModule,
                KbqInputModule,
                KbqToolTipModule,
                PasswordInputCustomPasswordRulesUndefined
            ],
            providers: [{ provide: ComponentFixtureAutoDetect, useValue: false }]
        }).compileComponents();

        const fixture = TestBed.createComponent(PasswordInputCustomPasswordRulesUndefined);

        expect(() => fixture.detectChanges()).toThrow('You should set [regex] or [checkRule] for PasswordRules.Custom');
    });

    it('should provide custom password rule via callback', fakeAsync(() => {
        const fixture = createComponent(PasswordInputCustomPasswordRule);

        fixture.detectChanges();
        flush();

        const input = fixture.debugElement.query(By.directive(KbqInputPassword)).nativeElement;
        const hint = () => fixture.componentInstance.passwordHint();
        const type = (value: string) => {
            input.value = value;
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();
        };

        expect(hint().customCheckRule()).toBeTruthy();

        // The rule asks for at least five uppercase letters.
        type('TestValue');
        expect(hint().hasError).toBe(true);

        type('TESTValue');
        expect(hint().hasError).toBe(false);
    }));

    it('should apply validation rules on blur', fakeAsync(() => {
        const fixture = createComponent(PasswordInputWithReactiveControl);
        const { componentInstance } = fixture;

        fixture.detectChanges();
        flush();

        const passwordInput: HTMLInputElement = fixture.debugElement.query(
            By.directive(KbqInputPassword)
        ).nativeElement;

        dispatchFakeEvent(passwordInput, 'focus');
        passwordInput.value = '123456';
        dispatchFakeEvent(passwordInput, 'input');
        dispatchFakeEvent(passwordInput, 'blur');

        fixture.detectChanges();

        expect(componentInstance.form.controls.control.hasError('maxlength')).toBeTruthy();
    }));

    describe('accessibility', () => {
        it('should mint its id in its own namespace', fakeAsync(() => {
            const fixture = createComponent(PasswordInputDefault);

            fixture.detectChanges();
            flush();

            const passwordInput: HTMLInputElement = fixture.debugElement.query(
                By.directive(KbqInputPassword)
            ).nativeElement;

            expect(passwordInput.id).toMatch(/^kbq-input-password-\w+$/);
        }));

        it('should flip aria-invalid with the error state', fakeAsync(() => {
            const fixture = createComponent(PasswordInputWithReactiveControl);

            fixture.detectChanges();
            flush();

            const passwordInput: HTMLInputElement = fixture.debugElement.query(
                By.directive(KbqInputPassword)
            ).nativeElement;

            expect(passwordInput.getAttribute('aria-invalid')).toBe('false');

            dispatchFakeEvent(passwordInput, 'focus');
            passwordInput.value = '123456';
            dispatchFakeEvent(passwordInput, 'input');
            dispatchFakeEvent(passwordInput, 'blur');
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(passwordInput.getAttribute('aria-invalid')).toBe('true');
        }));

        it('should link every password hint through aria-describedby', fakeAsync(() => {
            const fixture = createComponent(PasswordInputDefault);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const passwordInput: HTMLInputElement = fixture.debugElement.query(
                By.directive(KbqInputPassword)
            ).nativeElement;
            const describedByIds = passwordInput.getAttribute('aria-describedby')!.split(' ');

            expect(describedByIds).toHaveLength(fixture.debugElement.queryAll(By.css('kbq-password-hint')).length);
            expect(describedByIds.every((id) => !!document.getElementById(id))).toBe(true);
        }));

        it('should have no AXE violations for a label + control + hint + error template', async () => {
            const fixture = createComponent(PasswordInputWithLabel);

            fixture.componentInstance.control.markAsTouched();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });
});

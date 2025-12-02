import { Component, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqFormFieldModule, KbqPasswordHint, KbqPasswordToggle, PasswordRules } from '@koobiq/components/form-field';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
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
        KbqFormFieldModule,
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
class KbqPasswordInputDefault {
    disabled = false;
    passwordRules = PasswordRules;

    value: any = '1';
}

@Component({
    imports: [
        KbqFormFieldModule,
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
class KbqPasswordInputCustomPasswordRulesUndefined {
    value = '1';
    passwordRules = PasswordRules;
    regex;
    checkFunc;
}

@Component({
    imports: [
        KbqFormFieldModule,
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
class KbqPasswordInputCustomPasswordRule {
    @ViewChild(KbqPasswordHint) passwordHint: KbqPasswordHint;

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
        KbqInputModule,
        KbqFormFieldModule
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

describe('KbqPasswordInput', () => {
    it('should have toggle', fakeAsync(() => {
        const fixture = createComponent(KbqPasswordInputDefault);

        fixture.detectChanges();

        const kbqPasswordToggle = fixture.debugElement.query(By.css('.kbq-password-toggle'));

        expect(kbqPasswordToggle).not.toBeNull();
        flush();
    }));

    it('should change visibility of toggle if form field disabled and empty', fakeAsync(() => {
        const fixture = createComponent(KbqPasswordInputDefault);
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
        const fixture = createComponent(KbqPasswordInputDefault);

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
        const fixture = createComponent(KbqPasswordInputDefault);

        fixture.detectChanges();

        const kbqPasswordHints = fixture.debugElement.queryAll(By.css('.kbq-password-hint'));

        expect(kbqPasswordHints.length).toBe(5);
    });

    it('should throw Error if custom password rule selected and verification method not provided', fakeAsync(() => {
        const fixture = createComponent(KbqPasswordInputCustomPasswordRulesUndefined);

        expect(() => {
            try {
                fixture.detectChanges();
                flush();
            } catch {
                flush();
            }
        }).toThrowError('You should set [regex] or [checkRule] for PasswordRules.Custom');
    }));

    it('should provide custom password rule via callback', fakeAsync(() => {
        const valueToTest = 'TestValue';
        const fixture = createComponent(KbqPasswordInputCustomPasswordRule);

        fixture.detectChanges();
        flush();
        const passwordInput: any = fixture.debugElement.query(By.directive(KbqInputPassword));
        const input = passwordInput.nativeElement;

        fixture.componentInstance.value = valueToTest;
        dispatchFakeEvent(input, 'input');

        expect(fixture.componentInstance.passwordHint.customCheckRule).toBeTruthy();
        expect(fixture.componentInstance.passwordHint.hasError).toEqual(
            fixture.componentInstance.passwordHint.customCheckRule(valueToTest)
        );
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
});

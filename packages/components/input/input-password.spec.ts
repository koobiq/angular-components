/* tslint:disable */
import { Component, Provider, Type, ViewChild } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    ComponentFixtureAutoDetect,
    flush,
    tick
} from '@angular/core/testing';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqFormFieldModule, PasswordRules, KbqPasswordToggle, KbqPasswordHint } from '@koobiq/components/form-field';
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
            ...imports
        ],
        declarations: [component],
        providers: [
            { provide: ComponentFixtureAutoDetect, useValue: true },
            ...providers
        ]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}


@Component({
    template: `
        <kbq-form-field>
            <input kbqInputPassword [(ngModel)]="value" [disabled]="disabled">
            <kbq-password-toggle [kbqTooltipNotHidden]="'Скрыть пароль'" [kbqTooltipDisabled]="disabled"
                                [kbqTooltipHidden]="'Показать пароль'"></kbq-password-toggle>

            <kbq-password-hint [rule]="passwordRules.Length" [min]="8" [max]="64">От 8 до 64 символов</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.UpperLatin">Заглавная латинская буква</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.LowerLatin">Строчная латинская буква</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.Digit">Цифра</kbq-password-hint>

            <kbq-password-hint [rule]="passwordRules.LatinAndSpecialSymbols">Только латинские буквы, цифры, пробелы и
                спецсимволы
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
    template: `
        <kbq-form-field>
            <input kbqInputPassword [(ngModel)]="value">
            <kbq-password-toggle [kbqTooltipNotHidden]="'Скрыть пароль'"
                                [kbqTooltipHidden]="'Показать пароль'"></kbq-password-toggle>

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
    template: `
        <kbq-form-field>
            <input kbqInputPassword [(ngModel)]="value" [disabled]="disabled">
            <kbq-password-toggle [kbqTooltipNotHidden]="'Скрыть пароль'"
                                [kbqTooltipHidden]="'Показать пароль'"></kbq-password-toggle>

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
    template: `
        <kbq-form-field>
            <input kbqInputPassword [formControl]="formControl">
        </kbq-form-field>
    `
})
class KbqPasswordInputWithFormControl {
    formControl = new UntypedFormControl('');
}

@Component({
    template: `
        <form [formGroup]="reactiveForm" novalidate>
            <kbq-form-field>
                <input kbqInputPassword formControlName="reactiveInputValue">
            </kbq-form-field>
        </form>
    `
})
class KbqPasswordInputWithFormControlName {
    reactiveForm: UntypedFormGroup;

    constructor(private formBuilder: UntypedFormBuilder) {
        this.reactiveForm = this.formBuilder.group({
            reactiveInputValue: new UntypedFormControl('')
        });
    }
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
        const initialVisibility = kbqPasswordToggle.styles.visibility;

        fixture.componentInstance.disabled = true;
        fixture.componentInstance.value = '';
        fixture.detectChanges();
        tick(1000);

        expect(kbqPasswordToggle.styles.visibility).toEqual('hidden');
        expect(initialVisibility).not.toEqual(kbqPasswordToggle.styles.visibility);

        fixture.componentInstance.disabled = false;
        fixture.componentInstance.value = '123';
        fixture.detectChanges();
        tick(1000);

        expect(kbqPasswordToggle.styles.visibility).toEqual('visible');

        flush();
    }));

    it('toggle should change input type', fakeAsync(() => {
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
    }));

    it('should have password hints', fakeAsync(() => {
        const fixture = createComponent(KbqPasswordInputDefault);
        fixture.detectChanges();

        const kbqPasswordHints = fixture.debugElement.queryAll(By.css('.kbq-password-hint'));

        expect(kbqPasswordHints.length).toBe(5);
    }));

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
        expect(fixture.componentInstance.passwordHint.hasError)
            .toEqual(fixture.componentInstance.passwordHint.customCheckRule(valueToTest));
    }));

    it('password length rule', fakeAsync(() => {
        const fixture = createComponent(KbqPasswordInputDefault);
        fixture.detectChanges();
        flush();
        //
        // const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
        // const passwordLengthHint: DebugElement = fixture.debugElement.queryAll(By.directive(KbqPasswordHint))[0];
        // const passwordInput: any = fixture.debugElement.query(By.directive(KbqInputPassword));
        // const input = passwordInput.nativeElement;
        // const passwordToggle = fixture.debugElement.query(By.directive(KbqPasswordToggle)).nativeElement;
        // console.log('mcPasswordInput: ', passwordInput);
        //
        // expect(formFieldElement.classList.contains('ng-valid')).toBe(true);
        //
        // expect(passwordLengthHint.nativeElement.classList.contains('kbq-password-hint__icon_error')).toBe(false);
        //
        // console.log('input.value: ', input.value);
        // console.log('passwordInput.value: ', passwordInput.value);
        // passwordInput.value = '5';
        // dispatchFakeEvent(input, 'input');
        // dispatchFakeEvent(input, 'focus');
        // dispatchFakeEvent(passwordToggle, 'click');
        // fixture.detectChanges();
        //
        // flush();
        // fixture.detectChanges();
        //
        // console.log('formFieldElement.classList', formFieldElement.classList);
        // console.log('mcPasswordInput.classList: ', input.classList);
        // console.log('mcPasswordLengthHint.classList: ', passwordLengthHint.nativeElement.classList);
        //
        // expect(passwordLengthHint.nativeElement.classList.contains('kbq-password-hint__icon_error')).toBe(true);
    }));

    describe('formControl', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(KbqPasswordInputWithFormControl);
            fixture.detectChanges();
        }));
    });

    describe('formControlName', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(KbqPasswordInputWithFormControlName);
            fixture.detectChanges();
        }));
    });
});

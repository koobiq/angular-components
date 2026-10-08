import { F8 } from '@angular/cdk/keycodes';
import { Component, Provider, Type } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent, PasswordValidators } from '@koobiq/components/core';
import { KbqFormFieldModule, KbqPasswordToggle, KbqReactivePasswordHint } from '@koobiq/components/form-field';
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

    const fixture = TestBed.createComponent<T>(component);

    // Without zone.js, auto-detection renders on the next scheduled tick rather than inside `createComponent`.

    fixture.detectChanges();

    return fixture;
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

            <kbq-reactive-password-hint>От 8 до 64 символов</kbq-reactive-password-hint>

            <kbq-reactive-password-hint>Заглавная латинская буква</kbq-reactive-password-hint>

            <kbq-reactive-password-hint>Строчная латинская буква</kbq-reactive-password-hint>

            <kbq-reactive-password-hint>Цифра</kbq-reactive-password-hint>

            <kbq-reactive-password-hint>
                Только латинские буквы, цифры, пробелы и спецсимволы
            </kbq-reactive-password-hint>
        </kbq-form-field>
    `
})
class PasswordInputDefault {
    disabled = false;

    value: any = '1';
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

            <kbq-reactive-password-hint [hasError]="control.hasError('minLength')">
                От 8 до 64 символов
            </kbq-reactive-password-hint>

            <kbq-error>Required</kbq-error>
        </kbq-form-field>
    `
})
class PasswordInputWithLabel {
    readonly control = new FormControl('', [Validators.required, PasswordValidators.minLength(8)]);
}

describe('KbqPasswordInput', () => {
    afterEach(() => vi.useRealTimers());

    it('should handle Alt+F8 only when KbqPasswordToggle is present', async () => {
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

        await fixture.whenStable();

        expect(input.type).toBe('text');
    });

    it('should have toggle', () => {
        const fixture = createComponent(PasswordInputDefault);

        fixture.detectChanges();

        const kbqPasswordToggle = fixture.debugElement.query(By.css('.kbq-password-toggle'));

        expect(kbqPasswordToggle).not.toBeNull();
    });

    it('should change visibility of toggle if form field disabled and empty', async () => {
        vi.useFakeTimers();

        const fixture = createComponent(PasswordInputDefault);
        const kbqPasswordToggle = fixture.debugElement.query(By.css('.kbq-password-toggle'));

        fixture.componentInstance.disabled = true;
        fixture.componentInstance.value = '';
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1000);

        expect(kbqPasswordToggle.styles.visibility).toEqual('hidden');

        fixture.componentInstance.disabled = false;
        fixture.componentInstance.value = '123';
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1000);

        expect(kbqPasswordToggle.styles.visibility).toEqual('visible');
    });

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

        const kbqPasswordHints = fixture.debugElement.queryAll(By.directive(KbqReactivePasswordHint));

        expect(kbqPasswordHints.length).toBe(5);
    });

    it('should apply validation rules on blur', async () => {
        const fixture = createComponent(PasswordInputWithReactiveControl);
        const { componentInstance } = fixture;

        fixture.detectChanges();
        await fixture.whenStable();

        const passwordInput: HTMLInputElement = fixture.debugElement.query(
            By.directive(KbqInputPassword)
        ).nativeElement;

        dispatchFakeEvent(passwordInput, 'focus');
        passwordInput.value = '123456';
        dispatchFakeEvent(passwordInput, 'input');
        dispatchFakeEvent(passwordInput, 'blur');

        fixture.detectChanges();

        expect(componentInstance.form.controls.control.hasError('maxlength')).toBeTruthy();
    });

    describe('accessibility', () => {
        it('should mint its id in its own namespace', async () => {
            const fixture = createComponent(PasswordInputDefault);

            fixture.detectChanges();
            await fixture.whenStable();

            const passwordInput: HTMLInputElement = fixture.debugElement.query(
                By.directive(KbqInputPassword)
            ).nativeElement;

            expect(passwordInput.id).toMatch(/^kbq-input-password-\w+$/);
        });

        it('should flip aria-invalid with the error state', async () => {
            const fixture = createComponent(PasswordInputWithReactiveControl);

            fixture.detectChanges();
            await fixture.whenStable();

            const passwordInput: HTMLInputElement = fixture.debugElement.query(
                By.directive(KbqInputPassword)
            ).nativeElement;

            expect(passwordInput.getAttribute('aria-invalid')).toBe('false');

            dispatchFakeEvent(passwordInput, 'focus');
            passwordInput.value = '123456';
            dispatchFakeEvent(passwordInput, 'input');
            dispatchFakeEvent(passwordInput, 'blur');
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(passwordInput.getAttribute('aria-invalid')).toBe('true');
        });

        it('should link every password hint through aria-describedby', async () => {
            const fixture = createComponent(PasswordInputDefault);

            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const passwordInput: HTMLInputElement = fixture.debugElement.query(
                By.directive(KbqInputPassword)
            ).nativeElement;
            const describedByIds = passwordInput.getAttribute('aria-describedby')!.split(' ');

            expect(describedByIds).toHaveLength(
                fixture.debugElement.queryAll(By.directive(KbqReactivePasswordHint)).length
            );
            expect(describedByIds.every((id) => !!document.getElementById(id))).toBe(true);
        });

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

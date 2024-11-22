import { Component, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { createMouseEvent, dispatchEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { ThemePalette } from '../core';
import { KbqInput, KbqInputModule } from './index';

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            KbqInputModule,
            KbqFormFieldModule,
            ...imports
        ],
        declarations: [component],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }, ...providers]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}

@Component({
    template: `
        <kbq-form-field>
            <input [(ngModel)]="value" [required]="true" kbqInput minlength="4" />
        </kbq-form-field>
    `
})
class KbqInputInvalid {
    value: string = '';
}

@Component({
    template: `
        <kbq-form-field>
            <input [(ngModel)]="value" kbqInput kbqInputMonospace />
        </kbq-form-field>
    `
})
class KbqInputWithKbqInputMonospace {
    value: string = 'test';
}

@Component({
    template: `
        <kbq-form-field>
            <input [(ngModel)]="value" [placeholder]="placeholder" [disabled]="disabled" kbqInput />
        </kbq-form-field>
    `
})
class KbqInputForBehaviors {
    value: string = 'test';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput />
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>
    `
})
class KbqFormFieldWithHint {}

@Component({
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
            <input kbqInput />
        </kbq-form-field>
    `
})
class KbqFormFieldWithPrefix {}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput />
            <i kbqSuffix kbq-icon="kbq-magnifying-glass_16"></i>
        </kbq-form-field>
    `
})
class KbqFormFieldWithSuffix {}

@Component({
    template: `
        <kbq-form-field kbqFormFieldWithoutBorders>
            <input kbqInput />
        </kbq-form-field>
    `
})
class KbqFormFieldWithoutBorders {}

@Component({
    template: `
        <kbq-form-field>
            <input [(ngModel)]="value" kbqInput required />
        </kbq-form-field>
    `
})
class KbqFormFieldWithStandaloneNgModel {
    value: string = '';
}

@Component({
    template: `
        <form #form="ngForm">
            <kbq-form-field>
                <input [(ngModel)]="value" kbqInput name="control" required />
            </kbq-form-field>

            <button type="submit"></button>
        </form>
    `
})
class KbqFormFieldWithNgModelInForm {
    @ViewChild('form', { static: false }) form: NgForm;

    value: string = '';
}

@Component({
    template: `
        <form [formGroup]="reactiveForm" (ngSubmit)="submitReactive()">
            <kbq-form-field class="kbq-form__control">
                <input kbqInput formControlName="firstName" />
            </kbq-form-field>
            <kbq-form-field class="kbq-form__control">
                <input kbqInput formControlName="lastName" />
            </kbq-form-field>
            <button [color]="ThemePalette.Primary" [disabled]="reactiveForm.invalid" kbq-button type="submit">
                Отправить
            </button>
        </form>
    `
})
class KbqFormWithRequiredValidation {
    reactiveForm = new FormGroup({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required])
    });

    ThemePalette = ThemePalette;
    submitResult: string;

    submitReactive = jest.fn().mockImplementation(() => {
        this.submitResult = this.reactiveForm.invalid ? 'invalid' : 'valid';
    });
}

describe('KbqInput', () => {
    describe('basic behaviors', () => {
        it('should change state "disable"', fakeAsync(() => {
            const fixture = createComponent(KbqInputForBehaviors);
            fixture.detectChanges();

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            expect(formFieldElement.classList.contains('kbq-disabled')).toBe(false);
            expect(inputElement.disabled).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('kbq-disabled')).toBe(true);
                expect(inputElement.disabled).toBe(true);
            });
        }));

        it('should has placeholder', fakeAsync(() => {
            const fixture = createComponent(KbqInputForBehaviors);
            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            const inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            expect(inputElement.getAttribute('placeholder')).toBe(null);

            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(inputElement.getAttribute('placeholder')).toBe('placeholder');

            testComponent.placeholder = '';
            fixture.detectChanges();

            expect(inputElement.getAttribute('placeholder')).toBe('');
        }));
    });

    describe('validation', () => {
        describe('ngModel', () => {
            describe('standalone', () => {
                it('should run validation (required)', fakeAsync(() => {
                    const fixture = createComponent(KbqFormFieldWithStandaloneNgModel);
                    fixture.detectChanges();

                    const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
                    expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
                }));
            });

            describe('in form', () => {
                it('should not run validation (required)', fakeAsync(() => {
                    const fixture = createComponent(KbqFormFieldWithNgModelInForm);
                    fixture.detectChanges();

                    const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
                    expect(formFieldElement.classList.contains('ng-valid')).toBe(true);
                }));

                it('should run validation after submit (required)', fakeAsync(() => {
                    const fixture = createComponent(KbqFormFieldWithNgModelInForm);
                    fixture.detectChanges();

                    const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
                    const submitButton = fixture.debugElement.query(By.css('button')).nativeElement;

                    expect(formFieldElement.classList.contains('ng-valid')).toBe(true);

                    const event = createMouseEvent('click');
                    dispatchEvent(submitButton, event);
                    flush();
                    expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
                }));
            });
        });

        it('should has placeholder', fakeAsync(() => {
            const fixture = createComponent(KbqInputForBehaviors);
            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            const inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            expect(inputElement.getAttribute('placeholder')).toBe(null);

            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(inputElement.getAttribute('placeholder')).toBe('placeholder');

            testComponent.placeholder = '';
            fixture.detectChanges();

            expect(inputElement.getAttribute('placeholder')).toBe('');
        }));

        it('should set proper form group validation state on ngSubmit handler, without setTimeout', fakeAsync(() => {
            const fixture = createComponent(KbqFormWithRequiredValidation, [ReactiveFormsModule, KbqButtonModule]);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.reactiveForm.valid).toBeTruthy();

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');

            expect(fixture.componentInstance.submitReactive).toHaveBeenCalled();
            expect(fixture.componentInstance.submitResult).toEqual('invalid');
        }));
    });

    describe('appearance', () => {
        it('should change font to monospace', () => {
            const fixture = createComponent(KbqInputWithKbqInputMonospace);
            fixture.detectChanges();

            const kbqInputDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = kbqInputDebug.nativeElement;

            expect(inputElement.classList).toContain('kbq-input_monospace');
        });

        it('should has invalid state', fakeAsync(() => {
            const fixture = createComponent(KbqInputInvalid);
            fixture.detectChanges();

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);

            inputElement.value = 'four';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(false);

            inputElement.value = '';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
        }));

        it('should has hint', fakeAsync(() => {
            const fixture = createComponent(KbqFormFieldWithHint);
            fixture.detectChanges();

            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__hint').length).toBe(1);
            expect(formFieldElement.querySelectorAll('.kbq-form-field__hint')[0].textContent).toBe('Hint');
        }));

        it('should has prefix', () => {
            const fixture = createComponent(KbqFormFieldWithPrefix, [KbqIconModule]);
            fixture.detectChanges();

            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__prefix').length).toBe(1);
            expect(formFieldElement.querySelectorAll('[kbq-icon]').length).toBe(1);
        });

        it('should has suffix', () => {
            const fixture = createComponent(KbqFormFieldWithSuffix, [KbqIconModule]);
            fixture.detectChanges();

            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__suffix').length).toBe(1);
            expect(formFieldElement.querySelectorAll('[kbq-icon]').length).toBe(1);
        });

        it('should be without borders', () => {
            const fixture = createComponent(KbqFormFieldWithoutBorders, [KbqIconModule]);
            fixture.detectChanges();

            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;

            expect(formFieldElement.classList.contains('kbq-form-field_without-borders')).toBe(true);
        });
    });
});

import { Component, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ESCAPE } from '@koobiq/cdk/keycodes';
import { createMouseEvent, dispatchEvent, dispatchFakeEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { ThemePalette } from '../core';
import { KbqInput, KbqInputModule } from './index';

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [FormsModule, KbqInputModule, KbqFormFieldModule, ...imports],
        declarations: [component],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }, ...providers],
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}

// tslint:disable no-unnecessary-class
@Component({
    template: `
        <kbq-form-field>
            <input kbqInput [(ngModel)]="value" [required]="true" minlength="4" />
        </kbq-form-field>
    `,
})
class KbqInputInvalid {
    value: string = '';
}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput kbqInputMonospace [(ngModel)]="value" />
        </kbq-form-field>
    `,
})
class KbqInputWithKbqInputMonospace {
    value: string = 'test';
}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput [(ngModel)]="value" [placeholder]="placeholder" [disabled]="disabled" />
        </kbq-form-field>
    `,
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
    `,
})
class KbqFormFieldWithHint {}

@Component({
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="mc-search_16"></i>
            <input kbqInput />
        </kbq-form-field>
    `,
})
class KbqFormFieldWithPrefix {}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput />
            <i kbqSuffix kbq-icon="mc-search_16"></i>
        </kbq-form-field>
    `,
})
class KbqFormFieldWithSuffix {}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput [(ngModel)]="value" />
            <kbq-cleaner></kbq-cleaner>
        </kbq-form-field>
    `,
})
class KbqFormFieldWithCleaner {
    value: string;
}

@Component({
    template: `
        <kbq-form-field kbqFormFieldWithoutBorders>
            <input kbqInput />
        </kbq-form-field>
    `,
})
class KbqFormFieldWithoutBorders {}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput [(ngModel)]="value" required />
        </kbq-form-field>
    `,
})
class KbqFormFieldWithStandaloneNgModel {
    value: string = '';
}

@Component({
    template: `
        <form #form="ngForm">
            <kbq-form-field>
                <input kbqInput [(ngModel)]="value" name="control" required />
            </kbq-form-field>

            <button type="submit"></button>
        </form>
    `,
})
class KbqFormFieldWithNgModelInForm {
    @ViewChild('form', { static: false }) form: NgForm;

    value: string = '';
}

@Component({
    template: `
        <form [formGroup]="reactiveForm" (ngSubmit)="submitReactive()">
            <kbq-form-field class="kbq-form__control"><input kbqInput formControlName="firstName" /></kbq-form-field>
            <kbq-form-field class="kbq-form__control"><input kbqInput formControlName="lastName" /></kbq-form-field>
            <button kbq-button type="submit" [color]="ThemePalette.Primary" [disabled]="reactiveForm.invalid">
                Отправить
            </button>
        </form>
    `,
})
class KbqFormWithRequiredValidation {
    reactiveForm = new FormGroup({
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
    });

    ThemePalette = ThemePalette;
    submitResult: string;

    // tslint:disable-next-line:no-empty
    submitReactive() {
        this.submitResult = this.reactiveForm.invalid ? 'invalid' : 'valid';
    }
}
// tslint:enable no-unnecessary-class

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

        it('should has cleaner', () => {
            const fixture = createComponent(KbqFormFieldWithCleaner, [KbqIconModule]);
            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

            const kbqCleaner = fixture.debugElement.query(By.css('.kbq-form-field__cleaner'));
            const kbqCleanerElement = kbqCleaner.nativeElement;
            kbqCleanerElement.click();

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
            expect(testComponent.value).toBe(null);
        });

        it('with cleaner on keydown "ESC" should clear field', () => {
            const fixture = createComponent(KbqFormFieldWithCleaner, [KbqIconModule]);
            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

            dispatchKeyboardEvent(kbqFormFieldDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
            expect(testComponent.value).toBe(null);
        });
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

        it('should has cleaner', () => {
            const fixture = createComponent(KbqFormFieldWithCleaner, [KbqIconModule]);
            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

            const kbqCleaner = fixture.debugElement.query(By.css('.kbq-form-field__cleaner'));
            const kbqCleanerElement = kbqCleaner.nativeElement;
            kbqCleanerElement.click();

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
            expect(testComponent.value).toBe(null);
        });

        it('with cleaner on keydown "ESC" should clear field', () => {
            const fixture = createComponent(KbqFormFieldWithCleaner, [KbqIconModule]);
            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

            dispatchKeyboardEvent(kbqFormFieldDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
            expect(testComponent.value).toBe(null);
        });

        it('should set proper form group validation state on ngSubmit handler, without setTimeout', fakeAsync(() => {
            const fixture = createComponent(KbqFormWithRequiredValidation, [ReactiveFormsModule, KbqButtonModule]);
            fixture.detectChanges();
            flush();
            spyOn(fixture.componentInstance, 'submitReactive').and.callThrough();
            expect(fixture.componentInstance.reactiveForm.valid).toBeTrue();

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

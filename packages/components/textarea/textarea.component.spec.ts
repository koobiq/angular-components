import { Component, Provider, Type, ViewChild, viewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import {
    AsyncValidatorFn,
    FormControl,
    FormControlStatus,
    FormGroup,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { createMouseEvent, dispatchEvent } from '@koobiq/cdk/testing';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { Observable, map, timer } from 'rxjs';
import {
    ErrorStateMatcher,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher,
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider
} from '../core';
import { KbqTextarea, KbqTextareaModule } from './index';

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            KbqTextareaModule,
            KbqFormFieldModule,
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

const getSubmitButton = (fixture: ComponentFixture<unknown>): HTMLButtonElement =>
    fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;

const getTextareaElement = (fixture: ComponentFixture<unknown>): HTMLTextAreaElement =>
    fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

const customErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control?.untouched
};

const ASYNC_VALIDATOR_TIMER_DUE = 1000;

const getAsyncValidator =
    (valid: boolean = true): AsyncValidatorFn =>
    (): Observable<ValidationErrors | null> =>
        timer(ASYNC_VALIDATOR_TIMER_DUE).pipe(map(() => (!valid ? { test: { actual: valid } } : null)));

@Component({
    imports: [
        KbqFormFieldModule,
        KbqTextareaModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <textarea kbqTextarea required [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaInvalid {
    value: string = '';
}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqTextareaModule,
        FormsModule
    ],
    template: `
        <form #form="ngForm">
            <kbq-form-field>
                <textarea kbqTextarea name="control" required [(ngModel)]="value"></textarea>
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
    imports: [
        KbqFormFieldModule,
        KbqTextareaModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <textarea class="kbq-textarea_monospace" kbqTextarea [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaWithMonospace {
    value: string = 'test';
}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqTextareaModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <textarea kbqTextarea [placeholder]="placeholder" [disabled]="disabled" [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaForBehaviors {
    value: string = 'test\ntest\ntest';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqTextareaModule
    ],
    template: `
        <kbq-form-field kbqFormFieldWithoutBorders>
            <textarea kbqTextarea></textarea>
        </kbq-form-field>
    `
})
class KbqFormFieldWithoutBorders {}

@Component({
    imports: [KbqFormFieldModule, KbqTextareaModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <textarea kbqTextarea [formControl]="control"></textarea>
        </kbq-form-field>
    `
})
class LegacyTextareaControlWithAsyncValidators {
    readonly textarea = viewChild.required(KbqTextarea);
    readonly control = new FormControl<string>('', {
        nonNullable: true,
        asyncValidators: [getAsyncValidator()]
    });
}

@Component({
    imports: [KbqFormFieldModule, KbqTextareaModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <textarea kbqTextarea [formControl]="control"></textarea>
        </kbq-form-field>
    `
})
class TextareaControlWithAsyncValidators {
    readonly textarea = viewChild.required(KbqTextarea);
    readonly control = new FormControl<string>('', {
        nonNullable: true,
        asyncValidators: [getAsyncValidator()]
    });
}

@Component({
    imports: [KbqFormFieldModule, KbqTextareaModule, ReactiveFormsModule],
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(customErrorStateMatcher)
    ],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <textarea kbqTextarea formControlName="textarea"></textarea>
            </kbq-form-field>
        </form>
    `
})
class TextareaWithDIErrorStateMatcher {
    readonly textarea = viewChild.required(KbqTextarea);
    readonly form = new FormGroup({ textarea: new FormControl('', Validators.required) });
}

@Component({
    imports: [KbqFormFieldModule, KbqTextareaModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <textarea kbqTextarea formControlName="textarea" [errorStateMatcher]="errorStateMatcher"></textarea>
            </kbq-form-field>
            <button type="submit">Submit</button>
        </form>
    `
})
class TextareaWithErrorStateMatcher {
    readonly textarea = viewChild.required(KbqTextarea);
    readonly form = new FormGroup({ textarea: new FormControl('', Validators.required) });
    errorStateMatcher: ErrorStateMatcher = new ErrorStateMatcher();
}

describe('KbqTextarea', () => {
    describe('basic behaviors', () => {
        it('should change state "disable"', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);

            fixture.detectChanges();

            tick();

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(formFieldElement.classList.contains('kbq-disabled')).toBe(false);
            expect(textareaElement.disabled).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('kbq-disabled')).toBe(true);
                expect(textareaElement.disabled).toBe(true);
            });
        }));

        it('should has placeholder', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);

            fixture.detectChanges();

            tick();

            const testComponent = fixture.debugElement.componentInstance;

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(textareaElement.getAttribute('placeholder')).toBe(null);

            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(textareaElement.getAttribute('placeholder')).toBe('placeholder');

            testComponent.placeholder = '';
            fixture.detectChanges();

            expect(textareaElement.getAttribute('placeholder')).toBe('');
        }));
    });

    describe('appearance', () => {
        it('should change font to monospace', () => {
            const fixture = createComponent(KbqTextareaWithMonospace);

            fixture.detectChanges();

            const kbqTextareaDebug = fixture.debugElement.query(By.directive(KbqTextarea));
            const textareaElement = kbqTextareaDebug.nativeElement;

            expect(textareaElement.classList).toContain('kbq-textarea_monospace');
        });

        it('should run validation (required)', () => {
            const fixture = createComponent(KbqTextareaInvalid);

            fixture.detectChanges();

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
        });

        describe('in form', () => {
            it('should not run validation (required)', () => {
                const fixture = createComponent(KbqFormFieldWithNgModelInForm);

                fixture.detectChanges();

                const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;

                expect(formFieldElement.classList.contains('ng-valid')).toBe(true);
            });

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

        it('should be without borders', () => {
            const fixture = createComponent(KbqFormFieldWithoutBorders, [
                KbqIconModule
            ]);

            fixture.detectChanges();

            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;

            expect(formFieldElement.classList.contains('kbq-form-field_without-borders')).toBe(true);
        });
    });

    describe('ErrorStateMatcher', () => {
        describe(ErrorStateMatcher.name, () => {
            it('should not be in error state initially when invalid but untouched', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                expect(fixture.componentInstance.textarea().errorState).toBe(false);
            });

            it('should be in error state when invalid and touched', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                fixture.componentInstance.form.controls.textarea.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(true);
            });

            it('should be in error state when form is submitted and control is invalid', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                getSubmitButton(fixture).click();
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(true);
            });

            it('should call errorStateMatcher and update errorState on blur', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);
                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.textarea().errorState).toBe(false);

                getTextareaElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.textarea().errorState).toBe(true);
            });
        });

        describe(ShowOnFormSubmitErrorStateMatcher.name, () => {
            it('should not be in error state when invalid and touched but form not submitted', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.componentInstance.form.controls.textarea.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(false);
            });

            it('should be in error state after form is submitted when invalid', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.detectChanges();

                getSubmitButton(fixture).click();
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(true);
            });

            it('should call errorStateMatcher and NOT update errorState on blur', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.detectChanges();

                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.textarea().errorState).toBe(false);

                getTextareaElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.textarea().errorState).toBe(false);
            });
        });

        describe(ShowOnControlDirtyErrorStateMatcher.name, () => {
            it('should not be in error state when invalid but pristine', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(false);
            });

            it('should be in error state when invalid and dirty', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.componentInstance.form.controls.textarea.markAsDirty();
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(true);
            });

            it('should call errorStateMatcher and NOT update errorState on blur', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.detectChanges();

                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.textarea().errorState).toBe(false);

                getTextareaElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.textarea().errorState).toBe(false);
            });
        });

        describe('custom ErrorStateMatcher', () => {
            it('should override errorStateMatcher by kbqErrorStateMatcherProvider', () => {
                const fixture = createComponent(TextareaWithDIErrorStateMatcher);

                expect(fixture.componentInstance.textarea().errorState).toBe(true);

                fixture.componentInstance.form.controls.textarea.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(false);
            });

            it('should use custom errorStateMatcher logic', () => {
                const fixture = createComponent(TextareaWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = customErrorStateMatcher;
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(true);

                fixture.componentInstance.form.controls.textarea.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.textarea().errorState).toBe(false);
            });
        });
    });

    describe('async validation', () => {
        it('should emit PENDING via statusChanges on blur (KbqValidateDirective)', fakeAsync(() => {
            const fixture = createComponent(LegacyTextareaControlWithAsyncValidators);
            const { control, textarea } = fixture.componentInstance;
            const statuses: FormControlStatus[] = [];

            const subscription = control.statusChanges.subscribe((status) => statuses.push(status));

            control.setValue('ab');

            expect(control.status).toBe('PENDING');
            expect(statuses).toEqual(['PENDING']);

            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            textarea().onBlur();
            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID', 'PENDING']);

            subscription.unsubscribe();
        }));

        it('should emit VALID via statusChanges on blur', fakeAsync(() => {
            const fixture = createComponent(TextareaControlWithAsyncValidators);
            const { control, textarea } = fixture.componentInstance;
            const statuses: FormControlStatus[] = [];

            const subscription = control.statusChanges.subscribe((status) => statuses.push(status));

            control.setValue('ab');

            expect(control.status).toBe('PENDING');
            expect(statuses).toEqual(['PENDING']);

            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            textarea().onBlur();
            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            subscription.unsubscribe();
        }));
    });
});

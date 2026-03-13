import { Component, ElementRef, Provider, Signal, Type, viewChild, ViewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import {
    AbstractControl,
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
import { createMouseEvent, dispatchEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    ErrorStateMatcher,
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher,
    ThemePalette
} from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { iif, map, Observable, of, timer } from 'rxjs';

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            ...imports,
            component
        ],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }, ...providers]
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
            <input kbqInput minlength="4" [required]="true" [(ngModel)]="value" />
        </kbq-form-field>
    `
})
class KbqInputInvalid {
    value: string = '';
}

@Component({
    imports: [
        KbqFormFieldModule,
        FormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput kbqInputMonospace [(ngModel)]="value" />
        </kbq-form-field>
    `
})
class KbqInputWithKbqInputMonospace {
    value: string = 'test';
}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput [placeholder]="placeholder" [disabled]="disabled" [(ngModel)]="value" />
        </kbq-form-field>
    `
})
class KbqInputForBehaviors {
    value: string = 'test';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput />
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>
    `
})
class KbqFormFieldWithHint {}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule
    ],
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
            <input kbqInput />
        </kbq-form-field>
    `
})
class KbqFormFieldWithPrefix {}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput />
            <i kbqSuffix kbq-icon="kbq-magnifying-glass_16"></i>
        </kbq-form-field>
    `
})
class KbqFormFieldWithSuffix {}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field kbqFormFieldWithoutBorders>
            <input kbqInput />
        </kbq-form-field>
    `
})
class KbqFormFieldWithoutBorders {}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput required [(ngModel)]="value" />
        </kbq-form-field>
    `
})
class KbqFormFieldWithStandaloneNgModel {
    value: string = '';
}

@Component({
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <form #form="ngForm">
            <kbq-form-field>
                <input kbqInput name="control" required [(ngModel)]="value" />
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
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule
    ],
    template: `
        <form [formGroup]="reactiveForm" (ngSubmit)="submitReactive()">
            <kbq-form-field class="kbq-form__control">
                <input kbqInput formControlName="firstName" />
            </kbq-form-field>
            <kbq-form-field class="kbq-form__control">
                <input kbqInput formControlName="lastName" />
            </kbq-form-field>
            <button kbq-button type="submit" [color]="ThemePalette.Primary" [disabled]="reactiveForm.invalid">
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

const getInputElement = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
    fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

const customErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control?.untouched
};

const getAsyncMaxLengthValidator = (maxLength: number): AsyncValidatorFn => {
    return (control: AbstractControl): Observable<ValidationErrors | null> =>
        iif(
            () => control.value,
            timer(1000).pipe(
                map(() => {
                    const actualLength = control.value.length;

                    return actualLength > maxLength ? { maxLength: { actual: actualLength, max: maxLength } } : null;
                })
            ),
            of(null)
        );
};

@Component({
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" />
        </kbq-form-field>
    `
})
class LegacyInputControlWithAsyncValidators {
    readonly input = viewChild.required(KbqInput);
    readonly control = new FormControl<string>('', {
        nonNullable: true,
        asyncValidators: [getAsyncMaxLengthValidator(3)]
    });
}

@Component({
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" />
        </kbq-form-field>
    `
})
class InputControlWithAsyncValidators {
    readonly input = viewChild.required(KbqInput);
    readonly control = new FormControl<string>('', {
        nonNullable: true,
        asyncValidators: [getAsyncMaxLengthValidator(3)]
    });
}

@Component({
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(customErrorStateMatcher)
    ],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <input kbqInput formControlName="input" />
            </kbq-form-field>
        </form>
    `
})
class InputWithDIErrorStateMatcher {
    readonly input = viewChild.required(KbqInput);
    readonly form = new FormGroup({ input: new FormControl('', Validators.required) });
}

@Component({
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <input kbqInput formControlName="input" [errorStateMatcher]="errorStateMatcher" />
            </kbq-form-field>
            <button #submitButton type="submit">Submit</button>
        </form>
    `
})
class InputWithErrorStateMatcher {
    readonly input = viewChild.required(KbqInput);
    readonly submitButton: Signal<ElementRef<HTMLButtonElement>> = viewChild.required('submitButton', {
        read: ElementRef
    });
    readonly form = new FormGroup({ input: new FormControl('', Validators.required) });
    errorStateMatcher: ErrorStateMatcher = new ErrorStateMatcher();
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

    describe('ErrorStateMatcher', () => {
        describe(ErrorStateMatcher.name, () => {
            it('should not be in error state initially when invalid but untouched', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                expect(fixture.componentInstance.input().errorState).toBe(false);
            });

            it('should be in error state when invalid and touched', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.form.controls.input.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(true);
            });

            it('should be in error state when form is submitted and control is invalid', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.submitButton().nativeElement.click();
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(true);
            });

            it('should call errorStateMatcher and update errorState on blur', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);
                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);

                getInputElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(true);
            });
        });

        describe(ShowOnFormSubmitErrorStateMatcher.name, () => {
            it('should not be in error state when invalid and touched but form not submitted', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.componentInstance.form.controls.input.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(false);
            });

            it('should be in error state after form is submitted when invalid', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.detectChanges();

                fixture.componentInstance.submitButton().nativeElement.click();
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(true);
            });

            it('should call errorStateMatcher and NOT update errorState on blur', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.detectChanges();

                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);

                getInputElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);
            });
        });

        describe(ShowOnControlDirtyErrorStateMatcher.name, () => {
            it('should not be in error state when invalid but pristine', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(false);
            });

            it('should be in error state when invalid and dirty', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.componentInstance.form.controls.input.markAsDirty();
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(true);
            });

            it('should call errorStateMatcher and NOT update errorState on blur', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                fixture.detectChanges();

                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);

                getInputElement(fixture).dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);
            });
        });

        describe('custom ErrorStateMatcher', () => {
            it('should override errorStateMatcher by kbqErrorStateMatcherProvider', () => {
                const fixture = createComponent(InputWithDIErrorStateMatcher);

                expect(fixture.componentInstance.input().errorState).toBe(true);

                fixture.componentInstance.form.controls.input.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(false);
            });

            it('should use custom errorStateMatcher logic', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = customErrorStateMatcher;
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(true);

                fixture.componentInstance.form.controls.input.markAsTouched();
                fixture.detectChanges();

                expect(fixture.componentInstance.input().errorState).toBe(false);
            });
        });
    });

    describe('async validation', () => {
        it('should emit PENDING via statusChanges on blur', fakeAsync(() => {
            const fixture = createComponent(LegacyInputControlWithAsyncValidators);
            const { control, input } = fixture.componentInstance;
            const statuses: FormControlStatus[] = [];

            const subscription = control.statusChanges.subscribe((status) => statuses.push(status));

            control.setValue('ab');

            expect(control.status).toBe('PENDING');
            expect(statuses).toEqual(['PENDING']);

            tick(1001);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            input().onBlur();
            tick(1001);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID', 'PENDING']);

            subscription.unsubscribe();
        }));

        it('should emit VALID via statusChanges on blur', fakeAsync(() => {
            const fixture = createComponent(InputControlWithAsyncValidators);
            const { control, input } = fixture.componentInstance;
            const statuses: FormControlStatus[] = [];

            const subscription = control.statusChanges.subscribe((status) => statuses.push(status));

            control.setValue('ab');

            expect(control.status).toBe('PENDING');
            expect(statuses).toEqual(['PENDING']);

            tick(1001);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            input().onBlur();
            tick(1001);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            subscription.unsubscribe();
        }));
    });
});

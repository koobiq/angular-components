import { Component, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import {
    AsyncValidatorFn,
    FormControl,
    FormControlStatus,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    ErrorStateMatcher,
    ESCAPE,
    kbqErrorStateMatcherProvider,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';
import { axe } from 'jest-axe';
import { map, Observable, timer } from 'rxjs';

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

const getSubmitButton = (fixture: ComponentFixture<unknown>): HTMLButtonElement =>
    fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput minlength="4" [required]="true" [(ngModel)]="value" />
        </kbq-form-field>
    `
})
class InputInvalid {
    value: string = '';
}

@Component({
    imports: [
        FormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput kbqInputMonospace [(ngModel)]="value" />
        </kbq-form-field>
    `
})
class InputWithMonospace {
    value: string = 'test';
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput [placeholder]="placeholder" [disabled]="disabled" [(ngModel)]="value" />
        </kbq-form-field>
    `
})
class InputForBehaviors {
    value: string = 'test';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    imports: [
        KbqInputModule,
        KbqIconModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput [(ngModel)]="value" />
            <kbq-cleaner />
        </kbq-form-field>
    `
})
class FormFieldWithCleaner {
    value: string;
}

@Component({
    imports: [
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput />
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>
    `
})
class FormFieldWithHint {}

@Component({
    imports: [
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
class FormFieldWithPrefix {}

@Component({
    imports: [
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
class FormFieldWithSuffix {}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput required [(ngModel)]="value" />
        </kbq-form-field>
    `
})
class FormFieldWithStandaloneNgModel {
    value: string = '';
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <form>
            <kbq-form-field>
                <input kbqInput name="control" required [(ngModel)]="value" />
            </kbq-form-field>

            <button type="submit"></button>
        </form>
    `
})
class FormFieldWithNgModelInForm {
    value: string = '';
}

const getInputElement = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
    fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

const customErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control?.untouched
};

const ASYNC_VALIDATOR_TIMER_DUE = 1000;

const getAsyncValidator =
    (valid: boolean = true): AsyncValidatorFn =>
    (): Observable<ValidationErrors | null> =>
        timer(ASYNC_VALIDATOR_TIMER_DUE).pipe(map(() => (!valid ? { test: { actual: valid } } : null)));

@Component({
    imports: [KbqInputModule, ReactiveFormsModule],
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
        asyncValidators: [getAsyncValidator()]
    });
}

@Component({
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <input kbqInput formControlName="input" />
            </kbq-form-field>
        </form>
    `,
    providers: [
        kbqErrorStateMatcherProvider(customErrorStateMatcher)
    ]
})
class InputWithDIErrorStateMatcher {
    readonly input = viewChild.required(KbqInput);
    readonly form = new FormGroup({ input: new FormControl('', Validators.required) });
}

@Component({
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <input kbqInput formControlName="input" [errorStateMatcher]="errorStateMatcher" />
            </kbq-form-field>
            <button type="submit">Submit</button>
        </form>
    `
})
class InputWithErrorStateMatcher {
    readonly input = viewChild.required(KbqInput);
    readonly form = new FormGroup({ input: new FormControl('', Validators.required) });
    errorStateMatcher: ErrorStateMatcher = new ErrorStateMatcher();
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Login</kbq-label>
            <input kbqInput [(ngModel)]="login" />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Password</kbq-label>
            <input kbqInputPassword [(ngModel)]="password" />
            <kbq-password-toggle />
        </kbq-form-field>
    `
})
class LoginForm {
    login = '';
    password = '';
}

@Component({
    imports: [KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqInput [disabled]="disabled" />
        </kbq-form-field>
    `
})
class InputWithoutForm {
    disabled = false;
}

@Component({
    imports: [
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Login</kbq-label>
            <input kbqInput [formControl]="control" [errorStateMatcher]="errorStateMatcher" />
            <kbq-hint>Hint one</kbq-hint>
            <kbq-hint>Hint two</kbq-hint>
            <kbq-error>Required</kbq-error>
        </kbq-form-field>
    `
})
class InputWithHintsAndError {
    readonly input = viewChild.required(KbqInput);
    readonly control = new FormControl('', Validators.required);
    errorStateMatcher: ErrorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
}

describe('KbqInput', () => {
    describe('basic behaviors', () => {
        it('should reflect disabled state on form-field and native input', fakeAsync(() => {
            const fixture = createComponent(InputForBehaviors);

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            expect(formFieldElement.classList.contains('kbq-disabled')).toBe(false);
            expect(inputElement.disabled).toBe(false);
            expect(inputElement.getAttribute('disabled')).toBeNull();

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(formFieldElement.classList.contains('kbq-disabled')).toBe(true);
            expect(inputElement.disabled).toBe(true);
            expect(inputElement.getAttribute('disabled')).not.toBeNull();
        }));

        // The case above goes through `DefaultValueAccessor`, which writes the native `disabled` property
        // itself, so it never reaches `KbqInput`'s own host binding. This one has no form control at all.
        it('should reflect disabled state without a form control', fakeAsync(() => {
            const fixture = createComponent(InputWithoutForm);
            const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            fixture.detectChanges();

            expect(inputElement.getAttribute('disabled')).toBeNull();

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(inputElement.getAttribute('disabled')).not.toBeNull();
        }));

        it('should reflect placeholder input on native element', fakeAsync(() => {
            const fixture = createComponent(InputForBehaviors);
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

        describe('cleaner', () => {
            it('should show cleaner when value is set and clear value on cleaner click', fakeAsync(() => {
                const fixture = createComponent(FormFieldWithCleaner);
                const testComponent = fixture.debugElement.componentInstance;
                const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
                const inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

                expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);

                inputElement.value = 'test';
                dispatchFakeEvent(inputElement, 'input');
                fixture.detectChanges();

                expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

                const cleanerElement = fixture.debugElement.query(By.css('.kbq-cleaner')).nativeElement;

                cleanerElement.click();
                fixture.detectChanges();

                expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
                expect(testComponent.value).toBe(null);
            }));

            it('should clear value on ESC keydown', fakeAsync(() => {
                const fixture = createComponent(FormFieldWithCleaner);
                const formFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
                const formFieldElement = formFieldDebug.nativeElement;
                const inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;
                const testComponent = fixture.debugElement.componentInstance;

                inputElement.value = 'test';
                dispatchFakeEvent(inputElement, 'input');
                dispatchFakeEvent(inputElement, 'focus');
                fixture.detectChanges();

                expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

                dispatchKeyboardEvent(formFieldDebug.nativeElement, 'keydown', ESCAPE, undefined, 'Escape');
                fixture.detectChanges();

                expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
                expect(testComponent.value).toBe(null);
            }));
        });
    });

    describe('validation', () => {
        describe('ngModel', () => {
            describe('standalone', () => {
                it('should run validation (required)', fakeAsync(() => {
                    const fixture = createComponent(FormFieldWithStandaloneNgModel);
                    const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;

                    expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
                }));
            });

            describe('in form', () => {
                it('should not run validation (required)', fakeAsync(() => {
                    const fixture = createComponent(FormFieldWithNgModelInForm);
                    const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;

                    expect(formFieldElement.classList.contains('ng-valid')).toBe(true);
                }));

                it('should run validation after submit (required)', fakeAsync(() => {
                    const fixture = createComponent(FormFieldWithNgModelInForm);
                    const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
                    const submitButton = fixture.debugElement.query(By.css('button')).nativeElement;

                    expect(formFieldElement.classList.contains('ng-valid')).toBe(true);

                    submitButton.click();
                    flush();
                    expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
                }));
            });
        });
    });

    describe('appearance', () => {
        it('should change font to monospace', () => {
            const fixture = createComponent(InputWithMonospace);
            const inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            expect(inputElement.classList).toContain('kbq-input_monospace');
        });

        it('should toggle invalid state when value violates minlength', fakeAsync(() => {
            const fixture = createComponent(InputInvalid);
            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

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

        it('should render kbq-hint with provided text', fakeAsync(() => {
            const fixture = createComponent(FormFieldWithHint);
            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__hint').length).toBe(1);
            expect(formFieldElement.querySelectorAll('.kbq-form-field__hint')[0].textContent).toBe('Hint');
        }));

        it('should render kbqPrefix icon', () => {
            const fixture = createComponent(FormFieldWithPrefix, [KbqIconModule]);
            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__prefix').length).toBe(1);
            expect(formFieldElement.querySelectorAll('[kbq-icon]').length).toBe(1);
        });

        it('should render kbqSuffix icon', () => {
            const fixture = createComponent(FormFieldWithSuffix, [KbqIconModule]);
            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__suffix').length).toBe(1);
            expect(formFieldElement.querySelectorAll('[kbq-icon]').length).toBe(1);
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

                getSubmitButton(fixture).click();

                expect(fixture.componentInstance.input().errorState).toBe(true);
            });

            it('should call errorStateMatcher and update errorState on blur', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);
                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);

                dispatchFakeEvent(getInputElement(fixture), 'blur');

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(true);
            });
        });

        describe(ShowOnFormSubmitErrorStateMatcher.name, () => {
            it('should not be in error state when invalid and touched but form not submitted', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                fixture.componentInstance.form.controls.input.markAsTouched();

                expect(fixture.componentInstance.input().errorState).toBe(false);
            });

            it('should be in error state after form is submitted when invalid', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();

                getSubmitButton(fixture).click();

                expect(fixture.componentInstance.input().errorState).toBe(true);
            });

            it('should call errorStateMatcher and NOT update errorState on blur', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();

                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);

                dispatchFakeEvent(getInputElement(fixture), 'blur');

                expect(spy).toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);
            });
        });

        describe(ShowOnControlDirtyErrorStateMatcher.name, () => {
            it('should not be in error state when invalid but pristine', () => {
                const fixture = createComponent(InputWithErrorStateMatcher);

                fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();

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

                const spy = jest.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                expect(spy).not.toHaveBeenCalled();
                expect(fixture.componentInstance.input().errorState).toBe(false);

                dispatchFakeEvent(getInputElement(fixture), 'blur');

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
        it('should emit VALID via statusChanges on blur', fakeAsync(() => {
            const fixture = createComponent(InputControlWithAsyncValidators);
            const { control, input } = fixture.componentInstance;
            const statuses: FormControlStatus[] = [];

            const subscription = control.statusChanges.subscribe((status) => statuses.push(status));

            control.setValue('ab');

            expect(control.status).toBe('PENDING');
            expect(statuses).toEqual(['PENDING']);

            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            input().onBlur();
            tick(ASYNC_VALIDATOR_TIMER_DUE);

            expect(control.status).toBe('VALID');
            expect(statuses).toEqual(['PENDING', 'VALID']);

            subscription.unsubscribe();
        }));
    });

    describe('accessibility', () => {
        it('should give the text and the password control distinct ids', fakeAsync(() => {
            const fixture = createComponent(LoginForm);

            fixture.detectChanges();

            const ids = fixture.debugElement
                .queryAll(By.css('input'))
                .map(({ nativeElement }) => nativeElement.id as string);

            expect(ids).toHaveLength(2);
            expect(new Set(ids).size).toBe(2);
            // Distinct namespaces, not just distinct counters: two module-scoped counters over one prefix
            // produced byte-identical ids whenever the two controls were created in the same order.
            expect(ids[0]).toMatch(/^kbq-input-\w+$/);
            expect(ids[1]).toMatch(/^kbq-input-password-\w+$/);
        }));

        it('should resolve every label `for` to its own control', fakeAsync(() => {
            const fixture = createComponent(LoginForm);

            fixture.detectChanges();

            const formFields = fixture.debugElement.queryAll(By.directive(KbqFormField));

            expect(formFields).toHaveLength(2);

            formFields.forEach((formField) => {
                const label: HTMLLabelElement = formField.nativeElement.querySelector('label');
                const input: HTMLInputElement = formField.nativeElement.querySelector('input');

                expect(document.getElementById(label.htmlFor)).toBe(input);
            });
        }));

        it('should flip aria-invalid with the error state', fakeAsync(() => {
            const fixture = createComponent(InputWithHintsAndError);
            const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            fixture.detectChanges();

            expect(inputElement.getAttribute('aria-invalid')).toBe('false');

            fixture.componentInstance.control.markAsDirty();
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(inputElement.getAttribute('aria-invalid')).toBe('true');
        }));

        it('should list every hint and the error in aria-describedby', fakeAsync(() => {
            const fixture = createComponent(InputWithHintsAndError);
            const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            fixture.componentInstance.control.markAsDirty();
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const describedByIds = inputElement.getAttribute('aria-describedby')!.split(' ');
            const describedElements = describedByIds.map((id) => document.getElementById(id));

            expect(describedElements.some((element) => element?.tagName.toLowerCase() === 'kbq-error')).toBe(true);
            expect(describedElements.filter((element) => element?.tagName.toLowerCase() === 'kbq-hint')).toHaveLength(
                2
            );
            expect(describedElements.every(Boolean)).toBe(true);
        }));

        it('should have no AXE violations for a label + control + hint + error template', async () => {
            const fixture = createComponent(InputWithHintsAndError);

            fixture.componentInstance.control.markAsDirty();
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });
});

import { Component, DebugElement, Provider, Type, inject, viewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import {
    AbstractControl,
    FormGroupDirective,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    COMMA,
    DASH,
    DOWN_ARROW,
    ErrorStateMatcher,
    FF_MINUS,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqLocaleServiceModule,
    NUMPAD_MINUS,
    UP_ARROW,
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    ruRUFormattersData
} from '@koobiq/components/core';
import {
    KBQ_STEPPER_INITIAL_TIMEOUT,
    KBQ_STEPPER_INTERVAL_DELAY,
    KbqFormField,
    KbqFormFieldModule,
    getKbqFormFieldYouCanNotUseCleanerInNumberInputError
} from '@koobiq/components/form-field';
import { axe } from 'jest-axe';
import { KbqInput, KbqInputModule, KbqNumberInput, add, getPrecision } from './index';

const defaultLocaleGroupSep = ruRUFormattersData.input.number.viewGroupSeparator;

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            ReactiveFormsModule,
            FormsModule,
            KbqInputModule,
            KbqLocaleServiceModule,
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

@Component({
    imports: [
        FormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [disabled]="disabled" [(ngModel)]="value" />
            <kbq-stepper (stepUp)="stepUp()" (stepDown)="stepDown()" />
        </kbq-form-field>
    `
})
class NumberInputTestComponent {
    value: number | null = null;
    disabled = false;

    stepUp = jest.fn().mockImplementation(() => true);
    stepDown = jest.fn().mockImplementation(() => false);
}

@Component({
    imports: [
        FormsModule,
        KbqInputModule
    ],
    template: `
        @if (isVisible) {
            <kbq-form-field>
                <input kbqNumberInput [(ngModel)]="value" />
                <kbq-stepper (stepUp)="stepUp()" (stepDown)="stepDown()" />
            </kbq-form-field>
        }
    `
})
class TestNumberInputConditional {
    isVisible = true;
    value: number | null = null;

    stepUp = jest.fn().mockImplementation(() => true);
    stepDown = jest.fn().mockImplementation(() => false);
}

@Component({
    imports: [FormsModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [(ngModel)]="value" />
            @if (showStepper) {
                <kbq-stepper />
            }
        </kbq-form-field>
    `
})
class NumberInputWithDynamicStepper {
    value: number | null = 10;
    showStepper = false;
}

@Component({
    imports: [
        ReactiveFormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [formControl]="formControl" />
            <kbq-stepper />
        </kbq-form-field>
    `
})
class NumberInputWithFormControl {
    formControl = new UntypedFormControl(10);
}

@Component({
    imports: [
        ReactiveFormsModule,
        KbqInputModule
    ],
    template: `
        <form novalidate [formGroup]="reactiveForm">
            <kbq-form-field>
                <input kbqNumberInput formControlName="reactiveInputValue" />
                <kbq-stepper />
            </kbq-form-field>
        </form>
    `
})
class NumberInputWithFormControlName {
    private formBuilder = inject(UntypedFormBuilder);

    reactiveForm: UntypedFormGroup;

    constructor() {
        this.reactiveForm = this.formBuilder.group({
            reactiveInputValue: new UntypedFormControl(10)
        });
    }
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput max="10" min="3" step="0.5" big-step="2" [(ngModel)]="value" />
            <kbq-stepper />
        </kbq-form-field>
    `
})
class NumberInputMaxMinStep {
    value: number | null = null;
}

class NumberInputCustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, _form: FormGroupDirective | NgForm | null): boolean {
        return !!control?.invalid;
    }
}

@Component({
    imports: [
        ReactiveFormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [formControl]="formControl" [errorStateMatcher]="errorStateMatcher" />
            <kbq-stepper />
        </kbq-form-field>
    `
})
class NumberInputWithErrorState {
    formControl = new UntypedFormControl(100, [Validators.max(10)]);
    errorStateMatcher = new NumberInputCustomErrorStateMatcher();
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [max]="max" [min]="min" [step]="step" [bigStep]="bigStep" [(ngModel)]="value" />
            <kbq-stepper />
        </kbq-form-field>
    `
})
class NumberInputMaxMinStepInput {
    value: number | null = null;
    max: number = 10;
    min: number = 3;
    step: number = 0.5;
    bigStep: number = 2;
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [(ngModel)]="value" />
            <kbq-cleaner />
        </kbq-form-field>
    `
})
class NumberInputWithCleaner {
    value: number = 0;
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input
                kbqNumberInput
                [max]="max"
                [min]="min"
                [step]="step"
                [bigStep]="bigStep"
                [withThousandSeparator]="withMask"
                [(ngModel)]="value"
            />
            <kbq-stepper />
        </kbq-form-field>
    `
})
class NumberInputWithMask {
    localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true })!;

    value: number | null = null;
    max: number = 10;
    min: number = 3;
    step: number = 1;
    bigStep: number = 5;
    withMask = true;

    readonly inputNumberDirective = viewChild.required(KbqNumberInput);
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [step]="step" [bigStep]="bigStep" [integer]="true" [(ngModel)]="value" />
            <kbq-stepper />
        </kbq-form-field>
    `
})
class NumberInputWithInteger {
    localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true })!;

    value: number | null = null;
    step: number = 1;
    bigStep: number = 5;

    readonly inputNumberDirective = viewChild.required(KbqNumberInput);
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [(ngModel)]="value" />
        </kbq-form-field>

        <input data-testid="plain" value="12,5" />
    `
})
class NumberInputNextToPlainInput {
    value: number | null = 1;
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput type="number" [step]="0.5" [(ngModel)]="value" />
            <kbq-stepper />
        </kbq-form-field>
    `
})
class NumberInputWithNativeNumberType {
    value: number | null = null;
}

@Component({
    imports: [
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Amount</kbq-label>

            <input
                kbqNumberInput
                [max]="max"
                [min]="min"
                [step]="step"
                [integer]="integer"
                [startFormattingFrom]="startFormattingFrom"
                [(ngModel)]="value"
            />
            <kbq-stepper />
        </kbq-form-field>
    `
})
class NumberInputConfigurable {
    localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true })!;

    value: number | null = null;
    min: number | undefined = undefined;
    max: number | undefined = undefined;
    step: number = 1;
    integer = false;
    startFormattingFrom: number | undefined = undefined;

    readonly inputNumberDirective = viewChild.required(KbqNumberInput);
}

@Component({
    imports: [
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        @if (visible) {
            <kbq-form-field>
                <input kbqNumberInput [formControl]="formControl" />
            </kbq-form-field>
        }
    `
})
class NumberInputDestroyedWhileTyping {
    visible = true;
    formControl = new UntypedFormControl(null);
}

describe('KbqNumberInput', () => {
    it('should use input-number control type', fakeAsync(() => {
        const fixture = createComponent(NumberInputTestComponent);

        fixture.detectChanges();
        flush();

        const inputElement = fixture.debugElement.query(By.directive(KbqInput));
        const input = inputElement.injector.get(KbqInput);
        const numberInput = inputElement.injector.get(KbqNumberInput);
        const formField = fixture.debugElement.query(By.css('kbq-form-field')).nativeElement;

        expect(input.controlType).toBe('input-number');
        expect(numberInput.controlType).toBe('input-number');
        expect(formField.classList).toContain('kbq-form-field-type-input-number');
    }));

    it('should have stepper on focus', fakeAsync(() => {
        const fixture = createComponent(NumberInputTestComponent);

        fixture.detectChanges();
        flush();

        const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
        const inputElement = inputElementDebug.nativeElement;

        dispatchFakeEvent(inputElement, 'focus');
        fixture.detectChanges();

        const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const icons = stepper.queryAll(By.css('.kbq-icon'));

        expect(stepper).not.toBeNull();
        expect(icons.length).toBe(2);
    }));

    it('should apply kbq-error class to stepper icons when control is invalid', fakeAsync(() => {
        const fixture = createComponent(NumberInputWithErrorState);

        fixture.detectChanges();
        flush();

        const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const icons = stepper.queryAll(By.css('.kbq-icon'));

        expect(icons.length).toBe(2);
        expect(icons.every((icon) => icon.nativeElement.classList.contains('kbq-error'))).toBe(true);
    }));

    it('should throw error with cleaner', () => {
        // KbqCleaner.ngAfterContentInit() throws when it detects a number input.
        // Override ComponentFixtureAutoDetect so CD doesn't run inside
        // TestBed.createComponent — that way the throw originates from our explicit
        // fixture.detectChanges() call, where expect-to-throw can capture it.
        jest.spyOn(console, 'error').mockImplementation(() => {});

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                FormsModule,
                KbqInputModule,
                KbqLocaleServiceModule,
                KbqFormFieldModule,
                NumberInputWithCleaner
            ],
            providers: [{ provide: ComponentFixtureAutoDetect, useValue: false }]
        }).compileComponents();

        const fixture = TestBed.createComponent(NumberInputWithCleaner);

        expect(() => fixture.detectChanges()).toThrow(getKbqFormFieldYouCanNotUseCleanerInNumberInputError());
    });

    it('should throw an exception with kbq-cleaner', fakeAsync(() => {
        const fixture = createComponent(NumberInputTestComponent);

        fixture.detectChanges();
        flush();

        const stepper = fixture.debugElement.query(By.css('kbq-cleaner'));

        expect(stepper).toBeNull();
    }));

    it('should block steps when disabled', fakeAsync(() => {
        const fixture = createComponent(NumberInputTestComponent);

        fixture.componentInstance.disabled = true;

        fixture.detectChanges();
        flush();

        const initialValue = fixture.componentInstance.value;

        const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

        dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
        fixture.detectChanges();

        expect(fixture.componentInstance.value).toEqual(initialValue);

        dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
        fixture.detectChanges();

        expect(fixture.componentInstance.value).toEqual(initialValue);
    }));

    it('should connect a stepper added after form-field initialization', fakeAsync(() => {
        const fixture = createComponent(NumberInputWithDynamicStepper);

        fixture.detectChanges();
        flush();
        fixture.componentInstance.showStepper = true;
        fixture.detectChanges();

        const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const iconUp = stepper.queryAll(By.css('.kbq-icon'))[0];

        dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
        fixture.detectChanges();
        flush();

        expect(fixture.componentInstance.value).toBe(11);
    }));

    describe('with long press on stepper', () => {
        const initialValue = 0;

        it('should not have timers assigned on init', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            jest.spyOn(global, 'setTimeout');

            fixture.detectChanges();

            expect(global.setTimeout).not.toHaveBeenCalled();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp] = stepper.queryAll(By.css('.kbq-icon'));

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(global.setTimeout).toHaveBeenCalledTimes(1);
        }));

        it('should emit once before initial delay', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.componentInstance.value = initialValue;
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            const testLongPressFor = (icon, emitter) => {
                dispatchFakeEvent(icon.nativeElement, 'mousedown');

                fixture.detectChanges();
                tick(KBQ_STEPPER_INITIAL_TIMEOUT - 1);

                expect(emitter).toHaveBeenCalledTimes(1);

                dispatchFakeEvent(document, 'mouseup');
            };

            testLongPressFor(iconUp, fixture.componentInstance.stepUp);
            testLongPressFor(iconDown, fixture.componentInstance.stepDown);
        }));

        it('should emit after initial delay + interval', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.componentInstance.value = initialValue;
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            const testLongPressFor = (icon, emitter) => {
                dispatchFakeEvent(icon.nativeElement, 'mousedown');
                fixture.detectChanges();
                tick(KBQ_STEPPER_INITIAL_TIMEOUT);

                tick(KBQ_STEPPER_INTERVAL_DELAY);
                expect(emitter).toHaveBeenCalledTimes(2);

                tick(KBQ_STEPPER_INTERVAL_DELAY);
                expect(emitter).toHaveBeenCalledTimes(3);

                dispatchFakeEvent(document, 'mouseup');
            };

            testLongPressFor(iconUp, fixture.componentInstance.stepUp);
            testLongPressFor(iconDown, fixture.componentInstance.stepDown);
        }));

        it('should stop emitting on mouseUp', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.componentInstance.value = initialValue;
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            const testLongPressFor = (icon, emitter) => {
                dispatchFakeEvent(icon.nativeElement, 'mousedown');
                fixture.detectChanges();
                tick(KBQ_STEPPER_INITIAL_TIMEOUT);

                dispatchFakeEvent(document, 'mouseup');
                fixture.detectChanges();
                tick(KBQ_STEPPER_INTERVAL_DELAY);

                expect(emitter).toHaveBeenCalledTimes(1);
            };

            testLongPressFor(iconUp, fixture.componentInstance.stepUp);
            testLongPressFor(iconDown, fixture.componentInstance.stepDown);
        }));

        it('should stop emitting on component destroy', fakeAsync(() => {
            const fixture = createComponent(TestNumberInputConditional);
            const { debugElement } = fixture;

            fixture.detectChanges();

            expect(debugElement.query(By.directive(KbqFormField)).nativeElement).toBeTruthy();

            const testLongPressFor = (queryIconFn, emitter: jest.Mock<any, any, any>) => {
                const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
                const icon = queryIconFn(stepper.queryAll(By.css('.kbq-icon')));

                dispatchFakeEvent(icon.nativeElement, 'mousedown');
                fixture.detectChanges();
                tick(KBQ_STEPPER_INITIAL_TIMEOUT);

                fixture.componentInstance.isVisible = false;
                fixture.detectChanges();
                // this call is skipped
                tick(KBQ_STEPPER_INTERVAL_DELAY);

                expect(debugElement.query(By.directive(KbqFormField))).toBeFalsy();
                // only immediate call counts
                expect(emitter).toHaveBeenCalledTimes(1);
            };

            testLongPressFor((icons) => icons[0], fixture.componentInstance.stepUp);
            // return back visible state
            fixture.componentInstance.isVisible = true;
            fixture.detectChanges();

            testLongPressFor((icons) => icons[1], fixture.componentInstance.stepDown);
        }));
    });

    describe('formControl', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithFormControl);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.formControl.value).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();
            flush();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.formControl.value).toBe(11);
        }));

        it('should step down', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithFormControl);

            fixture.detectChanges();

            expect(fixture.componentInstance.formControl.value).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.formControl.value).toBe(9);
        }));

        it('should mark as touched on blur', () => {
            const fixture = createComponent(NumberInputWithFormControl);

            fixture.detectChanges();

            const inputElementDebugElement = fixture.debugElement.query(By.directive(KbqNumberInput));
            const formFieldDebugElement = fixture.debugElement.query(By.directive(KbqFormField));

            expect(formFieldDebugElement.classes['ng-touched']).toBeFalsy();

            dispatchFakeEvent(inputElementDebugElement.nativeElement, 'focus');
            dispatchFakeEvent(inputElementDebugElement.nativeElement, 'blur');
            fixture.detectChanges();

            expect(formFieldDebugElement.classes['ng-touched']).toBeTruthy();
        });

        it('should block steps when disabled', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithFormControl);

            fixture.componentInstance.formControl.disable();

            fixture.detectChanges();
            flush();

            const initialValue = fixture.componentInstance.formControl.value;

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.formControl.value).toEqual(initialValue);

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.formControl.value).toEqual(initialValue);
        }));
    });

    describe('formControlName', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithFormControlName);

            fixture.detectChanges();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(11);
        }));

        it('should step down', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithFormControlName);

            fixture.detectChanges();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(9);
        }));

        it('should block steps when disabled', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithFormControlName);

            fixture.componentInstance.reactiveForm.disable();

            fixture.detectChanges();
            flush();

            const initialValue = fixture.componentInstance.reactiveForm.value['reactiveInputValue'];

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toEqual(initialValue);

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toEqual(initialValue);
        }));
    });

    describe('empty value', () => {
        it('should step up when no max', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(1);
        }));

        it('should step down when no min', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[0];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(1);
        }));

        it('should step up when max is set', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(3);

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(3.5);
        }));

        it('should step down when min is set', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(3);

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(3);
        }));

        it('should be able to set min', fakeAsync(() => {
            const min = 1;

            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.detectChanges();

            fixture.componentInstance.min = min;

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(min);
        }));

        it('should be able to set max', fakeAsync(() => {
            const max = 3.5;

            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.componentInstance.max = max;

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const stepUp = icons[0];

            dispatchFakeEvent(stepUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(fixture.componentInstance.min);

            dispatchFakeEvent(stepUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(max);

            dispatchFakeEvent(stepUp.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(max);
        }));

        it('should be able to set step', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.detectChanges();

            fixture.componentInstance.step = 2;

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(3);

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(3);
        }));

        it('should be able to set bigStep via the camelCase property binding', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.detectChanges();

            fixture.componentInstance.bigStep = 3;

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 5;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            const event = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(8);
        }));

        it('should be able to set big-step via the kebab-case static attribute', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            flush();

            fixture.componentInstance.value = 5;
            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));

            const event = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            flush();

            // The template's static `big-step="2"` reaches `bigStep` through the `@Input('big-step')`
            // kebab-case alias. Stepping by the directive's own default (`BIG_STEP = 10`) instead would
            // clamp the result to `max="10"`, so 7 also proves the attribute, not the default, was used.
            expect(fixture.componentInstance.value).toBe(7);
        }));
    });

    describe('not empty value', () => {
        it('should step up when no min', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();
            flush();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(2);
        }));

        it('should step down when no max', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();
            flush();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(0);
        }));
    });

    describe('keys', () => {
        it('should step up on up arrow key', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', UP_ARROW);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(2);
        }));

        it('should step down on down arrow key', fakeAsync(() => {
            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', DOWN_ARROW);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(0);
        }));

        it('should step up with bug step on shift and up arrow key', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 5;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            const event = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(7);
        }));

        it('should step down with bug step on shift and down arrow key', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 6;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            const event = createKeyboardEvent('keydown', DOWN_ARROW);

            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(4);
        }));

        it('should ignore wrong chars', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = '123';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBe(123);

            inputElement.value = 'blahblah';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '1.2';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBe(1.2);

            inputElement.value = '1..2';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '1..';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '--1';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '-1-';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '.';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBeNull();
        }));

        it('should allow entering minus', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = '-';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBeNull();
        }));

        it('should allow enter fraction separator char after integer part', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);
            const localeService = fixture.debugElement.injector.get(KbqLocaleService);

            localeService.setLocale('ru-RU');
            fixture.detectChanges();
            flush();

            const fractionSeparator = localeService.current.input.number.fractionSeparator;

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = '123';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            inputElement.value = `${inputElement.value}${fractionSeparator}`;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toContain(localeService?.current.input.number.fractionSeparator);
        }));

        describe('negative values', () => {
            let fixture: ComponentFixture<NumberInputMaxMinStepInput>;
            let inputElementDebug;
            let inputElement;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(NumberInputMaxMinStepInput);
                inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
                inputElement = inputElementDebug.nativeElement;
                fixture.detectChanges();
                flush();
            }));

            it('should prevent negative value from being emitted if min >= 0', fakeAsync(() => {
                fixture.componentInstance.min = 0;
                const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
                const mockEvent: any = { preventDefault: () => true };
                const preventDefaultSpyFn = jest.spyOn(mockEvent, 'preventDefault');

                fixture.detectChanges();

                minuses.forEach((minus) => {
                    mockEvent.keyCode = minus;
                    inputElementDebug.triggerEventHandler('keydown', mockEvent);
                    fixture.detectChanges();
                    flush();
                });
                expect(preventDefaultSpyFn).toHaveBeenCalledTimes(minuses.length);
            }));

            /* TODO: not the full coverage since input validity change can't be emitted */
            it('should prevent negative value from being emitted for repeated minus', fakeAsync(() => {
                fixture.componentInstance.min = -5;
                const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
                const mockEvent: any = { preventDefault: () => true };
                const preventDefaultSpyFn = jest.spyOn(mockEvent, 'preventDefault');

                fixture.detectChanges();

                inputElement.value = '-1';
                dispatchFakeEvent(inputElement, 'input');
                fixture.detectChanges();
                flush();

                minuses.forEach((minus) => {
                    mockEvent.keyCode = minus;
                    mockEvent.key = '-';
                    inputElementDebug.triggerEventHandler('keydown', mockEvent);
                    dispatchFakeEvent(inputElement, 'input');
                    fixture.detectChanges();
                    flush();
                });
                expect(preventDefaultSpyFn).toHaveBeenCalledTimes(minuses.length);
            }));
        });
    });

    describe('truncate to bounds', () => {
        it('should set max when value > max on step up', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 20;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();
            flush();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(10);
        }));

        it('should set min when value < min on step down', fakeAsync(() => {
            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();
            flush();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(3);
        }));
    });

    describe('with masked thousand separators', () => {
        let fixture: ComponentFixture<NumberInputWithMask>;
        let inputElementDebug: DebugElement;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(NumberInputWithMask);
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            inputElement = inputElementDebug.nativeElement;
        });

        it('should mask number satisfying rules', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '12345';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`12${defaultLocaleGroupSep}345`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
            expect(fixture.componentInstance.value).toBe(12345);
        }));

        it('ru-RU: should NOT mask number if number between [1000, 10000)', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '1145';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('1145');
            groupSeparator.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });
            expect(fixture.componentInstance.value).toBe(1145);
        }));

        it('should mask number with model to view changes', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            fixture.componentInstance.value = 11145;
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`11${defaultLocaleGroupSep}145`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
        }));

        it('should NOT mask fractional part of number', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '0,1234';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('0,1234');
            groupSeparator.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });
            expect(fixture.componentInstance.value).toBe(0.1234);
        }));

        it('should add thousand separator for number more than thousand with fraction part', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '10234,1234';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`10${defaultLocaleGroupSep}234,1234`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
            expect(fixture.componentInstance.value).toBe(10234.1234);
        }));

        it('should NOT mask number if less thousand', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '123';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('123');
            groupSeparator.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });
            expect(fixture.componentInstance.value).toBe(123);
        }));

        it('should switch separators on language change', fakeAsync(() => {
            const { groupSeparator: previousGroupSep } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '99999,999';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`99${defaultLocaleGroupSep}999,999`);
            expect(previousGroupSep.some((separator) => inputElement.value.includes(separator))).toBeTruthy();

            const previousValue = fixture.componentInstance.value;

            fixture.componentInstance.localeService.setLocale('en-US');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('99,999.999');
            previousGroupSep.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });
            expect(previousValue).toEqual(fixture.componentInstance.value);
            expect(fixture.componentInstance.value).toEqual(99999.999);
        }));

        it('should work with ngModel of type number', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '12345,12345';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`12${defaultLocaleGroupSep}345,12345`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
            expect(fixture.componentInstance.value).toBe(12345.12345);
            expect(typeof fixture.componentInstance.value).toBe('number');
        }));

        it('should NOT allow duplicated fractional part sign', fakeAsync(() => {
            const mockEvent: any = { preventDefault: () => true, keyCode: COMMA, key: ',' };
            const preventDefaultSpyFn = jest.spyOn(mockEvent, 'preventDefault');
            const previousValue = '0,12345';

            inputElement.value = previousValue;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            inputElementDebug.triggerEventHandler('keydown', mockEvent);
            fixture.detectChanges();
            flush();

            expect(preventDefaultSpyFn).toHaveBeenCalled();
            expect(inputElement.value).toBe(previousValue);
        }));

        it('should mask on step up/down', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            fixture.componentInstance.max = 15000;
            fixture.componentInstance.value = 9999;
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('9999');

            groupSeparator.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();
            flush();
            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`10${defaultLocaleGroupSep}000`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
        }));

        it('should paste properly', fakeAsync(() => {
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            flush();

            const testOutput = [
                '1',
                '1.',
                '1.2',
                '1.2.',
                '1.2.2',
                '2,',
                '2,2',
                '2,2,',
                '2,2,2'
            ].map((value) => {
                inputElementDebug.triggerEventHandler('paste', {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => value
                    }
                });
                fixture.detectChanges();
                fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
                fixture.detectChanges();
                flush();

                return `${value} -> ${inputElement.value}`;
            });

            expect(testOutput).toMatchSnapshot();
        }));

        it('should check and normalize localized number when pasted number in different locale', fakeAsync(() => {
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            flush();
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '1.234.567,89'
                }
            });
            fixture.detectChanges();

            fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234${defaultLocaleGroupSep}567,89`);

            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '10,000,7'
                }
            });
            fixture.detectChanges();

            fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`10${defaultLocaleGroupSep}000,7`);
        }));

        it('nothing should happen when inserting a text value', fakeAsync(() => {
            const mockEvent: any = { preventDefault: () => true };
            const preventDefault = jest.spyOn(mockEvent, 'preventDefault');

            expect(inputElement.value).toBe('');

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            flush();
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault,
                clipboardData: {
                    getData: () => '1.234.567,89'
                }
            });
            fixture.detectChanges();

            fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
            fixture.detectChanges();
            flush();

            expect(preventDefault).not.toHaveBeenCalled();
            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234${defaultLocaleGroupSep}567,89`);

            inputElementDebug.triggerEventHandler('paste', {
                preventDefault,
                clipboardData: {
                    getData: () => 'text_value'
                }
            });
            fixture.detectChanges();
            flush();

            expect(preventDefault).toHaveBeenCalled();
            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234${defaultLocaleGroupSep}567,89`);
        }));

        it('should paste negative value properly', fakeAsync(() => {
            const pasteValue = '-1234';
            const mockEvent: any = { preventDefault: () => true };
            const preventDefault = jest.spyOn(mockEvent, 'preventDefault');

            expect(inputElement.value).toBe('');

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.componentInstance.withMask = false;
            fixture.detectChanges();
            flush();
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault,
                clipboardData: {
                    getData: () => pasteValue
                }
            });
            fixture.detectChanges();

            fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
            fixture.detectChanges();
            flush();

            expect(preventDefault).not.toHaveBeenCalled();
            expect(inputElement.value).toBe(pasteValue);
        }));
    });

    describe('with [integer]="true"', () => {
        let fixture: ComponentFixture<NumberInputWithInteger>;
        let inputElementDebug: DebugElement;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(NumberInputWithInteger);
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            inputElement = inputElementDebug.nativeElement;
        });

        it('should paste only integer part and normalize number in different locale', fakeAsync(() => {
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            flush();
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '1.234.567,89'
                }
            });
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234${defaultLocaleGroupSep}567`);

            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '10,000,7'
                }
            });
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`10${defaultLocaleGroupSep}000`);
        }));
    });

    describe('valueAsNumber', () => {
        it('should leave the platform accessor of an unrelated input alone', fakeAsync(() => {
            const fixture = createComponent(NumberInputNextToPlainInput);

            fixture.detectChanges();
            flush();

            const plainInput: HTMLInputElement = fixture.debugElement.query(
                By.css('[data-testid="plain"]')
            ).nativeElement;

            expect(plainInput.value).toBe('12,5');
            expect(plainInput.valueAsNumber).toBeNaN();
        }));

        it('should read the normalized model value off the directive', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithMask);

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.componentInstance.value = 1234.5;
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.inputNumberDirective().valueAsNumber).toBe(1234.5);
        }));

        it('should read the live view value, before the deferred reformat runs', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithMask);

            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement: HTMLInputElement = inputElementDebug.nativeElement;

            inputElement.value = '42';
            dispatchFakeEvent(inputElement, 'input');

            // No `flush()`/`tick()` yet: the reformat is still pending in its `setTimeout(0)`, and so is
            // the committed `value`/`valueChange`. A consumer reading `valueAsNumber` from its own
            // `(input)` handler must still see the keystroke immediately, same as `nativeElement.value`.
            expect(fixture.componentInstance.inputNumberDirective().valueAsNumber).toBe(42);

            flush();

            expect(fixture.componentInstance.inputNumberDirective().valueAsNumber).toBe(42);
        }));

        it('should read an in-progress "-" as null rather than the last committed number', fakeAsync(() => {
            const fixture = createComponent(NumberInputWithMask);

            fixture.componentInstance.value = 5;
            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement: HTMLInputElement = inputElementDebug.nativeElement;

            inputElement.value = '-';
            dispatchFakeEvent(inputElement, 'input');

            expect(fixture.componentInstance.inputNumberDirective().valueAsNumber).toBeNull();
        }));
    });

    describe('with type="number"', () => {
        it('should reset the native type to text and warn', fakeAsync(() => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

            try {
                const fixture = createComponent(NumberInputWithNativeNumberType);

                fixture.detectChanges();
                flush();

                const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

                expect(inputElement.type).toBe('text');
                expect(warn).toHaveBeenCalledWith(expect.stringContaining('kbqNumberInput'));
            } finally {
                warn.mockRestore();
            }
        }));

        it('should keep a fractional value in the field after a step', fakeAsync(() => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

            try {
                const fixture = createComponent(NumberInputWithNativeNumberType);

                fixture.detectChanges();
                flush();

                const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

                dispatchKeyboardEvent(inputElement, 'keydown', UP_ARROW);
                fixture.detectChanges();
                flush();

                expect(inputElement.value).toBe('0,5');
            } finally {
                warn.mockRestore();
            }
        }));
    });

    describe('decimal stepping', () => {
        it.each([
            [1.005, 0.001, 1.006],
            [0.1, 0.25, 0.35],
            [1e-7, 1, 1.0000001],
            [1e-7, 1e-7, 2e-7]
        ])('should add %p and %p as %p without float drift', (left, right, expected) => {
            expect(add(left, right)).toBe(expected);
        });

        it('should report the decimal scale of a number in exponential notation', () => {
            expect(getPrecision(1e-7)).toBe(1e7);
            expect(getPrecision(1.005)).toBe(1000);
            expect(getPrecision(12)).toBe(1);
        });

        it('should render the stepped value without drift', fakeAsync(() => {
            const fixture = createComponent(NumberInputConfigurable);

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.componentInstance.step = 0.001;
            fixture.componentInstance.value = 1.005;
            fixture.detectChanges();
            flush();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            dispatchKeyboardEvent(inputElement, 'keydown', UP_ARROW);
            fixture.detectChanges();
            flush();

            // The model alone would have missed this: `formatNumber` renders `toString()` digit for digit.
            expect(inputElement.value).toBe('1,006');
            expect(fixture.componentInstance.inputNumberDirective().value).toBe(1.006);
        }));
    });

    describe('startFormattingFrom', () => {
        let fixture: ComponentFixture<NumberInputConfigurable>;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(NumberInputConfigurable);
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;
        });

        it('should group from the given power of ten, overriding the locale default', fakeAsync(() => {
            fixture.componentInstance.startFormattingFrom = 3;
            fixture.componentInstance.value = 1234;
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234`);
        }));

        it('should follow the locale default when not set', fakeAsync(() => {
            fixture.componentInstance.value = 1234;
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('1234');
        }));
    });

    describe('accessibility', () => {
        let fixture: ComponentFixture<NumberInputConfigurable>;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(NumberInputConfigurable);
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;
        });

        it('should expose spinbutton semantics', fakeAsync(() => {
            fixture.componentInstance.min = -10;
            fixture.componentInstance.max = 10;
            fixture.detectChanges();
            flush();

            expect(inputElement.getAttribute('role')).toBe('spinbutton');
            expect(inputElement.getAttribute('aria-valuemin')).toBe('-10');
            expect(inputElement.getAttribute('aria-valuemax')).toBe('10');
        }));

        it('should omit aria-valuemin/aria-valuemax when unbounded', fakeAsync(() => {
            fixture.detectChanges();
            flush();

            expect(inputElement.getAttribute('aria-valuemin')).toBeNull();
            expect(inputElement.getAttribute('aria-valuemax')).toBeNull();
        }));

        it('should track the value in aria-valuenow and the formatted string in aria-valuetext', fakeAsync(() => {
            fixture.componentInstance.value = 12345;
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(inputElement.getAttribute('aria-valuenow')).toBe('12345');
            expect(inputElement.getAttribute('aria-valuetext')).toBe(`12${defaultLocaleGroupSep}345`);
        }));

        it('should update aria-valuenow after a step', fakeAsync(() => {
            fixture.componentInstance.value = 5;
            fixture.detectChanges();
            flush();

            dispatchKeyboardEvent(inputElement, 'keydown', UP_ARROW);
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(inputElement.getAttribute('aria-valuenow')).toBe('6');
        }));

        it('should flip inputmode with [integer]', fakeAsync(() => {
            fixture.detectChanges();
            flush();

            expect(inputElement.getAttribute('inputmode')).toBe('decimal');

            fixture.componentInstance.integer = true;
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(inputElement.getAttribute('inputmode')).toBe('numeric');
        }));

        it('should have no AXE violations', async () => {
            fixture.componentInstance.value = 12345;
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('caret position', () => {
        let fixture: ComponentFixture<NumberInputWithMask>;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(NumberInputWithMask);
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.componentInstance.max = Infinity;
            fixture.componentInstance.min = -Infinity;
            fixture.detectChanges();
            inputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;
        });

        /** Types `digit` at the end of the field, the way a keystroke reaches `onInput`. */
        const type = (nextViewValue: string) => {
            inputElement.value = nextViewValue;
            inputElement.setSelectionRange(nextViewValue.length, nextViewValue.length);
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
        };

        it('should move the caret right when a group separator is inserted', fakeAsync(() => {
            fixture.componentInstance.value = 1234;
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('1234');

            type('12345');

            expect(inputElement.value).toBe(`12${defaultLocaleGroupSep}345`);
            expect(inputElement.selectionStart).toBe(6);
        }));

        it('should move the caret left when a group separator is removed', fakeAsync(() => {
            fixture.componentInstance.value = 12345;
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe(`12${defaultLocaleGroupSep}345`);

            type(`12${defaultLocaleGroupSep}34`);

            expect(inputElement.value).toBe('1234');
            expect(inputElement.selectionStart).toBe(4);
        }));

        it('should keep the caret where it is when no separator crosses it', fakeAsync(() => {
            fixture.componentInstance.value = 12;
            fixture.detectChanges();
            flush();

            type('123');

            expect(inputElement.value).toBe('123');
            expect(inputElement.selectionStart).toBe(3);
        }));
    });

    describe('teardown', () => {
        it('should not update the model from a keystroke pending at destroy time', fakeAsync(() => {
            const fixture = createComponent(NumberInputDestroyedWhileTyping);

            fixture.detectChanges();
            flush();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;
            const onChange = jest.fn();

            fixture.componentInstance.formControl.valueChanges.subscribe(onChange);

            inputElement.value = '42';
            dispatchFakeEvent(inputElement, 'input');

            fixture.componentInstance.visible = false;
            fixture.detectChanges();

            flush();

            expect(onChange).not.toHaveBeenCalled();
        }));
    });
});

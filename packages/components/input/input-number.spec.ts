import { Component, DebugElement, Provider, Type, inject, viewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
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
import { BIG_STEP, KbqInput, KbqInputModule, KbqNumberInput, SMALL_STEP, add, getPrecision } from './index';

import type { Mock } from 'vitest';
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

    const fixture = TestBed.createComponent<T>(component);

    // Without zone.js, auto-detection renders on the next scheduled tick rather than inside `createComponent`.

    fixture.detectChanges();

    return fixture;
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

    stepUp = vi.fn().mockImplementation(() => true);
    stepDown = vi.fn().mockImplementation(() => false);
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

    stepUp = vi.fn().mockImplementation(() => true);
    stepDown = vi.fn().mockImplementation(() => false);
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
            <input kbqNumberInput max="10" min="3" step="0.5" bigStep="2" [(ngModel)]="value" />
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
    afterEach(() => {
        vi.useRealTimers();
    });

    it('should use input-number control type', async () => {
        vi.useFakeTimers();

        const fixture = createComponent(NumberInputTestComponent);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const inputElement = fixture.debugElement.query(By.directive(KbqInput));
        const input = inputElement.injector.get(KbqInput);
        const numberInput = inputElement.injector.get(KbqNumberInput);
        const formField = fixture.debugElement.query(By.css('kbq-form-field')).nativeElement;

        expect(input.controlType).toBe('input-number');
        expect(numberInput.controlType).toBe('input-number');
        expect(formField.classList).toContain('kbq-form-field-type-input-number');
    });

    it('should have stepper on focus', async () => {
        vi.useFakeTimers();

        const fixture = createComponent(NumberInputTestComponent);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
        const inputElement = inputElementDebug.nativeElement;

        dispatchFakeEvent(inputElement, 'focus');
        fixture.detectChanges();

        const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const icons = stepper.queryAll(By.css('.kbq-icon'));

        expect(stepper).not.toBeNull();
        expect(icons.length).toBe(2);
    });

    it('should apply kbq-error class to stepper icons when control is invalid', async () => {
        vi.useFakeTimers();

        const fixture = createComponent(NumberInputWithErrorState);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const icons = stepper.queryAll(By.css('.kbq-icon'));

        expect(icons.length).toBe(2);
        expect(icons.every((icon) => icon.nativeElement.classList.contains('kbq-error'))).toBe(true);
    });

    it('should throw error with cleaner', () => {
        // KbqCleaner.ngAfterContentInit() throws when it detects a number input.
        // Override ComponentFixtureAutoDetect so CD doesn't run inside
        // TestBed.createComponent — that way the throw originates from our explicit
        // fixture.detectChanges() call, where expect-to-throw can capture it.
        vi.spyOn(console, 'error').mockImplementation(() => {});

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

    it('should throw an exception with kbq-cleaner', async () => {
        vi.useFakeTimers();

        const fixture = createComponent(NumberInputTestComponent);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const stepper = fixture.debugElement.query(By.css('kbq-cleaner'));

        expect(stepper).toBeNull();
    });

    it('should block steps when disabled', async () => {
        vi.useFakeTimers();

        const fixture = createComponent(NumberInputTestComponent);

        fixture.componentInstance.disabled = true;

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        const initialValue = fixture.componentInstance.value;

        const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

        dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
        fixture.detectChanges();

        expect(fixture.componentInstance.value).toEqual(initialValue);

        dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
        fixture.detectChanges();

        expect(fixture.componentInstance.value).toEqual(initialValue);
    });

    it('should connect a stepper added after form-field initialization', async () => {
        vi.useFakeTimers();

        const fixture = createComponent(NumberInputWithDynamicStepper);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.componentInstance.showStepper = true;
        fixture.detectChanges();

        const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const iconUp = stepper.queryAll(By.css('.kbq-icon'))[0];

        dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        expect(fixture.componentInstance.value).toBe(11);
    });

    describe('with long press on stepper', () => {
        const initialValue = 0;

        it('should not have timers assigned on init', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
            // Change detection schedules itself with an undelayed timer; the long press waits for its own delay.
            const longPressTimers = () => setTimeoutSpy.mock.calls.filter(([, delay]) => !!delay);

            fixture.detectChanges();

            expect(longPressTimers()).toHaveLength(0);

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp] = stepper.queryAll(By.css('.kbq-icon'));

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(longPressTimers()).toHaveLength(1);
        });

        it('should emit once before initial delay', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            fixture.componentInstance.value = initialValue;
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            const testLongPressFor = async (icon, emitter) => {
                dispatchFakeEvent(icon.nativeElement, 'mousedown');

                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(KBQ_STEPPER_INITIAL_TIMEOUT - 1);

                expect(emitter).toHaveBeenCalledTimes(1);

                dispatchFakeEvent(document, 'mouseup');
            };

            await testLongPressFor(iconUp, fixture.componentInstance.stepUp);
            await testLongPressFor(iconDown, fixture.componentInstance.stepDown);
        });

        it('should emit after initial delay + interval', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            fixture.componentInstance.value = initialValue;
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            const testLongPressFor = async (icon, emitter) => {
                dispatchFakeEvent(icon.nativeElement, 'mousedown');
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(KBQ_STEPPER_INITIAL_TIMEOUT);

                await vi.advanceTimersByTimeAsync(KBQ_STEPPER_INTERVAL_DELAY);
                expect(emitter).toHaveBeenCalledTimes(2);

                await vi.advanceTimersByTimeAsync(KBQ_STEPPER_INTERVAL_DELAY);
                expect(emitter).toHaveBeenCalledTimes(3);

                dispatchFakeEvent(document, 'mouseup');
            };

            await testLongPressFor(iconUp, fixture.componentInstance.stepUp);
            await testLongPressFor(iconDown, fixture.componentInstance.stepDown);
        });

        it('should stop emitting on mouseUp', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            fixture.componentInstance.value = initialValue;
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            const testLongPressFor = async (icon, emitter) => {
                dispatchFakeEvent(icon.nativeElement, 'mousedown');
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(KBQ_STEPPER_INITIAL_TIMEOUT);

                dispatchFakeEvent(document, 'mouseup');
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(KBQ_STEPPER_INTERVAL_DELAY);

                expect(emitter).toHaveBeenCalledTimes(1);
            };

            await testLongPressFor(iconUp, fixture.componentInstance.stepUp);
            await testLongPressFor(iconDown, fixture.componentInstance.stepDown);
        });

        it('should stop emitting on component destroy', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(TestNumberInputConditional);
            const { debugElement } = fixture;

            fixture.detectChanges();

            expect(debugElement.query(By.directive(KbqFormField)).nativeElement).toBeTruthy();

            const testLongPressFor = async (queryIconFn, emitter: Mock) => {
                const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
                const icon = queryIconFn(stepper.queryAll(By.css('.kbq-icon')));

                dispatchFakeEvent(icon.nativeElement, 'mousedown');
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(KBQ_STEPPER_INITIAL_TIMEOUT);

                fixture.componentInstance.isVisible = false;
                fixture.detectChanges();
                // this call is skipped
                await vi.advanceTimersByTimeAsync(KBQ_STEPPER_INTERVAL_DELAY);

                expect(debugElement.query(By.directive(KbqFormField))).toBeFalsy();
                // only immediate call counts
                expect(emitter).toHaveBeenCalledTimes(1);
            };

            await testLongPressFor((icons) => icons[0], fixture.componentInstance.stepUp);
            // return back visible state
            fixture.componentInstance.isVisible = true;
            fixture.detectChanges();

            await testLongPressFor((icons) => icons[1], fixture.componentInstance.stepDown);
        });
    });

    describe('formControl', () => {
        it('should step up', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputWithFormControl);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.formControl.value).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.formControl.value).toBe(11);
        });

        it('should step down', async () => {
            vi.useFakeTimers();

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.formControl.value).toBe(9);
        });

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

        it('should block steps when disabled', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputWithFormControl);

            fixture.componentInstance.formControl.disable();

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const initialValue = fixture.componentInstance.formControl.value;

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.formControl.value).toEqual(initialValue);

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.formControl.value).toEqual(initialValue);
        });
    });

    describe('formControlName', () => {
        it('should step up', async () => {
            vi.useFakeTimers();

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(11);
        });

        it('should step down', async () => {
            vi.useFakeTimers();

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(9);
        });

        it('should block steps when disabled', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputWithFormControlName);

            fixture.componentInstance.reactiveForm.disable();

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const initialValue = fixture.componentInstance.reactiveForm.value['reactiveInputValue'];

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const [iconUp, iconDown] = stepper.queryAll(By.css('.kbq-icon'));

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toEqual(initialValue);

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toEqual(initialValue);
        });
    });

    describe('empty value', () => {
        it('should step up when no max', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(1);
        });

        it('should step down when no min', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(-1);
        });

        it('should step up when max is set', async () => {
            vi.useFakeTimers();

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(3.5);
        });

        it('should step down when min is set', async () => {
            vi.useFakeTimers();

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(3);
        });

        it('should be able to set min', async () => {
            vi.useFakeTimers();

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(min);
        });

        it('should be able to set max', async () => {
            vi.useFakeTimers();

            const max = 3.5;

            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.componentInstance.max = max;

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(max);
        });

        it('should be able to set step', async () => {
            vi.useFakeTimers();

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
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(3);
        });

        it('should be able to set bigStep via the camelCase property binding', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.detectChanges();

            fixture.componentInstance.bigStep = 3;

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 5;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const event = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(8);
        });

        it('should be able to set bigStep via the static attribute', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            fixture.componentInstance.value = 5;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));

            const event = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            // The template's static `bigStep="2"` reaches `bigStep()` through the input's transform.
            // Stepping by the directive's own default (`BIG_STEP = 10`) instead would clamp the result
            // to `max="10"`, so 7 also proves the attribute, not the default, was used.
            expect(fixture.componentInstance.value).toBe(7);
        });
    });

    describe('signal inputs', () => {
        const numberInputOf = (fixture: ComponentFixture<unknown>): KbqNumberInput =>
            fixture.debugElement.query(By.directive(KbqNumberInput)).injector.get(KbqNumberInput);

        it('should read the static attribute forms back as coerced numbers', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const numberInput = numberInputOf(fixture);

            expect(numberInput.min()).toBe(3);
            expect(numberInput.max()).toBe(10);
            expect(numberInput.step()).toBe(0.5);
            expect(numberInput.bigStep()).toBe(2);
        });

        it('should fall back to the defaults when nothing is bound', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputConfigurable);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const numberInput = numberInputOf(fixture);

            expect(numberInput.min()).toBe(-Infinity);
            expect(numberInput.max()).toBe(Infinity);
            expect(numberInput.step()).toBe(SMALL_STEP);
            expect(numberInput.bigStep()).toBe(BIG_STEP);
        });

        it('should fall back to the defaults for a non-numeric bound value', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.componentInstance.step = '5px' as unknown as number;
            fixture.componentInstance.bigStep = '5px' as unknown as number;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const numberInput = numberInputOf(fixture);

            expect(numberInput.step()).toBe(SMALL_STEP);
            expect(numberInput.bigStep()).toBe(BIG_STEP);
        });

        it('should track a rebound value', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const numberInput = numberInputOf(fixture);

            expect(numberInput.max()).toBe(10);

            fixture.componentInstance.max = 40;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(numberInput.max()).toBe(40);
        });

        it('should repaint aria-valuemax when the bound upper bound changes', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStepInput);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            expect(inputElement.getAttribute('aria-valuemax')).toBe('10');

            fixture.componentInstance.max = 40;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.getAttribute('aria-valuemax')).toBe('40');
        });
    });

    describe('not empty value', () => {
        it('should step up when no min', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(2);
        });

        it('should step down when no max', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(0);
        });
    });

    describe('keys', () => {
        it('should step up on up arrow key', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', UP_ARROW);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(2);
        });

        it('should step down on down arrow key', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputTestComponent);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', DOWN_ARROW);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(0);
        });

        it('should step up with bug step on shift and up arrow key', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 5;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const event = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(7);
        });

        it('should step down with bug step on shift and down arrow key', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 6;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const event = createKeyboardEvent('keydown', DOWN_ARROW);

            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(4);
        });

        it('should ignore wrong chars', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = '123';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBe(123);

            inputElement.value = 'blahblah';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '1.2';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBe(1.2);

            inputElement.value = '1..2';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '1..';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '--1';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '-1-';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '.';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBeNull();
        });

        it('should allow entering minus', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = '-';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(fixture.componentInstance.value).toBeNull();
        });

        it('should allow enter fraction separator char after integer part', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);
            const localeService = fixture.debugElement.injector.get(KbqLocaleService);

            localeService.setLocale('ru-RU');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const fractionSeparator = localeService.current.input.number.fractionSeparator;

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = '123';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            inputElement.value = `${inputElement.value}${fractionSeparator}`;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toContain(localeService?.current.input.number.fractionSeparator);
        });

        describe('negative values', () => {
            let fixture: ComponentFixture<NumberInputMaxMinStepInput>;
            let inputElementDebug;
            let inputElement;

            beforeEach(async () => {
                vi.useFakeTimers();

                fixture = createComponent(NumberInputMaxMinStepInput);
                inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
                inputElement = inputElementDebug.nativeElement;
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            });

            it('should prevent negative value from being emitted if min >= 0', async () => {
                fixture.componentInstance.min = 0;
                const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
                const mockEvent: any = { preventDefault: () => true };
                const preventDefaultSpyFn = vi.spyOn(mockEvent, 'preventDefault');

                fixture.detectChanges();

                for (const minus of minuses) {
                    mockEvent.keyCode = minus;
                    inputElementDebug.triggerEventHandler('keydown', mockEvent);
                    fixture.detectChanges();
                    await vi.runOnlyPendingTimersAsync();
                }

                expect(preventDefaultSpyFn).toHaveBeenCalledTimes(minuses.length);
            });

            /* TODO: not the full coverage since input validity change can't be emitted */
            it('should prevent negative value from being emitted for repeated minus', async () => {
                fixture.componentInstance.min = -5;
                const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
                const mockEvent: any = { preventDefault: () => true };
                const preventDefaultSpyFn = vi.spyOn(mockEvent, 'preventDefault');

                fixture.detectChanges();

                inputElement.value = '-1';
                dispatchFakeEvent(inputElement, 'input');
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                for (const minus of minuses) {
                    mockEvent.keyCode = minus;
                    mockEvent.key = '-';
                    inputElementDebug.triggerEventHandler('keydown', mockEvent);
                    dispatchFakeEvent(inputElement, 'input');
                    fixture.detectChanges();
                    await vi.runOnlyPendingTimersAsync();
                }

                expect(preventDefaultSpyFn).toHaveBeenCalledTimes(minuses.length);
            });
        });
    });

    describe('truncate to bounds', () => {
        it('should set max when value > max on step up', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 20;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(10);
        });

        it('should set min when value < min on step down', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputMaxMinStep);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.value).toBe(3);
        });
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

        it('should mask number satisfying rules', async () => {
            vi.useFakeTimers();

            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '12345';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`12${defaultLocaleGroupSep}345`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
            expect(fixture.componentInstance.value).toBe(12345);
        });

        it('ru-RU: should NOT mask number if number between [1000, 10000)', async () => {
            vi.useFakeTimers();

            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '1145';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe('1145');
            groupSeparator.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });
            expect(fixture.componentInstance.value).toBe(1145);
        });

        it('should mask number with model to view changes', async () => {
            vi.useFakeTimers();

            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            fixture.componentInstance.value = 11145;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`11${defaultLocaleGroupSep}145`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
        });

        it('should NOT mask fractional part of number', async () => {
            vi.useFakeTimers();

            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '0,1234';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe('0,1234');
            groupSeparator.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });
            expect(fixture.componentInstance.value).toBe(0.1234);
        });

        it('should add thousand separator for number more than thousand with fraction part', async () => {
            vi.useFakeTimers();

            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '10234,1234';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`10${defaultLocaleGroupSep}234,1234`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
            expect(fixture.componentInstance.value).toBe(10234.1234);
        });

        it('should NOT mask number if less thousand', async () => {
            vi.useFakeTimers();

            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '123';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe('123');
            groupSeparator.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });
            expect(fixture.componentInstance.value).toBe(123);
        });

        it('should switch separators on language change', async () => {
            vi.useFakeTimers();

            const { groupSeparator: previousGroupSep } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '99999,999';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            // The reformat schedules the change detection that writes the model back; it has to land before the
            // locale switches.
            await vi.runAllTimersAsync();

            expect(inputElement.value).toBe(`99${defaultLocaleGroupSep}999,999`);
            expect(previousGroupSep.some((separator) => inputElement.value.includes(separator))).toBeTruthy();

            const previousValue = fixture.componentInstance.value;

            fixture.componentInstance.localeService.setLocale('en-US');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe('99,999.999');
            previousGroupSep.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });
            expect(previousValue).toEqual(fixture.componentInstance.value);
            expect(fixture.componentInstance.value).toEqual(99999.999);
        });

        it('should work with ngModel of type number', async () => {
            vi.useFakeTimers();

            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '12345,12345';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`12${defaultLocaleGroupSep}345,12345`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
            expect(fixture.componentInstance.value).toBe(12345.12345);
            expect(typeof fixture.componentInstance.value).toBe('number');
        });

        it('should NOT allow duplicated fractional part sign', async () => {
            vi.useFakeTimers();

            const mockEvent: any = { preventDefault: () => true, keyCode: COMMA, key: ',' };
            const preventDefaultSpyFn = vi.spyOn(mockEvent, 'preventDefault');
            const previousValue = '0,12345';

            inputElement.value = previousValue;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            inputElementDebug.triggerEventHandler('keydown', mockEvent);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(preventDefaultSpyFn).toHaveBeenCalled();
            expect(inputElement.value).toBe(previousValue);
        });

        it('should mask on step up/down', async () => {
            vi.useFakeTimers();

            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            fixture.componentInstance.max = 15000;
            fixture.componentInstance.value = 9999;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe('9999');

            groupSeparator.forEach((separator) => {
                expect(inputElement.value).not.toContain(separator);
            });

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            const stepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = stepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`10${defaultLocaleGroupSep}000`);
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTruthy();
        });

        it('should paste properly', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const testOutput: string[] = [];

            for (const value of [
                '1',
                '1.',
                '1.2',
                '1.2.',
                '1.2.2',
                '2,',
                '2,2',
                '2,2,',
                '2,2,2'
            ]) {
                inputElementDebug.triggerEventHandler('paste', {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => value
                    }
                });
                fixture.detectChanges();
                fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                testOutput.push(`${value} -> ${inputElement.value}`);
            }

            expect(testOutput).toMatchSnapshot();
        });

        it('should check and normalize localized number when pasted number in different locale', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '1.234.567,89'
                }
            });
            fixture.detectChanges();

            fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

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
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`10${defaultLocaleGroupSep}000,7`);
        });

        it('nothing should happen when inserting a text value', async () => {
            vi.useFakeTimers();

            const mockEvent: any = { preventDefault: () => true };
            const preventDefault = vi.spyOn(mockEvent, 'preventDefault');

            expect(inputElement.value).toBe('');

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault,
                clipboardData: {
                    getData: () => '1.234.567,89'
                }
            });
            fixture.detectChanges();

            fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(preventDefault).not.toHaveBeenCalled();
            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234${defaultLocaleGroupSep}567,89`);

            inputElementDebug.triggerEventHandler('paste', {
                preventDefault,
                clipboardData: {
                    getData: () => 'text_value'
                }
            });
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(preventDefault).toHaveBeenCalled();
            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234${defaultLocaleGroupSep}567,89`);
        });

        it('should paste negative value properly', async () => {
            vi.useFakeTimers();

            const pasteValue = '-1234';
            const mockEvent: any = { preventDefault: () => true };
            const preventDefault = vi.spyOn(mockEvent, 'preventDefault');

            expect(inputElement.value).toBe('');

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.componentInstance.withMask = false;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault,
                clipboardData: {
                    getData: () => pasteValue
                }
            });
            fixture.detectChanges();

            fixture.componentInstance.inputNumberDirective().onInput({ inputType: 'insertFromPaste' } as any);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(preventDefault).not.toHaveBeenCalled();
            expect(inputElement.value).toBe(pasteValue);
        });
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

        it('should paste only integer part and normalize number in different locale', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '1.234.567,89'
                }
            });
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234${defaultLocaleGroupSep}567`);

            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '10,000,7'
                }
            });
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`10${defaultLocaleGroupSep}000`);
        });
    });

    describe('valueAsNumber', () => {
        it('should leave the platform accessor of an unrelated input alone', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputNextToPlainInput);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const plainInput: HTMLInputElement = fixture.debugElement.query(
                By.css('[data-testid="plain"]')
            ).nativeElement;

            expect(plainInput.value).toBe('12,5');
            expect(plainInput.valueAsNumber).toBeNaN();
        });

        it('should read the normalized model value off the directive', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputWithMask);

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.componentInstance.value = 1234.5;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.inputNumberDirective().valueAsNumber).toBe(1234.5);
        });

        it('should read the live view value, before the deferred reformat runs', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputWithMask);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement: HTMLInputElement = inputElementDebug.nativeElement;

            inputElement.value = '42';
            dispatchFakeEvent(inputElement, 'input');

            // No timer has run yet: the reformat is still pending in its `setTimeout(0)`, and so is
            // the committed `value`/`valueChange`. A consumer reading `valueAsNumber` from its own
            // `(input)` handler must still see the keystroke immediately, same as `nativeElement.value`.
            expect(fixture.componentInstance.inputNumberDirective().valueAsNumber).toBe(42);

            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.inputNumberDirective().valueAsNumber).toBe(42);
        });

        it('should read an in-progress "-" as null rather than the last committed number', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputWithMask);

            fixture.componentInstance.value = 5;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement: HTMLInputElement = inputElementDebug.nativeElement;

            inputElement.value = '-';
            dispatchFakeEvent(inputElement, 'input');

            expect(fixture.componentInstance.inputNumberDirective().valueAsNumber).toBeNull();
        });
    });

    describe('with type="number"', () => {
        it('should reset the native type to text and warn', async () => {
            vi.useFakeTimers();

            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            try {
                const fixture = createComponent(NumberInputWithNativeNumberType);

                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

                expect(inputElement.type).toBe('text');
                expect(warn).toHaveBeenCalledWith(expect.stringContaining('kbqNumberInput'));
            } finally {
                warn.mockRestore();
            }
        });

        it('should keep a fractional value in the field after a step', async () => {
            vi.useFakeTimers();

            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            try {
                const fixture = createComponent(NumberInputWithNativeNumberType);

                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

                dispatchKeyboardEvent(inputElement, 'keydown', UP_ARROW);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(inputElement.value).toBe('0,5');
            } finally {
                warn.mockRestore();
            }
        });
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

        it('should render the stepped value without drift', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputConfigurable);

            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.componentInstance.step = 0.001;
            fixture.componentInstance.value = 1.005;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

            dispatchKeyboardEvent(inputElement, 'keydown', UP_ARROW);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            // The model alone would have missed this: `formatNumber` renders `toString()` digit for digit.
            expect(inputElement.value).toBe('1,006');
            expect(fixture.componentInstance.inputNumberDirective().value).toBe(1.006);
        });
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

        it('should group from the given power of ten, overriding the locale default', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.startFormattingFrom = 3;
            fixture.componentInstance.value = 1234;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`1${defaultLocaleGroupSep}234`);
        });

        it('should follow the locale default when not set', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.value = 1234;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe('1234');
        });
    });

    describe('es-LA', () => {
        // `es-LA` is not a real BCP-47 tag, so the directive hands `Intl` the default locale instead of
        // letting each engine's ICU data decide what `es-LA` means. This pins that workaround: without
        // it the separators come from whatever `Intl` resolves to, which varies by build.
        it('should render exactly what the default locale renders', async () => {
            vi.useFakeTimers();

            const render = async (locale: 'es-LA' | 'ru-RU') => {
                const fixture = createComponent(NumberInputConfigurable);

                fixture.componentInstance.localeService.setLocale(locale);
                fixture.componentInstance.value = 1234567.89;
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                return (fixture.debugElement.query(By.directive(KbqInput)).nativeElement as HTMLInputElement).value;
            };

            expect(await render('es-LA')).toBe(await render('ru-RU'));
        });
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

        it('should expose spinbutton semantics', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.min = -10;
            fixture.componentInstance.max = 10;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.getAttribute('role')).toBe('spinbutton');
            expect(inputElement.getAttribute('aria-valuemin')).toBe('-10');
            expect(inputElement.getAttribute('aria-valuemax')).toBe('10');
        });

        it('should omit aria-valuemin/aria-valuemax when unbounded', async () => {
            vi.useFakeTimers();

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.getAttribute('aria-valuemin')).toBeNull();
            expect(inputElement.getAttribute('aria-valuemax')).toBeNull();
        });

        it('should track the value in aria-valuenow and the formatted string in aria-valuetext', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.value = 12345;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(inputElement.getAttribute('aria-valuenow')).toBe('12345');
            expect(inputElement.getAttribute('aria-valuetext')).toBe(`12${defaultLocaleGroupSep}345`);
        });

        it('should update aria-valuenow after a step', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.value = 5;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            dispatchKeyboardEvent(inputElement, 'keydown', UP_ARROW);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(inputElement.getAttribute('aria-valuenow')).toBe('6');
        });

        it('should flip inputmode with [integer]', async () => {
            vi.useFakeTimers();

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.getAttribute('inputmode')).toBe('decimal');

            fixture.componentInstance.integer = true;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(inputElement.getAttribute('inputmode')).toBe('numeric');
        });

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
        const type = async (nextViewValue: string) => {
            inputElement.value = nextViewValue;
            inputElement.setSelectionRange(nextViewValue.length, nextViewValue.length);
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
        };

        it('should move the caret right when a group separator is inserted', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.value = 1234;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe('1234');

            await type('12345');

            expect(inputElement.value).toBe(`12${defaultLocaleGroupSep}345`);
            expect(inputElement.selectionStart).toBe(6);
        });

        it('should move the caret left when a group separator is removed', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.value = 12345;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(inputElement.value).toBe(`12${defaultLocaleGroupSep}345`);

            await type(`12${defaultLocaleGroupSep}34`);

            expect(inputElement.value).toBe('1234');
            expect(inputElement.selectionStart).toBe(4);
        });

        it('should keep the caret where it is when no separator crosses it', async () => {
            vi.useFakeTimers();

            fixture.componentInstance.value = 12;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            await type('123');

            expect(inputElement.value).toBe('123');
            expect(inputElement.selectionStart).toBe(3);
        });
    });

    describe('teardown', () => {
        it('should not update the model from a keystroke pending at destroy time', async () => {
            vi.useFakeTimers();

            const fixture = createComponent(NumberInputDestroyedWhileTyping);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;
            const onChange = vi.fn();

            fixture.componentInstance.formControl.valueChanges.subscribe(onChange);

            inputElement.value = '42';
            dispatchFakeEvent(inputElement, 'input');

            fixture.componentInstance.visible = false;
            fixture.detectChanges();

            await vi.runOnlyPendingTimersAsync();

            expect(onChange).not.toHaveBeenCalled();
        });
    });
});

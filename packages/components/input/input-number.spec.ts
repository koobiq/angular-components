import { Component, DebugElement, Inject, Optional, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { COMMA, DASH, DOWN_ARROW, FF_MINUS, NUMPAD_MINUS, UP_ARROW } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, dispatchEvent, dispatchFakeEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import {
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqLocaleServiceModule,
    ruRUFormattersData
} from '@koobiq/components/core';
import {
    KBQ_STEPPER_INITIAL_TIMEOUT,
    KBQ_STEPPER_INTERVAL_DELAY,
    KbqFormField,
    KbqFormFieldModule,
    getKbqFormFieldYouCanNotUseCleanerInNumberInputError
} from '@koobiq/components/form-field';
import { KbqInput, KbqInputModule, KbqNumberInput } from './index';

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
        KbqFormFieldModule,
        FormsModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [(ngModel)]="value" />
            <kbq-stepper (stepUp)="stepUp()" (stepDown)="stepDown()" />
        </kbq-form-field>
    `
})
class KbqNumberInputTestComponent {
    value: number | null = null;

    stepUp = jest.fn().mockImplementation(() => true);
    stepDown = jest.fn().mockImplementation(() => false);
}

@Component({
    imports: [
        KbqFormFieldModule,
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
    imports: [
        KbqFormFieldModule,
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
class KbqNumberInputWithFormControl {
    formControl = new UntypedFormControl(10);
}

@Component({
    imports: [
        KbqFormFieldModule,
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
class KbqNumberInputWithFormControlName {
    reactiveForm: UntypedFormGroup;

    constructor(private formBuilder: UntypedFormBuilder) {
        this.reactiveForm = this.formBuilder.group({
            reactiveInputValue: new UntypedFormControl(10)
        });
    }
}

@Component({
    imports: [
        KbqFormFieldModule,
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
class KbqNumberInputMaxMinStep {
    value: number | null = null;
}

@Component({
    imports: [
        KbqFormFieldModule,
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
class KbqNumberInputMaxMinStepInput {
    value: number | null = null;
    max: number = 10;
    min: number = 3;
    step: number = 0.5;
    bigStep: number = 2;
}

@Component({
    imports: [
        KbqFormFieldModule,
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
class KbqNumberInputWithCleaner {
    value: number = 0;
}

@Component({
    imports: [
        KbqFormFieldModule,
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
class KbqNumberInputWithMask {
    value: number | null = null;
    max: number = 10;
    min: number = 3;
    step: number = 1;
    bigStep: number = 5;
    withMask = true;

    @ViewChild(KbqNumberInput) inputNumberDirective: KbqNumberInput;

    constructor(@Optional() @Inject(KBQ_LOCALE_SERVICE) public localeService: KbqLocaleService) {}
}

@Component({
    imports: [
        KbqFormFieldModule,
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
class KbqNumberInputWithInteger {
    value: number | null = null;
    step: number = 1;
    bigStep: number = 5;

    @ViewChild(KbqNumberInput) inputNumberDirective: KbqNumberInput;

    constructor(@Optional() @Inject(KBQ_LOCALE_SERVICE) public localeService: KbqLocaleService) {}
}

describe('KbqNumberInput', () => {
    it('should have stepper on focus', fakeAsync(() => {
        const fixture = createComponent(KbqNumberInputTestComponent);

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

    it('should throw error with stepper', fakeAsync(() => {
        const fixture = createComponent(KbqNumberInputWithCleaner);

        expect(() => {
            try {
                fixture.detectChanges();
                flush();
            } catch {
                flush();
            }
        }).toThrow(getKbqFormFieldYouCanNotUseCleanerInNumberInputError());
    }));

    it('should throw an exception with kbq-cleaner', fakeAsync(() => {
        const fixture = createComponent(KbqNumberInputTestComponent);

        fixture.detectChanges();
        flush();

        const stepper = fixture.debugElement.query(By.css('kbq-cleaner'));

        expect(stepper).toBeNull();
    }));

    describe('with long press on stepper', () => {
        const initialValue = 0;

        it('should not have timers assigned on init', fakeAsync(() => {
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputWithFormControl);

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
            const fixture = createComponent(KbqNumberInputWithFormControl);

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
            const fixture = createComponent(KbqNumberInputWithFormControl);

            fixture.detectChanges();

            const inputElementDebugElement = fixture.debugElement.query(By.directive(KbqNumberInput));
            const formFieldDebugElement = fixture.debugElement.query(By.directive(KbqFormField));

            expect(formFieldDebugElement.classes['ng-touched']).toBeFalsy();

            dispatchFakeEvent(inputElementDebugElement.nativeElement, 'focus');
            dispatchFakeEvent(inputElementDebugElement.nativeElement, 'blur');
            fixture.detectChanges();

            expect(formFieldDebugElement.classes['ng-touched']).toBeTruthy();
        });
    });

    describe('formControlName', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(KbqNumberInputWithFormControlName);

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
            const fixture = createComponent(KbqNumberInputWithFormControlName);

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
    });

    describe('empty value', () => {
        it('should step up when no max', fakeAsync(() => {
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputMaxMinStep);

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
            const fixture = createComponent(KbqNumberInputMaxMinStep);

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

            const fixture = createComponent(KbqNumberInputMaxMinStepInput);

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

            const fixture = createComponent(KbqNumberInputMaxMinStepInput);

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
            const fixture = createComponent(KbqNumberInputMaxMinStepInput);

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

        it('should be able to set big-step', fakeAsync(() => {
            const fixture = createComponent(KbqNumberInputMaxMinStepInput);

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
    });

    describe('not empty value', () => {
        it('should step up when no min', fakeAsync(() => {
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputTestComponent);

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
            const fixture = createComponent(KbqNumberInputMaxMinStep);

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
            const fixture = createComponent(KbqNumberInputMaxMinStep);

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
            const fixture = createComponent(KbqNumberInputMaxMinStep);

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
            const fixture = createComponent(KbqNumberInputMaxMinStep);

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
            const fixture = createComponent(KbqNumberInputMaxMinStep);
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
            let fixture: ComponentFixture<KbqNumberInputMaxMinStepInput>;
            let inputElementDebug;
            let inputElement;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(KbqNumberInputMaxMinStepInput);
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
            const fixture = createComponent(KbqNumberInputMaxMinStep);

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
            const fixture = createComponent(KbqNumberInputMaxMinStep);

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
        let fixture: ComponentFixture<KbqNumberInputWithMask>;
        let inputElementDebug: DebugElement;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(KbqNumberInputWithMask);
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
                fixture.componentInstance.inputNumberDirective.onInput({ inputType: 'insertFromPaste' } as any);
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

            fixture.componentInstance.inputNumberDirective.onInput({ inputType: 'insertFromPaste' } as any);
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

            fixture.componentInstance.inputNumberDirective.onInput({ inputType: 'insertFromPaste' } as any);
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

            fixture.componentInstance.inputNumberDirective.onInput({ inputType: 'insertFromPaste' } as any);
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

            fixture.componentInstance.inputNumberDirective.onInput({ inputType: 'insertFromPaste' } as any);
            fixture.detectChanges();
            flush();

            expect(preventDefault).not.toHaveBeenCalled();
            expect(inputElement.value).toBe(pasteValue);
        }));
    });

    describe('with [integer]="true"', () => {
        let fixture: ComponentFixture<KbqNumberInputWithInteger>;
        let inputElementDebug: DebugElement;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(KbqNumberInputWithInteger);
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
});

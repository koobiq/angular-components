/* tslint:disable */
import { Component, DebugElement, Inject, Optional, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush } from '@angular/core/testing';
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
import { KBQ_LOCALE_SERVICE, KbqLocaleService, KbqLocaleServiceModule } from '@koobiq/components/core';
import {
    KbqFormFieldModule,
    getKbqFormFieldYouCanNotUseCleanerInNumberInputError
} from '@koobiq/components/form-field';
import { KbqInput, KbqInputModule, KbqNumberInput } from './index';

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            ReactiveFormsModule,
            FormsModule,
            KbqInputModule,
            KbqLocaleServiceModule,
            KbqFormFieldModule,
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
            <input
                [(ngModel)]="value"
                kbqInput
                type="number"
            />
            <kbq-stepper></kbq-stepper>
        </kbq-form-field>
    `
})
class KbqNumberInputTestComponent {
    value: number | null = null;
}

@Component({
    template: `
        <kbq-form-field>
            <input
                [formControl]="formControl"
                kbqInput
                type="number"
            />
            <kbq-stepper></kbq-stepper>
        </kbq-form-field>
    `
})
class KbqNumberInputWithFormControl {
    formControl = new UntypedFormControl(10);
}

@Component({
    template: `
        <form
            [formGroup]="reactiveForm"
            novalidate
        >
            <kbq-form-field>
                <input
                    kbqInput
                    formControlName="reactiveInputValue"
                    type="number"
                />
                <kbq-stepper></kbq-stepper>
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
    template: `
        <kbq-form-field>
            <input
                [(ngModel)]="value"
                kbqInput
                type="number"
                max="10"
                min="3"
                step="0.5"
                big-step="2"
            />
            <kbq-stepper></kbq-stepper>
        </kbq-form-field>
    `
})
class KbqNumberInputMaxMinStep {
    value: number | null = null;
}

@Component({
    template: `
        <kbq-form-field>
            <input
                [(ngModel)]="value"
                [max]="max"
                [min]="min"
                [step]="step"
                [bigStep]="bigStep"
                kbqInput
                type="number"
            />
            <kbq-stepper></kbq-stepper>
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
    template: `
        <kbq-form-field>
            <input
                [(ngModel)]="value"
                kbqInput
                type="number"
            />
            <kbq-cleaner></kbq-cleaner>
        </kbq-form-field>
    `
})
class KbqNumberInputWithCleaner {
    value: number = 0;
}

@Component({
    template: `
        <kbq-form-field>
            <input
                [(ngModel)]="value"
                [max]="max"
                [min]="min"
                [step]="step"
                [bigStep]="bigStep"
                [withThousandSeparator]="withMask"
                kbqInput
                type="number"
            />
            <kbq-stepper></kbq-stepper>
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

describe('KbqNumberInput', () => {
    it('should have stepper on focus', fakeAsync(() => {
        const fixture = createComponent(KbqNumberInputTestComponent);
        fixture.detectChanges();
        flush();

        const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
        const inputElement = inputElementDebug.nativeElement;

        dispatchFakeEvent(inputElement, 'focus');
        fixture.detectChanges();

        const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
        const icons = mcStepper.queryAll(By.css('.kbq-icon'));

        expect(mcStepper).not.toBeNull();
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

        const mcStepper = fixture.debugElement.query(By.css('kbq-cleaner'));

        expect(mcStepper).toBeNull();
    }));

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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.formControl.value).toBe(9);
        }));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            inputElement.value = '-';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();
            expect(fixture.componentInstance.value).toBeNull();
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
                spyOn(mockEvent, 'preventDefault');
                fixture.detectChanges();

                minuses.forEach((minus) => {
                    mockEvent.keyCode = minus;
                    inputElementDebug.triggerEventHandler('keydown', mockEvent);
                    fixture.detectChanges();
                    flush();
                });
                expect(mockEvent.preventDefault).toHaveBeenCalledTimes(minuses.length);
            }));

            /* TODO: not the full coverage since input validity change can't be emitted */
            it('should prevent negative value from being emitted for repeated minus', fakeAsync(() => {
                fixture.componentInstance.min = -5;
                const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
                const mockEvent: any = { preventDefault: () => true };
                spyOn(mockEvent, 'preventDefault');
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
                expect(mockEvent.preventDefault).toHaveBeenCalledTimes(minuses.length);
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
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

        beforeEach(fakeAsync(() => {
            fixture = createComponent(KbqNumberInputWithMask);
            fixture.componentInstance.localeService.setLocale('ru-RU');
            fixture.detectChanges();
            inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            inputElement = inputElementDebug.nativeElement;
            flush();
        }));

        it('should mask number satisfying rules', fakeAsync(() => {
            const { groupSeparator } = fixture.componentInstance.localeService.current.input.number;

            inputElement.value = '12345';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('12 345');
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTrue();
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

            expect(inputElement.value).toBe('11 145');
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTrue();
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

            expect(inputElement.value).toBe('10 234,1234');
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTrue();
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

            expect(inputElement.value).toBe('99 999,999');
            expect(previousGroupSep.some((separator) => inputElement.value.includes(separator))).toBeTrue();

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

            expect(inputElement.value).toBe('12 345,12345');
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTrue();
            expect(fixture.componentInstance.value).toBe(12345.12345);
            expect(typeof fixture.componentInstance.value).toBe('number');
        }));

        it('shoud NOT allow duplicated fractional part sign', fakeAsync(() => {
            const mockEvent: any = { preventDefault: () => true, keyCode: COMMA, key: ',' };
            spyOn(mockEvent, 'preventDefault');
            const previousValue = '0,12345';

            inputElement.value = previousValue;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            flush();

            inputElementDebug.triggerEventHandler('keydown', mockEvent);
            fixture.detectChanges();
            flush();

            expect(mockEvent.preventDefault).toHaveBeenCalled();
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
            const mcStepper = fixture.debugElement.query(By.css('kbq-stepper'));
            const icons = mcStepper.queryAll(By.css('.kbq-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(inputElement.value).toBe('10 000');
            expect(groupSeparator.some((separator) => inputElement.value.includes(separator))).toBeTrue();
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

            expect(inputElement.value).toBe('1 234 567,89');
        }));
    });
});

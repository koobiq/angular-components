import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KBQ_CHECKBOX_CLICK_ACTION } from './checkbox-config';
import { KbqCheckbox, KbqCheckboxChange, KbqCheckboxModule } from './index';

describe('KbqCheckbox', () => {
    let fixture: ComponentFixture<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqCheckboxModule, FormsModule, ReactiveFormsModule],
            declarations: [
                SingleCheckbox,
                CheckboxWithFormDirectives,
                MultipleCheckboxes,
                CheckboxWithNgModel,
                CheckboxWithTabIndex,
                CheckboxWithAriaLabel,
                CheckboxWithAriaLabelledby,
                CheckboxWithNameAttribute,
                CheckboxWithChangeEvent,
                CheckboxWithFormControl,
                CheckboxWithoutLabel,
                CheckboxUsingViewChild
            ]
        }).compileComponents();
    });

    describe('basic behaviors', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let checkboxInstance: KbqCheckbox;
        let testComponent: SingleCheckbox;
        let inputElement: HTMLInputElement;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SingleCheckbox);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            checkboxInstance = checkboxDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
            labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
        });

        it('should add and remove the checked state', () => {
            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-checked');
            expect(inputElement.checked).toBe(false);

            testComponent.isChecked = true;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('kbq-checked');
            expect(inputElement.checked).toBe(true);

            testComponent.isChecked = false;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-checked');
            expect(inputElement.checked).toBe(false);
        });

        it('should add and remove indeterminate state', () => {
            expect(checkboxNativeElement.classList).not.toContain('kbq-checked');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.getAttribute('aria-checked')).toBe('false');

            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).toContain('kbq-indeterminate');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.getAttribute('aria-checked')).toBe('mixed');

            testComponent.isIndeterminate = false;
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).not.toContain('kbq-indeterminate');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
        });

        it('should set indeterminate to false when input clicked', fakeAsync(() => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the forms module updates the model state asynchronously.
            flush();

            // The checked property has been updated from the model and now the view needs
            // to reflect the state change.
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(false);

            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);
            expect(inputElement.getAttribute('aria-checked')).toBe('true');

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the forms module updates the model state asynchronously.
            flush();

            // The checked property has been updated from the model and now the view needs
            // to reflect the state change.
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.checked).toBe(false);
            expect(testComponent.isIndeterminate).toBe(false);
        }));

        it('should not set indeterminate to false when checked is set programmatically', () => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            testComponent.isChecked = true;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            testComponent.isChecked = false;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(false);
            expect(testComponent.isIndeterminate).toBe(true);
        });

        it('should change native element checked when check programmatically', () => {
            expect(inputElement.checked).toBe(false);

            checkboxInstance.checked = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
        });

        it('should toggle checked state on click', () => {
            expect(checkboxInstance.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
        });

        it('should change from indeterminate to checked on click', fakeAsync(() => {
            testComponent.isChecked = false;
            testComponent.isIndeterminate = true;
            fixture.detectChanges();
            const inputClickEvent = new Event('inputClick');

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxInstance.indeterminate).toBe(true);

            checkboxInstance.onInputClick(inputClickEvent);

            // Flush the microtasks because the indeterminate state will be updated in the next tick.
            flush();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxInstance.indeterminate).toBe(false);

            checkboxInstance.onInputClick(inputClickEvent);
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxInstance.indeterminate).toBe(false);
        }));

        it('should add and remove disabled state', () => {
            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(true);
            expect(checkboxNativeElement.classList).toContain('kbq-disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });

        it('should not toggle `checked` state upon interaction while disabled', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            checkboxNativeElement.click();
            expect(checkboxInstance.checked).toBe(false);
        });

        it('should overwrite indeterminate state when clicked', fakeAsync(() => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the indeterminate state will be updated in the next tick.
            flush();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxInstance.indeterminate).toBe(false);
        }));

        it('should preserve the user-provided id', () => {
            expect(checkboxNativeElement.id).toBe('simple-check');
            expect(inputElement.id).toBe('simple-check-input');
        });

        it('should generate a unique id for the checkbox input if no id is set', () => {
            testComponent.checkboxId = null;
            fixture.detectChanges();

            expect(checkboxInstance.inputId).toMatch(/kbq-checkbox-\d+/);
            expect(inputElement.id).toBe(checkboxInstance.inputId);
        });

        it('should project the checkbox content into the label element', () => {
            const label = <HTMLLabelElement>checkboxNativeElement.querySelector('.kbq-checkbox-label');
            expect(label.textContent!.trim()).toBe('Simple checkbox');
        });

        it('should make the host element a tab stop', () => {
            expect(inputElement.tabIndex).toBe(0);
        });

        it('should add a css class to position the label before the checkbox', () => {
            testComponent.labelPos = 'before';
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).toContain('kbq-checkbox_label-before');
        });

        it('should not trigger the click event multiple times', () => {
            // By default, when clicking on a label element, a generated click will be dispatched
            // on the associated input element.
            // Since we're using a label element and a visual hidden input, this behavior can led
            // to an issue, where the click events on the checkbox are getting executed twice.

            const onCheckboxClickSpyFn = jest.spyOn(testComponent, 'onCheckboxClick');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-checked');

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).toContain('kbq-checked');
            expect(inputElement.checked).toBe(true);

            expect(onCheckboxClickSpyFn).toHaveBeenCalledTimes(1);
        });

        it('should trigger a change event when the native input does', fakeAsync(() => {
            const onCheckboxChangeSpyFn = jest.spyOn(testComponent, 'onCheckboxChange');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-checked');

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('kbq-checked');

            fixture.detectChanges();
            flush();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(onCheckboxChangeSpyFn).toHaveBeenCalledTimes(1);
        }));

        it('should not trigger the change event by changing the native value', fakeAsync(() => {
            const onCheckboxChangeSpyFn = jest.spyOn(testComponent, 'onCheckboxChange');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-checked');

            testComponent.isChecked = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('kbq-checked');

            fixture.detectChanges();
            flush();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(onCheckboxChangeSpyFn).not.toHaveBeenCalled();
        }));

        it('should forward the required attribute', () => {
            testComponent.isRequired = true;
            fixture.detectChanges();

            expect(inputElement.required).toBe(true);

            testComponent.isRequired = false;
            fixture.detectChanges();

            expect(inputElement.required).toBe(false);
        });

        it('should focus on underlying input element when focus() is called', () => {
            expect(document.activeElement).not.toBe(inputElement);

            checkboxInstance.focus();
            fixture.detectChanges();

            expect(document.activeElement).toBe(inputElement);
        });

        it('should forward the value to input element', () => {
            testComponent.checkboxValue = 'basic_checkbox';
            fixture.detectChanges();

            expect(inputElement.value).toBe('basic_checkbox');
        });

        describe('color behaviour', () => {
            it('should apply class based on color attribute', () => {
                testComponent.checkboxColor = 'primary';
                fixture.detectChanges();
                expect(checkboxNativeElement.classList.contains('kbq-primary')).toBe(true);

                testComponent.checkboxColor = 'accent';
                fixture.detectChanges();
                expect(checkboxNativeElement.classList.contains('kbq-accent')).toBe(true);
            });

            it('should should not clear previous defined classes', () => {
                checkboxNativeElement.classList.add('custom-class');

                testComponent.checkboxColor = 'primary';
                fixture.detectChanges();

                expect(checkboxNativeElement.classList.contains('kbq-primary')).toBe(true);
                expect(checkboxNativeElement.classList.contains('custom-class')).toBe(true);

                testComponent.checkboxColor = 'accent';
                fixture.detectChanges();

                expect(checkboxNativeElement.classList.contains('kbq-primary')).toBe(false);
                expect(checkboxNativeElement.classList.contains('kbq-accent')).toBe(true);
                expect(checkboxNativeElement.classList.contains('custom-class')).toBe(true);
            });
        });

        describe(`when KBQ_CHECKBOX_CLICK_ACTION is 'check'`, () => {
            beforeEach(() => {
                TestBed.resetTestingModule();
                TestBed.configureTestingModule({
                    imports: [KbqCheckboxModule, FormsModule, ReactiveFormsModule],
                    declarations: [
                        SingleCheckbox
                    ],
                    providers: [
                        { provide: KBQ_CHECKBOX_CLICK_ACTION, useValue: 'check' }]
                });

                fixture = TestBed.createComponent(SingleCheckbox);
                fixture.detectChanges();

                checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
                checkboxNativeElement = checkboxDebugElement.nativeElement;
                checkboxInstance = checkboxDebugElement.componentInstance;
                testComponent = fixture.debugElement.componentInstance;

                inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;
                labelElement = checkboxNativeElement.querySelector('label') as HTMLLabelElement;
            });

            it('should not set `indeterminate` to false on click if check is set', fakeAsync(() => {
                testComponent.isIndeterminate = true;
                inputElement.click();

                fixture.detectChanges();
                flush();
                fixture.detectChanges();
                expect(inputElement.checked).toBe(true);
                expect(checkboxNativeElement.classList).toContain('kbq-checked');
                expect(inputElement.indeterminate).toBe(true);
                expect(checkboxNativeElement.classList).toContain('kbq-indeterminate');
            }));
        });

        describe(`when KBQ_CHECKBOX_CLICK_ACTION is 'noop'`, () => {
            beforeEach(() => {
                TestBed.resetTestingModule();
                TestBed.configureTestingModule({
                    imports: [KbqCheckboxModule, FormsModule, ReactiveFormsModule],
                    declarations: [
                        SingleCheckbox
                    ],
                    providers: [
                        { provide: KBQ_CHECKBOX_CLICK_ACTION, useValue: 'noop' }]
                });

                fixture = TestBed.createComponent(SingleCheckbox);
                fixture.detectChanges();

                checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
                checkboxNativeElement = checkboxDebugElement.nativeElement;
                checkboxInstance = checkboxDebugElement.componentInstance;
                testComponent = fixture.debugElement.componentInstance;
                inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;
                labelElement = checkboxNativeElement.querySelector('label') as HTMLLabelElement;
            });

            it('should not change `indeterminate` on click if noop is set', fakeAsync(() => {
                testComponent.isIndeterminate = true;
                inputElement.click();

                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputElement.checked).toBe(false);
                expect(checkboxNativeElement.classList).not.toContain('kbq-checked');
                expect(inputElement.indeterminate).toBe(true);
                expect(checkboxNativeElement.classList).toContain('kbq-indeterminate');
            }));

            it(`should not change 'checked' or 'indeterminate' on click if noop is set`, fakeAsync(() => {
                testComponent.isChecked = true;
                testComponent.isIndeterminate = true;
                inputElement.click();

                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputElement.checked).toBe(true);
                expect(checkboxNativeElement.classList).toContain('kbq-checked');
                expect(inputElement.indeterminate).toBe(true);
                expect(checkboxNativeElement.classList).toContain('kbq-indeterminate');

                testComponent.isChecked = false;
                inputElement.click();

                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputElement.checked).toBe(false);
                expect(checkboxNativeElement.classList).not.toContain('kbq-checked');
                expect(inputElement.indeterminate).toBe(true);
                expect(checkboxNativeElement.classList).toContain('kbq-indeterminate');
            }));
        });
    });

    describe('with change event and no initial value', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let checkboxInstance: KbqCheckbox;
        let testComponent: CheckboxWithChangeEvent;
        let inputElement: HTMLInputElement;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithChangeEvent);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            checkboxInstance = checkboxDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
            labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
        });

        it('should emit the event to the change observable', () => {
            const changeSpy = jest.fn();

            checkboxInstance.change.subscribe(changeSpy);

            fixture.detectChanges();
            expect(changeSpy).not.toHaveBeenCalled();

            // When changing the native `checked` property the checkbox will not fire a change event,
            // because the element is not focused and it's not the native behavior of the input element.
            labelElement.click();
            fixture.detectChanges();

            expect(changeSpy).toHaveBeenCalledTimes(1);
        });

        it('should not emit a DOM event to the change output', fakeAsync(() => {
            fixture.detectChanges();
            expect(testComponent.lastEvent).toBeUndefined();

            // Trigger the click on the inputElement, because the input will probably
            // emit a DOM event to the change output.
            inputElement.click();
            fixture.detectChanges();
            flush();

            // We're checking the arguments type / emitted value to be a boolean, because sometimes the
            // emitted value can be a DOM Event, which is not valid.
            // See angular/angular#4059
            expect(testComponent.lastEvent.checked).toBe(true);
        }));
    });

    describe('with provided tabIndex', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let testComponent: CheckboxWithTabIndex;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithTabIndex);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;
            checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
        });

        it('should preserve any given tabIndex', () => {
            expect(inputElement.tabIndex).toBe(7);
        });

        it('should preserve given tabIndex when the checkbox is disabled then enabled', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            testComponent.customTabIndex = 13;
            fixture.detectChanges();

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(inputElement.tabIndex).toBe(13);
        });
    });

    describe('using ViewChild', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let testComponent: CheckboxUsingViewChild;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxUsingViewChild);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            testComponent = fixture.debugElement.componentInstance;
        });

        it('should toggle checkbox disabledness correctly', () => {
            const checkboxInstance = checkboxDebugElement.componentInstance;
            const inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(true);
            expect(checkboxNativeElement.classList).toContain('kbq-disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('kbq-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });
    });

    describe('with multiple checkboxes', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(MultipleCheckboxes);
            fixture.detectChanges();
        });

        it('should assign a unique id to each checkbox', () => {
            const [firstId, secondId] = fixture.debugElement
                .queryAll(By.directive(KbqCheckbox))
                .map((debugElement) => debugElement.nativeElement.querySelector('input').id);

            expect(firstId).toMatch(/kbq-checkbox-\d+-input/);
            expect(secondId).toMatch(/kbq-checkbox-\d+-input/);
            expect(firstId).not.toEqual(secondId);
        });
    });

    describe('with ngModel', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let checkboxInstance: KbqCheckbox;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithFormDirectives);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            checkboxInstance = checkboxDebugElement.componentInstance;
            inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
        });

        it('should be in pristine, untouched, and valid states initially', fakeAsync(() => {
            flush();

            const checkboxElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            const ngModel = checkboxElement.injector.get<NgModel>(NgModel);

            expect(ngModel.valid).toBe(true);
            expect(ngModel.pristine).toBe(true);
            expect(ngModel.touched).toBe(false);

            // TODO(jelbourn): test that `touched` and `pristine` state are modified appropriately.
            // This is currently blocked on issues with async() and fakeAsync().
        }));

        it('should toggle checked state on click', () => {
            expect(checkboxInstance.checked).toBe(false);

            inputElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
        });
    });

    describe('with required ngModel', () => {
        let checkboxInstance: KbqCheckbox;
        let inputElement: HTMLInputElement;
        let testComponent: CheckboxWithNgModel;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithNgModel);
            fixture.detectChanges();

            const checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            const checkboxNativeElement = checkboxDebugElement.nativeElement;
            testComponent = fixture.debugElement.componentInstance;
            checkboxInstance = checkboxDebugElement.componentInstance;
            inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
        });

        it('should validate with RequiredTrue validator', () => {
            const checkboxElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            const ngModel = checkboxElement.injector.get<NgModel>(NgModel);

            testComponent.isRequired = true;
            inputElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(ngModel.valid).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(ngModel.valid).toBe(false);
        });
    });

    describe('with name attribute', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithNameAttribute);
            fixture.detectChanges();
        });

        it('should forward name value to input element', () => {
            const checkboxElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            const inputElement = <HTMLInputElement>checkboxElement.nativeElement.querySelector('input');

            expect(inputElement.getAttribute('name')).toBe('test-name');
        });
    });

    describe('with form control', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxInstance: KbqCheckbox;
        let testComponent: CheckboxWithFormControl;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithFormControl);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(KbqCheckbox));
            checkboxInstance = checkboxDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement>checkboxDebugElement.nativeElement.querySelector('input');
        });

        it('should toggle the disabled state', () => {
            expect(checkboxInstance.disabled).toBe(false);

            testComponent.formControl.disable();
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(true);
            expect(inputElement.disabled).toBe(true);

            testComponent.formControl.enable();
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(false);
            expect(inputElement.disabled).toBe(false);
        });
    });

    describe('without label', () => {
        let testComponent: CheckboxWithoutLabel;
        let checkboxInnerContainer: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithoutLabel);

            const checkboxDebugEl = fixture.debugElement.query(By.directive(KbqCheckbox));

            testComponent = fixture.componentInstance;
            checkboxInnerContainer = checkboxDebugEl.query(By.css('.kbq-checkbox__inner-container')).nativeElement;
        });

        it('should remove margin for checkbox without a label', () => {
            fixture.detectChanges();

            expect(checkboxInnerContainer.classList).toContain('kbq-checkbox__inner-container_no-side-margin');
        });

        it('should not remove margin if initial label is set through binding', () => {
            testComponent.label = 'Some content';
            fixture.detectChanges();

            expect(checkboxInnerContainer.classList).not.toContain('kbq-checkbox__inner-container_no-side-margin');
        });

        it('should not add the "name" attribute if it is not passed in', () => {
            fixture.detectChanges();
            expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('name')).toBe(false);
        });

        it('should not add the "value" attribute if it is not passed in', () => {
            fixture.detectChanges();
            expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('value')).toBe(false);
        });
    });
});

/** Simple component for testing a single checkbox. */
@Component({
    template: `
        <div
            (click)="parentElementClicked = true"
            (keyup)="parentElementKeyedUp = true"
        >
            <kbq-checkbox
                [(indeterminate)]="isIndeterminate"
                [id]="checkboxId"
                [required]="isRequired"
                [labelPosition]="labelPos"
                [checked]="isChecked"
                [disabled]="isDisabled"
                [color]="checkboxColor"
                [value]="checkboxValue"
                (click)="onCheckboxClick($event)"
                (change)="onCheckboxChange($event)"
            >
                Simple checkbox
            </kbq-checkbox>
        </div>
    `
})
class SingleCheckbox {
    labelPos: 'before' | 'after' = 'after';
    isChecked: boolean = false;
    isRequired: boolean = false;
    isIndeterminate: boolean = false;
    isDisabled: boolean = false;
    parentElementClicked: boolean = false;
    parentElementKeyedUp: boolean = false;
    checkboxId: string | null = 'simple-check';
    checkboxColor: string = 'primary';
    checkboxValue: string = 'single_checkbox';

    onCheckboxClick: (event?: Event) => void = () => {};
    onCheckboxChange: (event?: KbqCheckboxChange) => void = () => {};
}

/** Simple component for testing an KbqCheckbox with ngModel in a form. */
@Component({
    template: `
        <form>
            <kbq-checkbox
                [(ngModel)]="isGood"
                name="cb"
            >
                Be good
            </kbq-checkbox>
        </form>
    `
})
class CheckboxWithFormDirectives {
    isGood: boolean = false;
}

/** Simple component for testing an KbqCheckbox with required ngModel. */
@Component({
    template: `
        <kbq-checkbox
            [(ngModel)]="isGood"
            [required]="isRequired"
        >
            Be good
        </kbq-checkbox>
    `
})
class CheckboxWithNgModel {
    isGood: boolean = false;
    isRequired: boolean = true;
}

/** Simple test component with multiple checkboxes. */
@Component({
    template: `
        <kbq-checkbox>Option 1</kbq-checkbox>
        <kbq-checkbox>Option 2</kbq-checkbox>
    `
})
class MultipleCheckboxes {}

/** Simple test component with tabIndex */
@Component({
    template: `
        <kbq-checkbox
            [tabIndex]="customTabIndex"
            [disabled]="isDisabled"
        />
    `
})
class CheckboxWithTabIndex {
    customTabIndex: number = 7;
    isDisabled: boolean = false;
}

/** Simple test component that accesses KbqCheckbox using ViewChild. */
@Component({
    template: `
        <kbq-checkbox />
    `
})
class CheckboxUsingViewChild {
    @ViewChild(KbqCheckbox, { static: false }) checkbox;

    set isDisabled(value: boolean) {
        this.checkbox.disabled = value;
    }
}

/** Simple test component with an aria-label set. */
@Component({
    template: `
        <kbq-checkbox aria-label="Super effective" />
    `
})
class CheckboxWithAriaLabel {}

/** Simple test component with an aria-label set. */
@Component({
    template: `
        <kbq-checkbox aria-labelledby="some-id" />
    `
})
class CheckboxWithAriaLabelledby {}

/** Simple test component with name attribute */
@Component({
    template: `
        <kbq-checkbox name="test-name" />
    `
})
class CheckboxWithNameAttribute {}

/** Simple test component with change event */
@Component({
    template: `
        <kbq-checkbox (change)="lastEvent = $event" />
    `
})
class CheckboxWithChangeEvent {
    lastEvent: KbqCheckboxChange;
}

/** Test component with reactive forms */
@Component({
    template: `
        <kbq-checkbox [formControl]="formControl" />
    `
})
class CheckboxWithFormControl {
    formControl = new UntypedFormControl();
}

/** Test component without label */
@Component({
    template: `
        <kbq-checkbox>{{ label }}</kbq-checkbox>
    `
})
class CheckboxWithoutLabel {
    label: string;
}

import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, DebugElement, effect, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KBQ_CHECKBOX_CLICK_ACTION } from '@koobiq/components/checkbox';
import { KBQ_ANIMATIONS_CONFIG, KBQ_CHECKABLE_CLICK_ACTION, KbqCheckedState } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleClickAction, KbqToggleComponent, KbqToggleModule } from './index';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

describe('KbqToggle', () => {
    describe('basic behaviors', () => {
        let fixture: ComponentFixture<SingleToggle>;
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let toggleInstance: KbqToggleComponent;
        let testComponent: SingleToggle;
        let inputElement: HTMLInputElement;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            fixture = createComponent(SingleToggle);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            toggleInstance = toggleDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');
            labelElement = <HTMLLabelElement>toggleNativeElement.querySelector('label');
        });

        it('should add and remove the checked state', () => {
            expect(toggleInstance.checked).toBe(false);
            expect(inputElement.checked).toBe(false);

            testComponent.value = true;

            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(true);
            expect(inputElement.checked).toBe(true);

            testComponent.value = false;
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(false);
            expect(inputElement.checked).toBe(false);
        });

        it('should change native element checked when check programmatically', () => {
            expect(inputElement.checked).toBe(false);

            toggleInstance.checked = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
        });

        it('should toggle checked state on click', () => {
            expect(toggleInstance.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(true);

            labelElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(false);
        });

        it('should add and remove disabled state', () => {
            expect(toggleInstance.disabled).toBe(false);
            expect(toggleNativeElement.classList).not.toContain('kbq-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(true);
            expect(toggleNativeElement.classList).toContain('kbq-disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(false);
            expect(toggleNativeElement.classList).not.toContain('kbq-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });

        it('should not toggle `checked` state upon interaction while disabled', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            const onToggleChangeSpyFn = vi.spyOn(testComponent, 'onToggleChange');

            // A real browser never dispatches a click on a disabled control, so it has to be dispatched
            // manually to reach the handler that must decline it.
            inputElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(false);
            expect(onToggleChangeSpyFn).not.toHaveBeenCalled();
        });

        it('should preserve the user-provided id', () => {
            expect(toggleNativeElement.id).toBe('simple-check');
            expect(inputElement.id).toBe('simple-check-input');
        });

        it('should generate a unique id for the toggle input if no id is set', () => {
            testComponent.toggleId = '';
            fixture.detectChanges();

            expect(toggleInstance.inputId).toMatch(/kbq-toggle-\d+-input/);
            expect(inputElement.id).toBe(toggleInstance.inputId);
            expect(toggleNativeElement.id).toBe(toggleInstance.inputId.replace(/-input$/, ''));
        });

        it('should fall back to the generated id when the bound id turns undefined', () => {
            testComponent.toggleId = undefined;
            fixture.detectChanges();

            expect(toggleNativeElement.id).toMatch(/^kbq-toggle-\d+$/);
            expect(inputElement.id).toBe(`${toggleNativeElement.id}-input`);
        });

        it('should add a css class when big is set', () => {
            expect(toggleNativeElement.classList).not.toContain('kbq-toggle_big');

            testComponent.big = true;
            fixture.detectChanges();

            expect(toggleNativeElement.classList).toContain('kbq-toggle_big');
        });

        it('should project the toggle content into the label element', () => {
            const label = <HTMLLabelElement>toggleNativeElement.querySelector('.kbq-toggle-label');

            expect(label.textContent!.trim()).toBe('Simple toggle');
        });

        it('should make the host element a tab stop', () => {
            expect(inputElement.tabIndex).toBe(0);
        });

        it('should add a css class to position the label before the toggle', () => {
            testComponent.labelPos = 'left';
            fixture.detectChanges();

            expect(toggleNativeElement.querySelector('.kbq-toggle-layout_left')).not.toBeNull();
        });

        it('should not add the label position css class when the label is on the right', () => {
            testComponent.labelPos = 'right';
            fixture.detectChanges();

            expect(toggleNativeElement.querySelector('.kbq-toggle-layout_left')).toBeNull();
            expect(toggleNativeElement.querySelector('.kbq-toggle__content_right')).not.toBeNull();
        });

        it('should not trigger the click event multiple times', () => {
            const onToggleClickSpyFn = vi.spyOn(testComponent, 'onToggleClick');

            expect(inputElement.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            expect(onToggleClickSpyFn).toHaveBeenCalledTimes(1);
            expect(testComponent.parentElementClickCount).toBe(1);
        });

        it('should trigger a change event when the native input does', async () => {
            const onToggleChangeSpyFn = vi.spyOn(testComponent, 'onToggleChange');

            expect(inputElement.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            fixture.detectChanges();
            await fixture.whenStable();

            expect(onToggleChangeSpyFn).toHaveBeenCalledTimes(1);
        });

        it('should not trigger the change event by changing the native value', async () => {
            const onToggleChangeSpyFn = vi.spyOn(testComponent, 'onToggleChange');

            expect(inputElement.checked).toBe(false);

            testComponent.value = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            fixture.detectChanges();
            await fixture.whenStable();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(onToggleChangeSpyFn).not.toHaveBeenCalled();
        });

        it('should focus on underlying input element when focus() is called', () => {
            expect(document.activeElement).not.toBe(inputElement);

            toggleInstance.focus();
            fixture.detectChanges();

            expect(document.activeElement).toBe(inputElement);
        });

        describe('color behaviour', () => {
            it('should apply class based on color attribute', () => {
                testComponent.toggleColor = 'primary';
                fixture.detectChanges();
                expect(toggleNativeElement.classList.contains('kbq-primary')).toBe(true);

                testComponent.toggleColor = 'accent';
                fixture.detectChanges();
                expect(toggleNativeElement.classList.contains('kbq-accent')).toBe(true);
            });

            it('should should not clear previous defined classes', () => {
                toggleNativeElement.classList.add('custom-class');

                testComponent.toggleColor = 'primary';
                fixture.detectChanges();

                expect(toggleNativeElement.classList.contains('kbq-primary')).toBe(true);
                expect(toggleNativeElement.classList.contains('custom-class')).toBe(true);

                testComponent.toggleColor = 'accent';
                fixture.detectChanges();

                expect(toggleNativeElement.classList.contains('kbq-primary')).toBe(false);
                expect(toggleNativeElement.classList.contains('kbq-accent')).toBe(true);
                expect(toggleNativeElement.classList.contains('custom-class')).toBe(true);
            });
        });
    });

    describe('aria-label ', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let inputElement: HTMLInputElement;
        let fixture: ComponentFixture<ToggleWithAriaLabel>;

        it('should use the provided aria-label', () => {
            fixture = createComponent(ToggleWithAriaLabel);
            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-label')).toBe('Super effective');
        });

        it('should not set the aria-label attribute if no value is provided', () => {
            fixture = createComponent(SingleToggle);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-label')).toBe(false);
        });
    });

    describe('with provided aria-labelledby ', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let inputElement: HTMLInputElement;
        let fixture: ComponentFixture<ToggleWithAriaLabelledby | SingleToggle>;

        it('should use the provided aria-labelledby', () => {
            fixture = createComponent(ToggleWithAriaLabelledby);
            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
        });

        it('should not assign aria-labelledby if none is provided', () => {
            fixture = createComponent(SingleToggle);
            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-labelledby')).toBe(null);
        });
    });

    describe('with provided tabIndex', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let testComponent: ToggleWithTabIndex;
        let inputElement: HTMLInputElement;
        let fixture: ComponentFixture<ToggleWithTabIndex>;

        beforeEach(() => {
            fixture = createComponent(ToggleWithTabIndex);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;
            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');
        });

        it('should preserve any given tabIndex', () => {
            expect(inputElement.tabIndex).toBe(7);
        });

        it('should preserve given tabIndex when the toggle is disabled then enabled', () => {
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
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let testComponent: ToggleUsingViewChild;
        let fixture: ComponentFixture<ToggleUsingViewChild>;

        beforeEach(() => {
            fixture = createComponent(ToggleUsingViewChild);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            testComponent = fixture.debugElement.componentInstance;
        });

        it('should toggle disabledness correctly', () => {
            const toggleInstance = toggleDebugElement.componentInstance;
            const inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');

            expect(toggleInstance.disabled).toBe(false);
            expect(toggleNativeElement.classList).not.toContain('kbq-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(true);
            expect(toggleNativeElement.classList).toContain('kbq-disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(false);
            expect(toggleNativeElement.classList).not.toContain('kbq-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });
    });

    describe('with multiple toggles', () => {
        let fixture: ComponentFixture<MultipleToggles>;

        beforeEach(() => {
            fixture = createComponent(MultipleToggles);
            fixture.detectChanges();
        });

        it('should assign a unique id to each toggle', () => {
            const [firstId, secondId] = fixture.debugElement
                .queryAll(By.directive(KbqToggleComponent))
                .map((debugElement) => debugElement.nativeElement.querySelector('input').id);

            expect(firstId).toMatch(/kbq-toggle-\d+-input/);
            expect(secondId).toMatch(/kbq-toggle-\d+-input/);
            expect(firstId).not.toEqual(secondId);
        });
    });

    describe('with ngModel', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let toggleInstance: KbqToggleComponent;
        let inputElement: HTMLInputElement;
        let fixture: ComponentFixture<ToggleWithFormDirectives>;

        beforeEach(() => {
            fixture = createComponent(ToggleWithFormDirectives);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            toggleInstance = toggleDebugElement.componentInstance;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');
        });

        it('should be in pristine, untouched, and valid states initially', async () => {
            await fixture.whenStable();

            const toggleElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            const ngModel = toggleElement.injector.get<NgModel>(NgModel);

            expect(ngModel.valid).toBe(true);
            expect(ngModel.pristine).toBe(true);
            expect(ngModel.touched).toBe(false);
        });

        it('should toggle checked state on click', () => {
            expect(toggleInstance.checked).toBe(false);

            inputElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(false);
        });
    });

    describe('with name attribute', () => {
        let fixture: ComponentFixture<ToggleWithNameAttribute>;

        beforeEach(() => {
            fixture = createComponent(ToggleWithNameAttribute);
            fixture.detectChanges();
        });

        it('should forward name value to input element', () => {
            const toggleElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            const inputElement = <HTMLInputElement>toggleElement.nativeElement.querySelector('input');

            expect(inputElement.getAttribute('name')).toBe('test-name');
        });
    });

    describe('with form control', () => {
        let toggleDebugElement: DebugElement;
        let toggleInstance: KbqToggleComponent;
        let testComponent: ToggleWithFormControl;
        let inputElement: HTMLInputElement;
        let fixture: ComponentFixture<ToggleWithFormControl>;

        beforeEach(() => {
            fixture = createComponent(ToggleWithFormControl);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleInstance = toggleDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement>toggleDebugElement.nativeElement.querySelector('input');
        });

        it('should toggle the disabled state', () => {
            expect(toggleInstance.disabled).toBe(false);

            testComponent.formControl.disable();
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(true);
            expect(inputElement.disabled).toBe(true);

            testComponent.formControl.enable();
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(false);
            expect(inputElement.disabled).toBe(false);
        });
    });

    describe('without label', () => {
        let toggleInnerContainer: HTMLElement;
        let fixture: ComponentFixture<ToggleWithoutLabel>;

        beforeEach(() => {
            fixture = createComponent(ToggleWithoutLabel);

            const toggleDebugEl = fixture.debugElement.query(By.directive(KbqToggleComponent));

            toggleInnerContainer = toggleDebugEl.query(By.css('.kbq-toggle-layout')).nativeElement;
        });

        it('should not add the "name" attribute if it is not passed in', () => {
            fixture.detectChanges();
            expect(toggleInnerContainer.querySelector('input')!.hasAttribute('name')).toBe(false);
        });

        it('should not add the "value" attribute if it is not passed in', () => {
            fixture.detectChanges();
            expect(toggleInnerContainer.querySelector('input')!.hasAttribute('value')).toBe(false);
        });
    });

    describe('with indeterminate state', () => {
        it('should not have kbq-indeterminate class initially', () => {
            const { debugElement } = createComponent(SingleToggle);

            expect(debugElement.query(By.directive(KbqToggleComponent)).classes['kbq-indeterminate']).toBeUndefined();
        });

        it('should add kbq-indeterminate class when indeterminate is true', () => {
            const fixture = createComponent(SingleToggle);

            fixture.componentInstance.indeterminate = true;
            fixture.detectChanges();

            expect(
                fixture.debugElement.query(By.directive(KbqToggleComponent)).classes['kbq-indeterminate']
            ).toBeDefined();
        });

        it('should change aria-checked attr on inner input when indeterminate is true', () => {
            const fixture = createComponent(SingleToggle);
            const innerInput = fixture.debugElement.query(By.css('.kbq-toggle-input'));

            expect(innerInput.attributes['aria-checked']).toBe('false' satisfies KbqCheckedState);
            fixture.componentInstance.indeterminate = true;
            fixture.detectChanges();

            expect(innerInput.attributes['aria-checked']).toBe('mixed' satisfies KbqCheckedState);
        });

        it('should change from indeterminate to checked on input click', async () => {
            const fixture = createComponent(SingleToggle);
            const innerInput: DebugElement = fixture.debugElement.query(By.css('.kbq-toggle-input'));

            fixture.componentInstance.indeterminate = true;
            fixture.detectChanges();
            expect(innerInput.attributes['aria-checked']).toBe('mixed' satisfies KbqCheckedState);

            innerInput.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenRenderingDone();
            await fixture.whenStable();

            expect(fixture.componentInstance.toggle().checked).toBe(true);
            expect(fixture.componentInstance.toggle().indeterminate).toBe(false);
            expect(innerInput.attributes['aria-checked']).toBe('true' satisfies KbqCheckedState);
        });

        it('should emit indeterminateChange on input click', async () => {
            const fixture = createComponent(SingleToggle);
            const innerInput: DebugElement = fixture.debugElement.query(By.css('.kbq-toggle-input'));
            const emitted: boolean[] = [];

            fixture.componentInstance.indeterminate = true;
            fixture.detectChanges();

            fixture.componentInstance.toggle().indeterminateChange.subscribe((value) => emitted.push(value));

            innerInput.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(emitted).toEqual([false]);
        });

        it('should fall back to the native checkbox role while indeterminate', () => {
            const fixture = createComponent(SingleToggle);
            const innerInput: HTMLInputElement = fixture.nativeElement.querySelector('.kbq-toggle-input');

            expect(innerInput.getAttribute('role')).toBe('switch');

            fixture.componentInstance.indeterminate = true;
            fixture.detectChanges();

            // `aria-checked="mixed"` is not a supported value for `role="switch"`.
            expect(innerInput.hasAttribute('role')).toBe(false);
            expect(innerInput.getAttribute('aria-checked')).toBe('mixed' satisfies KbqCheckedState);

            fixture.componentInstance.indeterminate = false;
            fixture.detectChanges();

            expect(innerInput.getAttribute('role')).toBe('switch');
            expect(innerInput.getAttribute('aria-checked')).toBe('false' satisfies KbqCheckedState);
        });
    });

    describe('with static boolean attributes', () => {
        it('should coerce the bare `disabled` and `checked` attributes', () => {
            const fixture = createComponent(ToggleWithStaticAttributes);
            const toggleElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            const inputElement: HTMLInputElement = toggleElement.nativeElement.querySelector('input');

            fixture.detectChanges();

            expect(toggleElement.componentInstance.disabled).toBe(true);
            expect(toggleElement.componentInstance.checked).toBe(true);
            expect(inputElement.disabled).toBe(true);
            expect(inputElement.checked).toBe(true);
            expect(toggleElement.nativeElement.classList).toContain('kbq-disabled');
            expect(toggleElement.nativeElement.classList).toContain('kbq-active');
        });
    });

    describe('with click action tokens', () => {
        const clickLabel = (fixture: ComponentFixture<unknown>): void => {
            fixture.nativeElement.querySelector('label').click();
            fixture.detectChanges();
        };

        it('should respect KBQ_CHECKABLE_CLICK_ACTION provided above the toggle', () => {
            const fixture = createComponent(SingleToggle, [
                { provide: KBQ_CHECKABLE_CLICK_ACTION, useValue: 'noop' }
            ]);

            clickLabel(fixture);

            expect(fixture.componentInstance.toggle().checked).toBe(false);
        });

        it('should prefer KBQ_CHECKABLE_CLICK_ACTION over the legacy KBQ_CHECKBOX_CLICK_ACTION', () => {
            const fixture = createComponent(SingleToggle, [
                { provide: KBQ_CHECKABLE_CLICK_ACTION, useValue: 'noop' },
                { provide: KBQ_CHECKBOX_CLICK_ACTION, useValue: 'check-indeterminate' }
            ]);

            clickLabel(fixture);

            expect(fixture.componentInstance.toggle().checked).toBe(false);
        });

        it('should fall back to the legacy KBQ_CHECKBOX_CLICK_ACTION', () => {
            const fixture = createComponent(SingleToggle, [
                { provide: KBQ_CHECKBOX_CLICK_ACTION, useValue: 'noop' }
            ]);

            clickLabel(fixture);

            expect(fixture.componentInstance.toggle().checked).toBe(false);
        });

        it('should use clickAction input value instead of token when explicitly set', () => {
            const fixture = createComponent(SingleToggle, [
                { provide: KBQ_CHECKBOX_CLICK_ACTION, useValue: 'noop' }
            ]);
            const toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            const toggleInstance: KbqToggleComponent = toggleDebugElement.componentInstance;
            const inputElement = toggleDebugElement.nativeElement.querySelector('input') as HTMLInputElement;

            expect(toggleInstance.checked).toBe(false);
            expect(toggleInstance.indeterminate).toBe(false);

            toggleInstance.clickAction = 'check-indeterminate';
            fixture.detectChanges();

            inputElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(true);
            expect(toggleInstance.indeterminate).toBe(false);

            inputElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(false);
            expect(toggleInstance.indeterminate).toBe(false);
        });

        it('should fall back to the default action when the bound clickAction turns undefined', () => {
            const fixture = createComponent(ToggleWithClickAction);

            fixture.detectChanges();

            fixture.componentInstance.clickAction = undefined;
            fixture.detectChanges();

            clickLabel(fixture);

            expect(fixture.componentInstance.toggle().checked).toBe(true);
        });

        it('should not restore the token action when the bound clickAction turns undefined', () => {
            const fixture = createComponent(ToggleWithClickAction, [
                { provide: KBQ_CHECKABLE_CLICK_ACTION, useValue: 'noop' }
            ]);

            fixture.componentInstance.clickAction = 'check';
            fixture.detectChanges();

            fixture.componentInstance.clickAction = undefined;
            fixture.detectChanges();

            clickLabel(fixture);

            expect(fixture.componentInstance.toggle().checked).toBe(true);
        });
    });

    describe('with loading state', () => {
        let fixture: ComponentFixture<LoadingToggle>;
        let toggleElement: DebugElement;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(LoadingToggle);
            toggleElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            inputElement = toggleElement.nativeElement.querySelector('input');

            fixture.componentInstance.loading = true;
            fixture.detectChanges();
        });

        it('should set css-class on toggle when loading=true', () => {
            expect(toggleElement.classes['kbq-toggle_loading']).toBeTruthy();
            expect(toggleElement.classes['kbq-disabled']).toBeTruthy();
        });

        it('should report itself as busy and disabled without disabling the native input', () => {
            expect(inputElement.getAttribute('aria-busy')).toBe('true');
            expect(inputElement.getAttribute('aria-disabled')).toBe('true');
            expect(inputElement.disabled).toBe(false);
            expect(inputElement.tabIndex).toBe(0);
        });

        it('should not expose aria-busy or aria-disabled when idle', () => {
            fixture.componentInstance.loading = false;
            fixture.detectChanges();

            expect(inputElement.hasAttribute('aria-busy')).toBe(false);
            expect(inputElement.hasAttribute('aria-disabled')).toBe(false);
        });

        it('should ignore a click, keep the native input in sync and not bubble the click twice', () => {
            const onToggleClickSpyFn = vi.spyOn(fixture.componentInstance, 'onToggleClick');

            fixture.nativeElement.querySelector('label').click();
            fixture.detectChanges();

            expect(onToggleClickSpyFn).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.toggle().checked).toBe(false);
            expect(inputElement.checked).toBe(false);
        });
    });

    describe('with a projected hint', () => {
        it('should describe the input with the hint instead of naming it', () => {
            const fixture = createComponent(ToggleWithHint);
            const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
            const hintContainer: HTMLElement = fixture.nativeElement.querySelector('.kbq-toggle__hint');

            expect(hintContainer.id).toBeTruthy();
            expect(inputElement.getAttribute('aria-describedby')).toBe(hintContainer.id);
            // Hidden from the accessible name computed from the enclosing label.
            expect(hintContainer.getAttribute('aria-hidden')).toBe('true');
            expect(hintContainer.textContent).toContain('Hint text');
        });
    });

    describe('with keyboard interaction', () => {
        it('should toggle on enter without submitting the enclosing form', () => {
            const fixture = createComponent(ToggleInsideForm);
            const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

            inputElement.dispatchEvent(event);
            fixture.detectChanges();

            expect(fixture.componentInstance.toggle().checked).toBe(true);
            // Without `preventDefault` the same keystroke also submits the enclosing form.
            expect(event.defaultPrevented).toBe(true);
        });
    });

    describe('with touched state', () => {
        it('should mark the control as touched once focus leaves it, without changing its value', async () => {
            const fixture = createComponent(ToggleWithFormDirectives);

            fixture.detectChanges();
            await fixture.whenStable();

            const toggleElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            const ngModel = toggleElement.injector.get<NgModel>(NgModel);
            const inputElement: HTMLInputElement = toggleElement.nativeElement.querySelector('input');

            expect(ngModel.touched).toBe(false);

            TestBed.inject(FocusMonitor).focusVia(inputElement, 'keyboard');
            fixture.detectChanges();
            await fixture.whenStable();

            // A `required` error must not show while the control is only focused.
            expect(ngModel.touched).toBe(false);

            inputElement.blur();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(ngModel.touched).toBe(true);
            expect(fixture.componentInstance.isGood).toBe(false);
        });
    });

    describe('with animations disabled', () => {
        it('should take the motion off the switch', () => {
            const fixture = createComponent(SingleToggle, [
                { provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } }
            ]);

            fixture.detectChanges();

            const animated: HTMLElement[] = Array.from(
                fixture.nativeElement.querySelectorAll('.kbq-toggle-bar, .kbq-toggle__circle, .kbq-toggle__thumb')
            );

            expect(animated.length).toBe(3);
            animated.forEach((element) => expect(element.classList).toContain('kbq-animations-disabled'));
        });
    });

    describe('called from an effect', () => {
        let fixture: ComponentFixture<ToggleDrivenByEffect>;
        let host: ToggleDrivenByEffect;
        let input: HTMLInputElement;

        beforeEach(async () => {
            fixture = createComponent(ToggleDrivenByEffect);
            host = fixture.componentInstance;
            await fixture.whenStable();
            input = fixture.nativeElement.querySelector('input');
        });

        it('should not make an effect that checks it re-run when it is clicked', async () => {
            host.action.set('checked');
            await fixture.whenStable();

            expect(host.toggle().checked).toBe(true);

            input.click();
            await fixture.whenStable();

            expect(host.toggle().checked).toBe(false);
            expect(host.runs).toBe(1);
        });

        it('should not make an effect that sets indeterminate re-run when it is clicked', async () => {
            host.action.set('indeterminate');
            await fixture.whenStable();

            expect(host.toggle().indeterminate).toBe(true);

            input.click();
            await fixture.whenStable();

            expect(host.toggle().indeterminate).toBe(false);
            expect(host.runs).toBe(1);
        });
    });
});

/** Caps the runs of an effect that would otherwise loop, so that a regression fails instead of hanging. */
const EFFECT_RUN_LIMIT = 10;

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle>Driven by an effect</kbq-toggle>
    `
})
class ToggleDrivenByEffect {
    readonly toggle = viewChild.required(KbqToggleComponent);
    readonly action = signal<'checked' | 'indeterminate' | null>(null);
    runs = 0;

    constructor() {
        effect(() => {
            const action = this.action();

            if (!action || this.runs === EFFECT_RUN_LIMIT) return;

            this.runs++;

            if (action === 'checked') {
                this.toggle().checked = true;
            } else {
                this.toggle().indeterminate = true;
            }
        });
    }
}

@Component({
    imports: [
        KbqToggleModule
    ],
    template: `
        <kbq-toggle
            [checked]="value"
            [loading]="loading"
            (click)="onToggleClick($event)"
            (change)="onToggleChange($event)"
        >
            Loading toggle
        </kbq-toggle>
    `
})
class LoadingToggle {
    value: boolean = false;
    loading: boolean = false;

    readonly toggle = viewChild.required(KbqToggleComponent);

    onToggleClick: (event?: Event) => void = () => {};
    onToggleChange: (event?: any) => void = () => {};
}

@Component({
    imports: [
        KbqToggleModule
    ],
    template: `
        <div (click)="parentElementClickCount = parentElementClickCount + 1">
            <kbq-toggle
                [id]="toggleId"
                [labelPosition]="labelPos"
                [checked]="value"
                [disabled]="isDisabled"
                [color]="toggleColor"
                [indeterminate]="indeterminate"
                [big]="big"
                (click)="onToggleClick($event)"
                (change)="onToggleChange($event)"
            >
                Simple toggle
            </kbq-toggle>
        </div>
    `
})
class SingleToggle {
    labelPos: 'left' | 'right' = 'left';
    value: boolean = false;
    isDisabled: boolean = false;
    big: boolean = false;
    parentElementClickCount: number = 0;
    toggleId: string | undefined = 'simple-check';
    toggleColor: string = 'primary';
    indeterminate = false;

    readonly toggle = viewChild.required(KbqToggleComponent);

    onToggleClick: (event?: Event) => void = () => {};
    onToggleChange: (event?: any) => void = () => {};
}

@Component({
    imports: [
        KbqToggleModule
    ],
    template: `
        <kbq-toggle [clickAction]="clickAction">Toggle</kbq-toggle>
    `
})
class ToggleWithClickAction {
    clickAction: KbqToggleClickAction = 'noop';

    readonly toggle = viewChild.required(KbqToggleComponent);
}

@Component({
    imports: [
        KbqToggleModule,
        FormsModule
    ],
    template: `
        <form>
            <kbq-toggle name="cb" [(ngModel)]="isGood">Be good</kbq-toggle>
        </form>
    `
})
class ToggleWithFormDirectives {
    isGood: boolean = false;
}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle>Option 1</kbq-toggle>
        <kbq-toggle>Option 2</kbq-toggle>
    `
})
class MultipleToggles {}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [tabIndex]="customTabIndex" [disabled]="isDisabled" />
    `
})
class ToggleWithTabIndex {
    customTabIndex: number = 7;
    isDisabled: boolean = false;
}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle />
    `
})
class ToggleUsingViewChild {
    readonly toggle = viewChild.required(KbqToggleComponent);

    set isDisabled(value: boolean) {
        this.toggle().disabled = value;
    }
}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle aria-label="Super effective" />
    `
})
class ToggleWithAriaLabel {}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle aria-labelledby="some-id" />
    `
})
class ToggleWithAriaLabelledby {}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle name="test-name" />
    `
})
class ToggleWithNameAttribute {}

@Component({
    imports: [KbqToggleModule, ReactiveFormsModule],
    template: `
        <kbq-toggle [formControl]="formControl" />
    `
})
class ToggleWithFormControl {
    formControl = new UntypedFormControl();
}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle>{{ label }}</kbq-toggle>
    `
})
class ToggleWithoutLabel {
    label: string;
}

@Component({
    imports: [KbqToggleModule, KbqFormFieldModule],
    template: `
        <kbq-toggle>
            Label text
            <kbq-hint>Hint text</kbq-hint>
        </kbq-toggle>
    `
})
class ToggleWithHint {}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle disabled checked />
    `
})
class ToggleWithStaticAttributes {}

@Component({
    imports: [KbqToggleModule],
    template: `
        <form>
            <kbq-toggle />
        </form>
    `
})
class ToggleInsideForm {
    readonly toggle = viewChild.required(KbqToggleComponent);
}

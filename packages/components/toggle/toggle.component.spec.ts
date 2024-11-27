import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqToggleComponent, KbqToggleModule } from './index';

describe('KbqToggle', () => {
    let fixture: ComponentFixture<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                KbqToggleModule,
                FormsModule,
                ReactiveFormsModule
            ],
            declarations: [
                SingleToggle,
                ToggleWithFormDirectives,
                MultipleToggles,
                ToggleWithTabIndex,
                ToggleWithAriaLabel,
                ToggleWithAriaLabelledby,
                ToggleWithNameAttribute,
                ToggleWithFormControl,
                ToggleWithoutLabel,
                ToggleUsingViewChild
            ]
        }).compileComponents();
    });

    describe('basic behaviors', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let toggleInstance: KbqToggleComponent;
        let testComponent: SingleToggle;
        let inputElement: HTMLInputElement;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SingleToggle);
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

            toggleNativeElement.click();
            expect(toggleInstance.checked).toBe(false);
        });

        it('should preserve the user-provided id', () => {
            expect(toggleNativeElement.id).toBe('simple-check');
            expect(inputElement.id).toBe('simple-check-input');
        });

        it('should generate a unique id for the toggle input if no id is set', () => {
            testComponent.toggleId = null;
            fixture.detectChanges();

            expect(toggleInstance.inputId).toMatch(/kbq-toggle-\d+/);
            expect(inputElement.id).toBe(toggleInstance.inputId);
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

            expect(toggleNativeElement.querySelector('.left')).not.toBeNull();
        });

        it('should not trigger the click event multiple times', () => {
            const onToggleClickSpyFn = jest.spyOn(testComponent, 'onToggleClick');

            expect(inputElement.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            expect(onToggleClickSpyFn).toHaveBeenCalledTimes(1);
        });

        it('should trigger a change event when the native input does', fakeAsync(() => {
            const onToggleChangeSpyFn = jest.spyOn(testComponent, 'onToggleChange');

            expect(inputElement.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            fixture.detectChanges();
            flush();

            expect(onToggleChangeSpyFn).toHaveBeenCalledTimes(1);
        }));

        it('should not trigger the change event by changing the native value', fakeAsync(() => {
            const onToggleChangeSpyFn = jest.spyOn(testComponent, 'onToggleChange');

            expect(inputElement.checked).toBe(false);

            testComponent.value = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            fixture.detectChanges();
            flush();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(onToggleChangeSpyFn).not.toHaveBeenCalled();
        }));

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

        it('should use the provided aria-label', () => {
            fixture = TestBed.createComponent(ToggleWithAriaLabel);
            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-label')).toBe('Super effective');
        });

        it('should not set the aria-label attribute if no value is provided', () => {
            fixture = TestBed.createComponent(SingleToggle);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-label')).toBe(false);
        });
    });

    describe('with provided aria-labelledby ', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let inputElement: HTMLInputElement;

        it('should use the provided aria-labelledby', () => {
            fixture = TestBed.createComponent(ToggleWithAriaLabelledby);
            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
        });

        it('should not assign aria-labelledby if none is provided', () => {
            fixture = TestBed.createComponent(SingleToggle);
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

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithTabIndex);
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

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleUsingViewChild);
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
        beforeEach(() => {
            fixture = TestBed.createComponent(MultipleToggles);
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

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithFormDirectives);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            toggleInstance = toggleDebugElement.componentInstance;
            inputElement = <HTMLInputElement>toggleNativeElement.querySelector('input');
        });

        it('should be in pristine, untouched, and valid states initially', fakeAsync(() => {
            flush();

            const toggleElement = fixture.debugElement.query(By.directive(KbqToggleComponent));
            const ngModel = toggleElement.injector.get<NgModel>(NgModel);

            expect(ngModel.valid).toBe(true);
            expect(ngModel.pristine).toBe(true);
            expect(ngModel.touched).toBe(false);

            // TODO(jelbourn): test that `touched` and `pristine` state are modified appropriately.
            // This is currently blocked on issues with async() and fakeAsync().
        }));

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
        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithNameAttribute);
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

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithFormControl);
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

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithoutLabel);

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
});

@Component({
    template: `
        <div (click)="parentElementClicked = true" (keyup)="parentElementKeyedUp = true">
            <kbq-toggle
                [id]="toggleId"
                [labelPosition]="labelPos"
                [checked]="value"
                [disabled]="isDisabled"
                [color]="toggleColor"
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
    parentElementClicked: boolean = false;
    parentElementKeyedUp: boolean = false;
    toggleId: string | null = 'simple-check';
    toggleColor: string = 'primary';

    onToggleClick: (event?: Event) => void = () => {};
    onToggleChange: (event?: any) => void = () => {};
}

@Component({
    template: `
        <form>
            <kbq-toggle [(ngModel)]="isGood" name="cb">Be good</kbq-toggle>
        </form>
    `
})
class ToggleWithFormDirectives {
    isGood: boolean = false;
}

@Component({
    template: `
        <kbq-toggle>Option 1</kbq-toggle>
        <kbq-toggle>Option 2</kbq-toggle>
    `
})
class MultipleToggles {}

@Component({
    template: `
        <kbq-toggle [tabIndex]="customTabIndex" [disabled]="isDisabled" />
    `
})
class ToggleWithTabIndex {
    customTabIndex: number = 7;
    isDisabled: boolean = false;
}

@Component({
    template: `
        <kbq-toggle />
    `
})
class ToggleUsingViewChild {
    @ViewChild(KbqToggleComponent, { static: false }) toggle;

    set isDisabled(value: boolean) {
        this.toggle.disabled = value;
    }
}

@Component({
    template: `
        <kbq-toggle aria-label="Super effective" />
    `
})
class ToggleWithAriaLabel {}

@Component({
    template: `
        <kbq-toggle aria-labelledby="some-id" />
    `
})
class ToggleWithAriaLabelledby {}

@Component({
    template: `
        <kbq-toggle name="test-name" />
    `
})
class ToggleWithNameAttribute {}

@Component({
    template: `
        <kbq-toggle [formControl]="formControl" />
    `
})
class ToggleWithFormControl {
    formControl = new UntypedFormControl();
}

@Component({
    template: `
        <kbq-toggle>{{ label }}</kbq-toggle>
    `
})
class ToggleWithoutLabel {
    label: string;
}

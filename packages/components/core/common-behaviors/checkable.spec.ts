import { Component, ElementRef, inject, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqCheckable, KbqCheckableClickAction, TransitionCheckState } from './checkable';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, FormsModule],
        providers
    });

    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

@Component({
    selector: 'test-checkable',
    template: `
        <input
            #input
            type="checkbox"
            [checked]="checkable.checked()"
            [disabled]="checkable.disabled()"
            [indeterminate]="checkable.indeterminate()"
            [tabIndex]="checkable.effectiveTabIndex()"
            (click)="onInputClick($event)"
        />
    `,
    hostDirectives: [
        { directive: KbqCheckable, inputs: ['checked', 'disabled', 'indeterminate', 'tabIndex'] }
    ]
})
class TestCheckable {
    protected readonly checkable = inject(KbqCheckable, { self: true });

    private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

    clickAction: KbqCheckableClickAction;

    onInputClick(event: Event): void {
        event.stopPropagation();

        const { shouldToggle, shouldClearIndeterminate } = this.checkable.resolveClick(this.clickAction);

        if (shouldToggle) {
            if (shouldClearIndeterminate) {
                this.checkable.indeterminate.set(false);
            }

            this.checkable.toggle();
        } else {
            this.checkable.resetNativeInput(this.input().nativeElement);
        }
    }
}

@Component({
    imports: [TestCheckable, FormsModule],
    template: `
        <test-checkable [(ngModel)]="checked" />
    `
})
class TestCheckableWithNgModel {
    checked = false;
}

describe(KbqCheckable.name, () => {
    let fixture: ComponentFixture<TestCheckable>;
    let hostInstance: TestCheckable;
    let checkable: KbqCheckable;
    let inputElement: HTMLInputElement;

    beforeEach(() => {
        fixture = createComponent(TestCheckable);
        hostInstance = fixture.componentInstance;
        checkable = fixture.debugElement.injector.get(KbqCheckable);
        inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    describe('state', () => {
        it('should default to unchecked, enabled, determinate, tabIndex 0', () => {
            expect(checkable.checked()).toBe(false);
            expect(checkable.disabled()).toBe(false);
            expect(checkable.indeterminate()).toBe(false);
            expect(checkable.tabIndex()).toBe(0);
            expect(checkable.effectiveTabIndex()).toBe(0);
        });

        it('should force effectiveTabIndex to -1 while disabled, without changing the raw tabIndex', () => {
            checkable.tabIndex.set(3);
            checkable.disabled.set(true);
            fixture.detectChanges();

            expect(checkable.effectiveTabIndex()).toBe(-1);
            expect(checkable.tabIndex()).toBe(3);

            checkable.disabled.set(false);
            fixture.detectChanges();

            expect(checkable.effectiveTabIndex()).toBe(3);
        });

        it('should reflect state changes on the bound native input', () => {
            checkable.checked.set(true);
            checkable.disabled.set(true);
            checkable.indeterminate.set(true);
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
            expect(inputElement.disabled).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
        });
    });

    describe('toggle', () => {
        it('should flip checked', () => {
            expect(checkable.checked()).toBe(false);

            checkable.toggle();
            expect(checkable.checked()).toBe(true);

            checkable.toggle();
            expect(checkable.checked()).toBe(false);
        });

        it('should notify the registered ControlValueAccessor change handler with the new value', () => {
            const onChange = jest.fn();

            checkable.registerOnChange(onChange);

            checkable.toggle();

            expect(onChange).toHaveBeenCalledWith(true);

            checkable.toggle();

            expect(onChange).toHaveBeenCalledWith(false);
            expect(onChange).toHaveBeenCalledTimes(2);
        });
    });

    describe('getAriaChecked', () => {
        it('should return "false" by default', () => {
            expect(checkable.getAriaChecked()).toBe('false');
        });

        it('should return "true" when checked', () => {
            checkable.checked.set(true);
            expect(checkable.getAriaChecked()).toBe('true');
        });

        it('should return "mixed" when indeterminate and not checked', () => {
            checkable.indeterminate.set(true);
            expect(checkable.getAriaChecked()).toBe('mixed');
        });

        it('should prefer "true" over "mixed" when both checked and indeterminate', () => {
            checkable.checked.set(true);
            checkable.indeterminate.set(true);
            expect(checkable.getAriaChecked()).toBe('true');
        });
    });

    describe('resolveClick', () => {
        it('should not toggle while disabled, regardless of clickAction', () => {
            checkable.disabled.set(true);

            expect(checkable.resolveClick(undefined)).toEqual({ shouldToggle: false, shouldClearIndeterminate: false });
            expect(checkable.resolveClick('check-indeterminate')).toEqual({
                shouldToggle: false,
                shouldClearIndeterminate: false
            });
        });

        it('should not toggle when clickAction is "noop"', () => {
            expect(checkable.resolveClick('noop')).toEqual({ shouldToggle: false, shouldClearIndeterminate: false });
        });

        it('should toggle and clear indeterminate by default (undefined/check-indeterminate)', () => {
            checkable.indeterminate.set(true);

            expect(checkable.resolveClick(undefined)).toEqual({ shouldToggle: true, shouldClearIndeterminate: true });
            expect(checkable.resolveClick('check-indeterminate')).toEqual({
                shouldToggle: true,
                shouldClearIndeterminate: true
            });
        });

        it('should toggle without clearing indeterminate when clickAction is "check"', () => {
            checkable.indeterminate.set(true);

            expect(checkable.resolveClick('check')).toEqual({ shouldToggle: true, shouldClearIndeterminate: false });
        });

        it('should not report shouldClearIndeterminate when not indeterminate', () => {
            expect(checkable.resolveClick(undefined)).toEqual({ shouldToggle: true, shouldClearIndeterminate: false });
        });
    });

    describe('resetNativeInput', () => {
        it('should sync the native input to the current checked/indeterminate state', () => {
            checkable.checked.set(true);
            checkable.indeterminate.set(true);

            inputElement.checked = false;
            inputElement.indeterminate = false;

            checkable.resetNativeInput(inputElement);

            expect(inputElement.checked).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
        });
    });

    describe('transitionCheckState', () => {
        it('should update currentCheckState', () => {
            expect(checkable.currentCheckState()).toBe(TransitionCheckState.Init);

            checkable.transitionCheckState(TransitionCheckState.Checked);

            expect(checkable.currentCheckState()).toBe(TransitionCheckState.Checked);
        });

        it('should be a no-op when transitioning to the same state', () => {
            checkable.transitionCheckState(TransitionCheckState.Checked);

            const setSpy = jest.spyOn(checkable.currentCheckState, 'set');

            checkable.transitionCheckState(TransitionCheckState.Checked);

            expect(setSpy).not.toHaveBeenCalled();
        });
    });

    describe('click handling (via host)', () => {
        it('should toggle checked on click', () => {
            expect(checkable.checked()).toBe(false);

            inputElement.click();
            fixture.detectChanges();

            expect(checkable.checked()).toBe(true);
        });

        it('should not toggle when disabled', () => {
            checkable.disabled.set(true);
            fixture.detectChanges();

            inputElement.click();
            fixture.detectChanges();

            expect(checkable.checked()).toBe(false);
        });

        it('should clear indeterminate on click by default', () => {
            checkable.indeterminate.set(true);
            fixture.detectChanges();

            inputElement.click();
            fixture.detectChanges();

            expect(checkable.indeterminate()).toBe(false);
            expect(checkable.checked()).toBe(true);
        });

        it('should not toggle on click when clickAction is "noop"', () => {
            hostInstance.clickAction = 'noop';

            inputElement.click();
            fixture.detectChanges();

            expect(checkable.checked()).toBe(false);
        });
    });

    describe('ControlValueAccessor', () => {
        it('writeValue should coerce the value and set checked', () => {
            checkable.writeValue(1);
            expect(checkable.checked()).toBe(true);

            checkable.writeValue(null);
            expect(checkable.checked()).toBe(false);
        });

        it('registerOnChange should wire up notifyFormValueChange', () => {
            const onChange = jest.fn();

            checkable.registerOnChange(onChange);
            checkable.notifyFormValueChange(true);

            expect(onChange).toHaveBeenCalledWith(true);
        });

        it('registerOnTouched should wire up onTouched', () => {
            const onTouched = jest.fn();

            checkable.registerOnTouched(onTouched);
            checkable.onTouched();

            expect(onTouched).toHaveBeenCalled();
        });

        it('setDisabledState should set disabled', () => {
            checkable.setDisabledState(true);
            expect(checkable.disabled()).toBe(true);
        });
    });
});

describe(`${KbqCheckable.name} integration with ngModel`, () => {
    let ngModelFixture: ComponentFixture<TestCheckableWithNgModel>;

    beforeEach(() => {
        ngModelFixture = createComponent(TestCheckableWithNgModel);
    });

    it('should support two-way binding through the KbqCheckable ControlValueAccessor', fakeAsync(() => {
        const testInput = ngModelFixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

        tick();

        expect(ngModelFixture.componentInstance.checked).toBe(false);

        testInput.click();
        ngModelFixture.detectChanges();
        tick();

        expect(ngModelFixture.componentInstance.checked).toBe(true);
    }));
});

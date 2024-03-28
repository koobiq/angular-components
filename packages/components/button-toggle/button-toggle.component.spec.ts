import { Component, DebugElement, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { UntypedFormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';

import { KbqButtonToggle, KbqButtonToggleChange, KbqButtonToggleGroup, KbqButtonToggleModule } from './index';


describe('KbqButtonToggle with forms', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqButtonModule, KbqButtonToggleModule, FormsModule, ReactiveFormsModule],
            declarations: [
                ButtonToggleGroupWithNgModel,
                ButtonToggleGroupWithFormControl
            ]
        });

        TestBed.compileComponents();
    }));

    describe('using FormControl', () => {
        let fixture: ComponentFixture<ButtonToggleGroupWithFormControl>;
        let groupDebugElement: DebugElement;
        let groupInstance: KbqButtonToggleGroup;
        let testComponent: ButtonToggleGroupWithFormControl;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ButtonToggleGroupWithFormControl);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggleGroup));
            groupInstance = groupDebugElement.injector.get<KbqButtonToggleGroup>(KbqButtonToggleGroup);
        }));

        it('should toggle the disabled state', () => {
            testComponent.control.disable();

            expect(groupInstance.disabled).toBe(true);

            testComponent.control.enable();

            expect(groupInstance.disabled).toBe(false);
        });

        it('should set the value', () => {
            testComponent.control.setValue('green');

            expect(groupInstance.value).toBe('green');

            testComponent.control.setValue('red');

            expect(groupInstance.value).toBe('red');
        });

        it('should register the on change callback', () => {
            const spy = jasmine.createSpy('onChange callback');

            testComponent.control.registerOnChange(spy);
            testComponent.control.setValue('blue');

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('button toggle group with ngModel and change event', () => {
        let fixture: ComponentFixture<ButtonToggleGroupWithNgModel>;
        let groupDebugElement: DebugElement;
        let buttonToggleDebugElements: DebugElement[];
        let groupInstance: KbqButtonToggleGroup;
        let buttonToggleInstances: KbqButtonToggle[];
        let testComponent: ButtonToggleGroupWithNgModel;
        let groupNgModel: NgModel;
        let innerButtons: HTMLElement[];

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ButtonToggleGroupWithNgModel);
            fixture.detectChanges();
            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggleGroup));
            groupInstance = groupDebugElement.injector.get<KbqButtonToggleGroup>(KbqButtonToggleGroup);
            groupNgModel = groupDebugElement.injector.get<NgModel>(NgModel);

            buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(KbqButtonToggle));
            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
            innerButtons = buttonToggleDebugElements.map(
                (debugEl) => debugEl.query(By.css('button')).nativeElement);

            fixture.detectChanges();
        }));

        it('should update the model before firing change event', fakeAsync(() => {
            expect(testComponent.modelValue).toBeUndefined();
            expect(testComponent.lastEvent).toBeUndefined();

            innerButtons[0].click();
            fixture.detectChanges();

            tick();
            expect(testComponent.modelValue).toBe('red');
            expect(testComponent.lastEvent.value).toBe('red');
        }));

        it('should check the corresponding button toggle on a group value change', () => {
            expect(groupInstance.value).toBeFalsy();

            for (const buttonToggle of buttonToggleInstances) {
                expect(buttonToggle.checked).toBeFalsy();
            }

            groupInstance.value = 'red';

            for (const buttonToggle of buttonToggleInstances) {
                expect(buttonToggle.checked).toBe(groupInstance.value === buttonToggle.value);
            }

            const selected = groupInstance.selected as KbqButtonToggle;

            expect(selected.value).toBe(groupInstance.value);
        });

        it(
            'should have the correct FormControl state initially and after interaction',
            fakeAsync(() => {
                expect(groupNgModel.valid).toBe(true);
                expect(groupNgModel.pristine).toBe(true);
                expect(groupNgModel.touched).toBe(false);

                buttonToggleInstances[1].checked = true;
                fixture.detectChanges();
                tick();

                expect(groupNgModel.valid).toBe(true);
                expect(groupNgModel.pristine).toBe(true);
                expect(groupNgModel.touched).toBe(false);

                // tslint:disable-next-line:no-magic-numbers
                innerButtons[2].click();
                fixture.detectChanges();
                tick();

                expect(groupNgModel.valid).toBe(true);
                expect(groupNgModel.pristine).toBe(false);
                expect(groupNgModel.touched).toBe(true);
            })
        );

        it('should update the ngModel value when selecting a button toggle', fakeAsync(() => {
            innerButtons[1].click();
            fixture.detectChanges();

            tick();

            expect(testComponent.modelValue).toBe('green');
        }));
    });
});

describe('KbqButtonToggle without forms', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqButtonModule, KbqButtonToggleModule],
            declarations: [
                ButtonTogglesInsideButtonToggleGroup,
                ButtonTogglesInsideButtonToggleGroupMultiple,
                FalsyButtonTogglesInsideButtonToggleGroupMultiple,
                ButtonToggleGroupWithInitialValue,
                StandaloneButtonToggle,
                RepeatedButtonTogglesWithPreselectedValue
            ]
        });

        TestBed.compileComponents();
    }));

    describe('inside of an exclusive selection group', () => {

        let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroup>;
        let groupDebugElement: DebugElement;
        let groupNativeElement: HTMLElement;
        let buttonToggleDebugElements: DebugElement[];
        let buttonToggleNativeElements: HTMLElement[];
        let buttonToggleLabelElements: HTMLLabelElement[];
        let groupInstance: KbqButtonToggleGroup;
        let buttonToggleInstances: KbqButtonToggle[];
        let testComponent: ButtonTogglesInsideButtonToggleGroup;

        beforeEach(() => {
            fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroup);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggleGroup));
            groupNativeElement = groupDebugElement.nativeElement;
            groupInstance = groupDebugElement.injector.get<KbqButtonToggleGroup>(KbqButtonToggleGroup);

            buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(KbqButtonToggle));

            buttonToggleNativeElements = buttonToggleDebugElements
                .map((debugEl) => debugEl.nativeElement);

            buttonToggleLabelElements = fixture.debugElement.queryAll(By.css('button'))
                .map((debugEl) => debugEl.nativeElement);

            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
        });

        it('should disable click interactions when the group is disabled', () => {
            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            buttonToggleNativeElements[0].click();

            expect(buttonToggleInstances[0].checked).toBe(false);
            testComponent.isGroupDisabled = false;

            fixture.detectChanges();

            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(buttonToggleInstances[0].checked).toBe(true);
        });

        it('should disable the underlying button when the group is disabled', () => {
            const buttons = buttonToggleNativeElements.map((toggle) => toggle.querySelector('button')!);

            expect(buttons.every((input) => input.disabled)).toBe(false);

            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            expect(buttons.every((input) => input.disabled)).toBe(true);
        });

        it('should update the group value when one of the toggles changes', () => {
            expect(groupInstance.value).toBeFalsy();
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
        });

        it('should propagate the value change back up via a two-way binding', () => {
            expect(groupInstance.value).toBeFalsy();
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(testComponent.groupValue).toBe('test1');
        });

        it('should update the group and toggles when one of the button toggles is clicked', () => {
            expect(groupInstance.value).toBeFalsy();
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(buttonToggleInstances[1].checked).toBe(false);

            buttonToggleLabelElements[1].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test2');
            expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
            expect(buttonToggleInstances[0].checked).toBe(false);
            expect(buttonToggleInstances[1].checked).toBe(true);
        });

        it('should check a button toggle upon interaction with underlying native radio button', () => {
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(groupInstance.value);
        });

        it('should change the vertical state', () => {
            expect(groupNativeElement.classList).not.toContain('kbq-button-toggle_vertical');

            groupInstance.vertical = true;
            fixture.detectChanges();

            expect(groupNativeElement.classList).toContain('kbq-button-toggle_vertical');
        });

        it('should emit a change event from button toggles', fakeAsync(() => {
            expect(buttonToggleInstances[0].checked).toBe(false);

            const changeSpy = jasmine.createSpy('button-toggle change listener');
            buttonToggleInstances[0].change.subscribe(changeSpy);

            buttonToggleLabelElements[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalledTimes(1);

            buttonToggleLabelElements[0].click();
            fixture.detectChanges();
            tick();

            // Always emit change event when button toggle is clicked
            // tslint:disable-next-line:no-magic-numbers
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should emit a change event from the button toggle group', fakeAsync(() => {
            expect(groupInstance.value).toBeFalsy();

            const changeSpy = jasmine.createSpy('button-toggle-group change listener');
            groupInstance.change.subscribe(changeSpy);

            buttonToggleLabelElements[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();

            buttonToggleLabelElements[1].click();
            fixture.detectChanges();
            tick();
            // tslint:disable-next-line:no-magic-numbers
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should update the group and button toggles when updating the group value', () => {
            expect(groupInstance.value).toBeFalsy();

            testComponent.groupValue = 'test1';
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(buttonToggleInstances[1].checked).toBe(false);

            testComponent.groupValue = 'test2';
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test2');
            expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
            expect(buttonToggleInstances[0].checked).toBe(false);
            expect(buttonToggleInstances[1].checked).toBe(true);
        });

        it('should deselect all of the checkboxes when the group value is cleared', () => {
            buttonToggleInstances[0].checked = true;

            expect(groupInstance.value).toBeTruthy();

            groupInstance.value = null;

            expect(buttonToggleInstances.every((toggle) => !toggle.checked)).toBe(true);
        });

        it('should update the model if a selected toggle is removed', fakeAsync(() => {
            expect(groupInstance.value).toBeFalsy();
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);

            testComponent.renderFirstToggle = false;
            fixture.detectChanges();
            tick();

            expect(groupInstance.value).toBeFalsy();
            expect(groupInstance.selected).toBeFalsy();
        }));

    });

    describe('with initial value and change event', () => {

        it('should not fire an initial change event', () => {
            const fixture = TestBed.createComponent(ButtonToggleGroupWithInitialValue);
            const testComponent = fixture.debugElement.componentInstance;
            const groupDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggleGroup));
            const groupInstance: KbqButtonToggleGroup = groupDebugElement.injector
                .get<KbqButtonToggleGroup>(KbqButtonToggleGroup);

            fixture.detectChanges();

            // Note that we cast to a boolean, because the event has some circular references
            // which will crash the runner when Jasmine attempts to stringify them.
            expect(!!testComponent.lastEvent).toBe(false);
            expect(groupInstance.value).toBe('red');

            groupInstance.value = 'green';
            fixture.detectChanges();

            expect(!!testComponent.lastEvent).toBe(false);
            expect(groupInstance.value).toBe('green');
        });

    });

    describe('inside of a multiple selection group', () => {
        let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroupMultiple>;
        let groupDebugElement: DebugElement;
        let groupNativeElement: HTMLElement;
        let buttonToggleDebugElements: DebugElement[];
        let buttonToggleNativeElements: HTMLElement[];
        let buttonToggleButtonElements: HTMLLabelElement[];
        let groupInstance: KbqButtonToggleGroup;
        let buttonToggleInstances: KbqButtonToggle[];
        let testComponent: ButtonTogglesInsideButtonToggleGroupMultiple;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggleGroup));
            groupNativeElement = groupDebugElement.nativeElement;
            groupInstance = groupDebugElement.injector.get<KbqButtonToggleGroup>(KbqButtonToggleGroup);

            buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(KbqButtonToggle));
            buttonToggleNativeElements = buttonToggleDebugElements
                .map((debugEl) => debugEl.nativeElement);
            buttonToggleButtonElements = fixture.debugElement.queryAll(By.css('button'))
                .map((debugEl) => debugEl.nativeElement);
            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
        }));

        it('should disable click interactions when the group is disabled', () => {
            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            buttonToggleNativeElements[0].click();
            expect(buttonToggleInstances[0].checked).toBe(false);
        });

        it('should check a button toggle when clicked', () => {
            expect(buttonToggleInstances.every((buttonToggle) => !buttonToggle.checked)).toBe(true);

            const nativeCheckboxLabel = buttonToggleDebugElements[0].query(By.css('button')).nativeElement;

            nativeCheckboxLabel.click();

            expect(groupInstance.value).toEqual(['eggs']);
            expect(buttonToggleInstances[0].checked).toBe(true);
        });

        it('should allow for multiple toggles to be selected', () => {
            buttonToggleInstances[0].checked = true;
            fixture.detectChanges();

            expect(groupInstance.value).toEqual(['eggs']);
            expect(buttonToggleInstances[0].checked).toBe(true);

            buttonToggleInstances[1].checked = true;
            fixture.detectChanges();

            expect(groupInstance.value).toEqual(['eggs', 'flour']);
            expect(buttonToggleInstances[1].checked).toBe(true);
            expect(buttonToggleInstances[0].checked).toBe(true);
        });

        it('should check a button toggle upon interaction with underlying native checkbox', () => {
            const nativeCheckboxButton = buttonToggleDebugElements[0].query(By.css('button')).nativeElement;

            nativeCheckboxButton.click();
            fixture.detectChanges();

            expect(groupInstance.value).toEqual(['eggs']);
            expect(buttonToggleInstances[0].checked).toBe(true);
        });

        it('should change the vertical state', () => {
            expect(groupNativeElement.classList).not.toContain('kbq-button-toggle_vertical');

            groupInstance.vertical = true;
            fixture.detectChanges();

            expect(groupNativeElement.classList).toContain('kbq-button-toggle_vertical');
        });

        it('should deselect a button toggle when selected twice', fakeAsync(() => {
            buttonToggleButtonElements[0].click();
            fixture.detectChanges();
            tick();

            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(groupInstance.value).toEqual(['eggs']);

            buttonToggleButtonElements[0].click();
            fixture.detectChanges();
            tick();

            expect(groupInstance.value).toEqual([]);
            expect(buttonToggleInstances[0].checked).toBe(false);
        }));

        it('should emit a change event for state changes', fakeAsync(() => {
            expect(buttonToggleInstances[0].checked).toBe(false);

            const changeSpy = jasmine.createSpy('button-toggle change listener');
            buttonToggleInstances[0].change.subscribe(changeSpy);

            buttonToggleButtonElements[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();
            expect(groupInstance.value).toEqual(['eggs']);

            buttonToggleButtonElements[0].click();
            fixture.detectChanges();
            tick();
            expect(groupInstance.value).toEqual([]);

            // The default browser behavior is to emit an event, when the value was set
            // to false. That's because the current input type is set to `checkbox` when
            // using the multiple mode.
            // tslint:disable-next-line:no-magic-numbers
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should throw when attempting to assign a non-array value', () => {
            expect(() => {
                groupInstance.value = 'not-an-array';
            }).toThrowError(/Value must be an array/);
        });
    });

    describe('as standalone', () => {
        let fixture: ComponentFixture<StandaloneButtonToggle>;
        let buttonToggleDebugElement: DebugElement;
        let buttonToggleButtonElement: HTMLLabelElement;
        let buttonToggleInstance: KbqButtonToggle;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(StandaloneButtonToggle);
            fixture.detectChanges();

            buttonToggleDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggle));
            buttonToggleButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;

            buttonToggleInstance = buttonToggleDebugElement.componentInstance;
        }));

        it('should toggle when clicked', fakeAsync(() => {
            buttonToggleButtonElement.click();
            fixture.detectChanges();
            flush();

            expect(buttonToggleInstance.checked).toBe(true);

            buttonToggleButtonElement.click();
            fixture.detectChanges();
            flush();

            expect(buttonToggleInstance.checked).toBe(false);
        }));

        it('should emit a change event for state changes', fakeAsync(() => {

            expect(buttonToggleInstance.checked).toBe(false);

            const changeSpy = jasmine.createSpy('button-toggle change listener');
            buttonToggleInstance.change.subscribe(changeSpy);

            buttonToggleButtonElement.click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();

            buttonToggleButtonElement.click();
            fixture.detectChanges();
            tick();

            // The default browser behavior is to emit an event, when the value was set
            // to false. That's because the current input type is set to `checkbox`.
            // tslint:disable-next-line:no-magic-numbers
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));
    });

    it('should not throw on init when toggles are repeated and there is an initial value', () => {
        const fixture = TestBed.createComponent(RepeatedButtonTogglesWithPreselectedValue);

        expect(() => fixture.detectChanges()).not.toThrow();
        expect(fixture.componentInstance.toggleGroup.value).toBe('Two');
        expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(true);
    });

    it(
        'should maintain the selected state when the value and toggles are swapped out at the same time',
        () => {
            const fixture = TestBed.createComponent(RepeatedButtonTogglesWithPreselectedValue);
            fixture.detectChanges();

            expect(fixture.componentInstance.toggleGroup.value).toBe('Two');
            expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(true);

            fixture.componentInstance.possibleValues = ['Five', 'Six', 'Seven'];
            fixture.componentInstance.value = 'Seven';
            fixture.detectChanges();

            expect(fixture.componentInstance.toggleGroup.value).toBe('Seven');
            // tslint:disable-next-line:no-magic-numbers
            expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(true);
        }
    );

    it('should select falsy button toggle value in multiple selection', () => {
        const fixture = TestBed.createComponent(FalsyButtonTogglesInsideButtonToggleGroupMultiple);
        fixture.detectChanges();

        expect(fixture.componentInstance.toggles.toArray()[0].checked).toBe(true);
        expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(false);
        // tslint:disable-next-line:no-magic-numbers
        expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(false);

        fixture.componentInstance.value = [0, false];
        fixture.detectChanges();

        expect(fixture.componentInstance.toggles.toArray()[0].checked).toBe(true);
        expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(false);
        // tslint:disable-next-line:no-magic-numbers
        expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(true);
    });
});

@Component({
    template: `
        <kbq-button-toggle-group [disabled]="isGroupDisabled"
                                [vertical]="isVertical"
                                [(value)]="groupValue">

            <kbq-button-toggle [value]="'test1'" *ngIf="renderFirstToggle">Test1</kbq-button-toggle>
            <kbq-button-toggle [value]="'test2'">Test2</kbq-button-toggle>
            <kbq-button-toggle [value]="'test3'">Test3</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class ButtonTogglesInsideButtonToggleGroup {
    isGroupDisabled: boolean = false;
    isVertical: boolean = false;
    groupValue: string;
    renderFirstToggle = true;
}

@Component({
    template: `
        <kbq-button-toggle-group
            [name]="groupName"
            [(ngModel)]="modelValue"
            (change)="lastEvent = $event">
            <kbq-button-toggle *ngFor="let option of options" [value]="option.value">
                {{option.label}}
            </kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class ButtonToggleGroupWithNgModel {
    groupName = 'group-name';
    modelValue: string;
    options = [
        {label: 'Red', value: 'red'},
        {label: 'Green', value: 'green'},
        {label: 'Blue', value: 'blue'}
    ];
    lastEvent: KbqButtonToggleChange;
}

@Component({
    template: `
        <kbq-button-toggle-group [disabled]="isGroupDisabled" [vertical]="isVertical" multiple>
            <kbq-button-toggle [value]="'eggs'">Eggs</kbq-button-toggle>
            <kbq-button-toggle [value]="'flour'">Flour</kbq-button-toggle>
            <kbq-button-toggle [value]="'sugar'">Sugar</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class ButtonTogglesInsideButtonToggleGroupMultiple {
    isGroupDisabled: boolean = false;
    isVertical: boolean = false;
}

@Component({
    template: `
        <kbq-button-toggle-group multiple [value]="value">
            <kbq-button-toggle [value]="0">Eggs</kbq-button-toggle>
            <kbq-button-toggle [value]="null">Flour</kbq-button-toggle>
            <kbq-button-toggle [value]="false">Sugar</kbq-button-toggle>
            <kbq-button-toggle>Sugar</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class FalsyButtonTogglesInsideButtonToggleGroupMultiple {
    value: ('' | number | null | undefined | boolean)[] = [0];
    @ViewChildren(KbqButtonToggle) toggles: QueryList<KbqButtonToggle>;
}

@Component({
    template: `
        <kbq-button-toggle>
            Yes
        </kbq-button-toggle>
    `
})
class StandaloneButtonToggle {
}

@Component({
    template: `
        <kbq-button-toggle-group (change)="lastEvent = $event" [value]="'red'">
            <kbq-button-toggle [value]="'red'">Value Red</kbq-button-toggle>
            <kbq-button-toggle [value]="'green'">Value Green</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class ButtonToggleGroupWithInitialValue {
    lastEvent: KbqButtonToggleChange;
}

@Component({
    template: `
        <kbq-button-toggle-group [formControl]="control">
            <kbq-button-toggle [value]="'red'">Value Red</kbq-button-toggle>
            <kbq-button-toggle [value]="'green'">Value Green</kbq-button-toggle>
            <kbq-button-toggle [value]="'blue'">Value Blue</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class ButtonToggleGroupWithFormControl {
    control = new UntypedFormControl();
}

@Component({
    template: `
        <kbq-button-toggle-group [(value)]="value">
            <kbq-button-toggle *ngFor="let toggle of possibleValues" [value]="toggle">
                {{toggle}}
             </kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class RepeatedButtonTogglesWithPreselectedValue {
    @ViewChild(KbqButtonToggleGroup, {static: false}) toggleGroup: KbqButtonToggleGroup;
    @ViewChildren(KbqButtonToggle) toggles: QueryList<KbqButtonToggle>;

    possibleValues = ['One', 'Two', 'Three'];
    value = 'Two';
}


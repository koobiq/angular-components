import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ThemePalette } from '@koobiq/components/core';
import { KbqRadioButton, KbqRadioGroup, KbqRadioModule } from './index';

/* tslint:disable:no-magic-numbers */
describe('MсRadio', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqRadioModule, FormsModule, ReactiveFormsModule],
            declarations: [
                DisableableRadioButton,
                RadiosInsideRadioGroup
            ]
        });

        TestBed.compileComponents();
    }));

    describe('inside of a group', () => {
        let fixture: ComponentFixture<RadiosInsideRadioGroup>;
        let groupDebugElement: DebugElement;
        let radioDebugElements: DebugElement[];
        let radioLabelElements: HTMLLabelElement[];
        let radioInputElements: HTMLInputElement[];
        let groupInstance: KbqRadioGroup;
        let radioInstances: KbqRadioButton[];
        let testComponent: RadiosInsideRadioGroup;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(RadiosInsideRadioGroup);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqRadioGroup));
            groupInstance = groupDebugElement.injector.get<KbqRadioGroup>(KbqRadioGroup);

            radioDebugElements = fixture.debugElement.queryAll(By.directive(KbqRadioButton));
            radioInstances = radioDebugElements.map((debugEl) => debugEl.componentInstance);

            radioLabelElements = radioDebugElements.map((debugEl) => debugEl.query(By.css('label')).nativeElement);
            radioInputElements = radioDebugElements.map((debugEl) => debugEl.query(By.css('input')).nativeElement);
        }));

        it('should set individual radio names based on the group name', () => {
            expect(groupInstance.name).toBeTruthy();

            for (const radio of radioInstances) {
                expect(radio.name).toBe(groupInstance.name);
            }
        });

        it('should coerce the disabled binding on the radio group', () => {
            (groupInstance as any).disabled = '';
            fixture.detectChanges();

            radioLabelElements[0].click();
            fixture.detectChanges();

            expect(radioInstances[0].checked).toBe(false);
            expect(groupInstance.disabled).toBe(true);
        });

        it('should disable click interaction when the group is disabled', () => {
            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            radioLabelElements[0].click();
            fixture.detectChanges();

            expect(radioInstances[0].checked).toBe(false);
        });

        it('should set label position based on the group labelPosition', () => {
            testComponent.labelPos = 'before';
            fixture.detectChanges();

            for (const radio of radioInstances) {
                expect(radio.labelPosition).toBe('before');
            }

            testComponent.labelPos = 'after';
            fixture.detectChanges();

            for (const radio of radioInstances) {
                expect(radio.labelPosition).toBe('after');
            }
        });

        it('should disable each individual radio when the group is disabled', () => {
            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            for (const radio of radioInstances) {
                expect(radio.disabled).toBe(true);
            }
        });

        it('should set required to each radio button when the group is required', () => {
            testComponent.isGroupRequired = true;
            fixture.detectChanges();

            for (const radio of radioInstances) {
                expect(radio.required).toBe(true);
            }
        });

        it('should update the group value when one of the radios changes', () => {
            expect(groupInstance.value).toBeFalsy();

            radioInstances[0].checked = true;
            fixture.detectChanges();

            expect(groupInstance.value).toBe('fire');
            expect(groupInstance.selected).toBe(radioInstances[0]);
        });

        it('should update the group and radios when one of the radios is clicked', () => {
            expect(groupInstance.value).toBeFalsy();

            radioLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('fire');
            expect(groupInstance.selected).toBe(radioInstances[0]);
            expect(radioInstances[0].checked).toBe(true);
            expect(radioInstances[1].checked).toBe(false);

            radioLabelElements[1].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('water');
            expect(groupInstance.selected).toBe(radioInstances[1]);
            expect(radioInstances[0].checked).toBe(false);
            expect(radioInstances[1].checked).toBe(true);
        });

        it('should check a radio upon interaction with the underlying native radio button', () => {
            radioInputElements[0].click();
            fixture.detectChanges();

            expect(radioInstances[0].checked).toBe(true);
            expect(groupInstance.value).toBe('fire');
            expect(groupInstance.selected).toBe(radioInstances[0]);
        });

        it('should emit a change event from radio buttons', () => {
            expect(radioInstances[0].checked).toBe(false);

            const spies = radioInstances.map((radio, index) =>
                jasmine.createSpy(`onChangeSpy ${index} for ${radio.name}`)
            );

            spies.forEach((spy, index) => radioInstances[index].change.subscribe(spy));

            radioLabelElements[0].click();
            fixture.detectChanges();

            expect(spies[0]).toHaveBeenCalled();

            radioLabelElements[1].click();
            fixture.detectChanges();

            // To match the native radio button behavior, the change event shouldn't
            // be triggered when the radio got unselected.
            expect(spies[0]).toHaveBeenCalledTimes(1);
            expect(spies[1]).toHaveBeenCalledTimes(1);
        });

        it(`should not emit a change event from the radio group when change group value programmatically`, () => {
            expect(groupInstance.value).toBeFalsy();

            const changeSpy = jasmine.createSpy('radio-group change listener');
            groupInstance.change.subscribe(changeSpy);

            radioLabelElements[0].click();
            fixture.detectChanges();

            expect(changeSpy).toHaveBeenCalledTimes(1);

            groupInstance.value = 'water';
            fixture.detectChanges();

            expect(changeSpy).toHaveBeenCalledTimes(1);
        });

        it('should update the group and radios when updating the group value', () => {
            expect(groupInstance.value).toBeFalsy();

            testComponent.groupValue = 'fire';
            fixture.detectChanges();

            expect(groupInstance.value).toBe('fire');
            expect(groupInstance.selected).toBe(radioInstances[0]);
            expect(radioInstances[0].checked).toBe(true);
            expect(radioInstances[1].checked).toBe(false);

            testComponent.groupValue = 'water';
            fixture.detectChanges();

            expect(groupInstance.value).toBe('water');
            expect(groupInstance.selected).toBe(radioInstances[1]);
            expect(radioInstances[0].checked).toBe(false);
            expect(radioInstances[1].checked).toBe(true);
        });

        it('should deselect all of the checkboxes when the group value is cleared', () => {
            radioInstances[0].checked = true;

            expect(groupInstance.value).toBeTruthy();

            groupInstance.value = null;

            expect(radioInstances.every((radio) => !radio.checked)).toBe(true);
        });

        it(`should update the group's selected radio to null when unchecking that radio programmatically`, () => {
            const changeSpy = jasmine.createSpy('radio-group change listener');
            groupInstance.change.subscribe(changeSpy);
            radioInstances[0].checked = true;

            fixture.detectChanges();

            expect(changeSpy).not.toHaveBeenCalled();
            expect(groupInstance.value).toBeTruthy();

            radioInstances[0].checked = false;

            fixture.detectChanges();

            expect(changeSpy).not.toHaveBeenCalled();
            expect(groupInstance.value).toBeFalsy();
            expect(radioInstances.every((radio) => !radio.checked)).toBe(true);
            expect(groupInstance.selected).toBeNull();
        });

        it('should not fire a change event from the group when a radio checked state changes', () => {
            const changeSpy = jasmine.createSpy('radio-group change listener');
            groupInstance.change.subscribe(changeSpy);
            radioInstances[0].checked = true;

            fixture.detectChanges();

            expect(changeSpy).not.toHaveBeenCalled();
            expect(groupInstance.value).toBeTruthy();
            expect(groupInstance.value).toBe('fire');

            radioInstances[1].checked = true;

            fixture.detectChanges();

            expect(groupInstance.value).toBe('water');
            expect(changeSpy).not.toHaveBeenCalled();
        });

        it(`should update checked status if changed value to radio group's value`, () => {
            const changeSpy = jasmine.createSpy('radio-group change listener');
            groupInstance.change.subscribe(changeSpy);
            groupInstance.value = 'apple';

            expect(changeSpy).not.toHaveBeenCalled();
            expect(groupInstance.value).toBe('apple');
            expect(groupInstance.selected).withContext('expect group selected to be null').toBeFalsy();
            expect(radioInstances[0].checked).withContext('should not select the first button').toBeFalsy();
            expect(radioInstances[1].checked).withContext('should not select the second button').toBeFalsy();
            expect(radioInstances[2].checked).withContext('should not select the third button').toBeFalsy();

            radioInstances[0].value = 'apple';

            fixture.detectChanges();

            expect(groupInstance.selected)
                .withContext('expect group selected to be first button')
                .toBe(radioInstances[0]);
            expect(radioInstances[0].checked).withContext('expect group select the first button').toBeTruthy();
            expect(radioInstances[1].checked).withContext('should not select the second button').toBeFalsy();
            expect(radioInstances[2].checked).withContext('should not select the third button').toBeFalsy();
        });
    });

    describe('disableable', () => {
        let fixture: ComponentFixture<DisableableRadioButton>;
        let radioInstance: KbqRadioButton;
        let radioNativeElement: HTMLInputElement;
        let testComponent: DisableableRadioButton;

        beforeEach(() => {
            fixture = TestBed.createComponent(DisableableRadioButton);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            const radioDebugElement = fixture.debugElement.query(By.directive(KbqRadioButton));
            radioInstance = radioDebugElement.injector.get<KbqRadioButton>(KbqRadioButton);
            radioNativeElement = radioDebugElement.nativeElement.querySelector('input');
        });

        it('should toggle the disabled state', () => {
            expect(radioInstance.disabled).toBeFalsy();
            expect(radioNativeElement.disabled).toBeFalsy();

            testComponent.disabled = true;
            fixture.detectChanges();
            expect(radioInstance.disabled).toBeTruthy();
            expect(radioNativeElement.disabled).toBeTruthy();

            testComponent.disabled = false;
            fixture.detectChanges();
            expect(radioInstance.disabled).toBeFalsy();
            expect(radioNativeElement.disabled).toBeFalsy();
        });
    });
});

@Component({
    template: `
        <kbq-radio-group
            [disabled]="isGroupDisabled"
            [labelPosition]="labelPos"
            [required]="isGroupRequired"
            [value]="groupValue"
            name="test-name"
        >
            <kbq-radio-button [value]="'fire'" [disabled]="isFirstDisabled" [color]="color">
                Charmander
            </kbq-radio-button>
            <kbq-radio-button [value]="'water'" [color]="color"> Squirtle </kbq-radio-button>
            <kbq-radio-button [value]="'leaf'" [color]="color"> Bulbasaur </kbq-radio-button>
        </kbq-radio-group>
    `
})
class RadiosInsideRadioGroup {
    labelPos: 'before' | 'after';
    isFirstDisabled: boolean = false;
    isGroupDisabled: boolean = false;
    isGroupRequired: boolean = false;
    groupValue: string | null = null;
    color: ThemePalette;
}

@Component({
    template: `<kbq-radio-button>One</kbq-radio-button>`
})
class DisableableRadioButton {
    @ViewChild(KbqRadioButton, { static: false }) kbqRadioButton;

    set disabled(value: boolean) {
        this.kbqRadioButton.disabled = value;
    }
}

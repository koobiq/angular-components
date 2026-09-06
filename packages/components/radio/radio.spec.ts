import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { axe } from 'jest-axe';
import { KbqRadioButton, KbqRadioGroup, KbqRadioModule } from './index';

describe('KbqRadio', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqRadioModule, FormsModule, ReactiveFormsModule, DisableableRadioButton, RadiosInsideRadioGroup]
        }).compileComponents();
    });

    describe('inside of a group', () => {
        let fixture: ComponentFixture<RadiosInsideRadioGroup>;
        let groupDebugElement: DebugElement;
        let radioDebugElements: DebugElement[];
        let radioLabelElements: HTMLLabelElement[];
        let radioInputElements: HTMLInputElement[];
        let groupInstance: KbqRadioGroup;
        let radioInstances: KbqRadioButton[];
        let testComponent: RadiosInsideRadioGroup;

        beforeEach(() => {
            fixture = TestBed.createComponent(RadiosInsideRadioGroup);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqRadioGroup));
            groupInstance = groupDebugElement.injector.get<KbqRadioGroup>(KbqRadioGroup);

            radioDebugElements = fixture.debugElement.queryAll(By.directive(KbqRadioButton));
            radioInstances = radioDebugElements.map((debugEl) => debugEl.componentInstance);

            radioLabelElements = radioDebugElements.map((debugEl) => debugEl.query(By.css('label')).nativeElement);
            radioInputElements = radioDebugElements.map((debugEl) => debugEl.query(By.css('input')).nativeElement);
        });

        it('should set individual radio names based on the group name', () => {
            expect(groupInstance.name).toBeTruthy();

            for (const radio of radioInstances) {
                expect(radio.name).toBe(groupInstance.name);
            }
        });

        it('should coerce the disabled binding on the radio group', () => {
            testComponent.isGroupDisabled = '';
            fixture.detectChanges();

            expect(groupInstance.disabled).toBe(true);

            testComponent.isGroupDisabled = 'false';
            fixture.detectChanges();

            expect(groupInstance.disabled).toBe(false);
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

        it('should render the group labelPosition as a class on the label content', () => {
            const content = () =>
                radioDebugElements.map((debugEl) => debugEl.query(By.css('.kbq-radio-label-content')).nativeElement);

            expect(content().every((el: HTMLElement) => el.classList.contains('kbq-radio-label-before'))).toBe(false);

            testComponent.labelPos = 'before';
            fixture.detectChanges();

            expect(content().every((el: HTMLElement) => el.classList.contains('kbq-radio-label-before'))).toBe(true);
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

        it('should report a boolean from required for a radio button outside a required group', () => {
            expect(radioInstances[0].required).toBe(false);
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

        it('should move the group value on the change event an arrow key produces natively', () => {
            radioLabelElements[0].click();
            fixture.detectChanges();

            // The browser owns arrow-key traversal of a native radio group; what reaches the component
            // is the `change` event on the newly checked input.
            radioInputElements[1].checked = true;
            radioInputElements[1].dispatchEvent(new Event('change'));
            fixture.detectChanges();

            expect(groupInstance.value).toBe('water');
            expect(radioInstances[0].checked).toBe(false);
        });

        it('should give every native input in the group the same non-empty name', () => {
            const names = radioInputElements.map((input) => input.getAttribute('name'));

            expect(names[0]).toBeTruthy();
            expect(new Set(names).size).toBe(1);
        });

        it('should render the option value as the native value attribute', () => {
            expect(radioInputElements.map((input) => input.getAttribute('value'))).toEqual(['fire', 'water', 'leaf']);
        });

        it('should emit a change event from radio buttons', () => {
            expect(radioInstances[0].checked).toBe(false);

            const spies = radioInstances.map(() => jest.fn());

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

            const changeSpy = jest.fn();

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

        it('should deselect all of the radio buttons when the group value is cleared', () => {
            radioInstances[0].checked = true;

            expect(groupInstance.value).toBeTruthy();

            groupInstance.value = null;

            expect(radioInstances.every((radio) => !radio.checked)).toBe(true);
        });

        it(`should update the group's selected radio to null when unchecking that radio programmatically`, () => {
            const changeSpy = jest.fn();

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
            const changeSpy = jest.fn();

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
            const changeSpy = jest.fn();

            groupInstance.change.subscribe(changeSpy);
            groupInstance.value = 'apple';

            expect(changeSpy).not.toHaveBeenCalled();
            expect(groupInstance.value).toBe('apple');
            expect(groupInstance.selected).toBeFalsy();
            expect(radioInstances[0].checked).toBeFalsy();
            expect(radioInstances[1].checked).toBeFalsy();
            expect(radioInstances[2].checked).toBeFalsy();

            radioInstances[0].value = 'apple';

            fixture.detectChanges();

            expect(groupInstance.selected).toBe(radioInstances[0]);
            expect(radioInstances[0].checked).toBeTruthy();
            expect(radioInstances[1].checked).toBeFalsy();
            expect(radioInstances[2].checked).toBeFalsy();
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

    describe('name', () => {
        it('should keep two radio buttons used outside a group independent of each other', () => {
            const fixture = TestBed.createComponent(StandaloneRadioButtons);

            fixture.detectChanges();

            const [first, second] = fixture.debugElement
                .queryAll(By.directive(KbqRadioButton))
                .map((debugEl) => debugEl.componentInstance as KbqRadioButton);

            first.checked = true;
            second.checked = true;
            fixture.detectChanges();

            // The UniqueSelectionDispatcher is application-global and isolates its listeners by name
            // alone, so a button with no name of its own would un-check every other unnamed radio.
            expect(first.checked).toBe(true);
            expect(second.checked).toBe(true);
            expect(first.name).not.toBe(second.name);
        });

        it('should still group two radio buttons that share an explicit name outside a group', () => {
            const fixture = TestBed.createComponent(NamedStandaloneRadioButtons);

            fixture.detectChanges();

            const [first, second] = fixture.debugElement
                .queryAll(By.directive(KbqRadioButton))
                .map((debugEl) => debugEl.componentInstance as KbqRadioButton);

            first.checked = true;
            second.checked = true;
            fixture.detectChanges();

            expect(first.checked).toBe(false);
            expect(second.checked).toBe(true);
        });

        it('should keep an explicit name on a radio button inside a group', () => {
            const fixture = TestBed.createComponent(RadioGroupWithNamedButton);

            fixture.detectChanges();

            const [named, inherited] = fixture.debugElement
                .queryAll(By.directive(KbqRadioButton))
                .map((debugEl) => debugEl.componentInstance as KbqRadioButton);
            const group = fixture.debugElement.query(By.directive(KbqRadioGroup)).injector.get(KbqRadioGroup);

            expect(named.name).toBe('custom');
            expect(inherited.name).toBe(group.name);
        });

        it('should re-render the native name attribute when the group name changes', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.detectChanges();

            const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(input.getAttribute('name')).toBe('test-name');

            fixture.componentInstance.groupName = 'renamed';
            fixture.detectChanges();

            expect(input.getAttribute('name')).toBe('renamed');
        });
    });

    describe('native form', () => {
        it('should submit the value of the checked option under the group name', () => {
            const fixture = TestBed.createComponent(RadioGroupInsideForm);

            fixture.detectChanges();

            const form: HTMLFormElement = fixture.debugElement.query(By.css('form')).nativeElement;

            fixture.debugElement.queryAll(By.css('label'))[1].nativeElement.click();
            fixture.detectChanges();

            expect(new FormData(form).get('answer')).toBe('water');
        });
    });

    describe('accessibility', () => {
        it('should announce the group as a radiogroup', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.detectChanges();

            expect(fixture.debugElement.query(By.directive(KbqRadioGroup)).nativeElement.getAttribute('role')).toBe(
                'radiogroup'
            );
        });

        it('should leave a consumer-written aria-labelledby on the group host alone', () => {
            const fixture = TestBed.createComponent(LabelledRadioGroup);

            fixture.detectChanges();

            const group: HTMLElement = fixture.debugElement.query(By.directive(KbqRadioGroup)).nativeElement;
            const label: HTMLElement = fixture.debugElement.query(By.css('.group-label')).nativeElement;

            expect(group.getAttribute('aria-labelledby')).toBe(label.id);
        });

        it('should mirror the required state onto the group', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.detectChanges();

            const group: HTMLElement = fixture.debugElement.query(By.directive(KbqRadioGroup)).nativeElement;

            expect(group.getAttribute('aria-required')).toBeNull();

            fixture.componentInstance.isGroupRequired = true;
            fixture.detectChanges();

            expect(group.getAttribute('aria-required')).toBe('true');
        });

        it('should mirror the error color of the group onto aria-invalid', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.detectChanges();

            const group: HTMLElement = fixture.debugElement.query(By.directive(KbqRadioGroup)).nativeElement;

            expect(group.getAttribute('aria-invalid')).toBeNull();

            fixture.componentInstance.groupColor = ThemePalette.Error;
            fixture.detectChanges();

            expect(group.getAttribute('aria-invalid')).toBe('true');
            expect(group.classList).toContain('kbq-error');
        });

        it('should name a radio button by its option text alone and describe it with the hint', () => {
            const fixture = TestBed.createComponent(RadioButtonWithHint);

            fixture.detectChanges();

            const root: HTMLElement = fixture.nativeElement;
            const input: HTMLInputElement = root.querySelector('input')!;
            const labelledBy = input.getAttribute('aria-labelledby')!;
            const describedBy = input.getAttribute('aria-describedby')!;

            expect(root.querySelector(`#${labelledBy}`)!.textContent!.trim()).toBe('William Anderson');
            expect(root.querySelector(`#${describedBy}`)!.textContent!.trim()).toBe('Lawyer');
        });

        it('should not describe a radio button that projects no hint', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.detectChanges();

            expect(
                fixture.debugElement.query(By.css('input')).nativeElement.getAttribute('aria-describedby')
            ).toBeNull();
        });

        it('should have no violations for a labelled group', async () => {
            const fixture = TestBed.createComponent(LabelledRadioGroup);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations for a group whose options carry hints', async () => {
            const fixture = TestBed.createComponent(RadioButtonWithHint);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('focus', () => {
        it('should leave a keyboard focus origin on the host, which is what paints the ring', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.detectChanges();

            const host: HTMLElement = fixture.debugElement.query(By.directive(KbqRadioButton)).nativeElement;

            fixture.debugElement.query(By.directive(KbqRadioButton)).componentInstance.focus('keyboard');
            fixture.detectChanges();

            expect(host.classList).toContain('cdk-keyboard-focused');
        });

        it('should default to a programmatic focus origin, which leaves no ring', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.detectChanges();

            const host: HTMLElement = fixture.debugElement.query(By.directive(KbqRadioButton)).nativeElement;

            fixture.debugElement.query(By.directive(KbqRadioButton)).componentInstance.focus();
            fixture.detectChanges();

            expect(host.classList).toContain('cdk-program-focused');
            expect(host.classList).not.toContain('cdk-keyboard-focused');
        });

        it('should move group focus to the checked option', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.detectChanges();

            fixture.componentInstance.groupValue = 'water';
            fixture.detectChanges();

            const group = fixture.debugElement.query(By.directive(KbqRadioGroup)).injector.get(KbqRadioGroup);

            group.focus('keyboard');
            fixture.detectChanges();

            const hosts = fixture.debugElement.queryAll(By.directive(KbqRadioButton));

            expect(hosts[1].nativeElement.classList).toContain('cdk-keyboard-focused');
        });

        it('should move group focus to the first enabled option when nothing is checked', () => {
            const fixture = TestBed.createComponent(RadiosInsideRadioGroup);

            fixture.componentInstance.isFirstDisabled = true;
            fixture.detectChanges();

            const group = fixture.debugElement.query(By.directive(KbqRadioGroup)).injector.get(KbqRadioGroup);

            group.focus('keyboard');
            fixture.detectChanges();

            const hosts = fixture.debugElement.queryAll(By.directive(KbqRadioButton));

            expect(hosts[1].nativeElement.classList).toContain('cdk-keyboard-focused');
        });

        it('should mark the group as touched when focus leaves a radio button', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupWithFormControl);

            fixture.detectChanges();

            const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            TestBed.inject(FocusMonitor).focusVia(input, 'keyboard');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.touched).toBe(false);

            input.blur();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.touched).toBe(true);
        }));
    });

    describe('ControlValueAccessor', () => {
        it('should check the radio matching the ngModel value', fakeAsync(() => {
            const fixture = TestBed.createComponent(RadioGroupWithNgModel);

            fixture.componentInstance.model = 'water';
            fixture.detectChanges();
            // NgModel writes the initial value through a microtask.
            tick();
            fixture.detectChanges();

            const radios = fixture.debugElement
                .queryAll(By.directive(KbqRadioButton))
                .map((debugEl) => debugEl.componentInstance as KbqRadioButton);

            expect(radios.map((radio) => radio.checked)).toEqual([false, true, false]);
        }));

        it('should write the clicked value back into the ngModel', () => {
            const fixture = TestBed.createComponent(RadioGroupWithNgModel);

            fixture.detectChanges();

            fixture.debugElement.queryAll(By.css('label'))[2].nativeElement.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.model).toBe('leaf');
        });

        it('should check the radio matching the form control value', () => {
            const fixture = TestBed.createComponent(RadioGroupWithFormControl);

            fixture.detectChanges();

            fixture.componentInstance.control.setValue('leaf');
            fixture.detectChanges();

            const radios = fixture.debugElement
                .queryAll(By.directive(KbqRadioButton))
                .map((debugEl) => debugEl.componentInstance as KbqRadioButton);

            expect(radios.map((radio) => radio.checked)).toEqual([false, false, true]);
        });

        it('should write the clicked value back into the form control', () => {
            const fixture = TestBed.createComponent(RadioGroupWithFormControl);

            fixture.detectChanges();

            fixture.debugElement.queryAll(By.css('label'))[1].nativeElement.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toBe('water');
            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('should disable every native input when the form control is disabled', () => {
            const fixture = TestBed.createComponent(RadioGroupWithFormControl);

            fixture.detectChanges();

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            const inputs = fixture.debugElement.queryAll(By.css('input'));

            expect(inputs.every((input) => (input.nativeElement as HTMLInputElement).disabled)).toBe(true);
        });
    });
});

@Component({
    imports: [KbqRadioModule, FormsModule, ReactiveFormsModule],
    template: `
        <kbq-radio-group
            [color]="groupColor"
            [disabled]="isGroupDisabled"
            [labelPosition]="labelPos"
            [name]="groupName"
            [required]="isGroupRequired"
            [value]="groupValue"
        >
            <kbq-radio-button [value]="'fire'" [disabled]="isFirstDisabled" [color]="color">
                Charmander
            </kbq-radio-button>
            <kbq-radio-button [value]="'water'" [color]="color">Squirtle</kbq-radio-button>
            <kbq-radio-button [value]="'leaf'" [color]="color">Bulbasaur</kbq-radio-button>
        </kbq-radio-group>
    `
})
class RadiosInsideRadioGroup {
    labelPos: 'before' | 'after' = 'after';
    isFirstDisabled: boolean = false;
    isGroupDisabled: unknown = false;
    isGroupRequired: boolean = false;
    groupName: string = 'test-name';
    groupValue: string | null = null;
    groupColor: ThemePalette = ThemePalette.Empty;
    color: ThemePalette;
}

@Component({
    imports: [KbqRadioModule, FormsModule, ReactiveFormsModule],
    template: `
        <kbq-radio-button [disabled]="disabled">One</kbq-radio-button>
    `
})
class DisableableRadioButton {
    disabled = false;
}

@Component({
    imports: [KbqRadioModule],
    template: `
        <kbq-radio-button>One</kbq-radio-button>
        <kbq-radio-button>Two</kbq-radio-button>
    `
})
class StandaloneRadioButtons {}

@Component({
    imports: [KbqRadioModule],
    template: `
        <kbq-radio-button name="shared">One</kbq-radio-button>
        <kbq-radio-button name="shared">Two</kbq-radio-button>
    `
})
class NamedStandaloneRadioButtons {}

@Component({
    imports: [KbqRadioModule],
    template: `
        <kbq-radio-group>
            <kbq-radio-button name="custom" [value]="'fire'">Charmander</kbq-radio-button>
            <kbq-radio-button [value]="'water'">Squirtle</kbq-radio-button>
        </kbq-radio-group>
    `
})
class RadioGroupWithNamedButton {}

@Component({
    imports: [KbqRadioModule],
    template: `
        <form>
            <kbq-radio-group name="answer">
                <kbq-radio-button [value]="'fire'">Charmander</kbq-radio-button>
                <kbq-radio-button [value]="'water'">Squirtle</kbq-radio-button>
            </kbq-radio-group>
        </form>
    `
})
class RadioGroupInsideForm {}

@Component({
    imports: [KbqRadioModule],
    template: `
        <div id="pokemon-label" class="group-label">Pokemon</div>
        <kbq-radio-group aria-labelledby="pokemon-label">
            <kbq-radio-button [value]="'fire'">Charmander</kbq-radio-button>
            <kbq-radio-button [value]="'water'">Squirtle</kbq-radio-button>
        </kbq-radio-group>
    `
})
class LabelledRadioGroup {}

@Component({
    imports: [KbqRadioModule, KbqFormFieldModule],
    template: `
        <div id="lawyers-label">Lawyers</div>
        <kbq-radio-group aria-labelledby="lawyers-label">
            <kbq-radio-button [value]="'option_1'">
                William Anderson
                <kbq-hint>Lawyer</kbq-hint>
            </kbq-radio-button>
        </kbq-radio-group>
    `
})
class RadioButtonWithHint {}

@Component({
    imports: [KbqRadioModule, FormsModule],
    template: `
        <kbq-radio-group aria-label="Pokemon" [(ngModel)]="model">
            <kbq-radio-button [value]="'fire'">Charmander</kbq-radio-button>
            <kbq-radio-button [value]="'water'">Squirtle</kbq-radio-button>
            <kbq-radio-button [value]="'leaf'">Bulbasaur</kbq-radio-button>
        </kbq-radio-group>
    `
})
class RadioGroupWithNgModel {
    model: string | null = null;
}

@Component({
    imports: [KbqRadioModule, ReactiveFormsModule],
    template: `
        <kbq-radio-group aria-label="Pokemon" [formControl]="control">
            <kbq-radio-button [value]="'fire'">Charmander</kbq-radio-button>
            <kbq-radio-button [value]="'water'">Squirtle</kbq-radio-button>
            <kbq-radio-button [value]="'leaf'">Bulbasaur</kbq-radio-button>
        </kbq-radio-group>
    `
})
class RadioGroupWithFormControl {
    readonly control = new FormControl<string | null>(null);
}

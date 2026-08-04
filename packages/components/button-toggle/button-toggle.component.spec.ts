import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Component, DebugElement, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    dispatchKeyboardEvent,
    DOWN_ARROW,
    END,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    UP_ARROW
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleDirective } from '@koobiq/components/title';
import { axe } from 'jest-axe';
import { EMPTY } from 'rxjs';
import { KbqButtonToggle, KbqButtonToggleChange, KbqButtonToggleGroup, KbqButtonToggleModule } from './index';

describe('KbqButtonToggle with forms', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqButtonModule,
                KbqButtonToggleModule,
                FormsModule,
                ReactiveFormsModule,
                ButtonToggleGroupWithNgModel,
                ButtonToggleGroupWithFormControl
            ]
        }).compileComponents();
    });

    describe('using FormControl', () => {
        let fixture: ComponentFixture<ButtonToggleGroupWithFormControl>;
        let groupDebugElement: DebugElement;
        let groupInstance: KbqButtonToggleGroup;
        let testComponent: ButtonToggleGroupWithFormControl;

        beforeEach(() => {
            fixture = TestBed.createComponent(ButtonToggleGroupWithFormControl);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggleGroup));
            groupInstance = groupDebugElement.injector.get<KbqButtonToggleGroup>(KbqButtonToggleGroup);
        });

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
            const spy = jest.fn();

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

        beforeEach(() => {
            fixture = TestBed.createComponent(ButtonToggleGroupWithNgModel);
            fixture.detectChanges();
            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggleGroup));
            groupInstance = groupDebugElement.injector.get<KbqButtonToggleGroup>(KbqButtonToggleGroup);
            groupNgModel = groupDebugElement.injector.get<NgModel>(NgModel);

            buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(KbqButtonToggle));
            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
            innerButtons = buttonToggleDebugElements.map((debugEl) => debugEl.query(By.css('button')).nativeElement);

            fixture.detectChanges();
        });

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

        it('should have the correct NgModel control state initially and after interaction', fakeAsync(() => {
            expect(groupNgModel.valid).toBe(true);
            expect(groupNgModel.pristine).toBe(true);
            expect(groupNgModel.touched).toBe(false);

            buttonToggleInstances[1].checked = true;
            fixture.detectChanges();
            tick();

            expect(groupNgModel.valid).toBe(true);
            expect(groupNgModel.pristine).toBe(true);
            expect(groupNgModel.touched).toBe(false);

            innerButtons[2].click();
            fixture.detectChanges();
            tick();

            expect(groupNgModel.valid).toBe(true);
            expect(groupNgModel.pristine).toBe(false);
            expect(groupNgModel.touched).toBe(true);
        }));

        it('should update the ngModel value when selecting a button toggle', fakeAsync(() => {
            innerButtons[1].click();
            fixture.detectChanges();

            tick();

            expect(testComponent.modelValue).toBe('green');
        }));
    });
});

describe('KbqButtonToggle without forms', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqButtonModule,
                KbqButtonToggleModule,
                ButtonTogglesInsideButtonToggleGroup,
                ButtonTogglesInsideButtonToggleGroupMultiple,
                FalsyButtonTogglesInsideButtonToggleGroupMultiple,
                ButtonToggleGroupWithInitialValue,
                StandaloneButtonToggle,
                RepeatedButtonTogglesWithPreselectedValue
            ]
        }).compileComponents();
    });

    describe('inside of an exclusive selection group', () => {
        let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroup>;
        let groupDebugElement: DebugElement;
        let groupNativeElement: HTMLElement;
        let buttonToggleDebugElements: DebugElement[];
        let buttonToggleNativeElements: HTMLElement[];
        let innerButtons: HTMLButtonElement[];
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

            buttonToggleNativeElements = buttonToggleDebugElements.map((debugEl) => debugEl.nativeElement);

            innerButtons = fixture.debugElement.queryAll(By.css('button')).map((debugEl) => debugEl.nativeElement);

            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
        });

        it('should disable click interactions when the group is disabled', () => {
            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            buttonToggleNativeElements[0].click();

            expect(buttonToggleInstances[0].checked).toBe(false);
            testComponent.isGroupDisabled = false;

            fixture.detectChanges();

            innerButtons[0].click();
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
            innerButtons[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
        });

        it('should propagate the value change back up via a two-way binding', () => {
            expect(groupInstance.value).toBeFalsy();
            innerButtons[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(testComponent.groupValue).toBe('test1');
        });

        it('should update the group and toggles when one of the button toggles is clicked', () => {
            expect(groupInstance.value).toBeFalsy();
            innerButtons[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(buttonToggleInstances[1].checked).toBe(false);

            innerButtons[1].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test2');
            expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
            expect(buttonToggleInstances[0].checked).toBe(false);
            expect(buttonToggleInstances[1].checked).toBe(true);
        });

        it('should change the vertical state', () => {
            expect(groupNativeElement.classList).not.toContain('kbq-button-toggle_vertical');

            testComponent.isVertical = true;
            fixture.detectChanges();

            expect(groupNativeElement.classList).toContain('kbq-button-toggle_vertical');
        });

        it('should emit a change event from button toggles', fakeAsync(() => {
            expect(buttonToggleInstances[0].checked).toBe(false);

            const changeSpy = jest.fn();

            buttonToggleInstances[0].change.subscribe(changeSpy);

            innerButtons[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalledTimes(1);

            innerButtons[0].click();
            fixture.detectChanges();
            tick();

            // Always emit change event when button toggle is clicked
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should emit a change event from the button toggle group', fakeAsync(() => {
            expect(groupInstance.value).toBeFalsy();

            const changeSpy = jest.fn();

            groupInstance.change.subscribe(changeSpy);

            innerButtons[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();

            innerButtons[1].click();
            fixture.detectChanges();
            tick();
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

        it('should deselect all of the toggles when the group value is cleared', () => {
            buttonToggleInstances[0].checked = true;

            expect(groupInstance.value).toBeTruthy();

            groupInstance.value = null;

            expect(buttonToggleInstances.every((toggle) => !toggle.checked)).toBe(true);
        });

        it('should update the model if a selected toggle is removed', fakeAsync(() => {
            expect(groupInstance.value).toBeFalsy();
            innerButtons[0].click();
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
            const groupInstance: KbqButtonToggleGroup =
                groupDebugElement.injector.get<KbqButtonToggleGroup>(KbqButtonToggleGroup);

            fixture.detectChanges();

            // Note that we cast to a boolean, because the event has some circular references
            // which will crash the runner when it attempts to stringify them.
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
        let innerButtons: HTMLButtonElement[];
        let groupInstance: KbqButtonToggleGroup;
        let buttonToggleInstances: KbqButtonToggle[];
        let testComponent: ButtonTogglesInsideButtonToggleGroupMultiple;

        beforeEach(() => {
            fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggleGroup));
            groupNativeElement = groupDebugElement.nativeElement;
            groupInstance = groupDebugElement.injector.get<KbqButtonToggleGroup>(KbqButtonToggleGroup);

            buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(KbqButtonToggle));
            buttonToggleNativeElements = buttonToggleDebugElements.map((debugEl) => debugEl.nativeElement);
            innerButtons = fixture.debugElement.queryAll(By.css('button')).map((debugEl) => debugEl.nativeElement);
            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
        });

        it('should disable click interactions when the group is disabled', () => {
            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            buttonToggleNativeElements[0].click();
            expect(buttonToggleInstances[0].checked).toBe(false);
        });

        it('should check a button toggle when clicked', () => {
            expect(buttonToggleInstances.every((buttonToggle) => !buttonToggle.checked)).toBe(true);

            const innerButton = buttonToggleDebugElements[0].query(By.css('button')).nativeElement;

            innerButton.click();

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

        it('should change the vertical state', () => {
            expect(groupNativeElement.classList).not.toContain('kbq-button-toggle_vertical');

            testComponent.isVertical = true;
            fixture.detectChanges();

            expect(groupNativeElement.classList).toContain('kbq-button-toggle_vertical');
        });

        it('should deselect a button toggle when selected twice', fakeAsync(() => {
            innerButtons[0].click();
            fixture.detectChanges();
            tick();

            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(groupInstance.value).toEqual(['eggs']);

            innerButtons[0].click();
            fixture.detectChanges();
            tick();

            expect(groupInstance.value).toEqual([]);
            expect(buttonToggleInstances[0].checked).toBe(false);
        }));

        it('should emit a change event for state changes', fakeAsync(() => {
            expect(buttonToggleInstances[0].checked).toBe(false);

            const changeSpy = jest.fn();

            buttonToggleInstances[0].change.subscribe(changeSpy);

            innerButtons[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();
            expect(groupInstance.value).toEqual(['eggs']);

            innerButtons[0].click();
            fixture.detectChanges();
            tick();
            expect(groupInstance.value).toEqual([]);

            // The default browser behavior is to emit an event, when the value was set
            // to false. That's because the current input type is set to `checkbox` when
            // using the multiple mode.
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should report the toggle the change came from, including the one that emptied the group', () => {
            const events: KbqButtonToggleChange[] = [];

            groupInstance.change.subscribe((event) => events.push(event));

            innerButtons[0].click();
            fixture.detectChanges();

            expect(events[0].source).toBe(buttonToggleInstances[0]);

            // Nothing is selected after this one, so there is no "last selected" toggle to fall back on.
            innerButtons[0].click();
            fixture.detectChanges();

            expect(events[1].source).toBe(buttonToggleInstances[0]);
            expect(events[1].value).toEqual([]);
        });

        it('should throw when attempting to assign a non-array value', () => {
            expect(() => {
                groupInstance.value = 'not-an-array';
            }).toThrow(/Value must be an array/);
        });
    });

    describe('as standalone', () => {
        let fixture: ComponentFixture<StandaloneButtonToggle>;
        let buttonToggleDebugElement: DebugElement;
        let innerButton: HTMLButtonElement;
        let buttonToggleInstance: KbqButtonToggle;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandaloneButtonToggle);
            fixture.detectChanges();

            buttonToggleDebugElement = fixture.debugElement.query(By.directive(KbqButtonToggle));
            innerButton = fixture.debugElement.query(By.css('button')).nativeElement;

            buttonToggleInstance = buttonToggleDebugElement.componentInstance;
        });

        it('should toggle when clicked', fakeAsync(() => {
            innerButton.click();
            fixture.detectChanges();
            flush();

            expect(buttonToggleInstance.checked).toBe(true);

            innerButton.click();
            fixture.detectChanges();
            flush();

            expect(buttonToggleInstance.checked).toBe(false);
        }));

        it('should emit a change event for state changes', fakeAsync(() => {
            expect(buttonToggleInstance.checked).toBe(false);

            const changeSpy = jest.fn();

            buttonToggleInstance.change.subscribe(changeSpy);

            innerButton.click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();

            innerButton.click();
            fixture.detectChanges();
            tick();

            // The default browser behavior is to emit an event, when the value was set
            // to false. That's because the current input type is set to `checkbox`.
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should report the disabled state as a boolean without a group to fall back on', () => {
            // The getter used to hand back the group it could not find, i.e. `null`, whenever the
            // toggle was not disabled itself — falsy, so it rendered fine, and still not a boolean.
            expect(buttonToggleInstance.disabled).toBe(false);

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();

            expect(buttonToggleInstance.disabled).toBe(true);
            expect(innerButton.disabled).toBe(true);

            innerButton.click();
            fixture.detectChanges();

            expect(buttonToggleInstance.checked).toBe(false);
        });
    });

    it('should not throw on init when toggles are repeated and there is an initial value', () => {
        const fixture = TestBed.createComponent(RepeatedButtonTogglesWithPreselectedValue);

        expect(() => fixture.detectChanges()).not.toThrow();
        expect(fixture.componentInstance.toggleGroup().value).toBe('Two');
        expect(fixture.componentInstance.toggles()[1].checked).toBe(true);
    });

    it('should maintain the selected state when the value and toggles are swapped out at the same time', () => {
        const fixture = TestBed.createComponent(RepeatedButtonTogglesWithPreselectedValue);

        fixture.detectChanges();

        expect(fixture.componentInstance.toggleGroup().value).toBe('Two');
        expect(fixture.componentInstance.toggles()[1].checked).toBe(true);

        fixture.componentInstance.possibleValues = ['Five', 'Six', 'Seven'];
        fixture.componentInstance.value = 'Seven';
        fixture.detectChanges();

        expect(fixture.componentInstance.toggleGroup().value).toBe('Seven');
        expect(fixture.componentInstance.toggles()[2].checked).toBe(true);
    });

    it('should select falsy button toggle value in multiple selection', () => {
        const fixture = TestBed.createComponent(FalsyButtonTogglesInsideButtonToggleGroupMultiple);

        fixture.detectChanges();

        expect(fixture.componentInstance.toggles()[0].checked).toBe(true);
        expect(fixture.componentInstance.toggles()[1].checked).toBe(false);
        expect(fixture.componentInstance.toggles()[2].checked).toBe(false);

        fixture.componentInstance.value = [0, false];
        fixture.detectChanges();

        expect(fixture.componentInstance.toggles()[0].checked).toBe(true);
        expect(fixture.componentInstance.toggles()[1].checked).toBe(false);
        expect(fixture.componentInstance.toggles()[2].checked).toBe(true);
    });
});

/**
 * The label lives in a box of its own, because it has two jobs no single box can do at once: paint
 * `text-overflow: ellipsis`, which a flex box never does, and lay icons out beside it, which only a
 * flex box does exactly. Nothing here asserts computed styles — jest-preset-angular strips component
 * styles — so what is pinned instead is the structure those styles are written against, and the
 * element `kbq-title` measures.
 */
describe('KbqButtonToggle label', () => {
    const getLabel = (fixture: ComponentFixture<unknown>): HTMLElement =>
        fixture.nativeElement.querySelector('.kbq-button-toggle-text');
    const getWrapper = (fixture: ComponentFixture<unknown>): HTMLElement =>
        fixture.nativeElement.querySelector('.kbq-button-toggle-wrapper');
    const getTitle = (fixture: ComponentFixture<unknown>): KbqTitleDirective =>
        fixture.debugElement.query(By.directive(KbqTitleDirective)).injector.get(KbqTitleDirective);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqButtonToggleModule,
                KbqIconModule,
                ButtonToggleWithLabelOnly,
                ButtonToggleWithSlottedIcons,
                ButtonToggleWithConditionalSlottedIcon,
                ButtonToggleWithLegacyIcon,
                ButtonToggleWithIconOnly,
                ButtonToggleWithSlottedIconOnly
            ]
        }).compileComponents();
    });

    describe('content projection', () => {
        it('should project the label into the label box', () => {
            const fixture = TestBed.createComponent(ButtonToggleWithSlottedIcons);

            fixture.detectChanges();

            expect(getLabel(fixture).textContent!.trim()).toBe('Label');
        });

        it('should project marked icons beside the label box, in source order', () => {
            const fixture = TestBed.createComponent(ButtonToggleWithSlottedIcons);

            fixture.detectChanges();

            const label = getLabel(fixture);

            // the whole point of the slots: an icon inside the label box would share its line and
            // take the ellipsis with it
            expect(label.querySelector('.kbq-icon')).toBeNull();
            expect(Array.from(getWrapper(fixture).children)).toEqual([
                fixture.nativeElement.querySelector('#prefix'),
                label,
                fixture.nativeElement.querySelector('#suffix')
            ]);
        });

        it('should project a marked icon rendered by @if beside the label box', () => {
            const fixture = TestBed.createComponent(ButtonToggleWithConditionalSlottedIcon);

            fixture.detectChanges();

            // A slot selector is matched at compile time, so content Angular only creates later still
            // has to reach it — otherwise every conditional icon would silently fall back to the
            // default slot and take the ellipsis with it.
            expect(getLabel(fixture).querySelector('.kbq-icon')).toBeNull();
            expect(getWrapper(fixture).querySelector(':scope > .kbq-icon')).not.toBeNull();

            fixture.componentInstance.showIcon = false;
            fixture.detectChanges();

            expect(getWrapper(fixture).querySelector('.kbq-icon')).toBeNull();
        });

        it('should project an unmarked icon into the label box', () => {
            const fixture = TestBed.createComponent(ButtonToggleWithLegacyIcon);

            fixture.detectChanges();

            expect(getLabel(fixture).querySelector('#legacy')).not.toBeNull();
            expect(getWrapper(fixture).children.length).toBe(1);
        });

        it('should leave the label box empty when everything is slotted', () => {
            const fixture = TestBed.createComponent(ButtonToggleWithSlottedIconOnly);

            fixture.detectChanges();

            // `:empty` is what stops the box from taking a gap of the row and pushing the lone icon
            // off centre, so it has to stay empty — whitespace included
            expect(getLabel(fixture).childNodes.length).toBe(0);
        });
    });

    describe('kbq-title', () => {
        it('should measure the label box against itself', () => {
            const fixture = TestBed.createComponent(ButtonToggleWithSlottedIcons);

            fixture.detectChanges();

            const title = getTitle(fixture);
            const label = getLabel(fixture);

            // Measuring the label against the whole button would leave a band as wide as an icon plus
            // its gap where the label is already clipped but the tooltip stays silent. Measured
            // against itself, the comparison is exactly `clientWidth < scrollWidth`.
            expect(title.child).toBe(label);
            expect(title.parent).toBe(label);
        });

        it('should enable the tooltip only while the label is clipped', () => {
            const fixture = TestBed.createComponent(ButtonToggleWithSlottedIcons);

            fixture.detectChanges();

            const title = getTitle(fixture);
            const label = getLabel(fixture);
            const setWidths = (offsetWidth: number, scrollWidth: number) => {
                Object.defineProperty(label, 'offsetWidth', { value: offsetWidth, configurable: true });
                Object.defineProperty(label, 'scrollWidth', { value: scrollWidth, configurable: true });
            };

            setWidths(100, 200);
            title.handleElementEnter();

            expect(title.disabled).toBe(false);
            expect(title.content).toBe('Label');

            setWidths(100, 100);
            title.handleElementEnter();

            expect(title.disabled).toBe(true);
        });
    });

    describe('iconType', () => {
        /**
         * The host class is the only consumer-visible signal for "icons only" versus "icons beside a
         * label", and no stylesheet in the repo reads it — so nothing else would catch it drifting.
         * The label box is flattened out of the node walk to keep a marked and an unmarked icon
         * counted the same way; these are the cases that go wrong without it.
         */
        it.each([
            ['text only', () => ButtonToggleWithLabelOnly, ''],
            ['a marked icon beside a label', () => ButtonToggleWithSlottedIcons, '-icon-text'],
            ['an unmarked icon beside a label', () => ButtonToggleWithLegacyIcon, '-icon-text'],
            ['an unmarked icon on its own', () => ButtonToggleWithIconOnly, '-icon'],
            ['a marked icon on its own', () => ButtonToggleWithSlottedIconOnly, '-icon']
        ])('should report %s', (_, component, expected) => {
            const fixture = TestBed.createComponent(component());

            fixture.detectChanges();

            const toggle = fixture.debugElement.query(By.directive(KbqButtonToggle));

            expect(toggle.componentInstance.iconType).toBe(expected);
            expect(toggle.nativeElement.classList).toContain(`kbq-button-toggle${expected}`);
        });
    });
});

/**
 * The control behaves like a radio group in single-selection mode and like a set of toggle buttons
 * with `multiple`, and none of that reaches assistive tech through the styling: `.kbq-selected` is a
 * class, not a state. What is pinned here is the semantics the two modes render — role, state, the
 * accessible name, and the tab order that `role="radio"` implies.
 */
describe('KbqButtonToggle accessibility', () => {
    const getGroup = (fixture: ComponentFixture<unknown>): HTMLElement =>
        fixture.nativeElement.querySelector('kbq-button-toggle-group');
    const getInnerButtons = (fixture: ComponentFixture<unknown>): HTMLButtonElement[] =>
        Array.from(fixture.nativeElement.querySelectorAll('button'));
    const getToggles = (fixture: ComponentFixture<unknown>): KbqButtonToggle[] =>
        fixture.debugElement.queryAll(By.directive(KbqButtonToggle)).map((debugEl) => debugEl.componentInstance);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqButtonToggleModule,
                KbqIconModule,
                NamedButtonToggleGroup,
                ButtonTogglesInsideButtonToggleGroupMultiple,
                StandaloneButtonToggle,
                StandaloneButtonToggleWithTabIndex,
                ButtonToggleWithIconOnly,
                UnnamedIconOnlyButtonToggle,
                TitledIconOnlyButtonToggle,
                DestroyableButtonToggleGroup
            ]
        }).compileComponents();
    });

    describe('role and state', () => {
        it('should announce a single-selection group as a named radiogroup of radios', () => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.detectChanges();

            expect(getGroup(fixture).getAttribute('role')).toBe('radiogroup');
            expect(getGroup(fixture).getAttribute('aria-label')).toBe('Delivery');
            expect(getGroup(fixture).getAttribute('aria-orientation')).toBe('horizontal');

            for (const button of getInnerButtons(fixture)) {
                expect(button.getAttribute('role')).toBe('radio');
                expect(button.getAttribute('aria-checked')).toBe('false');
                expect(button.hasAttribute('aria-pressed')).toBe(false);
            }
        });

        it('should track the selection in aria-checked', () => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.detectChanges();

            getInnerButtons(fixture)[1].click();
            fixture.detectChanges();

            expect(getInnerButtons(fixture).map((button) => button.getAttribute('aria-checked'))).toEqual([
                'false',
                'true',
                'false'
            ]);
        });

        it('should announce a multiple-selection group as toggle buttons in a group', () => {
            const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);

            fixture.detectChanges();

            expect(getGroup(fixture).getAttribute('role')).toBe('group');

            // A native button is already a button; a multi-select toggle only misses its pressed
            // state, which is exactly what the toggle-button pattern asks for.
            for (const button of getInnerButtons(fixture)) {
                expect(button.hasAttribute('role')).toBe(false);
                expect(button.getAttribute('aria-pressed')).toBe('false');
                expect(button.hasAttribute('aria-checked')).toBe(false);
            }

            getInnerButtons(fixture)[0].click();
            fixture.detectChanges();

            expect(getInnerButtons(fixture)[0].getAttribute('aria-pressed')).toBe('true');
        });

        it('should announce the orientation a radio group is walked in', () => {
            const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);

            fixture.componentInstance.isMultiple = false;
            fixture.detectChanges();

            expect(getGroup(fixture).getAttribute('aria-orientation')).toBe('horizontal');

            fixture.componentInstance.isVertical = true;
            fixture.detectChanges();

            expect(getGroup(fixture).getAttribute('aria-orientation')).toBe('vertical');
        });

        it('should leave the orientation off a multiple-selection group, which does not support it', () => {
            // `role="group"` has no `aria-orientation` (AXE `aria-allowed-attr`), and no arrow keys either.
            const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);

            fixture.componentInstance.isVertical = true;
            fixture.detectChanges();

            expect(getGroup(fixture).hasAttribute('aria-orientation')).toBe(false);
        });

        it('should announce a standalone toggle as a toggle button', () => {
            const fixture = TestBed.createComponent(StandaloneButtonToggle);

            fixture.detectChanges();

            const button = getInnerButtons(fixture)[0];

            expect(button.hasAttribute('role')).toBe(false);
            expect(button.getAttribute('aria-pressed')).toBe('false');

            button.click();
            fixture.detectChanges();

            expect(button.getAttribute('aria-pressed')).toBe('true');
        });

        it('should follow the mode when it changes at runtime', () => {
            const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);

            fixture.detectChanges();

            expect(getToggles(fixture)[0].type).toBe('checkbox');

            fixture.componentInstance.isMultiple = false;
            fixture.detectChanges();

            expect(getToggles(fixture)[0].type).toBe('radio');
            expect(getGroup(fixture).getAttribute('role')).toBe('radiogroup');
            expect(getInnerButtons(fixture)[0].getAttribute('role')).toBe('radio');
        });
    });

    describe('accessible name', () => {
        it('should forward the name to the button, which is the element the user focuses', () => {
            const fixture = TestBed.createComponent(ButtonToggleWithIconOnly);

            fixture.detectChanges();

            expect(getInnerButtons(fixture)[0].getAttribute('aria-label')).toBe('Play');
        });

        it('should warn about an icon-only toggle with no accessible name', () => {
            // An icon glyph is `aria-hidden`, so such a button has no name at all (AXE `button-name`).
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const fixture = TestBed.createComponent(UnnamedIconOnlyButtonToggle);

            fixture.detectChanges();

            expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'), expect.anything());

            warn.mockRestore();
        });

        it('should stay quiet about an icon-only toggle that carries a name', () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const fixture = TestBed.createComponent(ButtonToggleWithIconOnly);

            fixture.detectChanges();

            expect(warn).not.toHaveBeenCalled();

            warn.mockRestore();
        });

        it('should not accept a title on the host, which never reaches the button it would name', () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const fixture = TestBed.createComponent(TitledIconOnlyButtonToggle);

            fixture.detectChanges();

            expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'), expect.anything());

            warn.mockRestore();
        });
    });

    describe('axe', () => {
        it('should have no violations in a single-selection group', async () => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations in a multiple-selection group', async () => {
            const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations for a named icon-only toggle', async () => {
            const fixture = TestBed.createComponent(ButtonToggleWithIconOnly);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('roving tabindex', () => {
        // `KbqButton` renders no `tabindex` for the default 0: a native button is in the tab order
        // already. Anything else is rendered, so `-1` is what the excluded toggles show.
        const getTabIndexes = (fixture: ComponentFixture<unknown>) =>
            getInnerButtons(fixture).map((button) => button.getAttribute('tabindex'));

        it('should leave one tab stop in a radio group and move it with the selection', () => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.detectChanges();

            expect(getTabIndexes(fixture)).toEqual([null, '-1', '-1']);

            getInnerButtons(fixture)[2].click();
            fixture.detectChanges();

            expect(getTabIndexes(fixture)).toEqual(['-1', '-1', null]);
        });

        it('should not park the tab stop on a disabled toggle', () => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.componentInstance.isFirstDisabled = true;
            fixture.detectChanges();

            // a disabled button is out of the tab order on its own, so the entry point has to move
            expect(getTabIndexes(fixture)).toEqual(['-1', null, '-1']);
        });

        it('should keep every toggle in the tab order in a multiple-selection group', () => {
            const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);

            fixture.detectChanges();

            expect(getTabIndexes(fixture)).toEqual([null, null, null]);
        });

        it('should reflect an explicit tabIndex', () => {
            const fixture = TestBed.createComponent(StandaloneButtonToggleWithTabIndex);

            fixture.detectChanges();

            expect(getTabIndexes(fixture)).toEqual([null]);

            fixture.componentInstance.tabIndex = 3;
            fixture.detectChanges();

            expect(getTabIndexes(fixture)).toEqual(['3']);
        });
    });

    describe('keyboard navigation', () => {
        it.each([
            ['ArrowRight', RIGHT_ARROW, 1],
            ['ArrowDown', DOWN_ARROW, 1],
            ['ArrowLeft', LEFT_ARROW, 2],
            ['ArrowUp', UP_ARROW, 2]
        ])('should move focus and selection with %s', (_, keyCode, expected) => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.detectChanges();

            const buttons = getInnerButtons(fixture);

            dispatchKeyboardEvent(buttons[0], 'keydown', keyCode);
            fixture.detectChanges();

            // selection follows focus, which is what makes it a radio group rather than a toolbar
            expect(getToggles(fixture)[expected].checked).toBe(true);
            expect(document.activeElement).toBe(buttons[expected]);
        });

        it.each([
            ['Home', HOME, 0],
            ['End', END, 2]
        ])('should jump to the edge of the group with %s', (_, keyCode, expected) => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.detectChanges();

            const buttons = getInnerButtons(fixture);

            dispatchKeyboardEvent(buttons[1], 'keydown', keyCode);
            fixture.detectChanges();

            expect(getToggles(fixture)[expected].checked).toBe(true);
        });

        it('should skip a disabled toggle', () => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.componentInstance.isFirstDisabled = true;
            fixture.detectChanges();

            dispatchKeyboardEvent(getInnerButtons(fixture)[1], 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(getToggles(fixture)[0].checked).toBe(false);
            expect(getToggles(fixture)[2].checked).toBe(true);
        });

        it('should wrap around at both ends of the group', () => {
            const fixture = TestBed.createComponent(NamedButtonToggleGroup);

            fixture.detectChanges();

            const buttons = getInnerButtons(fixture);

            // backwards off the first toggle lands on the last one, and forwards off the last one
            dispatchKeyboardEvent(buttons[0], 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            expect(getToggles(fixture)[2].checked).toBe(true);

            dispatchKeyboardEvent(buttons[2], 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(getToggles(fixture)[0].checked).toBe(true);
        });

        it('should ignore the arrow keys in a multiple-selection group, leaving them to the browser', () => {
            const fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);

            fixture.detectChanges();

            const event = dispatchKeyboardEvent(getInnerButtons(fixture)[0], 'keydown', RIGHT_ARROW);

            fixture.detectChanges();

            expect(event.defaultPrevented).toBe(false);
            expect(getToggles(fixture).some((toggle) => toggle.checked)).toBe(false);
        });
    });

    describe('focus', () => {
        it('should focus the inner button rather than the non-focusable host', () => {
            const fixture = TestBed.createComponent(StandaloneButtonToggle);

            fixture.detectChanges();

            getToggles(fixture)[0].focus();

            expect(document.activeElement).toBe(getInnerButtons(fixture)[0]);
        });

        it('should show the focus ring when focused via the keyboard', () => {
            const fixture = TestBed.createComponent(StandaloneButtonToggle);

            fixture.detectChanges();

            getToggles(fixture)[0].focusViaKeyboard();
            fixture.detectChanges();

            // the class is the only thing that paints the ring, and only FocusMonitor sets it
            expect(fixture.nativeElement.querySelector('kbq-button-toggle').classList).toContain(
                'cdk-keyboard-focused'
            );
        });

        it('should monitor the host and stop on destroy', () => {
            const focusMonitor = TestBed.inject(FocusMonitor);
            const monitor = jest.spyOn(focusMonitor, 'monitor');
            const stopMonitoring = jest.spyOn(focusMonitor, 'stopMonitoring');
            const fixture = TestBed.createComponent(StandaloneButtonToggle);

            fixture.detectChanges();

            const host = fixture.nativeElement.querySelector('kbq-button-toggle');

            expect(monitor).toHaveBeenCalledWith(host, true);

            fixture.destroy();

            expect(stopMonitoring).toHaveBeenCalledWith(host);
        });
    });

    describe('teardown', () => {
        it('should not sync the selection after the whole group is destroyed', fakeAsync(() => {
            const fixture = TestBed.createComponent(DestroyableButtonToggleGroup);

            fixture.detectChanges();

            const group = fixture.debugElement
                .query(By.directive(KbqButtonToggleGroup))
                .injector.get(KbqButtonToggleGroup);
            const valueChange = jest.fn();

            group.valueChange.subscribe(valueChange);

            // Each selected toggle queues its own removal from the selection on a microtask, which
            // runs after the group it would notify is already gone.
            fixture.componentInstance.render = false;
            fixture.detectChanges();
            flush();

            expect(valueChange).not.toHaveBeenCalled();
        }));
    });
});

describe('KbqButtonToggle keyboard navigation in RTL', () => {
    const getInnerButtons = (fixture: ComponentFixture<unknown>): HTMLButtonElement[] =>
        Array.from(fixture.nativeElement.querySelectorAll('button'));
    const getToggles = (fixture: ComponentFixture<unknown>): KbqButtonToggle[] =>
        fixture.debugElement.queryAll(By.directive(KbqButtonToggle)).map((debugEl) => debugEl.componentInstance);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqButtonToggleModule, NamedButtonToggleGroup],
            providers: [{ provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }]
        }).compileComponents();
    });

    it.each([
        ['ArrowLeft', LEFT_ARROW, 1],
        ['ArrowRight', RIGHT_ARROW, 2]
    ])('should swap the horizontal keys, so %s follows the reading direction', (_, keyCode, expected) => {
        const fixture = TestBed.createComponent(NamedButtonToggleGroup);

        fixture.detectChanges();

        dispatchKeyboardEvent(getInnerButtons(fixture)[0], 'keydown', keyCode);
        fixture.detectChanges();

        expect(getToggles(fixture)[expected].checked).toBe(true);
    });

    it.each([
        ['ArrowDown', DOWN_ARROW, 1],
        ['ArrowUp', UP_ARROW, 2]
    ])('should leave the vertical key %s pointing the same way', (_, keyCode, expected) => {
        const fixture = TestBed.createComponent(NamedButtonToggleGroup);

        fixture.detectChanges();

        dispatchKeyboardEvent(getInnerButtons(fixture)[0], 'keydown', keyCode);
        fixture.detectChanges();

        expect(getToggles(fixture)[expected].checked).toBe(true);
    });
});

@Component({
    imports: [KbqButtonModule, KbqButtonToggleModule],
    template: `
        <kbq-button-toggle-group [disabled]="isGroupDisabled" [vertical]="isVertical" [(value)]="groupValue">
            @if (renderFirstToggle) {
                <kbq-button-toggle [value]="'test1'">Test1</kbq-button-toggle>
            }
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
    imports: [KbqButtonModule, KbqButtonToggleModule, FormsModule, ReactiveFormsModule],
    template: `
        <kbq-button-toggle-group [name]="groupName" [(ngModel)]="modelValue" (change)="lastEvent = $event">
            @for (option of options; track option) {
                <kbq-button-toggle [value]="option.value">
                    {{ option.label }}
                </kbq-button-toggle>
            }
        </kbq-button-toggle-group>
    `
})
class ButtonToggleGroupWithNgModel {
    groupName = 'group-name';
    modelValue: string;
    options = [
        { label: 'Red', value: 'red' },
        { label: 'Green', value: 'green' },
        { label: 'Blue', value: 'blue' }
    ];
    lastEvent: KbqButtonToggleChange;
}

@Component({
    imports: [KbqButtonModule, KbqButtonToggleModule],
    template: `
        <kbq-button-toggle-group [disabled]="isGroupDisabled" [multiple]="isMultiple" [vertical]="isVertical">
            <kbq-button-toggle [value]="'eggs'">Eggs</kbq-button-toggle>
            <kbq-button-toggle [value]="'flour'">Flour</kbq-button-toggle>
            <kbq-button-toggle [value]="'sugar'">Sugar</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class ButtonTogglesInsideButtonToggleGroupMultiple {
    isGroupDisabled: boolean = false;
    isVertical: boolean = false;
    isMultiple: boolean = true;
}

@Component({
    imports: [KbqButtonModule, KbqButtonToggleModule],
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
    readonly toggles = viewChildren(KbqButtonToggle);
}

@Component({
    imports: [KbqButtonModule, KbqButtonToggleModule],
    template: `
        <kbq-button-toggle [disabled]="isDisabled">Yes</kbq-button-toggle>
    `
})
class StandaloneButtonToggle {
    isDisabled = false;
}

@Component({
    imports: [KbqButtonModule, KbqButtonToggleModule],
    template: `
        <kbq-button-toggle-group [value]="'red'" (change)="lastEvent = $event">
            <kbq-button-toggle [value]="'red'">Value Red</kbq-button-toggle>
            <kbq-button-toggle [value]="'green'">Value Green</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class ButtonToggleGroupWithInitialValue {
    lastEvent: KbqButtonToggleChange;
}

@Component({
    imports: [KbqButtonModule, KbqButtonToggleModule, FormsModule, ReactiveFormsModule],
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
    imports: [KbqButtonModule, KbqButtonToggleModule],
    template: `
        <kbq-button-toggle-group [(value)]="value">
            @for (toggle of possibleValues; track toggle) {
                <kbq-button-toggle [value]="toggle">
                    {{ toggle }}
                </kbq-button-toggle>
            }
        </kbq-button-toggle-group>
    `
})
class RepeatedButtonTogglesWithPreselectedValue {
    readonly toggleGroup = viewChild.required(KbqButtonToggleGroup);
    readonly toggles = viewChildren(KbqButtonToggle);

    possibleValues = ['One', 'Two', 'Three'];
    value = 'Two';
}

@Component({
    imports: [KbqButtonToggleModule],
    template: `
        <kbq-button-toggle>Label</kbq-button-toggle>
    `
})
class ButtonToggleWithLabelOnly {}

@Component({
    imports: [KbqButtonToggleModule, KbqIconModule],
    template: `
        <kbq-button-toggle>
            <i id="prefix" kbqButtonPrefix kbq-icon="kbq-play_16"></i>
            Label
            <i id="suffix" kbqButtonSuffix kbq-icon="kbq-chevron-down-s_16"></i>
        </kbq-button-toggle>
    `
})
class ButtonToggleWithSlottedIcons {}

@Component({
    imports: [KbqButtonToggleModule, KbqIconModule],
    template: `
        <kbq-button-toggle>
            @if (showIcon) {
                <i kbqButtonPrefix kbq-icon="kbq-play_16"></i>
            }
            Label
        </kbq-button-toggle>
    `
})
class ButtonToggleWithConditionalSlottedIcon {
    showIcon = true;
}

@Component({
    imports: [KbqButtonToggleModule, KbqIconModule],
    template: `
        <kbq-button-toggle>
            <i id="legacy" kbq-icon="kbq-play_16"></i>
            Label
        </kbq-button-toggle>
    `
})
class ButtonToggleWithLegacyIcon {}

@Component({
    imports: [KbqButtonToggleModule, KbqIconModule],
    template: `
        <kbq-button-toggle aria-label="Play">
            <i kbq-icon="kbq-play_16"></i>
        </kbq-button-toggle>
    `
})
class ButtonToggleWithIconOnly {}

@Component({
    imports: [KbqButtonToggleModule, KbqIconModule],
    template: `
        <kbq-button-toggle aria-label="Play">
            <i kbqButtonPrefix kbq-icon="kbq-play_16"></i>
        </kbq-button-toggle>
    `
})
class ButtonToggleWithSlottedIconOnly {}

@Component({
    imports: [KbqButtonToggleModule, KbqIconModule],
    template: `
        <kbq-button-toggle>
            <i kbq-icon="kbq-play_16"></i>
        </kbq-button-toggle>
    `
})
class UnnamedIconOnlyButtonToggle {}

@Component({
    imports: [KbqButtonToggleModule, KbqIconModule],
    template: `
        <kbq-button-toggle title="Play">
            <i kbq-icon="kbq-play_16"></i>
        </kbq-button-toggle>
    `
})
class TitledIconOnlyButtonToggle {}

@Component({
    imports: [KbqButtonToggleModule],
    template: `
        <kbq-button-toggle-group aria-label="Delivery">
            <kbq-button-toggle [disabled]="isFirstDisabled" [value]="1">One</kbq-button-toggle>
            <kbq-button-toggle [value]="2">Two</kbq-button-toggle>
            <kbq-button-toggle [value]="3">Three</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class NamedButtonToggleGroup {
    isFirstDisabled = false;
}

@Component({
    imports: [KbqButtonToggleModule],
    template: `
        <kbq-button-toggle [tabIndex]="tabIndex">Standalone</kbq-button-toggle>
    `
})
class StandaloneButtonToggleWithTabIndex {
    tabIndex: number | null = null;
}

@Component({
    imports: [KbqButtonToggleModule],
    template: `
        @if (render) {
            <kbq-button-toggle-group [(value)]="value">
                <kbq-button-toggle [value]="1">One</kbq-button-toggle>
                <kbq-button-toggle [value]="2">Two</kbq-button-toggle>
            </kbq-button-toggle-group>
        }
    `
})
class DestroyableButtonToggleGroup {
    render = true;
    value = 1;
}

// tslint:disable:no-magic-numbers
// tslint:disable:max-func-body-length
// tslint:disable:no-inferred-empty-object-type
// tslint:disable:chai-vague-errors

// TODO: fixed linters
// tslint:disable
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    Provider,
    QueryList,
    Type,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DOWN_ARROW, ENTER, ESCAPE, SPACE, TAB, UP_ARROW } from '@koobiq/cdk/keycodes';
import {
    MockNgZone,
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    typeInElement,
} from '@koobiq/cdk/testing';
import { KbqLocaleServiceModule, KbqOption, KbqOptionSelectionChange } from '@koobiq/components/core';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { KbqInputModule } from '../input/index';
import {
    KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS,
    KBQ_AUTOCOMPLETE_SCROLL_STRATEGY,
    KbqAutocomplete,
    KbqAutocompleteModule,
    KbqAutocompleteOrigin,
    KbqAutocompleteSelectedEvent,
    KbqAutocompleteTrigger,
    getKbqAutocompleteMissingPanelError,
} from './index';

describe('KbqAutocomplete', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let zone: MockNgZone;

    // Creates a test component fixture.
    function createComponent<T>(component: Type<T>, providers: Provider[] = []) {
        TestBed.configureTestingModule({
            imports: [
                KbqAutocompleteModule,
                KbqFormFieldModule,
                KbqInputModule,
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                KbqLocaleServiceModule,
            ],
            declarations: [component],
            providers: [
                { provide: NgZone, useFactory: () => (zone = new MockNgZone()) },
                { provide: KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS, useFactory: () => ({ autoActiveFirstOption: false }) },
                ...providers,
            ],
        });

        TestBed.compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();

        return TestBed.createComponent<T>(component);
    }

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        // Since we're resetting the testing module in some of the tests,
        // we can potentially have multiple overlay containers.
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    }));

    describe('panel toggling', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should open the panel when the input is focused', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to start out closed.`)
                .toBeFalsy();

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to read open when input is focused.`)
                .toBeTruthy();

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to display when input is focused.`)
                .toContain('Alabama');

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to display when input is focused.`)
                .toContain('California');
        });

        it('should not open the panel on focus if the input is readonly', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;
            input.readOnly = true;
            fixture.detectChanges();

            expect(trigger.panelOpen).withContext('Expected panel state to start out closed.').toBeFalsy();

            dispatchFakeEvent(input, 'focusin');
            flush();

            fixture.detectChanges();

            expect(trigger.panelOpen).withContext('Expected panel to stay closed.').toBeFalsy();
        }));

        it('should not open using the arrow keys when the input is readonly', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;
            input.readOnly = true;
            fixture.detectChanges();

            expect(trigger.panelOpen).withContext('Expected panel state to start out closed.').toBeFalsy();

            dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
            flush();

            fixture.detectChanges();
            expect(trigger.panelOpen).withContext('Expected panel to stay closed.').toBeFalsy();
        }));

        it('should open the panel programmatically', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to start out closed.`)
                .toBeFalsy();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to read open when opened programmatically.`)
                .toBeTruthy();

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to display when opened programmatically.`)
                .toContain('Alabama');

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to display when opened programmatically.`)
                .toContain('California');
        });

        it('should show the panel when the first open is after the initial zone stabilization', waitForAsync(() => {
            // Note that we're running outside the Angular zone, in order to be able
            // to test properly without the subscription from `_subscribeToClosingActions`
            // giving us a false positive.
            fixture.ngZone!.runOutsideAngular(() => {
                fixture.componentInstance.trigger.openPanel();

                Promise.resolve().then(() => {
                    expect(fixture.componentInstance.panel.showPanel)
                        .withContext(`Expected panel to be visible.`)
                        .toBeTruthy();
                });
            });
        }));

        it('should close the panel when the user clicks away', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();
            dispatchFakeEvent(document, 'click');

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected clicking outside the panel to set its state to closed.`)
                .toBeFalsy();
            expect(overlayContainerElement.textContent)
                .withContext(`Expected clicking outside the panel to close the panel.`)
                .toEqual('');
        }));

        it('should close the panel when the user taps away on a touch device', fakeAsync(() => {
            dispatchFakeEvent(input, 'focus');
            fixture.detectChanges();
            flush();
            dispatchFakeEvent(document, 'touchend');

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected tapping outside the panel to set its state to closed.`)
                .toBeFalsy();
            expect(overlayContainerElement.textContent)
                .withContext(`Expected tapping outside the panel to close the panel.`)
                .toEqual('');
        }));

        it('should close the panel when an option is clicked', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            flush();
            zone.simulateZoneExit();

            const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
            option.click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected clicking an option to set the panel state to closed.`)
                .toBeFalsy();
            expect(overlayContainerElement.textContent)
                .withContext(`Expected clicking an option to close the panel.`)
                .toEqual('');
        }));

        it('should close the panel when a newly created option is clicked', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();

            // Filter down the option list to a subset of original options ('Alabama', 'California')
            typeInElement('al', input);
            fixture.detectChanges();
            tick();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            options[0].click();

            // Changing value from 'Alabama' to 'al' to re-populate the option list,
            // ensuring that 'California' is created new.
            dispatchFakeEvent(input, 'focusin');
            typeInElement('al', input);
            fixture.detectChanges();
            tick();

            options = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected clicking a new option to set the panel state to closed.`)
                .toBeFalsy();
            expect(overlayContainerElement.textContent)
                .withContext(`Expected clicking a new option to close the panel.`)
                .toEqual('');
        }));

        it('should close the panel programmatically', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected closing programmatically to set the panel state to closed.`)
                .toBeFalsy();
            expect(overlayContainerElement.textContent)
                .withContext(`Expected closing programmatically to close the panel.`)
                .toEqual('');
        });

        it('should not throw when attempting to close the panel of a destroyed autocomplete', () => {
            const trigger = fixture.componentInstance.trigger;

            trigger.openPanel();
            fixture.detectChanges();
            fixture.destroy();

            expect(() => trigger.closePanel()).not.toThrow();
        });

        it('should hide the panel when the options list is empty', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel') as HTMLElement;

            expect(panel.classList)
                .withContext(`Expected panel to start out visible.`)
                .toContain('kbq-autocomplete_visible');

            // Filter down the option list such that no options match the value
            typeInElement('af', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(panel.classList)
                .withContext(`Expected panel to hide itself when empty.`)
                .toContain('kbq-autocomplete_hidden');
        }));

        it('should not open the panel when the `input` event is invoked on a non-focused input', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to start out closed.`)
                .toBeFalsy();

            input.value = 'Alabama';
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to stay closed.`)
                .toBeFalsy();
        });

        it('should toggle the visibility when typing and closing the panel', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel')!.classList)
                .withContext('Expected panel to be visible.')
                .toContain('kbq-autocomplete_visible');

            typeInElement('x', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel')!.classList)
                .withContext('Expected panel to be hidden.')
                .toContain('kbq-autocomplete_hidden');

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            typeInElement('al', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel')!.classList)
                .withContext('Expected panel to be visible.')
                .toContain('kbq-autocomplete_visible');
        }));

        it('should provide the open state of the panel', fakeAsync(() => {
            expect(fixture.componentInstance.panel.isOpen)
                .withContext(`Expected the panel to be unopened initially.`)
                .toBeFalsy();

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.panel.isOpen)
                .withContext(`Expected the panel to be opened on focus.`)
                .toBeTruthy();
        }));

        it('should emit an event when the panel is opened', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalled();
        });

        it('should not emit the `opened` event when no options are being shown', () => {
            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).not.toHaveBeenCalled();
        });

        it('should emit the `opened` event if the options come in after the panel is shown', fakeAsync(() => {
            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).not.toHaveBeenCalled();

            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [
                { name: 'California', code: 'CA' },
            ];
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalled();
        }));

        it('should not emit the opened event multiple times while typing', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalledTimes(1);

            typeInElement('Alabam', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalledTimes(1);
        }));

        it('should emit an event when the panel is closed', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.closedSpy).toHaveBeenCalled();
        });

        it('should not emit the `closed` event when no options were shown', () => {
            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.closedSpy).not.toHaveBeenCalled();
        });

        it('should not be able to open the panel if the autocomplete is disabled', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to start out closed.`)
                .toBeFalsy();

            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel to remain closed.`)
                .toBeFalsy();
        });

        it('should continue to update the model if the autocomplete is disabled', () => {
            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            typeInElement('hello', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value).toBe('hello');
        });

        xit('should set aria-haspopup depending on whether the autocomplete is disabled', () => {
            expect(input.getAttribute('aria-haspopup')).toBe('true');

            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            expect(input.getAttribute('aria-haspopup')).toBe('false');
        });

        it('should scroll to active options below the fold for options with custom height', () => {
            const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            const trigger = fixture.componentInstance.trigger;

            fixture.componentInstance.kbqOptionWidth = 50;
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();
            expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(4);

            // These down arrows will set the 6th option active, below the fold.
            const keydownEvents = [1, 2, 3, 4, 5];
            keydownEvents.forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (50 * 6 - 256 = 44)
            expect(scrollContainer.scrollTop).toEqual(275);

            expect(fixture.componentInstance.panel.keyManager.activeItemIndex).toEqual(5);
        });
    });

    it('should have the correct text direction in RTL', () => {
        const rtlFixture = createComponent(SimpleAutocomplete, [
            { provide: Directionality, useFactory: () => ({ value: 'rtl', change: EMPTY }) },
        ]);

        rtlFixture.detectChanges();
        rtlFixture.componentInstance.trigger.openPanel();
        rtlFixture.detectChanges();

        const boundingBox = overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('rtl');
    });

    it('should update the panel direction if it changes for the trigger', () => {
        const dirProvider = { value: 'rtl', change: EMPTY };
        const rtlFixture = createComponent(SimpleAutocomplete, [
            { provide: Directionality, useFactory: () => dirProvider },
        ]);

        rtlFixture.detectChanges();
        rtlFixture.componentInstance.trigger.openPanel();
        rtlFixture.detectChanges();

        let boundingBox = overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('rtl');

        rtlFixture.componentInstance.trigger.closePanel();
        rtlFixture.detectChanges();

        dirProvider.value = 'ltr';
        rtlFixture.componentInstance.trigger.openPanel();
        rtlFixture.detectChanges();

        boundingBox = overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('ltr');
    });

    it('should be able to set a custom value for the `autocomplete` attribute', () => {
        const fixture = createComponent(AutocompleteWithNativeAutocompleteAttribute);
        const input = fixture.nativeElement.querySelector('input');

        fixture.detectChanges();

        expect(input.getAttribute('autocomplete')).toBe('changed');
    });

    it('should not throw when typing in an element with a null and disabled autocomplete', () => {
        const fixture = createComponent(InputWithoutAutocompleteAndDisabled);
        fixture.detectChanges();

        expect(() => {
            dispatchKeyboardEvent(fixture.nativeElement.querySelector('input'), 'keydown', SPACE);
            fixture.detectChanges();
        }).not.toThrow();
    });

    describe('forms integration', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should update control value as user types with input value', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            typeInElement('a', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value)
                .withContext('Expected control value to be updated as user types.')
                .toEqual('a');

            typeInElement('al', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value)
                .withContext('Expected control value to be updated as user types.')
                .toEqual('al');
        });

        it('should update control value when autofilling', () => {
            // Simulate the browser autofilling the input by setting a value and
            // dispatching an `input` event while the input is out of focus.
            expect(document.activeElement).withContext('Expected input not to have focus.').not.toBe(input);

            input.value = 'Alabama';
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value)
                .withContext('Expected value to be propagated to the form control.')
                .toBe('Alabama');
        });

        it('should update control value when option is selected with option value', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value)
                .withContext('Expected control value to equal the selected option value.')
                .toEqual({ code: 'CA', name: 'California' });
        }));

        it('should update the control back to a string if user types after an option is selected', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            typeInElement('Californi', input);
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.stateCtrl.value)
                .withContext('Expected control value to revert back to string.')
                .toEqual('Californi');
        }));

        it('should fill the text field with display value when an option is selected', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            expect(input.value).withContext(`Expected text field to fill with selected value.`).toContain('California');
        }));

        it('should fill the text field with value if displayWith is not set', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            fixture.componentInstance.panel.displayWith = null;
            fixture.componentInstance.options.toArray()[1].value = 'test value';
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();

            fixture.detectChanges();
            expect(input.value)
                .withContext(`Expected input to fall back to selected option's value.`)
                .toContain('test value');
        }));

        it('should fill the text field correctly if value is set to obj programmatically', fakeAsync(() => {
            fixture.componentInstance.stateCtrl.setValue({ code: 'AL', name: 'Alabama' });
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(input.value)
                .withContext(`Expected input to fill with matching option's viewValue.`)
                .toContain('Alabama');
        }));

        it('should clear the text field if value is reset programmatically', fakeAsync(() => {
            typeInElement('Alabama', input);
            fixture.detectChanges();
            tick();

            fixture.componentInstance.stateCtrl.reset();
            tick();

            fixture.detectChanges();
            tick();

            expect(input.value).withContext(`Expected input value to be empty after reset.`).toEqual('');
        }));

        it('should disable input in view when disabled programmatically', () => {
            const formFieldElement = fixture.debugElement.query(By.css('.kbq-form-field')).nativeElement;

            expect(input.disabled).withContext(`Expected input to start out enabled in view.`).toBeFalsy();
            expect(formFieldElement.classList.contains('kbq-disabled'))
                .withContext(`Expected input underline to start out with normal styles.`)
                .toBeFalsy();

            fixture.componentInstance.stateCtrl.disable();
            fixture.detectChanges();

            expect(input.disabled)
                .withContext(`Expected input to be disabled in view when disabled programmatically.`)
                .toBeTruthy();
            expect(formFieldElement.classList.contains('kbq-disabled'))
                .withContext(`Expected input underline to display disabled styles.`)
                .toBeTruthy();
        });

        it('should mark the autocomplete control as dirty as user types', () => {
            expect(fixture.componentInstance.stateCtrl.dirty)
                .withContext(`Expected control to start out pristine.`)
                .toBeFalsy();

            typeInElement('a', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty)
                .withContext(`Expected control to become dirty when the user types into the input.`)
                .toBeTruthy();
        });

        it('should mark the autocomplete control as dirty when an option is selected', fakeAsync(() => {
            expect(fixture.componentInstance.stateCtrl.dirty)
                .withContext(`Expected control to start out pristine.`)
                .toBeFalsy();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty)
                .withContext(`Expected control to become dirty when an option was selected.`)
                .toBeTruthy();
        }));

        it('should not mark the control dirty when the value is set programmatically', () => {
            expect(fixture.componentInstance.stateCtrl.dirty)
                .withContext(`Expected control to start out pristine.`)
                .toBeFalsy();

            fixture.componentInstance.stateCtrl.setValue('AL');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty)
                .withContext(`Expected control to stay pristine if value is set programmatically.`)
                .toBeFalsy();
        });

        it('should mark the autocomplete control as touched on blur', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            expect(fixture.componentInstance.stateCtrl.touched)
                .withContext(`Expected control to start out untouched.`)
                .toBe(false);

            dispatchFakeEvent(input, 'blur');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.touched)
                .withContext(`Expected control to become touched on blur.`)
                .toBe(true);
        });

        it('should disable the input when used with a value accessor and without `kbqInput`', () => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            TestBed.resetTestingModule();

            const plainFixture = createComponent(PlainAutocompleteInputWithFormControl);
            plainFixture.detectChanges();
            input = plainFixture.nativeElement.querySelector('input');

            expect(input.disabled).toBe(false);

            plainFixture.componentInstance.formControl.disable();
            plainFixture.detectChanges();

            expect(input.disabled).toBe(true);
        });
    });

    describe('keyboard events', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;
        let DOWN_ARROW_EVENT: KeyboardEvent;
        let UP_ARROW_EVENT: KeyboardEvent;
        let ENTER_EVENT: KeyboardEvent;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;
            DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);
            ENTER_EVENT = createKeyboardEvent('keydown', ENTER);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
        }));

        it('should not close the panel when DOWN key is pressed', () => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to stay open when DOWN key is pressed.`)
                .toBe(true);

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to keep displaying when DOWN key is pressed.`)
                .toContain('Alabama');

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to keep displaying when DOWN key is pressed.`)
                .toContain('California');
        });

        it('should set the active item to the first option when DOWN key is pressed', () => {
            const componentInstance = fixture.componentInstance;
            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            expect(componentInstance.trigger.panelOpen)
                .withContext('Expected first down press to open the pane.')
                .toBe(true);

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeOption === componentInstance.options.first)
                .withContext('Expected first option to be active.')
                .toBe(true);
            expect(optionEls[0].classList).toContain('kbq-active');
            expect(optionEls[1].classList).not.toContain('kbq-active');

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeOption === componentInstance.options.toArray()[1])
                .withContext('Expected second option to be active.')
                .toBe(true);
            expect(optionEls[0].classList).not.toContain('kbq-active');
            expect(optionEls[1].classList).toContain('kbq-active');
        });

        it('should not set the active item to the last option when UP key is pressed', () => {
            const componentInstance = fixture.componentInstance;
            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            expect(componentInstance.trigger.panelOpen)
                .withContext('Expected first up press to open the pane.')
                .toBe(true);

            componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeOption !== componentInstance.options.first)
                .withContext('Expected last option to be active.')
                .toBe(true);
            expect(optionEls[0].classList).not.toContain('kbq-active');

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeOption === componentInstance.options.first)
                .withContext('Expected first option to be active.')
                .toBe(true);
            expect(optionEls[0].classList).toContain('kbq-active');
        });

        it('should set the active item properly after filtering', fakeAsync(() => {
            const componentInstance = fixture.componentInstance;

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();
        }));

        it('should set the active item properly after filtering', () => {
            const componentInstance = fixture.componentInstance;

            typeInElement('o', input);
            fixture.detectChanges();

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            expect(componentInstance.trigger.activeOption === componentInstance.options.first)
                .withContext('Expected first option to be active.')
                .toBe(true);

            expect(optionEls[0].classList).toContain('kbq-active');
            expect(optionEls[1].classList).not.toContain('kbq-active');
        });

        it('should fill the text field when an option is selected with ENTER', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.detectChanges();

            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);
            fixture.detectChanges();

            expect(input.value)
                .withContext(`Expected text field to fill with selected value on ENTER.`)
                .toContain('Alabama');
        }));

        it('should prevent the default enter key action', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            flush();

            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);

            expect(ENTER_EVENT.defaultPrevented)
                .withContext('Expected the default action to have been prevented.')
                .toBe(true);
        }));

        it('should not prevent the default enter action for a closed panel after a user action', () => {
            fixture.componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();
            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);

            expect(ENTER_EVENT.defaultPrevented).withContext('Default action should not be prevented.').toBe(false);
        });

        it('should fill the text field, not select an option, when SPACE is entered', () => {
            typeInElement('New', input);
            fixture.detectChanges();

            const SPACE_EVENT = createKeyboardEvent('keydown', SPACE);
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            fixture.componentInstance.trigger.handleKeydown(SPACE_EVENT);
            fixture.detectChanges();

            expect(input.value).withContext(`Expected option not to be selected on SPACE.`).not.toContain('New York');
        });

        it('should mark the control dirty when selecting an option from the keyboard', fakeAsync(() => {
            expect(fixture.componentInstance.stateCtrl.dirty)
                .withContext(`Expected control to start out pristine.`)
                .toBe(false);

            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty)
                .withContext(`Expected control to become dirty when option was selected by ENTER.`)
                .toBe(true);
        }));

        it('should open the panel again when typing after making a selection', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to read closed after ENTER key.`)
                .toBe(false);

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to close after ENTER key.`)
                .toEqual('');

            dispatchFakeEvent(input, 'focusin');
            typeInElement('Alabama', input);
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to read open when typing in input.`)
                .toBe(true);

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to display when typing in input.`)
                .toContain('Alabama');
        }));

        it('should not open the panel if the `input` event was dispatched with changing the value', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;

            dispatchFakeEvent(input, 'focusin');
            typeInElement('A', input);
            fixture.detectChanges();
            tick();

            expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

            trigger.closePanel();
            fixture.detectChanges();

            expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);

            // Dispatch the event without actually changing the value
            // to simulate what happen in some cases on IE.
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();
            tick();

            expect(trigger.panelOpen).withContext('Expected panel to stay closed.').toBe(false);
        }));

        it('should scroll to active options below the fold', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();
            expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

            // These down arrows will set the 6th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (288 - 256 - 4 = 32)
            expect(scrollContainer.scrollTop).withContext(`Expected panel to reveal the sixth option.`).toEqual(28);
        });

        it('should not scroll to active options on UP arrow', () => {
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            fixture.componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).withContext(`Expected panel to reveal last option.`).toEqual(0);
        });

        it('should not scroll to active options that are fully in the panel', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

            // These down arrows will set the 6th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (288 - 256 - 4 = 28)
            expect(scrollContainer.scrollTop).withContext(`Expected panel to reveal the sixth option.`).toEqual(28);

            // These up arrows will set the 2nd option active
            [4, 3, 2, 1].forEach(() => trigger.handleKeydown(UP_ARROW_EVENT));

            // Expect no scrolling to have occurred. Still showing bottom of 6th option.
            expect(scrollContainer.scrollTop)
                .withContext(`Expected panel not to scroll up since sixth option still fully visible.`)
                .toEqual(28);
        });

        it('should scroll to active options that are above the panel', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).withContext(`Expected panel not to scroll.`).toEqual(0);

            // These down arrows will set the 7th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // These up arrows will set the 2nd option active
            [7, 6, 5, 4, 3, 2, 1].forEach(() => trigger.handleKeydown(UP_ARROW_EVENT));

            // Expect to show the top of the 2nd option at the top of the panel
            expect(scrollContainer.scrollTop)
                .withContext(`Expected panel to scroll up when option is above panel.`)
                .toEqual(28);
        });

        it('should close the panel when pressing escape', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;

            input.focus();
            flush();
            fixture.detectChanges();

            expect(document.activeElement).withContext('Expected input to be focused.').toBe(input);

            expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).withContext('Expected input to continue to be focused.').toBe(input);

            expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);
        }));

        it('should prevent the default action when pressing escape', fakeAsync(() => {
            const escapeEvent = dispatchKeyboardEvent(input, 'keydown', ESCAPE);
            fixture.detectChanges();
            flush();

            expect(escapeEvent.defaultPrevented).toBe(true);
        }));

        it('should close the panel when pressing ALT + UP_ARROW', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;
            const upArrowEvent = createKeyboardEvent('keydown', UP_ARROW);
            Object.defineProperty(upArrowEvent, 'altKey', { get: () => true });

            input.focus();
            flush();
            fixture.detectChanges();

            expect(document.activeElement).withContext('Expected input to be focused.').toBe(input);

            expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

            dispatchEvent(document.body, upArrowEvent);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).withContext('Expected input to continue to be focused.').toBe(input);
            expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);
        }));

        it('should close the panel when tabbing away from a trigger without results', fakeAsync(() => {
            fixture.componentInstance.states = [];
            fixture.componentInstance.filteredStates = [];
            fixture.detectChanges();
            input.focus();
            flush();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel'))
                .withContext('Expected panel to be rendered.')
                .toBeTruthy();

            dispatchKeyboardEvent(input, 'keydown', TAB);
            fixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel'))
                .withContext('Expected panel to be removed.')
                .toBeFalsy();
        }));

        it('should reset the active option when closing with the escape key', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;

            trigger.openPanel();
            fixture.detectChanges();
            flush();

            expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);
            expect(!!trigger.activeOption).withContext('Expected no active option.').toBe(false);

            // Press the down arrow a few times.
            [1, 2, 3].forEach(() => {
                trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
                fixture.detectChanges();
            });

            // Note that this casts to a boolean, in order to prevent Jasmine
            // from crashing when trying to stringify the option if the test fails.
            expect(!!trigger.activeOption).withContext('Expected to find an active option.').toBe(true);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            flush();

            expect(!!trigger.activeOption).withContext('Expected no active options.').toBe(false);
        }));

        it('should reset the active option when closing by selecting with enter', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;

            trigger.openPanel();
            fixture.detectChanges();
            tick();

            expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

            expect(!!trigger.activeOption).withContext('Expected no active option.').toBe(false);

            // Press the down arrow a few times.
            [1, 2, 3].forEach(() => {
                trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
                fixture.detectChanges();
            });

            // Note that this casts to a boolean, in order to prevent Jasmine
            // from crashing when trying to stringify the option if the test fails.
            expect(!!trigger.activeOption).withContext('Expected to find an active option.').toBe(true);

            trigger.handleKeydown(ENTER_EVENT);
            tick();

            expect(!!trigger.activeOption).withContext('Expected no active options.').toBe(false);
        }));
    });

    xdescribe('option groups', () => {
        let fixture: ComponentFixture<AutocompleteWithGroups>;
        let DOWN_ARROW_EVENT: KeyboardEvent;
        let UP_ARROW_EVENT: KeyboardEvent;
        let container: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(AutocompleteWithGroups);
            fixture.detectChanges();

            DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            container = document.querySelector('.kbq-autocomplete-panel') as HTMLElement;
        }));

        it('should scroll to active options below the fold', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();
            expect(container.scrollTop).withContext('Expected the panel not to scroll.').toBe(0);

            // Press the down arrow five times.
            [1, 2, 3, 4, 5].forEach(() => {
                fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
            });

            // <option bottom> - <panel height> + <2x group labels> = 128
            // 288 - 256 + 96 = 128
            expect(container.scrollTop).withContext('Expected panel to reveal the sixth option.').toBe(128);
        }));

        it('should scroll to active options on UP arrow', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
            tick();
            fixture.detectChanges();

            // <option bottom> - <panel height> + <3x group label> = 464
            // 576 - 256 + 144 = 464
            expect(container.scrollTop).withContext('Expected panel to reveal last option.').toBe(464);
        }));

        it('should scroll to active options that are above the panel', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();
            expect(container.scrollTop).withContext('Expected panel not to scroll.').toBe(0);

            // These down arrows will set the 7th option active, below the fold.
            [1, 2, 3, 4, 5, 6].forEach(() => {
                fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
            });

            // These up arrows will set the 2nd option active
            [5, 4, 3, 2, 1].forEach(() => {
                fixture.componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
                tick();
            });

            // Expect to show the top of the 2nd option at the top of the panel.
            // It is offset by 48, because there's a group label above it.
            expect(container.scrollTop).withContext('Expected panel to scroll up when option is above panel.').toBe(96);
        }));
    });

    xdescribe('aria', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should set role of input to combobox', () => {
            expect(input.getAttribute('role'))
                .withContext('Expected role of input to be combobox.')
                .toEqual('combobox');
        });

        it('should set role of autocomplete panel to listbox', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            const panel = fixture.debugElement.query(By.css('.kbq-autocomplete-panel')).nativeElement;

            expect(panel.getAttribute('role'))
                .withContext('Expected role of the panel to be listbox.')
                .toEqual('listbox');
        });

        it('should set aria-autocomplete to list', () => {
            expect(input.getAttribute('aria-autocomplete'))
                .withContext('Expected aria-autocomplete attribute to equal list.')
                .toEqual('list');
        });

        it('should set aria-activedescendant based on the active option', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(input.hasAttribute('aria-activedescendant'))
                .withContext('Expected aria-activedescendant to be absent if no active item.')
                .toBe(false);

            const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);

            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();

            expect(input.getAttribute('aria-activedescendant'))
                .withContext('Expected aria-activedescendant to match the active item after 1 down arrow.')
                .toEqual(fixture.componentInstance.options.first.id);

            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();

            expect(input.getAttribute('aria-activedescendant'))
                .withContext('Expected aria-activedescendant to match the active item after 2 down arrows.')
                .toEqual(fixture.componentInstance.options.toArray()[1].id);
        }));

        it('should set aria-expanded based on whether the panel is open', () => {
            expect(input.getAttribute('aria-expanded'))
                .withContext('Expected aria-expanded to be false while panel is closed.')
                .toBe('false');

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(input.getAttribute('aria-expanded'))
                .withContext('Expected aria-expanded to be true while panel is open.')
                .toBe('true');

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            expect(input.getAttribute('aria-expanded'))
                .withContext('Expected aria-expanded to be false when panel closes again.')
                .toBe('false');
        });

        it('should set aria-expanded properly when the panel is hidden', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            expect(input.getAttribute('aria-expanded'))
                .withContext('Expected aria-expanded to be true while panel is open.')
                .toBe('true');

            typeInElement('zz', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(input.getAttribute('aria-expanded'))
                .withContext('Expected aria-expanded to be false when panel hides itself.')
                .toBe('false');
        }));

        it('should set aria-owns based on the attached autocomplete', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            const panel = fixture.debugElement.query(By.css('.kbq-autocomplete-panel')).nativeElement;

            expect(input.getAttribute('aria-owns'))
                .withContext('Expected aria-owns to match attached autocomplete.')
                .toBe(panel.getAttribute('id'));
        });

        it('should not set aria-owns while the autocomplete is closed', () => {
            expect(input.getAttribute('aria-owns')).toBeFalsy();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(input.getAttribute('aria-owns')).toBeTruthy();
        });

        it('should restore focus to the input when clicking to select a value', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

            // Focus the option manually since the synthetic click may not do it.
            option.focus();
            option.click();
            fixture.detectChanges();

            expect(document.activeElement).withContext('Expected focus to be restored to the input.').toBe(input);
        }));

        it('should remove autocomplete-specific aria attributes when autocomplete is disabled', () => {
            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            expect(input.getAttribute('role')).toBeFalsy();
            expect(input.getAttribute('aria-autocomplete')).toBeFalsy();
            expect(input.getAttribute('aria-expanded')).toBeFalsy();
            expect(input.getAttribute('aria-owns')).toBeFalsy();
        });
    });

    xdescribe('Fallback positions', () => {
        it('should use below positioning by default', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
            const inputReference = fixture.debugElement.query(By.css('.kbq-form-field-flex')).nativeElement;

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const inputBottom = inputReference.getBoundingClientRect().bottom;
            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel')!;
            const panelTop = panel.getBoundingClientRect().top;

            expect(Math.floor(inputBottom))
                .withContext(`Expected panel top to match input bottom by default.`)
                .toEqual(Math.floor(panelTop));

            expect(panel.classList).not.toContain('kbq-autocomplete-panel-above');
        }));

        it('should reposition the panel on scroll', () => {
            const scrolledSubject = new Subject();
            const spacer = document.createElement('div');
            const fixture = createComponent(SimpleAutocomplete, [
                {
                    provide: ScrollDispatcher,
                    useValue: { scrolled: () => scrolledSubject.asObservable() },
                },
            ]);

            fixture.detectChanges();

            const inputReference = fixture.debugElement.query(By.css('.kbq-form-field-flex')).nativeElement;
            spacer.style.height = '1000px';
            document.body.appendChild(spacer);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            window.scroll(0, 100);
            scrolledSubject.next(null);
            fixture.detectChanges();

            const inputBottom = inputReference.getBoundingClientRect().bottom;
            const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const panelTop = panel.getBoundingClientRect().top;

            expect(Math.floor(inputBottom))
                .withContext('Expected panel top to match input bottom after scrolling.')
                .toEqual(Math.floor(panelTop));

            document.body.removeChild(spacer);
            window.scroll(0, 0);
        });

        it('should fall back to above position if panel cannot fit below', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
            const inputReference = fixture.debugElement.query(By.css('.kbq-form-field-flex')).nativeElement;

            // Push the autocomplete trigger down so it won't have room to open "below"
            inputReference.style.bottom = '0';
            inputReference.style.position = 'fixed';

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const inputTop = inputReference.getBoundingClientRect().top;
            const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const panelBottom = panel.getBoundingClientRect().bottom;

            expect(Math.floor(inputTop))
                .withContext(`Expected panel to fall back to above position.`)
                .toEqual(Math.floor(panelBottom));

            expect(panel.classList).toContain('kbq-autocomplete-panel-above');
        }));

        it('should allow the panel to expand when the number of results increases', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
            const inputReference = fixture.debugElement.query(By.css('.kbq-form-field-flex')).nativeElement;

            // Push the element down so it has a little bit of space, but not enough to render.
            inputReference.style.bottom = '10px';
            inputReference.style.position = 'fixed';

            // Type enough to only show one option.
            typeInElement('California', inputEl);
            fixture.detectChanges();
            tick();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            let panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const initialPanelHeight = panel.getBoundingClientRect().height;

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            // Change the text so we get more than one result.
            typeInElement('C', inputEl);
            fixture.detectChanges();
            tick();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;

            expect(panel.getBoundingClientRect().height).toBeGreaterThan(initialPanelHeight);
        }));

        it('should align panel properly when filtering in "above" position', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            const inputReference = fixture.debugElement.query(By.css('.kbq-form-field-flex')).nativeElement;

            // Push the autocomplete trigger down so it won't have room to open "below"
            inputReference.style.bottom = '0';
            inputReference.style.position = 'fixed';

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            typeInElement('f', input);
            fixture.detectChanges();
            tick();

            const inputTop = inputReference.getBoundingClientRect().top;
            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel')!;
            const panelBottom = panel.getBoundingClientRect().bottom;

            expect(Math.floor(inputTop))
                .withContext(`Expected panel to stay aligned after filtering.`)
                .toEqual(Math.floor(panelBottom));
        }));

        it(
            'should fall back to above position when requested if options are added while ' + 'the panel is open',
            fakeAsync(() => {
                const fixture = createComponent(SimpleAutocomplete);
                fixture.componentInstance.states = fixture.componentInstance.states.slice(0, 1);
                fixture.componentInstance.filteredStates = fixture.componentInstance.states.slice();
                fixture.detectChanges();

                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
                const inputReference = fixture.debugElement.query(By.css('.kbq-form-field-flex')).nativeElement;

                // Push the element down so it has a little bit of space, but not enough to render.
                inputReference.style.bottom = '75px';
                inputReference.style.position = 'fixed';

                dispatchFakeEvent(inputEl, 'focusin');
                fixture.detectChanges();
                zone.simulateZoneExit();
                fixture.detectChanges();

                const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel')!;
                let inputRect = inputReference.getBoundingClientRect();
                let panelRect = panel.getBoundingClientRect();

                expect(Math.floor(panelRect.top))
                    .withContext(`Expected panel top to be below input before repositioning.`)
                    .toBe(Math.floor(inputRect.bottom));

                for (let i = 0; i < 20; i++) {
                    fixture.componentInstance.filteredStates.push({ code: 'FK', name: 'Fake State' });
                    fixture.detectChanges();
                }

                // Request a position update now that there are too many suggestions to fit in the viewport.
                fixture.componentInstance.trigger.updatePosition();

                inputRect = inputReference.getBoundingClientRect();
                panelRect = panel.getBoundingClientRect();

                expect(Math.floor(panelRect.bottom))
                    .withContext(`Expected panel to fall back to above position after repositioning.`)
                    .toBe(Math.floor(inputRect.top));
                tick();
            }),
        );

        it('should not throw if a panel reposition is requested while the panel is closed', () => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            expect(() => fixture.componentInstance.trigger.updatePosition()).not.toThrow();
        });
    });

    describe('Option selection', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
        });

        it('should deselect any other selected option', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            options[0].click();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const componentOptions = fixture.componentInstance.options.toArray();
            expect(componentOptions[0].selected).withContext(`Clicked option should be selected.`).toBe(true);

            options = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            expect(componentOptions[0].selected).withContext(`Previous option should not be selected.`).toBe(false);

            expect(componentOptions[1].selected).withContext(`New Clicked option should be selected.`).toBe(true);
        }));

        it('should call deselect only on the previous selected option', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            options[0].click();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const componentOptions = fixture.componentInstance.options.toArray();
            componentOptions.forEach((option) => spyOn(option, 'deselect'));

            expect(componentOptions[0].selected).withContext(`Clicked option should be selected.`).toBe(true);

            options = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            expect(componentOptions[0].deselect).toHaveBeenCalled();
            componentOptions.slice(1).forEach((option) => expect(option.deselect).not.toHaveBeenCalled());
        }));

        it('should be able to preselect the first option', fakeAsync(() => {
            fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-option')[0].classList)
                .withContext('Expected first option to be highlighted.')
                .toContain('kbq-active');
        }));

        it('should be able to configure preselecting the first option globally', fakeAsync(() => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            TestBed.resetTestingModule();
            fixture = createComponent(SimpleAutocomplete, [
                { provide: KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: { autoActiveFirstOption: true } },
            ]);

            fixture.detectChanges();
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-option')[0].classList)
                .withContext('Expected first option to be highlighted.')
                .toContain('kbq-active');
        }));

        it('should handle `optionSelections` being accessed too early', fakeAsync(() => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            fixture = TestBed.createComponent(SimpleAutocomplete);

            const spy = jasmine.createSpy('option selection spy');
            let subscription: Subscription;

            expect(fixture.componentInstance.trigger.autocomplete).toBeFalsy();
            expect(() => {
                subscription = fixture.componentInstance.trigger.optionSelections.subscribe(spy);
            }).not.toThrow();

            fixture.detectChanges();
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

            option.click();
            fixture.detectChanges();
            zone.simulateZoneExit();

            expect(spy).toHaveBeenCalledWith(jasmine.any(KbqOptionSelectionChange));
            // @ts-ignore
            subscription.unsubscribe();
        }));

        xit('should reposition the panel when the amount of options changes', fakeAsync(() => {
            const formField = fixture.debugElement.query(By.css('.kbq-form-field')).nativeElement;
            const inputReference = formField.querySelector('.kbq-form-field-flex');
            const input = inputReference.querySelector('input');

            formField.style.bottom = '100px';
            formField.style.position = 'fixed';

            typeInElement('Cali', input);
            fixture.detectChanges();
            tick();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const inputBottom = inputReference.getBoundingClientRect().bottom;
            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel')!;
            const panelTop = panel.getBoundingClientRect().top;

            expect(Math.floor(inputBottom))
                .withContext(`Expected panel top to match input bottom when there is only one option.`)
                .toBe(Math.floor(panelTop));

            typeInElement('', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const inputTop = inputReference.getBoundingClientRect().top;
            const panelBottom = panel.getBoundingClientRect().bottom;

            expect(Math.floor(inputTop))
                .withContext(`Expected panel switch to the above position if the options no longer fit.`)
                .toBe(Math.floor(panelBottom));
        }));
    });

    describe('panel closing', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;
        let trigger: KbqAutocompleteTrigger;
        let closingActionSpy: jasmine.Spy;
        let closingActionsSub: Subscription;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            flush();

            trigger = fixture.componentInstance.trigger;
            closingActionSpy = jasmine.createSpy('closing action listener');
            closingActionsSub = trigger.panelClosingActions.subscribe(closingActionSpy);
        }));

        afterEach(() => closingActionsSub.unsubscribe());

        it('should emit panel close event when clicking away', () => {
            expect(closingActionSpy).not.toHaveBeenCalled();
            dispatchFakeEvent(document, 'click');
            expect(closingActionSpy).toHaveBeenCalledWith(null);
        });

        it('should emit panel close event when tabbing out', () => {
            const tabEvent = createKeyboardEvent('keydown', TAB);
            input.focus();

            expect(closingActionSpy).not.toHaveBeenCalled();
            trigger.handleKeydown(tabEvent);
            expect(closingActionSpy).toHaveBeenCalledWith(null);
        });

        it('should not emit when tabbing away from a closed panel', () => {
            const tabEvent = createKeyboardEvent('keydown', TAB);

            input.focus();
            zone.simulateZoneExit();

            trigger.handleKeydown(tabEvent);

            // Ensure that it emitted once while the panel was open.
            expect(closingActionSpy).toHaveBeenCalledTimes(1);

            trigger.handleKeydown(tabEvent);

            // Ensure that it didn't emit again when tabbing out again.
            expect(closingActionSpy).toHaveBeenCalledTimes(1);
        });

        it('should emit panel close event when selecting an option', () => {
            const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

            expect(closingActionSpy).not.toHaveBeenCalled();
            option.click();
            expect(closingActionSpy).toHaveBeenCalledWith(jasmine.any(KbqOptionSelectionChange));
        });

        it('should close the panel when pressing escape', () => {
            expect(closingActionSpy).not.toHaveBeenCalled();
            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            expect(closingActionSpy).toHaveBeenCalledWith(null);
        });
    });

    describe('without kbqInput', () => {
        let fixture: ComponentFixture<AutocompleteWithNativeInput>;

        beforeEach(() => {
            fixture = createComponent(AutocompleteWithNativeInput);
            fixture.detectChanges();
        });

        it('should not throw when clicking outside', fakeAsync(() => {
            dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focus');
            fixture.detectChanges();
            flush();

            expect(() => dispatchFakeEvent(document, 'click')).not.toThrow();
        }));
    });

    describe('misc', () => {
        it('should allow basic use without any forms directives', () => {
            expect(() => {
                const fixture = createComponent(AutocompleteWithoutForms);
                fixture.detectChanges();

                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                typeInElement('d', input);
                fixture.detectChanges();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
                expect(options.length).toBe(1);
            }).not.toThrowError();
        });

        it('should display an empty input when the value is undefined with ngModel', () => {
            const fixture = createComponent(AutocompleteWithNgModel);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('');
        });

        it('should display the number when the selected option is the number zero', fakeAsync(() => {
            const fixture = createComponent(AutocompleteWithNumbers);

            fixture.componentInstance.selectedNumber = 0;
            fixture.detectChanges();
            tick();

            expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('0');
        }));

        it('should work when input is wrapped in ngIf', () => {
            const fixture = createComponent(NgIfAutocomplete);
            fixture.detectChanges();

            dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to read open when input is focused.`)
                .toBe(true);

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to display when input is focused.`)
                .toContain('One');

            expect(overlayContainerElement.textContent)
                .withContext(`Expected panel to display when input is focused.`)
                .toContain('Two');
        });

        it('should filter properly with ngIf after setting the active item', () => {
            const fixture = createComponent(NgIfAutocomplete);
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            typeInElement('o', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.kbqOptions.length).toBe(2);
        });

        it('should throw if the user attempts to open the panel too early', () => {
            const fixture = createComponent(AutocompleteWithoutPanel);
            fixture.detectChanges();

            expect(() => {
                fixture.componentInstance.trigger.openPanel();
            }).toThrow(getKbqAutocompleteMissingPanelError());
        });

        it('should not throw on init, even if the panel is not defined', fakeAsync(() => {
            expect(() => {
                const fixture = createComponent(AutocompleteWithoutPanel);
                fixture.componentInstance.control.setValue('Something');
                fixture.detectChanges();
                tick();
            }).not.toThrow();
        }));

        xit(
            'should hide the label with a preselected form control value ' + 'and a disabled floating label',
            fakeAsync(() => {
                const fixture = createComponent(AutocompleteWithFormsAndNonfloatingLabel);

                fixture.detectChanges();
                tick();
                fixture.detectChanges();

                const input = fixture.nativeElement.querySelector('input');
                const label = fixture.nativeElement.querySelector('.kbq-form-field-label');

                expect(input.value).toBe('California');
                expect(label.classList).not.toContain('kbq-form-field-empty');
            }),
        );

        it('should transfer the kbq-autocomplete classes to the panel element', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            tick();
            fixture.detectChanges();

            const autocomplete = fixture.debugElement.nativeElement.querySelector('kbq-autocomplete');
            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel')!;

            expect(autocomplete.classList).not.toContain('class-one');
            expect(autocomplete.classList).not.toContain('class-two');

            expect(panel.classList).toContain('class-one');
            expect(panel.classList).toContain('class-two');
        }));

        it('should reset correctly when closed programmatically', fakeAsync(() => {
            const scrolledSubject = new Subject();
            const fixture = createComponent(SimpleAutocomplete, [
                {
                    provide: ScrollDispatcher,
                    useValue: { scrolled: () => scrolledSubject.asObservable() },
                },
                {
                    provide: KBQ_AUTOCOMPLETE_SCROLL_STRATEGY,
                    useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
                    deps: [Overlay],
                },
            ]);

            fixture.detectChanges();
            const trigger = fixture.componentInstance.trigger;

            trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

            scrolledSubject.next(null);
            fixture.detectChanges();

            expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);
        }));

        /* TODO: Not working with new realization of number input, should be checked for relevance */
        xit('should handle autocomplete being attached to number inputs', fakeAsync(() => {
            const fixture = createComponent(AutocompleteWithNumberInputAndNgModel);
            fixture.detectChanges();
            flush();
            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            typeInElement('1337', input);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.selectedValue).toBe(1337);
        }));
    });

    it('should have correct width when opened', () => {
        const widthFixture = createComponent(SimpleAutocomplete);
        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.trigger.closePanel();
        widthFixture.detectChanges();

        widthFixture.componentInstance.width = 500;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(498);
    });

    it('should update the width while the panel is open', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        const input = widthFixture.debugElement.query(By.css('input')).nativeElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.width = 500;
        widthFixture.detectChanges();

        input.focus();
        dispatchFakeEvent(input, 'input');
        widthFixture.detectChanges();

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(498);
    });

    it('should not reopen a closed autocomplete when returning to a blurred tab', () => {
        const fixture = createComponent(SimpleAutocomplete);
        fixture.detectChanges();

        const trigger = fixture.componentInstance.trigger;
        const input = fixture.debugElement.query(By.css('input')).nativeElement;

        input.focus();
        fixture.detectChanges();

        expect(trigger.panelOpen).withContext('Expected panel to be open.').toBe(true);

        trigger.closePanel();
        fixture.detectChanges();

        expect(trigger.panelOpen).withContext('Expected panel to be closed.').toBe(false);

        // Simulate the user going to a different tab.
        dispatchFakeEvent(window, 'blur');
        input.blur();
        fixture.detectChanges();

        // Simulate the user coming back.
        dispatchFakeEvent(window, 'focus');
        input.focus();
        fixture.detectChanges();

        expect(trigger.panelOpen).withContext('Expected panel to remain closed.').toBe(false);
    });

    it('should update the panel width if the window is resized', fakeAsync(() => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.width = 400;
        widthFixture.detectChanges();

        dispatchFakeEvent(window, 'resize');
        tick(20);

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(398);
    }));

    it('should have panel width match host width by default', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);
    });

    it('should have panel width set to string value', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.autocomplete.panelWidth = 'auto';
        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(overlayPane.style.width).toBe('auto');
    });

    it('should have panel width set to number value', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.autocomplete.panelWidth = 400;
        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(400);
    });

    it(
        'should show the panel when the options are initialized later within a component with ' +
            'OnPush change detection',
        fakeAsync(() => {
            const fixture = createComponent(AutocompleteWithOnPushDelay);

            fixture.detectChanges();
            dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focusin');
            tick(1000);

            fixture.detectChanges();
            tick();

            Promise.resolve().then(() => {
                const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel') as HTMLElement;
                const visibleClass = 'kbq-autocomplete_visible';

                fixture.detectChanges();
                expect(panel.classList).withContext(`Expected panel to be visible.`).toContain(visibleClass);
            });
        }),
    );

    it('should emit an event when an option is selected', fakeAsync(() => {
        const fixture = createComponent(AutocompleteWithSelectEvent);

        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        zone.simulateZoneExit();
        fixture.detectChanges();

        const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
        const spy = fixture.componentInstance.optionSelected;

        options[1].click();
        tick();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);

        const event = spy.calls.mostRecent().args[0] as KbqAutocompleteSelectedEvent;

        expect(event.source).toBe(fixture.componentInstance.autocomplete);
        expect(event.option.value).toBe('Washington');
    }));

    it('should emit an event when a newly-added option is selected', fakeAsync(() => {
        const fixture = createComponent(AutocompleteWithSelectEvent);

        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        tick();
        fixture.detectChanges();

        fixture.componentInstance.states.push('Puerto Rico');
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
        const spy = fixture.componentInstance.optionSelected;

        options[3].click();
        tick();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);

        const event = spy.calls.mostRecent().args[0] as KbqAutocompleteSelectedEvent;

        expect(event.source).toBe(fixture.componentInstance.autocomplete);
        expect(event.option.value).toBe('Puerto Rico');
    }));

    xit('should be able to set a custom panel connection element', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);

        fixture.detectChanges();
        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        const overlayRect = overlayContainerElement.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
        const originRect = fixture.nativeElement.querySelector('.origin').getBoundingClientRect();

        expect(Math.floor(overlayRect.top))
            .withContext('Expected autocomplete panel to align with the bottom of the new origin.')
            .toBe(Math.floor(originRect.bottom));
    });

    xit('should be able to change the origin after the panel has been opened', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);

        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        fixture.componentInstance.trigger.closePanel();
        fixture.detectChanges();

        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
        fixture.detectChanges();

        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        const overlayRect = overlayContainerElement.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
        const originRect = fixture.nativeElement.querySelector('.origin').getBoundingClientRect();

        expect(Math.floor(overlayRect.top))
            .withContext('Expected autocomplete panel to align with the bottom of the new origin.')
            .toBe(Math.floor(originRect.bottom));
    });

    it('should be able to re-type the same value when it is reset while open', fakeAsync(() => {
        const fixture = createComponent(SimpleAutocomplete);
        fixture.detectChanges();
        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        const formControl = fixture.componentInstance.stateCtrl;

        typeInElement('Cal', input);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(formControl.value).withContext('Expected initial value to be propagated to model').toBe('Cal');

        formControl.setValue('');
        fixture.detectChanges();

        expect(input.value).withContext('Expected input value to reset when model is reset').toBe('');

        typeInElement('Cal', input);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(formControl.value).withContext('Expected new value to be propagated to model').toBe('Cal');
    }));

    it('should not close when clicking inside alternate origin', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);
        fixture.detectChanges();
        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        expect(fixture.componentInstance.trigger.panelOpen).toBe(true);

        const origin = fixture.nativeElement.querySelector('.origin');
        origin.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen).toBe(true);
    });

    describe('Option selection with disabled items', () => {
        let fixture: ComponentFixture<AutocompleteWithDisabledItems>;

        beforeEach(() => {
            fixture = createComponent(AutocompleteWithDisabledItems);
            fixture.detectChanges();
        });

        it('should not autofocus on first item when it disabled', () => {
            fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-option')[1].classList)
                .withContext('Expected second option to be highlighted.')
                .toContain('kbq-active');
        });

        it('should not autofocus on first and second item when it disabled', () => {
            fixture.componentInstance.states[1].disabled = true;

            fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-option')[2].classList)
                .withContext('Expected second option to be highlighted.')
                .toContain('kbq-active');
        });
    });

    describe('Manage dropdown opening with openOnFocus when focus', () => {
        let fixture: ComponentFixture<AutocompleteWithDisabledItems>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(AutocompleteWithOpenOnFocus);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should not open dropdown with disabled openOnFocus', () => {
            fixture.componentInstance.trigger.autocomplete.openOnFocus = false;

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to start out closed.`)
                .toBe(false);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to closed when input is focused.`)
                .toBe(false);
        });

        it('should open dropdown with enabled openOnFocus', () => {
            fixture.componentInstance.trigger.autocomplete.openOnFocus = true;

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to start out closed.`)
                .toBe(false);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to read open when input is focused.`)
                .toBe(true);
        });
    });

    describe('Manage dropdown opening with openOnFocus when focus in default state', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should open dropdown when no openOnFocus attribute', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to start out closed.`)
                .toBe(false);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .withContext(`Expected panel state to read open when input is focused.`)
                .toBe(true);
        });
    });
});

@Component({
    template: `
        <kbq-form-field [style.width.px]="width">
            <input
                kbqInput
                placeholder="State"
                [kbqAutocomplete]="auto"
                [kbqAutocompleteDisabled]="autocompleteDisabled"
                [formControl]="stateCtrl"
            />
        </kbq-form-field>

        <kbq-autocomplete
            class="class-one class-two"
            #auto="kbqAutocomplete"
            [displayWith]="displayFn"
            (opened)="openedSpy()"
            (closed)="closedSpy()"
        >
            <kbq-option *ngFor="let state of filteredStates" [value]="state" [style.height.px]="kbqOptionWidth">
                <span>{{ state.code }}: {{ state.name }}</span>
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class SimpleAutocomplete implements OnDestroy {
    stateCtrl = new UntypedFormControl();
    filteredStates: any[];
    valueSub: Subscription;
    width: number;
    kbqOptionWidth: number;
    autocompleteDisabled = false;
    openedSpy = jasmine.createSpy('autocomplete opened spy');
    closedSpy = jasmine.createSpy('autocomplete closed spy');

    @ViewChild(KbqAutocompleteTrigger, { static: true }) trigger: KbqAutocompleteTrigger;
    @ViewChild(KbqAutocomplete, { static: false }) panel: KbqAutocomplete;
    @ViewChild(KbqFormField, { static: false }) formField: KbqFormField;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;

    states = [
        { code: 'AL', name: 'Alabama' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' },
    ];

    constructor() {
        this.filteredStates = this.states;
        this.valueSub = this.stateCtrl.valueChanges.subscribe((val) => {
            this.filteredStates = val ? this.states.filter((s) => s.name.match(new RegExp(val, 'gi'))) : this.states;
        });
    }

    displayFn(value: any): string {
        return value ? value.name : value;
    }

    ngOnDestroy() {
        this.valueSub.unsubscribe();
    }
}

@Component({
    template: `
        <kbq-form-field *ngIf="isVisible">
            <input kbqInput placeholder="Choose" [kbqAutocomplete]="auto" [formControl]="optionCtrl" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let option of filteredOptions | async" [value]="option">
                {{ option }}
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class NgIfAutocomplete {
    optionCtrl = new UntypedFormControl();
    filteredOptions: Observable<any>;
    isVisible = true;
    options = ['One', 'Two', 'Three'];

    @ViewChild(KbqAutocompleteTrigger, { static: false }) trigger: KbqAutocompleteTrigger;
    @ViewChildren(KbqOption) kbqOptions: QueryList<KbqOption>;

    constructor() {
        this.filteredOptions = this.optionCtrl.valueChanges.pipe(
            startWith(null),
            map((val: string) => {
                return val ? this.options.filter((option) => new RegExp(val, 'gi').test(option)) : this.options.slice();
            }),
        );
    }
}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="State" [kbqAutocomplete]="auto" (input)="onInput($event.target?.value)" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let state of filteredStates" [value]="state">
                <span>{{ state }}</span>
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithoutForms {
    filteredStates: any[];
    states = ['Alabama', 'California', 'Florida'];

    constructor() {
        this.filteredStates = this.states.slice();
    }

    onInput(value: any) {
        this.filteredStates = this.states.filter((s) => new RegExp(value, 'gi').test(s));
    }
}

@Component({
    template: `
        <kbq-form-field>
            <input
                kbqInput
                placeholder="State"
                [kbqAutocomplete]="auto"
                [(ngModel)]="selectedState"
                (ngModelChange)="onInput($event)"
            />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let state of filteredStates" [value]="state">
                <span>{{ state }}</span>
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithNgModel {
    filteredStates: any[];
    selectedState: string;
    states = ['New York', 'Washington', 'Oregon'];

    constructor() {
        this.filteredStates = this.states.slice();
    }

    onInput(value: any) {
        this.filteredStates = this.states.filter((s) => new RegExp(value, 'gi').test(s));
    }
}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="Number" [kbqAutocomplete]="auto" [(ngModel)]="selectedNumber" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let number of numbers" [value]="number">
                <span>{{ number }}</span>
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithNumbers {
    selectedNumber: number;
    numbers = [0, 1, 2];
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <input type="text" kbqInput [kbqAutocomplete]="auto" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let option of options" [value]="option">{{ option }}</kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithOnPushDelay implements OnInit {
    @ViewChild(KbqAutocompleteTrigger, { static: false }) trigger: KbqAutocompleteTrigger;
    options: string[];

    ngOnInit() {
        setTimeout(() => {
            this.options = ['One'];
        }, 1000);
    }
}

@Component({
    template: `
        <input placeholder="Choose" [kbqAutocomplete]="auto" [formControl]="optionCtrl" />

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let option of filteredOptions | async" [value]="option">
                {{ option }}
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithNativeInput {
    optionCtrl = new UntypedFormControl();
    filteredOptions: Observable<any>;
    options = ['En', 'To', 'Tre', 'Fire', 'Fem'];

    @ViewChild(KbqAutocompleteTrigger, { static: false }) trigger: KbqAutocompleteTrigger;
    @ViewChildren(KbqOption) kbqOptions: QueryList<KbqOption>;

    constructor() {
        this.filteredOptions = this.optionCtrl.valueChanges.pipe(
            startWith(null),
            map((val: string) => {
                return val ? this.options.filter((option) => new RegExp(val, 'gi').test(option)) : this.options.slice();
            }),
        );
    }
}

@Component({
    template: ` <input placeholder="Choose" [kbqAutocomplete]="auto" [formControl]="control" /> `,
})
class AutocompleteWithoutPanel {
    @ViewChild(KbqAutocompleteTrigger, { static: false }) trigger: KbqAutocompleteTrigger;
    control = new UntypedFormControl();
}

@Component({
    template: `
        <kbq-form-field>
            <input placeholder="State" kbqInput [kbqAutocomplete]="auto" [formControl]="formControl" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option [value]="'California'">California</kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithFormsAndNonfloatingLabel {
    formControl = new UntypedFormControl('California');
}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="State" [kbqAutocomplete]="auto" [(ngModel)]="selectedState" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-optgroup *ngFor="let group of stateGroups" [label]="group.label">
                <kbq-option *ngFor="let state of group.states" [value]="state">
                    <span>{{ state }}</span>
                </kbq-option>
            </kbq-optgroup>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithGroups {
    @ViewChild(KbqAutocompleteTrigger, { static: false }) trigger: KbqAutocompleteTrigger;
    selectedState: string;
    stateGroups = [
        {
            title: 'One',
            states: ['Alabama', 'California', 'Florida', 'Oregon'],
        },
        {
            title: 'Two',
            states: ['Kansas', 'Massachusetts', 'New York', 'Pennsylvania'],
        },
        {
            title: 'Three',
            states: ['Tennessee', 'Virginia', 'Wyoming', 'Alaska'],
        },
    ];
}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="State" [kbqAutocomplete]="auto" [(ngModel)]="selectedState" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete" (optionSelected)="optionSelected($event)">
            <kbq-option *ngFor="let state of states" [value]="state">
                <span>{{ state }}</span>
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithSelectEvent {
    selectedState: string;
    states = ['New York', 'Washington', 'Oregon'];
    optionSelected = jasmine.createSpy('optionSelected callback');

    @ViewChild(KbqAutocompleteTrigger, { static: false }) trigger: KbqAutocompleteTrigger;
    @ViewChild(KbqAutocomplete, { static: false }) autocomplete: KbqAutocomplete;
}

@Component({
    template: `
        <input [formControl]="formControl" [kbqAutocomplete]="auto" />
        <kbq-autocomplete #auto="kbqAutocomplete"></kbq-autocomplete>
    `,
})
class PlainAutocompleteInputWithFormControl {
    formControl = new UntypedFormControl();
}

@Component({
    template: `
        <kbq-form-field>
            <input type="number" kbqInput [kbqAutocomplete]="auto" [(ngModel)]="selectedValue" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let value of values" [value]="value">{{ value }}</kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithNumberInputAndNgModel {
    selectedValue: number;
    values = [1, 2, 3];
}

@Component({
    template: `
        <div>
            <kbq-form-field>
                <input
                    kbqInput
                    [kbqAutocomplete]="auto"
                    [kbqAutocompleteConnectedTo]="connectedTo"
                    [(ngModel)]="selectedValue"
                />
            </kbq-form-field>
        </div>

        <div class="origin" kbqAutocompleteOrigin #origin="kbqAutocompleteOrigin" style="margin-top: 50px">
            Connection element
        </div>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let value of values" [value]="value">{{ value }}</kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithDifferentOrigin {
    @ViewChild(KbqAutocompleteTrigger, { static: false }) trigger: KbqAutocompleteTrigger;
    @ViewChild(KbqAutocompleteOrigin, { static: false }) alternateOrigin: KbqAutocompleteOrigin;

    selectedValue: string;
    values = ['one', 'two', 'three'];
    connectedTo?: KbqAutocompleteOrigin;
}

@Component({
    template: `
        <input autocomplete="changed" [(ngModel)]="value" [kbqAutocomplete]="auto" />
        <kbq-autocomplete #auto="kbqAutocomplete"></kbq-autocomplete>
    `,
})
class AutocompleteWithNativeAutocompleteAttribute {
    value: string;
}

@Component({
    template: '<input [kbqAutocomplete]="null" kbqAutocompleteDisabled>',
})
class InputWithoutAutocompleteAndDisabled {}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="States" [kbqAutocomplete]="auto" [(ngModel)]="selectedState" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option *ngFor="let state of states" [value]="state.code" [disabled]="state.disabled">
                <span>{{ state.name }}</span>
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithDisabledItems {
    @ViewChild(KbqAutocompleteTrigger, { static: true }) trigger: KbqAutocompleteTrigger;

    selectedState: string;
    states = [
        { code: 'AL', name: 'Alabama', disabled: true },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' },
    ];
}

@Component({
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="States" [kbqAutocomplete]="auto" [(ngModel)]="selectedState" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete" [openOnFocus]="false">
            <kbq-option *ngFor="let state of states" [value]="state.code">
                <span>{{ state.name }}</span>
            </kbq-option>
        </kbq-autocomplete>
    `,
})
class AutocompleteWithOpenOnFocus {
    @ViewChild(KbqAutocompleteTrigger, { static: true }) trigger: KbqAutocompleteTrigger;

    selectedState: string;
    states = [
        { code: 'AL', name: 'Alabama' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' },
    ];
}

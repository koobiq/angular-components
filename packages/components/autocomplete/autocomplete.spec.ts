import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    Provider,
    Type,
    ViewEncapsulation,
    viewChild,
    viewChildren
} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    DOWN_ARROW,
    ENTER,
    ESCAPE,
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    KbqLocaleServiceModule,
    KbqOption,
    KbqOptionSelectionChange,
    KbqPanelMaxWidth,
    KbqPanelWidth,
    MockNgZone,
    SPACE,
    TAB,
    UP_ARROW,
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    typeInElement
} from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { KbqInputModule } from '../input/index';
import {
    KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS,
    KbqAutocomplete,
    KbqAutocompleteModule,
    KbqAutocompleteOrigin,
    KbqAutocompleteSelectedEvent,
    KbqAutocompleteTrigger,
    getKbqAutocompleteMissingPanelError
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
                KbqInputModule,
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                KbqLocaleServiceModule,
                component
            ],
            providers: [
                { provide: NgZone, useFactory: () => (zone = new MockNgZone()) },
                { provide: KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS, useFactory: () => ({ autoActiveFirstOption: false }) },
                ...providers
            ]
        }).compileComponents();

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
            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBeTruthy();

            expect(overlayContainerElement.textContent).toContain('Alabama');

            expect(overlayContainerElement.textContent).toContain('California');
        });

        it('should not open the panel on focus if the input is readonly', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger();

            input.readOnly = true;
            fixture.detectChanges();

            expect(trigger.panelOpen).toBeFalsy();

            dispatchFakeEvent(input, 'focusin');
            flush();

            fixture.detectChanges();

            expect(trigger.panelOpen).toBeFalsy();
        }));

        it('should not open using the arrow keys when the input is readonly', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger();

            input.readOnly = true;
            fixture.detectChanges();

            expect(trigger.panelOpen).toBeFalsy();

            dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
            flush();

            fixture.detectChanges();
            expect(trigger.panelOpen).toBeFalsy();
        }));

        it('should open the panel programmatically', () => {
            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBeTruthy();

            expect(overlayContainerElement.textContent).toContain('Alabama');

            expect(overlayContainerElement.textContent).toContain('California');
        });

        it('should show the panel when the first open is after the initial zone stabilization', waitForAsync(() => {
            // Note that we're running outside the Angular zone, in order to be able
            // to test properly without the subscription from `_subscribeToClosingActions`
            // giving us a false positive.
            fixture.ngZone!.runOutsideAngular(() => {
                fixture.componentInstance.trigger().open();

                Promise.resolve().then(() => {
                    expect(fixture.componentInstance.panel().showPanel).toBeTruthy();
                });
            });
        }));

        it('should close the panel when the user clicks away', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();
            dispatchFakeEvent(document, 'click');

            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();
            expect(overlayContainerElement.textContent).toEqual('');
        }));

        it('should close the panel when the user taps away on a touch device', fakeAsync(() => {
            dispatchFakeEvent(input, 'focus');
            fixture.detectChanges();
            flush();
            dispatchFakeEvent(document, 'touchend');

            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();
            expect(overlayContainerElement.textContent).toEqual('');
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

            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();
            expect(overlayContainerElement.textContent).toEqual('');
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

            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();
            expect(overlayContainerElement.textContent).toEqual('');
        }));

        it('should close the panel programmatically', () => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            fixture.componentInstance.trigger().closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();
            expect(overlayContainerElement.textContent).toEqual('');
        });

        it('should not throw when attempting to close the panel of a destroyed autocomplete', () => {
            const trigger = fixture.componentInstance.trigger();

            trigger.open();
            fixture.detectChanges();
            fixture.destroy();

            expect(() => trigger.closePanel()).not.toThrow();
        });

        it('should hide the panel when the options list is empty', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel') as HTMLElement;

            expect(panel.classList).toContain('kbq-autocomplete_visible');

            // Filter down the option list such that no options match the value
            typeInElement('af', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(panel.classList).toContain('kbq-autocomplete_hidden');
        }));

        it('should not open the panel when the `input` event is invoked on a non-focused input', () => {
            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();

            input.value = 'Alabama';
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();
        });

        it('should toggle the visibility when typing and closing the panel', fakeAsync(() => {
            fixture.componentInstance.trigger().open();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel')!.classList).toContain(
                'kbq-autocomplete_visible'
            );

            typeInElement('x', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel')!.classList).toContain(
                'kbq-autocomplete_hidden'
            );

            fixture.componentInstance.trigger().closePanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            typeInElement('al', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel')!.classList).toContain(
                'kbq-autocomplete_visible'
            );
        }));

        it('should provide the open state of the panel', fakeAsync(() => {
            expect(fixture.componentInstance.panel().isOpen).toBeFalsy();

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.panel().isOpen).toBeTruthy();
        }));

        it('should emit an event when the panel is opened', () => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalled();
        });

        it('should not emit the `opened` event when no options are being shown', () => {
            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
            fixture.detectChanges();

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).not.toHaveBeenCalled();
        });

        it('should emit the `opened` event if the options come in after the panel is shown', fakeAsync(() => {
            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
            fixture.detectChanges();

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).not.toHaveBeenCalled();

            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [
                { name: 'California', code: 'CA' }
            ];
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalled();
        }));

        it('should not emit the opened event multiple times while typing', fakeAsync(() => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalledTimes(1);

            typeInElement('Alabam', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalledTimes(1);
        }));

        it('should emit an event when the panel is closed', () => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            fixture.componentInstance.trigger().closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.closedSpy).toHaveBeenCalled();
        });

        it('should not emit the `closed` event when no options were shown', () => {
            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
            fixture.detectChanges();

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            fixture.componentInstance.trigger().closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.closedSpy).not.toHaveBeenCalled();
        });

        it('should not be able to open the panel if the autocomplete is disabled', () => {
            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();

            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();
        });

        it('should continue to update the model if the autocomplete is disabled', () => {
            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            typeInElement('hello', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value).toBe('hello');
        });
    });

    it('should have the correct text direction in RTL', () => {
        const rtlFixture = createComponent(SimpleAutocomplete, [
            { provide: Directionality, useFactory: () => ({ value: 'rtl', change: EMPTY }) }
        ]);

        rtlFixture.detectChanges();
        rtlFixture.componentInstance.trigger().open();
        rtlFixture.detectChanges();

        const boundingBox = overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(boundingBox.getAttribute('dir')).toEqual('rtl');
    });

    it('should update the panel direction if it changes for the trigger', () => {
        const dirProvider = { value: 'rtl', change: EMPTY };
        const rtlFixture = createComponent(SimpleAutocomplete, [
            { provide: Directionality, useFactory: () => dirProvider }
        ]);

        rtlFixture.detectChanges();
        rtlFixture.componentInstance.trigger().open();
        rtlFixture.detectChanges();

        let boundingBox = overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(boundingBox.getAttribute('dir')).toEqual('rtl');

        rtlFixture.componentInstance.trigger().closePanel();
        rtlFixture.detectChanges();

        dirProvider.value = 'ltr';
        rtlFixture.componentInstance.trigger().open();
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
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();

            typeInElement('a', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value).toEqual('a');

            typeInElement('al', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value).toEqual('al');
        });

        it('should update control value when autofilling', () => {
            // Simulate the browser autofilling the input by setting a value and
            // dispatching an `input` event while the input is out of focus.
            expect(document.activeElement).not.toBe(input);

            input.value = 'Alabama';
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value).toBe('Alabama');
        });

        it('should update control value when option is selected with option value', fakeAsync(() => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value).toEqual({ code: 'CA', name: 'California' });
        }));

        it('should update the control back to a string if user types after an option is selected', fakeAsync(() => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[1].click();
            fixture.detectChanges();

            typeInElement('Californi', input);
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.stateCtrl.value).toEqual('Californi');
        }));

        it('should fill the text field with display value when an option is selected', () => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[1].click();
            fixture.detectChanges();

            expect(input.value).toContain('California');
        });

        it('should fill the text field with value if displayWith is not set', () => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();

            fixture.componentInstance.panel().displayWith = null;
            fixture.componentInstance.options()[1].value = 'test value';
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[1].click();

            fixture.detectChanges();
            expect(input.value).toContain('test value');
        });

        it('should fill the text field correctly if value is set to obj programmatically', fakeAsync(() => {
            fixture.componentInstance.stateCtrl.setValue({ code: 'AL', name: 'Alabama' });
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(input.value).toContain('Alabama');
        }));

        it('should clear the text field if value is reset programmatically', fakeAsync(() => {
            typeInElement('Alabama', input);
            fixture.detectChanges();
            tick();

            fixture.componentInstance.stateCtrl.reset();
            tick();

            fixture.detectChanges();
            tick();

            expect(input.value).toEqual('');
        }));

        it('should disable input in view when disabled programmatically', () => {
            const formFieldElement = fixture.debugElement.query(By.css('.kbq-form-field')).nativeElement;

            expect(input.disabled).toBeFalsy();
            expect(formFieldElement.classList.contains('kbq-disabled')).toBeFalsy();

            fixture.componentInstance.stateCtrl.disable();
            fixture.detectChanges();

            expect(input.disabled).toBeTruthy();
            expect(formFieldElement.classList.contains('kbq-disabled')).toBeTruthy();
        });

        it('should mark the autocomplete control as dirty as user types', () => {
            expect(fixture.componentInstance.stateCtrl.dirty).toBeFalsy();

            typeInElement('a', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty).toBeTruthy();
        });

        it('should mark the autocomplete control as dirty when an option is selected', () => {
            expect(fixture.componentInstance.stateCtrl.dirty).toBeFalsy();

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty).toBeTruthy();
        });

        it('should not mark the control dirty when the value is set programmatically', () => {
            expect(fixture.componentInstance.stateCtrl.dirty).toBeFalsy();

            fixture.componentInstance.stateCtrl.setValue('AL');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty).toBeFalsy();
        });

        it('should mark the autocomplete control as touched on blur', () => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            expect(fixture.componentInstance.stateCtrl.touched).toBe(false);

            dispatchFakeEvent(input, 'blur');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.touched).toBe(true);
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
        let trigger: KbqAutocompleteTrigger;
        let panel: KbqAutocomplete;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;
            DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);
            ENTER_EVENT = createKeyboardEvent('keydown', ENTER);

            trigger = fixture.componentInstance.trigger();
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();
            panel = fixture.componentInstance.panel();
        });

        it('should not close the panel when DOWN key is pressed', () => {
            fixture.componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);

            expect(fixture.componentInstance.trigger().panelOpen).toBe(true);

            expect(overlayContainerElement.textContent).toContain('Alabama');

            expect(overlayContainerElement.textContent).toContain('California');
        });

        it('should set the active item to the first option when DOWN key is pressed', () => {
            const componentInstance = fixture.componentInstance;
            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            expect(componentInstance.trigger().panelOpen).toBe(true);

            componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger().activeOption === componentInstance.options().at(0)!).toBe(true);
            expect(optionEls[0].classList).toContain('kbq-active');
            expect(optionEls[1].classList).not.toContain('kbq-active');

            componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger().activeOption === componentInstance.options().at(1)!).toBe(true);
            expect(optionEls[0].classList).not.toContain('kbq-active');
            expect(optionEls[1].classList).toContain('kbq-active');
        });

        it('should not set the active item to the last option when UP key is pressed', () => {
            const componentInstance = fixture.componentInstance;
            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            expect(componentInstance.trigger().panelOpen).toBe(true);

            componentInstance.trigger().handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger().activeOption !== componentInstance.options().at(0)!).toBe(true);
            expect(optionEls[0].classList).not.toContain('kbq-active');

            componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger().activeOption === componentInstance.options().at(0)!).toBe(true);
            expect(optionEls[0].classList).toContain('kbq-active');
        });

        it('should set the active item properly after filtering', () => {
            const componentInstance = fixture.componentInstance;

            typeInElement('o', input);
            fixture.detectChanges();

            componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            expect(componentInstance.trigger().activeOption === componentInstance.options().at(0)!).toBe(true);

            expect(optionEls[0].classList).toContain('kbq-active');
            expect(optionEls[1].classList).not.toContain('kbq-active');
        });

        it('should fill the text field when an option is selected with ENTER', fakeAsync(() => {
            fixture.componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.detectChanges();

            fixture.componentInstance.trigger().handleKeydown(ENTER_EVENT);
            fixture.detectChanges();

            expect(input.value).toContain('Alabama');
        }));

        it('should prevent the default enter key action', fakeAsync(() => {
            fixture.componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            flush();

            fixture.componentInstance.trigger().handleKeydown(ENTER_EVENT);

            expect(ENTER_EVENT.defaultPrevented).toBe(true);
        }));

        it('should not prevent the default enter action for a closed panel after a user action', () => {
            fixture.componentInstance.trigger().handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            fixture.componentInstance.trigger().closePanel();
            fixture.detectChanges();
            fixture.componentInstance.trigger().handleKeydown(ENTER_EVENT);

            expect(ENTER_EVENT.defaultPrevented).toBe(false);
        });

        it('should fill the text field, not select an option, when SPACE is entered', () => {
            typeInElement('New', input);
            fixture.detectChanges();

            const SPACE_EVENT = createKeyboardEvent('keydown', SPACE);

            fixture.componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            fixture.componentInstance.trigger().handleKeydown(SPACE_EVENT);
            fixture.detectChanges();

            expect(input.value).not.toContain('New York');
        });

        it('should mark the control dirty when selecting an option from the keyboard', fakeAsync(() => {
            expect(fixture.componentInstance.stateCtrl.dirty).toBe(false);

            fixture.componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.componentInstance.trigger().handleKeydown(ENTER_EVENT);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty).toBe(true);
        }));

        it('should open the panel again when typing after making a selection', fakeAsync(() => {
            fixture.componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.componentInstance.trigger().handleKeydown(ENTER_EVENT);
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBe(false);

            expect(overlayContainerElement.textContent).toEqual('');

            dispatchFakeEvent(input, 'focusin');
            typeInElement('Alabama', input);
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.trigger().panelOpen).toBe(true);

            expect(overlayContainerElement.textContent).toContain('Alabama');
        }));

        it('should not open the panel if the `input` event was dispatched with changing the value', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger();

            dispatchFakeEvent(input, 'focusin');
            typeInElement('A', input);
            fixture.detectChanges();
            tick();

            expect(trigger.panelOpen).toBe(true);

            trigger.closePanel();
            fixture.detectChanges();

            expect(trigger.panelOpen).toBe(false);

            // Dispatch the event without actually changing the value
            // to simulate what happen in some cases on IE.
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();
            tick();

            expect(trigger.panelOpen).toBe(false);
        }));

        it('should not move active option past the first when pressing UP from the top', () => {
            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-autocomplete-panel')!;
            const componentInstance = fixture.componentInstance;

            fixture.componentInstance.trigger().handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).toEqual(0);
            expect(componentInstance.trigger().activeOption).not.toBe(componentInstance.options().at(0)!);
        });

        it('should move the active option through the panel via DOWN/UP', () => {
            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();
            expect(panel.getScrollTop()).toEqual(0);
            expect(trigger.activeOption).toBe(fixture.componentInstance.options().at(0)!);

            Array.from({ length: 8 }).forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));
            const optionsArray = fixture.componentInstance.options();

            expect(trigger.activeOption).toBe(optionsArray[8]);

            Array.from({ length: 6 }).forEach(() => trigger.handleKeydown(UP_ARROW_EVENT));
            expect(trigger.activeOption).toBe(optionsArray[2]);
            expect(panel.getScrollTop()).toEqual(0);
        });

        it('should close the panel when pressing escape', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger();

            input.focus();
            flush();
            fixture.detectChanges();

            expect(document.activeElement).toBe(input);

            expect(trigger.panelOpen).toBe(true);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(input);

            expect(trigger.panelOpen).toBe(false);
        }));

        it('should prevent the default action when pressing escape', fakeAsync(() => {
            const escapeEvent = dispatchKeyboardEvent(input, 'keydown', ESCAPE);

            fixture.detectChanges();
            flush();

            expect(escapeEvent.defaultPrevented).toBe(true);
        }));

        it('should close the panel when pressing ALT + UP_ARROW', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger();
            const upArrowEvent = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(upArrowEvent, 'altKey', { get: () => true });

            input.focus();
            flush();
            fixture.detectChanges();

            expect(document.activeElement).toBe(input);

            expect(trigger.panelOpen).toBe(true);

            dispatchEvent(document.body, upArrowEvent);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(input);
            expect(trigger.panelOpen).toBe(false);
        }));

        it('should close the panel when tabbing away from a trigger without results', fakeAsync(() => {
            fixture.componentInstance.states = [];
            fixture.componentInstance.filteredStates = [];
            fixture.detectChanges();
            input.focus();
            flush();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel')).toBeTruthy();

            dispatchKeyboardEvent(input, 'keydown', TAB);
            fixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelector('.kbq-autocomplete-panel')).toBeFalsy();
        }));

        it('should reset the active option when closing with the escape key', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger();

            trigger.open();
            fixture.detectChanges();
            flush();

            expect(trigger.panelOpen).toBe(true);
            expect(trigger.activeOption).toBeFalsy();

            // Press the down arrow a few times.
            [1, 2, 3].forEach(() => {
                trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
                fixture.detectChanges();
            });

            expect(trigger.activeOption).toBe(fixture.componentInstance.options()[2]);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            flush();

            expect(trigger.activeOption).toBeFalsy();
        }));

        it('should reset the active option when closing by selecting with enter', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger();

            trigger.open();
            fixture.detectChanges();
            tick();

            expect(trigger.panelOpen).toBe(true);
            expect(trigger.activeOption).toBeFalsy();

            // Press the down arrow a few times.
            [1, 2, 3].forEach(() => {
                trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
                fixture.detectChanges();
            });

            expect(trigger.activeOption).toBe(fixture.componentInstance.options()[2]);

            trigger.handleKeydown(ENTER_EVENT);
            tick();

            expect(trigger.activeOption).toBeFalsy();
        }));

        it('should select the option immediately when Shift + DOWN moves focus', () => {
            const componentInstance = fixture.componentInstance;
            const shiftDown = createKeyboardEvent('keydown', DOWN_ARROW);

            Object.defineProperty(shiftDown, 'shiftKey', { value: true });

            trigger.handleKeydown(shiftDown);
            fixture.detectChanges();

            expect(componentInstance.options().at(0)!.selected).toBe(true);
        });

        it('should expose setScrollTop / getScrollTop on the panel', () => {
            expect(panel.getScrollTop()).toBe(0);

            panel.setScrollTop(42);

            expect(panel.getScrollTop()).toBe(42);
        });
    });

    describe('Fallback positions', () => {
        it('should use below positioning by default', () => {
            const fixture = createComponent(SimpleAutocomplete);

            fixture.detectChanges();
            const inputReference = fixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const inputBottom = inputReference.getBoundingClientRect().bottom;
            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel')!;
            const panelTop = panel.getBoundingClientRect().top;

            expect(Math.floor(inputBottom)).toEqual(Math.floor(panelTop));

            expect(panel.classList).not.toContain('kbq-autocomplete-panel-above');
        });

        it('should reposition the panel on scroll', () => {
            const scrolledSubject = new Subject();
            const spacer = document.createElement('div');
            const fixture = createComponent(SimpleAutocomplete, [
                {
                    provide: ScrollDispatcher,
                    useValue: { scrolled: () => scrolledSubject.asObservable() }
                }
            ]);

            fixture.detectChanges();

            const inputReference = fixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

            spacer.style.height = '1000px';
            document.body.appendChild(spacer);

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            window.scroll(0, 100);
            scrolledSubject.next(null);
            fixture.detectChanges();

            const inputBottom = inputReference.getBoundingClientRect().bottom;
            const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const panelTop = panel.getBoundingClientRect().top;

            expect(Math.floor(inputBottom)).toEqual(Math.floor(panelTop));

            document.body.removeChild(spacer);
            window.scroll(0, 0);
        });

        it('should align panel properly when filtering in "above" position', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);

            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            const inputReference = fixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

            // Push the autocomplete trigger down so it won't have room to open "below"
            inputReference.style.bottom = '0';
            inputReference.style.position = 'fixed';

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();

            typeInElement('f', input);
            fixture.detectChanges();
            tick();

            const inputTop = inputReference.getBoundingClientRect().top;
            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel')!;
            const panelBottom = panel.getBoundingClientRect().bottom;

            expect(Math.floor(inputTop)).toEqual(Math.floor(panelBottom));
        }));

        it(
            'should fall back to above position when requested if options are added while ' + 'the panel is open',
            fakeAsync(() => {
                const fixture = createComponent(SimpleAutocomplete);

                fixture.componentInstance.states = fixture.componentInstance.states.slice(0, 1);
                fixture.componentInstance.filteredStates = fixture.componentInstance.states.slice();
                fixture.detectChanges();

                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
                const inputReference = fixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

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

                expect(Math.floor(panelRect.top)).toBe(Math.floor(inputRect.bottom));

                for (let i = 0; i < 20; i++) {
                    fixture.componentInstance.filteredStates.push({ code: 'FK', name: 'Fake State' });
                    fixture.detectChanges();
                }

                // Request a position update now that there are too many suggestions to fit in the viewport.
                fixture.componentInstance.trigger().updatePosition();

                inputRect = inputReference.getBoundingClientRect();
                panelRect = panel.getBoundingClientRect();

                expect(Math.floor(panelRect.bottom)).toBe(Math.floor(inputRect.top));
                tick();
            })
        );

        it('should not throw if a panel reposition is requested while the panel is closed', () => {
            const fixture = createComponent(SimpleAutocomplete);

            fixture.detectChanges();

            expect(() => fixture.componentInstance.trigger().updatePosition()).not.toThrow();
        });
    });

    describe('Option selection', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
        });

        it('should deselect any other selected option', () => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].click();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const componentOptions = fixture.componentInstance.options();

            expect(componentOptions[0].selected).toBe(true);

            options = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            expect(componentOptions[0].selected).toBe(false);

            expect(componentOptions[1].selected).toBe(true);
        });

        it('should call deselect only on the previous selected option', () => {
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].click();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const componentOptions = fixture.componentInstance.options();

            componentOptions.forEach((option) => jest.spyOn(option, 'deselect'));

            expect(componentOptions[0].selected).toBe(true);

            options = overlayContainerElement.querySelectorAll('kbq-option');
            options[1].click();
            fixture.detectChanges();

            expect(componentOptions[0].deselect).toHaveBeenCalled();
            componentOptions.slice(1).forEach((option) => expect(option.deselect).not.toHaveBeenCalled());
        });

        it('should be able to preselect the first option', () => {
            fixture.componentInstance.trigger().autocomplete().autoActiveFirstOption = true;
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-option')[0].classList).toContain('kbq-active');
        });

        it('should be able to configure preselecting the first option globally', () => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            TestBed.resetTestingModule();
            fixture = createComponent(SimpleAutocomplete, [
                { provide: KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: { autoActiveFirstOption: true } }
            ]);

            fixture.detectChanges();
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-option')[0].classList).toContain('kbq-active');
        });

        it('should handle `optionSelections` being accessed too early', () => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            fixture = TestBed.createComponent(SimpleAutocomplete);

            const spy = jest.fn();

            expect(fixture.componentInstance.trigger().autocomplete()).toBeFalsy();
            expect(() => {
                fixture.componentInstance.trigger().optionSelections.pipe(take(1)).subscribe(spy);
            }).not.toThrow();

            fixture.detectChanges();
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

            option.click();
            fixture.detectChanges();
            zone.simulateZoneExit();

            expect(spy).toHaveBeenCalledWith(expect.any(KbqOptionSelectionChange));
        });

        it('should reposition the panel when the amount of options changes', fakeAsync(() => {
            const formField = fixture.debugElement.query(By.css('.kbq-form-field')).nativeElement;
            const inputReference = formField.querySelector('.kbq-form-field__container');
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

            expect(Math.floor(inputBottom)).toBe(Math.floor(panelTop));

            typeInElement('', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const inputTop = inputReference.getBoundingClientRect().top;
            const panelBottom = panel.getBoundingClientRect().bottom;

            expect(Math.floor(inputTop)).toBe(Math.floor(panelBottom));
        }));
    });

    describe('panel closing', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;
        let trigger: KbqAutocompleteTrigger;
        let closingActionFn: jest.Mock;
        let closingActionsSub: Subscription;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            flush();

            trigger = fixture.componentInstance.trigger();
            closingActionFn = jest.fn();
            closingActionsSub = trigger.panelClosingActions.subscribe(closingActionFn);
        }));

        afterEach(() => closingActionsSub.unsubscribe());

        it('should emit panel close event when clicking away', () => {
            expect(closingActionFn).not.toHaveBeenCalled();
            dispatchFakeEvent(document, 'click');
            expect(closingActionFn).toHaveBeenCalledWith(null);
        });

        it('should emit panel close event when tabbing out', () => {
            const tabEvent = createKeyboardEvent('keydown', TAB);

            input.focus();

            expect(closingActionFn).not.toHaveBeenCalled();
            trigger.handleKeydown(tabEvent);
            expect(closingActionFn).toHaveBeenCalledWith(null);
        });

        it('should not emit when tabbing away from a closed panel', () => {
            const tabEvent = createKeyboardEvent('keydown', TAB);

            input.focus();
            zone.simulateZoneExit();

            trigger.handleKeydown(tabEvent);

            // Ensure that it emitted once while the panel was open.
            expect(closingActionFn).toHaveBeenCalledTimes(1);

            trigger.handleKeydown(tabEvent);

            // Ensure that it didn't emit again when tabbing out again.
            expect(closingActionFn).toHaveBeenCalledTimes(1);
        });

        it('should emit panel close event when selecting an option', () => {
            const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

            expect(closingActionFn).not.toHaveBeenCalled();
            option.click();
            expect(closingActionFn).toHaveBeenCalledWith(expect.any(KbqOptionSelectionChange));
        });

        it('should close the panel when pressing escape', () => {
            expect(closingActionFn).not.toHaveBeenCalled();
            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            expect(closingActionFn).toHaveBeenCalledWith(null);
        });
    });

    describe('onInputBlur callback', () => {
        it('should return true by default when blurring to a non-option target', () => {
            const fixture = createComponent(SimpleAutocomplete);

            fixture.detectChanges();

            const trigger = fixture.componentInstance.trigger();
            const blurEvent = { relatedTarget: document.createElement('button') } as unknown as FocusEvent;

            expect(trigger.onInputBlur()(blurEvent)).toBe(true);
        });

        it('should return false by default when blurring to a KBQ-OPTION target', () => {
            const fixture = createComponent(SimpleAutocomplete);

            fixture.detectChanges();

            const trigger = fixture.componentInstance.trigger();
            const optionEl = document.createElement('kbq-option');
            const blurEvent = { relatedTarget: optionEl } as unknown as FocusEvent;

            expect(trigger.onInputBlur()(blurEvent)).toBe(false);
        });

        it('should return true by default when relatedTarget is null', () => {
            const fixture = createComponent(SimpleAutocomplete);

            fixture.detectChanges();

            const trigger = fixture.componentInstance.trigger();
            const blurEvent = { relatedTarget: null } as unknown as FocusEvent;

            expect(trigger.onInputBlur()(blurEvent)).toBe(true);
        });

        it('should accept a custom callback via [kbqAutocompleteOnBlur]', () => {
            const fixture = createComponent(AutocompleteWithCustomOnBlur);

            fixture.detectChanges();

            const trigger = fixture.componentInstance.trigger();
            const blurEvent = { relatedTarget: null } as unknown as FocusEvent;

            expect(trigger.onInputBlur()(blurEvent)).toBe(false);
            expect(fixture.componentInstance.customBlurSpy).toHaveBeenCalledWith(blurEvent);
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
            }).not.toThrow();
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

            expect(fixture.componentInstance.trigger().panelOpen).toBe(true);

            expect(overlayContainerElement.textContent).toContain('One');

            expect(overlayContainerElement.textContent).toContain('Two');
        });

        it('should filter properly with ngIf after setting the active item', () => {
            const fixture = createComponent(NgIfAutocomplete);

            fixture.detectChanges();

            fixture.componentInstance.trigger().open();
            fixture.detectChanges();

            const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);

            fixture.componentInstance.trigger().handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            typeInElement('o', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.kbqOptions().length).toBe(2);
        });

        it('should throw if the user attempts to open the panel too early', () => {
            const fixture = createComponent(AutocompleteWithoutPanel);

            fixture.detectChanges();

            expect(() => {
                fixture.componentInstance.trigger().open();
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

        it('should transfer the kbq-autocomplete classes to the panel element', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);

            fixture.detectChanges();

            fixture.componentInstance.trigger().open();
            tick();
            fixture.detectChanges();

            const autocomplete = fixture.debugElement.nativeElement.querySelector('kbq-autocomplete');
            const panel = overlayContainerElement.querySelector('.kbq-autocomplete-panel')!;

            expect(autocomplete.classList).not.toContain('class-one');
            expect(autocomplete.classList).not.toContain('class-two');

            expect(panel.classList).toContain('class-one');
            expect(panel.classList).toContain('class-two');
        }));

        // The "close" scroll strategy doesn't propagate in jsdom; it is covered by Playwright in
        // e2e.playwright-spec.ts → "Scroll strategy: close".

        it('should handle autocomplete being attached to number inputs', fakeAsync(() => {
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

    it('should not reopen a closed autocomplete when returning to a blurred tab', async () => {
        const fixture = createComponent(SimpleAutocomplete);

        fixture.detectChanges();
        await fixture.whenStable();

        const trigger = fixture.componentInstance.trigger();
        const input = fixture.debugElement.query(By.css('input')).nativeElement;

        input.focus();
        fixture.detectChanges();

        expect(trigger.panelOpen).toBe(true);

        trigger.closePanel();
        fixture.detectChanges();

        expect(trigger.panelOpen).toBe(false);

        // Simulate the user going to a different tab.
        dispatchFakeEvent(window, 'blur');
        input.blur();
        fixture.detectChanges();

        // Simulate the user coming back.
        dispatchFakeEvent(window, 'focus');
        input.focus();
        fixture.detectChanges();

        expect(trigger.panelOpen).toBe(false);
    });

    it('should match the panel width to the host when panelWidth is auto', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

        jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);

        widthFixture.componentInstance.panelWidth = 'auto';
        widthFixture.detectChanges();
        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(overlayPane.style.width).toBe('300px');
    });

    it('should have panel width set to a CSS string value', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.panelWidth = 'fit-content';
        widthFixture.detectChanges();
        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(overlayPane.style.width).toBe('fit-content');
    });

    it('should have panel width set to number value', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.panelWidth = 400;
        widthFixture.detectChanges();
        widthFixture.componentInstance.trigger().open();
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
                expect(panel.classList).toContain(visibleClass);
            });
        })
    );

    it('should emit an event when an option is selected', fakeAsync(() => {
        const fixture = createComponent(AutocompleteWithSelectEvent);

        fixture.detectChanges();
        fixture.componentInstance.trigger().open();
        zone.simulateZoneExit();
        fixture.detectChanges();

        const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
        const spy = fixture.componentInstance.optionSelected;

        options[1].click();
        tick();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);

        const event = spy.mock.calls[spy.mock.calls.length - 1][0] as KbqAutocompleteSelectedEvent;

        expect(event.source).toBe(fixture.componentInstance.autocomplete());
        expect(event.option.value).toBe('Washington');
    }));

    it('should emit an event when a newly-added option is selected', fakeAsync(() => {
        const fixture = createComponent(AutocompleteWithSelectEvent);

        fixture.detectChanges();
        fixture.componentInstance.trigger().open();
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

        const event = spy.mock.calls[spy.mock.calls.length - 1][0] as KbqAutocompleteSelectedEvent;

        expect(event.source).toBe(fixture.componentInstance.autocomplete());
        expect(event.option.value).toBe('Puerto Rico');
    }));

    it('should be able to set a custom panel connection element', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);

        fixture.detectChanges();
        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin();
        fixture.detectChanges();
        fixture.componentInstance.trigger().open();
        fixture.detectChanges();
        zone.simulateZoneExit();

        const overlayRect = overlayContainerElement.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
        const originRect = fixture.nativeElement.querySelector('.origin').getBoundingClientRect();

        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
    });

    it('should be able to change the origin after the panel has been opened', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);

        fixture.detectChanges();
        fixture.componentInstance.trigger().open();
        fixture.detectChanges();
        zone.simulateZoneExit();

        fixture.componentInstance.trigger().closePanel();
        fixture.detectChanges();

        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin();
        fixture.detectChanges();

        fixture.componentInstance.trigger().open();
        fixture.detectChanges();
        zone.simulateZoneExit();

        const overlayRect = overlayContainerElement.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
        const originRect = fixture.nativeElement.querySelector('.origin').getBoundingClientRect();

        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
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

        expect(formControl.value).toBe('Cal');

        formControl.setValue('');
        fixture.detectChanges();

        expect(input.value).toBe('');

        typeInElement('Cal', input);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(formControl.value).toBe('Cal');
    }));

    it('should not close when clicking inside alternate origin', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);

        fixture.detectChanges();
        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin();
        fixture.detectChanges();
        fixture.componentInstance.trigger().open();
        fixture.detectChanges();
        zone.simulateZoneExit();

        expect(fixture.componentInstance.trigger().panelOpen).toBe(true);

        const origin = fixture.nativeElement.querySelector('.origin');

        origin.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger().panelOpen).toBe(true);
    });

    it('should have correct min-width when opened', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;
        const rectSpy = jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(300);

        widthFixture.componentInstance.trigger().closePanel();
        widthFixture.detectChanges();

        widthFixture.componentInstance.width = 500;
        widthFixture.detectChanges();
        rectSpy.mockReturnValue({ width: 500 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(500);
    });

    it('should update the min-width while the panel is open', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;
        const rectSpy = jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(300);

        widthFixture.componentInstance.width = 500;
        widthFixture.detectChanges();
        rectSpy.mockReturnValue({ width: 500 } as DOMRect);

        // Re-open to trigger the else branch in attachOverlay which calls overlayRef.updateSize()
        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(500);
    });

    it('should re-measure the panel min-width once the layout is stable after opening', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;
        // Simulate the host being narrower when the panel first opens, e.g. when the trigger lives
        // inside another overlay (inline-edit) that hasn't reached its final width yet.
        const rectSpy = jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        // The create-time measurement is applied before the layout settles.
        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(300);

        // The host reaches its final width after the layout settles.
        rectSpy.mockReturnValue({ width: 500 } as DOMRect);

        // The `zone.onStable` callback re-measures the panel once the layout is stable.
        zone.simulateZoneExit();
        widthFixture.detectChanges();

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(500);
    });

    it('should update the panel min-width if the window is resized', fakeAsync(() => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;
        const rectSpy = jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(300);

        widthFixture.componentInstance.width = 400;
        widthFixture.detectChanges();
        rectSpy.mockReturnValue({ width: 400 } as DOMRect);

        dispatchFakeEvent(window, 'resize');
        tick(20);

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(400);
    }));

    it('should have panel min-width match host width by default', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

        jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(300);
    });

    it('should enforce panelMinWidth when host is narrower', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

        jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(200);
    });

    it('should use host width when wider than panelMinWidth', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 400;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

        jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 400 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(400);
    });

    it('should respect a custom panelMinWidth input', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.detectChanges();

        widthFixture.componentInstance.panelMinWidth = 350;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

        jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.minWidth as string))).toBe(350);
    });

    it('should use exact width when panelWidth is set, ignoring panelMinWidth', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.detectChanges();

        widthFixture.componentInstance.panelWidth = 250;
        widthFixture.detectChanges();

        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

        jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);

        widthFixture.componentInstance.trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(250);
        expect(overlayPane.style.minWidth).toBe('');
    });

    it('should drop a previously set panelWidth when it is unset at runtime', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.detectChanges();

        const { trigger } = widthFixture.componentInstance;
        const connectedEl = widthFixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

        jest.spyOn(connectedEl, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect);

        widthFixture.componentInstance.panelWidth = 300;
        widthFixture.detectChanges();
        trigger().open();
        widthFixture.detectChanges();
        trigger().closePanel();
        widthFixture.detectChanges();

        // `OverlayRef.updateSize()` merges shallowly, so the resolver has to emit both keys or the
        // stale `width` stays applied to the pane.
        widthFixture.componentInstance.panelWidth = null;
        widthFixture.detectChanges();
        trigger().open();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(overlayPane.style.width).toBe('');
        expect(overlayPane.style.minWidth).toBe('200px');
    });

    describe('Option selection with disabled items', () => {
        let fixture: ComponentFixture<AutocompleteWithDisabledItems>;

        beforeEach(() => {
            fixture = createComponent(AutocompleteWithDisabledItems);
            fixture.detectChanges();
        });

        it('should not autofocus on first item when it disabled', () => {
            fixture.componentInstance.trigger().autocomplete().autoActiveFirstOption = true;
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-option')[1].classList).toContain('kbq-active');
        });

        it('should not autofocus on first and second item when it disabled', () => {
            fixture.componentInstance.states[1].disabled = true;

            fixture.componentInstance.trigger().autocomplete().autoActiveFirstOption = true;
            fixture.componentInstance.trigger().open();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-option')[2].classList).toContain('kbq-active');
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
            fixture.componentInstance.trigger().autocomplete().openOnFocus = false;

            expect(fixture.componentInstance.trigger().panelOpen).toBe(false);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBe(false);
        });

        it('should open dropdown with enabled openOnFocus', () => {
            fixture.componentInstance.trigger().autocomplete().openOnFocus = true;

            expect(fixture.componentInstance.trigger().panelOpen).toBe(false);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBe(true);
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
            expect(fixture.componentInstance.trigger().panelOpen).toBe(false);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBe(true);
        });
    });

    describe('with encapsulation: ViewEncapsulation.ShadowDom', () => {
        it('should open the panel when the input is the shadow-DOM focused element', fakeAsync(() => {
            const fixture = createComponent(TestShadowDomAutocomplete);

            fixture.detectChanges();
            const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            // emulate native behavior
            input.focus();
            input.value = 'Alabama';
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.trigger().panelOpen).toBeTruthy();
        }));

        it('should open the panel when the clicked input is the shadow-DOM focused element', fakeAsync(() => {
            const fixture = createComponent(TestShadowDomAutocomplete);

            fixture.detectChanges();
            const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(fixture.componentInstance.trigger().panelOpen).toBeFalsy();
            // emulate native behavior
            input.focus();
            dispatchFakeEvent(input, 'click');
            flush();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger().panelOpen).toBeTruthy();
        }));
    });
});

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        ReactiveFormsModule
    ],
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
            #auto="kbqAutocomplete"
            class="class-one class-two"
            [displayWith]="displayFn"
            [panelMaxWidth]="panelMaxWidth"
            [panelMinWidth]="panelMinWidth"
            [panelWidth]="panelWidth"
            (opened)="openedSpy()"
            (closed)="closedSpy()"
        >
            @for (state of filteredStates; track state) {
                <kbq-option [value]="state" [style.height.px]="kbqOptionWidth">
                    <span>{{ state.code }}: {{ state.name }}</span>
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class SimpleAutocomplete implements OnDestroy {
    stateCtrl = new UntypedFormControl();
    filteredStates: any[];
    valueSub: Subscription;
    width: number;
    panelWidth: KbqPanelWidth | undefined;
    panelMinWidth: number = KBQ_PANEL_DEFAULT_MIN_WIDTH;
    panelMaxWidth: KbqPanelMaxWidth = null;
    kbqOptionWidth: number;
    autocompleteDisabled = false;
    openedSpy = jest.fn();
    closedSpy = jest.fn();

    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly panel = viewChild.required(KbqAutocomplete);
    readonly formField = viewChild.required(KbqFormField);
    readonly options = viewChildren(KbqOption);

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
        { code: 'WY', name: 'Wyoming' }
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
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        ReactiveFormsModule
    ],
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
            #auto="kbqAutocomplete"
            class="class-one class-two"
            [displayWith]="displayFn"
            (opened)="openedSpy()"
            (closed)="closedSpy()"
        >
            @for (state of filteredStates; track state) {
                <kbq-option [value]="state" [style.height.px]="kbqOptionWidth">
                    <span>{{ state.code }}: {{ state.name }}</span>
                </kbq-option>
            }
        </kbq-autocomplete>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom
})
class TestShadowDomAutocomplete implements OnDestroy {
    stateCtrl = new UntypedFormControl();
    filteredStates: any[];
    valueSub: Subscription;
    width: number;
    kbqOptionWidth: number;
    autocompleteDisabled = false;
    openedSpy = jest.fn();
    closedSpy = jest.fn();

    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly panel = viewChild.required(KbqAutocomplete);
    readonly formField = viewChild.required(KbqFormField);
    readonly options = viewChildren(KbqOption);

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
        { code: 'WY', name: 'Wyoming' }
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
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    template: `
        @if (isVisible) {
            <kbq-form-field>
                <input kbqInput placeholder="Choose" [kbqAutocomplete]="auto" [formControl]="optionCtrl" />
            </kbq-form-field>
        }

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (option of filteredOptions | async; track option) {
                <kbq-option [value]="option">
                    {{ option }}
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class NgIfAutocomplete {
    optionCtrl = new UntypedFormControl();
    filteredOptions: Observable<any>;
    isVisible = true;
    options = ['One', 'Two', 'Three'];

    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly kbqOptions = viewChildren(KbqOption);

    constructor() {
        this.filteredOptions = this.optionCtrl.valueChanges.pipe(
            startWith(null),
            map((val: string) => {
                return val ? this.options.filter((option) => new RegExp(val, 'gi').test(option)) : this.options.slice();
            })
        );
    }
}

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="State" [kbqAutocomplete]="auto" (input)="onInput($event.target?.value)" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (state of filteredStates; track state) {
                <kbq-option [value]="state">
                    <span>{{ state }}</span>
                </kbq-option>
            }
        </kbq-autocomplete>
    `
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
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        FormsModule
    ],
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
            @for (state of filteredStates; track state) {
                <kbq-option [value]="state">
                    <span>{{ state }}</span>
                </kbq-option>
            }
        </kbq-autocomplete>
    `
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
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="Number" [kbqAutocomplete]="auto" [(ngModel)]="selectedNumber" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (number of numbers; track number) {
                <kbq-option [value]="number">
                    <span>{{ number }}</span>
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class AutocompleteWithNumbers {
    selectedNumber: number;
    numbers = [0, 1, 2];
}

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <input type="text" kbqInput [kbqAutocomplete]="auto" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (option of options; track option) {
                <kbq-option [value]="option">
                    {{ option }}
                </kbq-option>
            }
        </kbq-autocomplete>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class AutocompleteWithOnPushDelay implements OnInit {
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    options: string[];

    ngOnInit() {
        setTimeout(() => {
            this.options = ['One'];
        }, 1000);
    }
}

@Component({
    imports: [
        KbqAutocompleteModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    template: `
        <input placeholder="Choose" [kbqAutocomplete]="auto" [formControl]="optionCtrl" />

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (option of filteredOptions | async; track option) {
                <kbq-option [value]="option">
                    {{ option }}
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class AutocompleteWithNativeInput {
    optionCtrl = new UntypedFormControl();
    filteredOptions: Observable<any>;
    options = ['En', 'To', 'Tre', 'Fire', 'Fem'];

    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly kbqOptions = viewChildren(KbqOption);

    constructor() {
        this.filteredOptions = this.optionCtrl.valueChanges.pipe(
            startWith(null),
            map((val: string) => {
                return val ? this.options.filter((option) => new RegExp(val, 'gi').test(option)) : this.options.slice();
            })
        );
    }
}

@Component({
    imports: [
        KbqAutocompleteModule,
        ReactiveFormsModule
    ],
    template: `
        <input placeholder="Choose" [kbqAutocomplete]="auto" [formControl]="control" />
    `
})
class AutocompleteWithoutPanel {
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    control = new UntypedFormControl();
}

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="State" [kbqAutocomplete]="auto" [(ngModel)]="selectedState" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete" (optionSelected)="optionSelected($event)">
            @for (state of states; track state) {
                <kbq-option [value]="state">
                    <span>{{ state }}</span>
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class AutocompleteWithSelectEvent {
    selectedState: string;
    states = ['New York', 'Washington', 'Oregon'];
    optionSelected = jest.fn();

    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly autocomplete = viewChild.required(KbqAutocomplete);
}

@Component({
    imports: [
        KbqAutocompleteModule,
        ReactiveFormsModule
    ],
    template: `
        <input [formControl]="formControl" [kbqAutocomplete]="auto" />
        <kbq-autocomplete #auto="kbqAutocomplete" />
    `
})
class PlainAutocompleteInputWithFormControl {
    formControl = new UntypedFormControl();
}

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input type="number" kbqInput [kbqAutocomplete]="auto" [(ngModel)]="selectedValue" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (value of values; track value) {
                <kbq-option [value]="value">
                    {{ value }}
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class AutocompleteWithNumberInputAndNgModel {
    selectedValue: number;
    values = [1, 2, 3];
}

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        FormsModule
    ],
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

        <div #origin="kbqAutocompleteOrigin" class="origin" kbqAutocompleteOrigin style="margin-top: 50px">
            Connection element
        </div>

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (value of values; track value) {
                <kbq-option [value]="value">
                    {{ value }}
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class AutocompleteWithDifferentOrigin {
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly alternateOrigin = viewChild.required(KbqAutocompleteOrigin);

    selectedValue: string;
    values = ['one', 'two', 'three'];
    connectedTo?: KbqAutocompleteOrigin;
}

@Component({
    imports: [
        KbqAutocompleteModule,
        FormsModule
    ],
    template: `
        <input autocomplete="changed" [kbqAutocomplete]="auto" [(ngModel)]="value" />
        <kbq-autocomplete #auto="kbqAutocomplete" />
    `
})
class AutocompleteWithNativeAutocompleteAttribute {
    value: string;
}

@Component({
    imports: [
        KbqAutocompleteModule
    ],
    template: '<input kbqAutocompleteDisabled [kbqAutocomplete]="null">'
})
class InputWithoutAutocompleteAndDisabled {}

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="States" [kbqAutocomplete]="auto" [(ngModel)]="selectedState" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            @for (state of states; track state) {
                <kbq-option [value]="state.code" [disabled]="state.disabled">
                    <span>{{ state.name }}</span>
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class AutocompleteWithDisabledItems {
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);

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
        { code: 'WY', name: 'Wyoming' }
    ];
}

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput placeholder="States" [kbqAutocomplete]="auto" [(ngModel)]="selectedState" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete" [openOnFocus]="false">
            @for (state of states; track state) {
                <kbq-option [value]="state.code">
                    <span>{{ state.name }}</span>
                </kbq-option>
            }
        </kbq-autocomplete>
    `
})
class AutocompleteWithOpenOnFocus {
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);

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
        { code: 'WY', name: 'Wyoming' }
    ];
}

@Component({
    imports: [
        KbqInputModule,
        KbqAutocompleteModule
    ],
    template: `
        <kbq-form-field>
            <input kbqInput [kbqAutocomplete]="auto" [kbqAutocompleteOnBlur]="customBlurSpy" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete">
            <kbq-option value="one">one</kbq-option>
        </kbq-autocomplete>
    `
})
class AutocompleteWithCustomOnBlur {
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);

    customBlurSpy: jest.Mock<boolean, [FocusEvent]> = jest.fn().mockReturnValue(false);
}

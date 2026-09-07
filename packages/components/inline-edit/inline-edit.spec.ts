import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    CdkConnectedOverlay,
    CloseScrollStrategy,
    OverlayContainer,
    RepositionScrollStrategy
} from '@angular/cdk/overlay';
import { Component, DebugElement, model, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchKeyboardEvent,
    ESCAPE,
    KbqOptionModule,
    ruRULocaleData,
    TAB
} from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';
import { KbqInlineEdit } from './inline-edit';
import { KbqInlineEditModule } from './module';

/** `axe()` walks the whole subtree, which takes far longer than the 2s default of the suite. */
const AXE_TIMEOUT = 15000;

const setup = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers: [...providers]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const componentCssClasses = {
    panel: '.kbq-inline-edit__panel',
    focusContainer: '.kbq-inline-edit',
    terminalButtons: '.kbq-inline-edit__action-buttons',
    terminalButtonItem: '.kbq-inline-edit__action-button',
    menuMask: '.kbq-inline-edit__menu-mask',
    menu: '.kbq-inline-edit__menu',
    overlay: '.cdk-overlay-pane',
    selectPanel: '.kbq-select__panel',
    viewContent: '.kbq-inline-edit__view-content',
    focusAnchor: '.kbq-inline-edit__focus-anchor'
};

const simulateKeyboardFocus = <T>(fixture: ComponentFixture<T>, debugElement: DebugElement): void => {
    dispatchKeyboardEvent(fixture.nativeElement, 'keydown', TAB);
    debugElement.nativeElement.focus();
    fixture.detectChanges();
};

const getInlineEditDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqInlineEdit));
};

const getInlineEditFocusContainerDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.css(componentCssClasses.focusContainer));
};

const getViewContentDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.css(componentCssClasses.viewContent));
};

const getMaskDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.css(componentCssClasses.menuMask));
};

const getOverlayElement = (): HTMLElement | null => {
    return document.querySelector(componentCssClasses.overlay);
};

const getOverlayContainerElement = (): HTMLElement => TestBed.inject(OverlayContainer).getContainerElement();

describe('KbqInlineEdit', () => {
    it('should setup with default parameters', () => {
        const { debugElement } = setup(TestComponent);

        expect(
            Object.keys(getInlineEditDebugElement(debugElement).classes).filter(
                (className) => !className.startsWith('ng-tns')
            )
        ).toMatchSnapshot();
    });

    it('should add css class when label provided', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;

        componentInstance.toggleLabelVisibility();
        fixture.detectChanges();

        expect(
            Object.keys(getInlineEditDebugElement(debugElement).classes).filter(
                (className) => !className.startsWith('ng-tns')
            )
        ).toMatchSnapshot();
    });

    it('should toggle mode on click / space / enter', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'onModeChange');

        const resetToInitialMode = () => {
            dispatchEvent(getOverlayElement()!, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));
            fixture.detectChanges();
        };

        [
            () => inlineEditDebugElement.nativeElement.click(),
            () =>
                dispatchEvent(
                    inlineEditDebugElement.nativeElement,
                    createKeyboardEvent('keydown', ENTER, undefined, 'Enter')
                ),
            () =>
                dispatchEvent(
                    inlineEditDebugElement.nativeElement,
                    createKeyboardEvent('keydown', SPACE, undefined, 'Space')
                )
        ].forEach((event, index) => {
            event();
            fixture.detectChanges();

            expect(spyFn).toHaveBeenNthCalledWith(index * 2 + 1, 'edit');

            resetToInitialMode();
        });
    });

    it('should add css class on keyboard focus', () => {
        const fixture = setup(TestComponent);
        const { debugElement } = fixture;
        const focusContainer: DebugElement = getInlineEditFocusContainerDebugElement(debugElement);

        // The tab stop is the view content, so the ring on the host has to follow subtree focus.
        simulateKeyboardFocus(fixture, getViewContentDebugElement(debugElement));

        expect(focusContainer.classes['cdk-keyboard-focused']).toBeTruthy();
    });

    it('should have terminal buttons when provided', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        expect(
            document.querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)
        ).toBeTruthy();
    });

    it('should emit saved event on overlay outside click', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();
        expect(spyFn).not.toHaveBeenCalled();

        document.body.click();
        fixture.detectChanges();
        expect(spyFn).toHaveBeenCalled();
    });

    it('should emit saved event on save button click', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const saveButtonHTMLElement = document
            .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
            .querySelector('button') as HTMLButtonElement | null;

        saveButtonHTMLElement?.click();

        expect(spyFn).toHaveBeenCalled();
    });

    it('should emit saved event on ENTER keydown event', async () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const overlayElement = getOverlayElement();

        dispatchEvent(overlayElement!, createKeyboardEvent('keydown', ENTER, undefined, 'Enter'));
        await fixture.whenStable();

        expect(spyFn).toHaveBeenCalled();
    });

    it('should emit canceled event on cancel terminal button click', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const cancelButtonHTMLElement = document
            .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
            .querySelectorAll('button')[1] as HTMLButtonElement | null;

        cancelButtonHTMLElement?.click();

        expect(componentInstance.cancel).toHaveBeenCalled();
    });

    it('should emit canceled event on ESCAPE keydown event', () => {
        const fixture = setup(TestWithTextareaControl);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const overlayElement = getOverlayElement();

        dispatchEvent(overlayElement!, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));

        expect(componentInstance.cancel).toHaveBeenCalled();
    });

    it('should return previous value for control canceled event', async () => {
        const initialValue = 'TEST';
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        componentInstance.value = initialValue;
        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const cancelButtonHTMLElement = document
            .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
            .querySelectorAll('button')[1] as HTMLButtonElement | null;

        const control = getOverlayElement()!.querySelector('input');

        control!.value = initialValue + ' UPDATED';
        control!.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        await fixture.whenStable();

        cancelButtonHTMLElement?.click();

        expect(componentInstance.cancel).toHaveBeenCalled();
        expect(componentInstance.value).toEqual(initialValue);
    });

    it('should emit saved event on CMD/CTRL + ENTER keydown event for TEXTAREA', async () => {
        let event: KeyboardEvent;
        const fixture = setup(TestWithTextareaControl);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const overlayElement = getOverlayElement();
        const target = overlayElement!.querySelector('.kbq-textarea');

        event = createKeyboardEvent('keydown', ENTER, target!, 'Enter');

        dispatchEvent(overlayElement!, event);

        expect(spyFn).not.toHaveBeenCalled();

        event = createKeyboardEvent('keydown', ENTER, target!, 'Enter');
        Object.defineProperties(event, {
            metaKey: { get: () => true },
            ctrlKey: { get: () => true }
        });
        dispatchEvent(overlayElement!, event);
        await fixture.whenStable();

        expect(spyFn).toHaveBeenCalled();
    });

    it('should not toggle mode on menu click', () => {
        const fixture = setup(TestWithMenu);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const maskDebugElement = getMaskDebugElement(inlineEditDebugElement);
        const spyFn = jest.spyOn(componentInstance, 'onModeChange');

        maskDebugElement.query(By.css(componentCssClasses.menu)).nativeElement.click();

        expect(spyFn).not.toHaveBeenCalled();
    });

    it('should prevent close if control invalid', () => {
        const fixture = setup(TestWithValidatedControl);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        componentInstance.showActions.set(true);
        fixture.detectChanges();

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        const overlayElement = getOverlayElement();
        const target: HTMLTextAreaElement | null = overlayElement!.querySelector('.kbq-textarea');

        fixture.detectChanges();

        target?.focus();
        componentInstance.control.markAsTouched();
        componentInstance.control.updateValueAndValidity();
        fixture.detectChanges();

        const saveButtonHTMLElement = document
            .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
            .querySelector('button') as HTMLButtonElement | null;

        saveButtonHTMLElement?.click();

        expect(spyFn).not.toHaveBeenCalled();
    });

    it('should save and return to view mode when commit() is called directly', () => {
        const fixture = setup(TestComponent);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        (inlineEditDebugElement.componentInstance as KbqInlineEdit).commit();
        fixture.detectChanges();

        expect(spyFn).toHaveBeenCalled();
        expect(inlineEditDebugElement.classes['kbq-inline-edit_view']).toBe(true);
    });

    it('should not save when commit() is called while control is invalid', () => {
        const fixture = setup(TestWithValidatedControl);
        const { componentInstance, debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const spyFn = jest.spyOn(componentInstance, 'update');

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        componentInstance.control.markAsTouched();
        componentInstance.control.updateValueAndValidity();
        fixture.detectChanges();

        (inlineEditDebugElement.componentInstance as KbqInlineEdit).commit();
        fixture.detectChanges();

        expect(spyFn).not.toHaveBeenCalled();
        expect(inlineEditDebugElement.classes['kbq-inline-edit_edit']).toBe(true);
    });

    it('should reposition the edit mode overlay when the surrounding layout resizes', () => {
        const resize$ = new Subject<void>();
        const fixture = setup(TestComponent, [
            { provide: SharedResizeObserver, useValue: { observe: () => resize$ } }
        ]);
        const { debugElement } = fixture;
        const inlineEdit = getInlineEditDebugElement(debugElement).componentInstance as KbqInlineEdit;

        // Enter edit mode so the overlay attaches and starts observing the layout.
        getInlineEditDebugElement(debugElement).nativeElement.click();
        fixture.detectChanges();

        const overlayRef = (inlineEdit as unknown as { overlayDir: () => CdkConnectedOverlay }).overlayDir().overlayRef;
        const updatePositionSpy = jest.spyOn(overlayRef, 'updatePosition');

        resize$.next();
        fixture.detectChanges();

        expect(updatePositionSpy).toHaveBeenCalled();
    });

    describe('interactiveSelectors', () => {
        it('should not toggle mode when clicking on a built-in interactive element', () => {
            const fixture = setup(TestWithClickableContent);
            const { componentInstance, debugElement } = fixture;
            const spyFn = jest.spyOn(componentInstance, 'onModeChange');

            debugElement.query(By.css('[data-testid="link"]')).nativeElement.click();

            expect(spyFn).not.toHaveBeenCalled();
        });

        it('should toggle mode when clicking on plain text', () => {
            const fixture = setup(TestWithClickableContent);
            const { componentInstance, debugElement } = fixture;
            const spyFn = jest.spyOn(componentInstance, 'onModeChange');

            debugElement.query(By.css('[data-testid="text"]')).nativeElement.click();
            fixture.detectChanges();

            expect(spyFn).toHaveBeenCalledWith('edit');
        });

        it('should not toggle mode when clicking on element matching custom interactiveSelectors', () => {
            const fixture = setup(TestWithClickableContent);
            const { componentInstance, debugElement } = fixture;
            const spyFn = jest.spyOn(componentInstance, 'onModeChange');

            componentInstance.interactiveSelectors.set(['a', 'kbq-tag', 'button']);
            fixture.detectChanges();

            debugElement.query(By.css('[data-testid="button"]')).nativeElement.click();

            expect(spyFn).not.toHaveBeenCalled();
        });
    });

    describe('focus anchor', () => {
        it('should render focus anchor when interactive content exists', fakeAsync(() => {
            const fixture = setup(TestWithTagContent);
            const { debugElement } = fixture;

            tick();
            fixture.detectChanges();

            const anchor = debugElement.query(By.css(componentCssClasses.focusAnchor));

            expect(anchor).toBeTruthy();
            expect(anchor.nativeElement.getAttribute('tabindex')).toBe('0');
        }));

        it('should set view content tabindex to -1 when interactive content exists', fakeAsync(() => {
            const fixture = setup(TestWithTagContent);
            const { debugElement } = fixture;

            tick();
            fixture.detectChanges();

            expect(getViewContentDebugElement(debugElement).nativeElement.getAttribute('tabindex')).toBe('-1');
        }));

        it('should add anchor-focused class to host when focus anchor receives focus', fakeAsync(() => {
            const fixture = setup(TestWithTagContent);
            const { debugElement } = fixture;

            tick();
            fixture.detectChanges();

            const anchor = debugElement.query(By.css(componentCssClasses.focusAnchor));

            anchor.nativeElement.dispatchEvent(new FocusEvent('focus'));
            fixture.detectChanges();

            expect(getInlineEditDebugElement(debugElement).classes['kbq-inline-edit_anchor-focused']).toBeTruthy();
        }));

        it('should remove anchor-focused class from host when focus anchor loses focus', fakeAsync(() => {
            const fixture = setup(TestWithTagContent);
            const { debugElement } = fixture;

            tick();
            fixture.detectChanges();

            const anchor = debugElement.query(By.css(componentCssClasses.focusAnchor));

            anchor.nativeElement.dispatchEvent(new FocusEvent('focus'));
            fixture.detectChanges();

            anchor.nativeElement.dispatchEvent(new FocusEvent('blur'));
            fixture.detectChanges();

            expect(getInlineEditDebugElement(debugElement).classes['kbq-inline-edit_anchor-focused']).toBeFalsy();
        }));

        it('should open edit mode on Enter keydown on focus anchor', fakeAsync(() => {
            const fixture = setup(TestWithTagContent);
            const { componentInstance, debugElement } = fixture;
            const spyFn = jest.spyOn(componentInstance, 'onModeChange');

            tick();
            fixture.detectChanges();

            const anchor = debugElement.query(By.css(componentCssClasses.focusAnchor));

            dispatchEvent(anchor.nativeElement, createKeyboardEvent('keydown', ENTER, anchor.nativeElement, 'Enter'));
            fixture.detectChanges();

            expect(spyFn).toHaveBeenCalledWith('edit');
        }));

        it('should not render focus anchor in edit mode', fakeAsync(() => {
            const fixture = setup(TestWithTagContent);
            const { debugElement } = fixture;
            const inlineEditEl = getInlineEditDebugElement(debugElement).nativeElement;

            tick();
            fixture.detectChanges();

            inlineEditEl.click();
            fixture.detectChanges();

            expect(debugElement.query(By.css(componentCssClasses.focusAnchor))).toBeNull();
        }));

        it('should not render focus anchor when no interactive content exists', fakeAsync(() => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;

            tick();
            fixture.detectChanges();

            expect(debugElement.query(By.css(componentCssClasses.focusAnchor))).toBeNull();
        }));
    });

    it('should open select panel on mode toggle', async () => {
        const fixture = setup(TestWithSelect);
        const { debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();

        await fixture.whenStable();

        expect(document.querySelector(componentCssClasses.selectPanel)).toBeTruthy();
    });

    describe('select-style editor', () => {
        it('should mark a single select as such and add the select-style panel class while editing', async () => {
            const fixture = setup(TestWithSelect);
            const { debugElement } = fixture;
            const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

            expect(inlineEditDebugElement.classes['kbq-inline-edit_select']).toBe(true);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(document.querySelector(`${componentCssClasses.panel}.kbq-inline-edit__panel_select`)).toBeTruthy();
        });

        it('should connect the select panel to the inline-edit host', async () => {
            const fixture = setup(TestWithSelect);
            const { debugElement } = fixture;
            const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            const formField = fixture.debugElement.query(By.directive(KbqFormField)).componentInstance as KbqFormField;

            expect(formField.getConnectedOverlayOrigin().nativeElement).toBe(inlineEditDebugElement.nativeElement);
        });

        it('should not treat a multi-select as a select-style editor', async () => {
            const fixture = setup(TestWithMultiSelect);
            const { debugElement } = fixture;
            const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

            expect(inlineEditDebugElement.classes['kbq-inline-edit_select']).toBeFalsy();

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(document.querySelector(`${componentCssClasses.panel}.kbq-inline-edit__panel_select`)).toBeNull();
        });

        it('should not override the overlay origin for a non-select control', async () => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;
            const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            const formField = fixture.debugElement.query(By.directive(KbqFormField)).componentInstance as KbqFormField;

            expect(formField.getConnectedOverlayOrigin().nativeElement).not.toBe(inlineEditDebugElement.nativeElement);
        });
    });

    it('should stay in view mode when commit() is followed by a redundant outside-click save()', async () => {
        // A control whose panel is a separate CDK overlay (e.g. kbq-select) makes the overlay's own
        // outside-click detection see clicks on that panel as "outside" inline-edit's overlay, so both
        // the control's own (selectionChange)-driven commit() and the overlay's outside-click handler
        // can fire for the same interaction. Since save() used to be an unconditional toggle, the
        // second (redundant) call would flip the mode straight back to 'edit'.
        const fixture = setup(TestWithSelectAutoCommit);
        const { debugElement } = fixture;
        const inlineEditDebugElement: DebugElement = getInlineEditDebugElement(debugElement);
        const inlineEdit = inlineEditDebugElement.componentInstance as KbqInlineEdit;

        inlineEditDebugElement.nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        inlineEdit.commit();
        (inlineEdit as any).save();
        fixture.detectChanges();

        expect(inlineEditDebugElement.classes['kbq-inline-edit_view']).toBe(true);
    });

    describe('with multiple form fields', () => {
        it('should emit saved event when both form fields are valid', async () => {
            const fixture = setup(TestWithMultipleFormFields);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            componentInstance.showActions.set(true);
            fixture.detectChanges();

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            const saveButton = document
                .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
                .querySelector('button') as HTMLButtonElement;

            saveButton.click();

            expect(componentInstance.update).toHaveBeenCalled();
        });

        it('should prevent save when first form field is invalid', async () => {
            const fixture = setup(TestWithMultipleFormFields);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            componentInstance.showActions.set(true);
            fixture.detectChanges();

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            componentInstance.form.controls.firstName.setValue('');
            componentInstance.form.controls.firstName.markAsTouched();
            componentInstance.form.controls.firstName.updateValueAndValidity();
            fixture.detectChanges();

            const saveButton = document
                .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
                .querySelector('button') as HTMLButtonElement;

            saveButton.click();

            expect(componentInstance.update).not.toHaveBeenCalled();
        });

        it('should prevent save when second form field is invalid', async () => {
            const fixture = setup(TestWithMultipleFormFields);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            componentInstance.showActions.set(true);
            fixture.detectChanges();

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            componentInstance.form.controls.lastName.setValue('');
            componentInstance.form.controls.lastName.markAsTouched();
            componentInstance.form.controls.lastName.updateValueAndValidity();
            fixture.detectChanges();

            const saveButton = document
                .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
                .querySelector('button') as HTMLButtonElement;

            saveButton.click();

            expect(componentInstance.update).not.toHaveBeenCalled();
        });

        it('should restore initial values for both form fields on cancel', async () => {
            const fixture = setup(TestWithMultipleFormFields);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            componentInstance.showActions.set(true);
            fixture.detectChanges();

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            const inputs = getOverlayElement()!.querySelectorAll<HTMLInputElement>('input');

            inputs[0].value = 'Jane';
            inputs[0].dispatchEvent(new Event('input'));
            inputs[1].value = 'Smith';
            inputs[1].dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const cancelButton = document
                .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
                .querySelectorAll('button')[1] as HTMLButtonElement;

            cancelButton.click();

            expect(componentInstance.form.value).toEqual({ firstName: 'John', lastName: 'Doe' });
        });

        it('should save on Tab from the last control of the panel when form is valid', async () => {
            const fixture = setup(TestWithMultipleFormFields);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            const inputs = getOverlayElement()!.querySelectorAll<HTMLInputElement>('input');
            const lastInput = inputs[inputs.length - 1];

            dispatchEvent(lastInput, createKeyboardEvent('keydown', TAB, lastInput, 'Tab'));
            await fixture.whenStable();

            expect(componentInstance.update).toHaveBeenCalled();
        });

        it('should not save on Tab from a control in the middle of the panel', async () => {
            const fixture = setup(TestWithMultipleFormFields);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            const firstInput = getOverlayElement()!.querySelectorAll<HTMLInputElement>('input')[0];

            dispatchEvent(firstInput, createKeyboardEvent('keydown', TAB, firstInput, 'Tab'));
            await fixture.whenStable();

            expect(componentInstance.update).not.toHaveBeenCalled();
        });

        it('should save on Shift+Tab from the first control of the panel when form is valid', async () => {
            const fixture = setup(TestWithMultipleFormFields);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            const firstInput = getOverlayElement()!.querySelectorAll<HTMLInputElement>('input')[0];
            const shiftTabEvent = createKeyboardEvent('keydown', TAB, firstInput, 'Tab');

            Object.defineProperties(shiftTabEvent, { shiftKey: { get: () => true } });
            dispatchEvent(firstInput, shiftTabEvent);
            await fixture.whenStable();

            expect(componentInstance.update).toHaveBeenCalled();
        });

        it('should pass overlayPanelClass to panel', () => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();

            const overlay = getOverlayElement();

            expect(overlay?.classList.contains('test-custom-inline-edit-panel')).toBeTruthy();
        });
    });

    describe('validationTooltip', () => {
        const openEditAndInvalidate = (fixture: ComponentFixture<TestWithDynamicValidationTooltip>) => {
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();

            getOverlayElement()!.querySelector<HTMLElement>('.kbq-textarea')?.focus();
            componentInstance.control.markAsTouched();
            componentInstance.control.updateValueAndValidity();
            fixture.detectChanges();

            return inlineEditDebugElement;
        };

        const clickSave = () => {
            const terminalButtonList = document.querySelectorAll(
                `${componentCssClasses.panel} ${componentCssClasses.terminalButtonItem}`
            );

            const saveButton = terminalButtonList.length && terminalButtonList[0].firstElementChild;

            expect(saveButton).toBeTruthy();
            expect(saveButton instanceof HTMLButtonElement).toBeTruthy();

            (saveButton as HTMLButtonElement).click();
        };

        const offscreenRect: DOMRect = {
            top: -500,
            left: 0,
            bottom: -400,
            right: 100,
            width: 100,
            height: 100,
            x: 0,
            y: -500,
            toJSON: () => ({})
        };

        const setupOffscreen = (fixture: ComponentFixture<TestWithDynamicValidationTooltip>) => {
            const { componentInstance } = fixture;

            componentInstance.validationTooltip.set('Required field');

            const inlineEditDebugElement = openEditAndInvalidate(fixture);
            const inlineEdit = inlineEditDebugElement.componentInstance as any;
            const overlayOrigin: HTMLElement = inlineEdit.overlayOrigin();

            jest.spyOn(overlayOrigin, 'getBoundingClientRect').mockReturnValue(offscreenRect);

            const scrollIntoViewSpy = jest.spyOn(overlayOrigin, 'scrollIntoView');
            const tooltipTrigger = inlineEdit.tooltipTrigger();
            const updatePositionSpy = jest.spyOn(tooltipTrigger, 'updatePosition');
            const showSpy = jest.spyOn(tooltipTrigger, 'show');

            return { scrollIntoViewSpy, updatePositionSpy, showSpy };
        };

        it('should not show tooltip when empty string is passed and control is invalid', () => {
            const fixture = setup(TestWithDynamicValidationTooltip);
            const { componentInstance } = fixture;

            componentInstance.validationTooltip.set('');

            const inlineEditDebugElement = openEditAndInvalidate(fixture);
            const tooltipTrigger = (inlineEditDebugElement.componentInstance as any).tooltipTrigger();
            const showSpy = jest.spyOn(tooltipTrigger, 'show');

            clickSave();

            expect(showSpy).not.toHaveBeenCalled();
        });

        it('should hide the tooltip once the control becomes valid again', fakeAsync(() => {
            const fixture = setup(TestWithDynamicValidationTooltip);
            const { componentInstance } = fixture;

            componentInstance.validationTooltip.set('Required field');

            const inlineEditDebugElement = openEditAndInvalidate(fixture);
            const tooltipTrigger = (inlineEditDebugElement.componentInstance as any).tooltipTrigger();

            clickSave();

            // `show()` reveals the tooltip after `kbqEnterDelay` (400ms by default) plus a small buffer for the deferred show.
            tick(tooltipTrigger.enterDelay + 10);
            expect(tooltipTrigger.isOpen).toBe(true);

            const hideSpy = jest.spyOn(tooltipTrigger, 'hide');

            componentInstance.control.setValue('Some text');
            componentInstance.control.updateValueAndValidity();
            fixture.detectChanges();

            tick();
            expect(hideSpy).toHaveBeenCalled();
            expect(tooltipTrigger.isOpen).toBe(false);
        }));

        it('should show the tooltip immediately when the control is already fully visible', () => {
            const onscreenRect: DOMRect = {
                top: 10,
                left: 10,
                bottom: 50,
                right: 110,
                width: 100,
                height: 40,
                x: 10,
                y: 10,
                toJSON: () => ({})
            };

            const fixture = setup(TestWithDynamicValidationTooltip);
            const { componentInstance } = fixture;

            componentInstance.validationTooltip.set('Required field');

            const inlineEditDebugElement = openEditAndInvalidate(fixture);
            const inlineEdit = inlineEditDebugElement.componentInstance as any;

            jest.spyOn(inlineEdit.overlayOrigin(), 'getBoundingClientRect').mockReturnValue(onscreenRect);

            const scrollIntoViewSpy = jest.spyOn(inlineEdit.overlayOrigin(), 'scrollIntoView');
            const showSpy = jest.spyOn(inlineEdit.tooltipTrigger(), 'show');

            clickSave();

            expect(scrollIntoViewSpy).not.toHaveBeenCalled();
            expect(showSpy).toHaveBeenCalled();
        });

        describe('when the control is scrolled out of view', () => {
            it('should scroll the control into view immediately and show tooltip once scrollend fires', fakeAsync(() => {
                const fixture = setup(TestWithDynamicValidationTooltip);
                const { scrollIntoViewSpy, updatePositionSpy, showSpy } = setupOffscreen(fixture);

                clickSave();

                expect(scrollIntoViewSpy).toHaveBeenCalledWith({
                    block: 'center',
                    inline: 'nearest',
                    behavior: 'smooth'
                });
                expect(showSpy).not.toHaveBeenCalled();

                window.dispatchEvent(new Event('scrollend'));

                expect(updatePositionSpy).toHaveBeenCalled();
                expect(showSpy).toHaveBeenCalled();

                // Flush the tooltip's own `kbqEnterDelay` timer (default 400ms) scheduled by `show()` —
                // the scrollend above already settled the scroll-into-view request, so nothing else is pending.
                tick(800);
            }));

            it('should show the tooltip after a timeout if scrollend never fires', fakeAsync(() => {
                const fixture = setup(TestWithDynamicValidationTooltip);
                const { showSpy } = setupOffscreen(fixture);

                clickSave();
                expect(showSpy).not.toHaveBeenCalled();

                tick(800);
                expect(showSpy).toHaveBeenCalledTimes(1);

                // A late scrollend must not show the tooltip a second time.
                window.dispatchEvent(new Event('scrollend'));
                expect(showSpy).toHaveBeenCalledTimes(1);
            }));
        });

        it('should use a reposition scroll strategy instead of the tooltip default close strategy', () => {
            // The validation tooltip is anchored inside the edit-mode overlay (an overlay inside another
            // overlay) and is shown right after programmatically scrolling its origin into view — closing it
            // on that very scroll (the tooltip's default behavior) would immediately undo `show()`.
            const fixture = setup(TestWithDynamicValidationTooltip);
            const inlineEditDebugElement = openEditAndInvalidate(fixture);
            const tooltipTrigger = (inlineEditDebugElement.componentInstance as any).tooltipTrigger();

            expect(tooltipTrigger.scrollStrategy()).toBeInstanceOf(RepositionScrollStrategy);
        });

        it('should not leak the reposition scroll strategy into a tooltip projected into edit mode', () => {
            // The reposition override is passed to the validation tooltip's own `[kbqTooltipScrollStrategy]`
            // input, not provided via DI on the component — so it must not affect other `kbqTooltip`s declared
            // on content projected into `[kbqInlineEditEditMode]`, which should keep the library default.
            const fixture = setup(TestWithDynamicValidationTooltip);
            const { debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();

            const projectedTooltipTrigger = fixture.debugElement
                .query(By.css('[data-testid="projected-tooltip"]'))
                .injector.get(KbqTooltipTrigger) as any;

            expect(projectedTooltipTrigger.scrollStrategy()).toBeInstanceOf(CloseScrollStrategy);
            expect(projectedTooltipTrigger.scrollStrategy()).not.toBeInstanceOf(RepositionScrollStrategy);
        });

        it('should show the tooltip with showTooltipOnError left at its default', fakeAsync(() => {
            const fixture = setup(TestWithDynamicValidationTooltip);
            const { componentInstance } = fixture;

            componentInstance.validationTooltip.set('Required field');

            const inlineEditDebugElement = openEditAndInvalidate(fixture);
            const tooltipTrigger = (inlineEditDebugElement.componentInstance as any).tooltipTrigger();

            clickSave();

            tick(tooltipTrigger.enterDelay + 10);

            expect(tooltipTrigger.isOpen).toBe(true);
        }));

        it('should keep the scrollend listener until the overlay detaches', fakeAsync(() => {
            const fixture = setup(TestWithDynamicValidationTooltip);

            setupOffscreen(fixture);
            clickSave();

            // The fallback fires without a scrollend, and the listener has to survive it: only `cancel()`
            // removes it, and `cancel()` is reachable only through the handle the fallback used to drop.
            tick(800);

            const removeListenerSpy = jest.spyOn(window, 'removeEventListener');

            dispatchEvent(getOverlayElement()!, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));
            fixture.detectChanges();
            tick();

            expect(removeListenerSpy).toHaveBeenCalledWith('scrollend', expect.any(Function), { capture: true });
        }));

        it('should register exactly one scrollend listener across two rejected saves', fakeAsync(() => {
            const fixture = setup(TestWithDynamicValidationTooltip);
            const addListenerSpy = jest.spyOn(window, 'addEventListener');

            setupOffscreen(fixture);

            clickSave();
            tick(800);
            clickSave();
            tick(800);

            const scrollEndListeners = addListenerSpy.mock.calls.filter(([type]) => type === 'scrollend');

            expect(scrollEndListeners).toHaveLength(1);
        }));
    });

    describe('accessibility', () => {
        it(
            'has no axe violations in edit mode',
            async () => {
                const fixture = setup(TestComponent);

                getInlineEditDebugElement(fixture.debugElement).nativeElement.click();
                fixture.detectChanges();
                await fixture.whenStable();

                expect(await axe(getOverlayContainerElement())).toHaveNoViolations();
            },
            AXE_TIMEOUT
        );

        it(
            'has no axe violations in view mode',
            async () => {
                const fixture = setup(TestComponent);

                await fixture.whenStable();

                expect(await axe(fixture.nativeElement)).toHaveNoViolations();
            },
            AXE_TIMEOUT
        );

        it('should not add tab stops of its own to the edit overlay', async () => {
            const fixture = setup(TestComponent);

            getInlineEditDebugElement(fixture.debugElement).nativeElement.click();
            fixture.detectChanges();
            await fixture.whenStable();

            const tabStops = getOverlayElement()!.querySelectorAll('[tabindex="0"]');

            expect(tabStops).toHaveLength(0);
        });

        it('should announce the view content as a collapsed button', () => {
            const fixture = setup(TestComponent);
            const viewContent = getViewContentDebugElement(fixture.debugElement).nativeElement;

            expect(viewContent.getAttribute('role')).toBe('button');
            expect(viewContent.getAttribute('tabindex')).toBe('0');
            expect(viewContent.getAttribute('aria-label')).toBe(ruRULocaleData.a11y.edit);
            expect(viewContent.getAttribute('aria-expanded')).toBe('false');
        });

        it('should flip aria-expanded when the editor opens', () => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;
            const viewContent = getViewContentDebugElement(debugElement).nativeElement;

            getInlineEditDebugElement(debugElement).nativeElement.click();
            fixture.detectChanges();

            expect(viewContent.getAttribute('aria-expanded')).toBe('true');
        });

        it('should take the accessible name from the aria-label input', () => {
            const fixture = setup(TestWithAriaLabel);

            expect(getViewContentDebugElement(fixture.debugElement).nativeElement.getAttribute('aria-label')).toBe(
                'Assignee'
            );
        });

        it('should not leave aria-label on the host, which carries no role', () => {
            const fixture = setup(TestWithAriaLabel);

            expect(getInlineEditDebugElement(fixture.debugElement).nativeElement.hasAttribute('aria-label')).toBe(
                false
            );
        });

        it('should mark a disabled view content as such', () => {
            const fixture = setup(TestDisabled);
            const viewContent = getViewContentDebugElement(fixture.debugElement).nativeElement;

            expect(viewContent.getAttribute('aria-disabled')).toBe('true');
            expect(viewContent.getAttribute('tabindex')).toBe('-1');
        });

        it('should move the widget semantics to the focus anchor when the view content is interactive', fakeAsync(() => {
            const fixture = setup(TestWithTagContent);
            const { debugElement } = fixture;

            tick();
            fixture.detectChanges();

            const anchor = debugElement.query(By.css(componentCssClasses.focusAnchor)).nativeElement;

            // A `button` wrapping the projected tags would be a `nested-interactive` violation.
            expect(getViewContentDebugElement(debugElement).nativeElement.hasAttribute('role')).toBe(false);
            expect(anchor.getAttribute('role')).toBe('button');
            expect(anchor.getAttribute('aria-label')).toBe(ruRULocaleData.a11y.edit);
        }));
    });

    describe('focus management', () => {
        it('should return focus to the view content after cancel', fakeAsync(() => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;

            getInlineEditDebugElement(debugElement).nativeElement.click();
            fixture.detectChanges();
            tick();

            dispatchEvent(getOverlayElement()!, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toBe(getViewContentDebugElement(debugElement).nativeElement);
        }));

        it('should return focus to the view content after a successful save', fakeAsync(() => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            tick();

            (inlineEditDebugElement.componentInstance as KbqInlineEdit).commit();
            fixture.detectChanges();
            tick();

            expect(document.activeElement).toBe(getViewContentDebugElement(debugElement).nativeElement);
        }));

        it('should return focus to the recreated focus anchor of an interactive view', fakeAsync(() => {
            const fixture = setup(TestWithTagContent);
            const { debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            tick();
            fixture.detectChanges();

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();
            tick();

            (inlineEditDebugElement.componentInstance as KbqInlineEdit).commit();
            fixture.detectChanges();
            tick();

            // The anchor that was focused on the way in is gone; the restore has to resolve the new one.
            expect(document.activeElement).toBe(
                debugElement.query(By.css(componentCssClasses.focusAnchor)).nativeElement
            );
        }));
    });

    describe('tab chaining', () => {
        it('should open the next inline edit even when it has interactive content', fakeAsync(() => {
            const fixture = setup(TestWithTwoFields);
            const { debugElement } = fixture;
            const [first, second] = debugElement.queryAll(By.directive(KbqInlineEdit));

            tick();
            fixture.detectChanges();

            first.nativeElement.click();
            fixture.detectChanges();
            tick();

            const input = getOverlayElement()!.querySelector<HTMLInputElement>('input')!;

            dispatchEvent(input, createKeyboardEvent('keydown', TAB, input, 'Tab'));
            fixture.detectChanges();

            // Stands in for the browser moving focus out of the overlay, which jsdom does not do.
            (second.nativeElement as HTMLElement).querySelector<HTMLElement>(componentCssClasses.focusAnchor)!.focus();
            tick();
            fixture.detectChanges();

            expect(second.classes['kbq-inline-edit_edit']).toBe(true);
        }));

        it('should restore a keyboard focus ring once the chained editor closes', fakeAsync(() => {
            const fixture = setup(TestWithTwoFields);
            const { debugElement } = fixture;
            const [first, second] = debugElement.queryAll(By.directive(KbqInlineEdit));

            tick();
            fixture.detectChanges();

            first.nativeElement.click();
            fixture.detectChanges();
            tick();

            const input = getOverlayElement()!.querySelector<HTMLInputElement>('input')!;

            dispatchEvent(input, createKeyboardEvent('keydown', TAB, input, 'Tab'));
            fixture.detectChanges();

            // Stands in for the browser moving focus out of the overlay, which jsdom does not do.
            (second.nativeElement as HTMLElement).querySelector<HTMLElement>(componentCssClasses.focusAnchor)!.focus();
            tick();
            fixture.detectChanges();

            dispatchEvent(getOverlayElement()!, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));
            fixture.detectChanges();
            tick();

            // Tab is what opened it, so the ring the host draws for `cdk-keyboard-focused` has to come back.
            expect(second.nativeElement.classList).toContain('cdk-keyboard-focused');
        }));

        it('should not reopen itself when focus stays inside the same inline edit', fakeAsync(() => {
            const fixture = setup(TestWithTwoFields);
            const { debugElement } = fixture;
            const [first] = debugElement.queryAll(By.directive(KbqInlineEdit));

            tick();
            fixture.detectChanges();

            first.nativeElement.click();
            fixture.detectChanges();
            tick();

            const input = getOverlayElement()!.querySelector<HTMLInputElement>('input')!;

            dispatchEvent(input, createKeyboardEvent('keydown', TAB, input, 'Tab'));
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(first.classes['kbq-inline-edit_view']).toBe(true);
        }));
    });

    describe('validation gating', () => {
        it('should keep edit mode when commit() runs on a never-touched invalid control', () => {
            const fixture = setup(TestWithValidatedControl);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);
            const spyFn = jest.spyOn(componentInstance, 'update');

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();

            expect(componentInstance.control.touched).toBe(false);

            (inlineEditDebugElement.componentInstance as KbqInlineEdit).commit();
            fixture.detectChanges();

            expect(spyFn).not.toHaveBeenCalled();
            expect(inlineEditDebugElement.classes['kbq-inline-edit_edit']).toBe(true);
        });

        it('should keep edit mode when the save button runs on a never-touched invalid control', () => {
            const fixture = setup(TestWithValidatedControl);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);
            const spyFn = jest.spyOn(componentInstance, 'update');

            componentInstance.showActions.set(true);
            fixture.detectChanges();

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();

            const saveButton = document
                .querySelector(`${componentCssClasses.panel} ${componentCssClasses.terminalButtons}`)!
                .querySelector('button') as HTMLButtonElement;

            saveButton.click();
            fixture.detectChanges();

            expect(spyFn).not.toHaveBeenCalled();
            expect(inlineEditDebugElement.classes['kbq-inline-edit_edit']).toBe(true);
        });

        it('should not enter the error state while the value is still being typed', () => {
            const fixture = setup(TestWithValidatedControl);
            const { componentInstance, debugElement } = fixture;
            const inlineEditDebugElement = getInlineEditDebugElement(debugElement);

            inlineEditDebugElement.nativeElement.click();
            fixture.detectChanges();

            const overlayElement = getOverlayElement()!;
            const textarea = overlayElement.querySelector<HTMLTextAreaElement>('.kbq-textarea')!;

            dispatchEvent(overlayElement, createKeyboardEvent('keydown', 65, textarea, 'a'));
            fixture.detectChanges();

            expect(componentInstance.control.touched).toBe(false);
            expect(overlayElement.querySelector('.kbq-form-field_invalid')).toBeNull();
        });
    });

    describe('interactive content detection', () => {
        it('should ignore interactive content that lives in the label', fakeAsync(() => {
            const fixture = setup(TestWithLabelAction);
            const { debugElement } = fixture;

            tick();
            fixture.detectChanges();

            expect(debugElement.query(By.css(componentCssClasses.focusAnchor))).toBeNull();
            expect(getViewContentDebugElement(debugElement).nativeElement.getAttribute('tabindex')).toBe('0');
        }));

        it('should pick up interactive content that arrives after the first pass', async () => {
            const fixture = setup(TestWithLateContent);
            const { componentInstance, debugElement } = fixture;

            await fixture.whenStable();
            expect(debugElement.query(By.css(componentCssClasses.focusAnchor))).toBeNull();

            componentInstance.loaded.set(true);
            fixture.detectChanges();

            // One tick delivers the mutation record, the next flushes the detection debounce behind it.
            await new Promise((resolve) => setTimeout(resolve));
            await new Promise((resolve) => setTimeout(resolve));
            fixture.detectChanges();

            expect(debugElement.query(By.css(componentCssClasses.focusAnchor))).not.toBeNull();
        });

        it('should not treat an interactive ancestor outside the component as interactive content', () => {
            const fixture = setup(TestWithInteractiveAncestor);
            const { componentInstance, debugElement } = fixture;
            const spyFn = jest.spyOn(componentInstance, 'onModeChange');

            debugElement.query(By.css('[data-testid="text"]')).nativeElement.click();
            fixture.detectChanges();

            expect(spyFn).toHaveBeenCalledWith('edit');
        });
    });

    it('should update the overlay offset when the surrounding layout resizes', () => {
        const resize$ = new Subject<void>();
        const fixture = setup(TestComponent, [
            { provide: SharedResizeObserver, useValue: { observe: () => resize$ } }
        ]);
        const { debugElement } = fixture;
        const inlineEdit = getInlineEditDebugElement(debugElement).componentInstance as any;

        getInlineEditDebugElement(debugElement).nativeElement.click();
        fixture.detectChanges();

        jest.spyOn(inlineEdit.overlayOrigin(), 'offsetHeight', 'get').mockReturnValue(64);

        resize$.next();
        fixture.detectChanges();

        expect(inlineEdit.overlayOffsetY()).toBe(-64);
    });
});

/** Field bag shared by the hosts below. Not a directive: nothing here needs Angular to see it. */
class BaseTestComponent {
    readonly showActions = signal(false);
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqInputModule,
        KbqInlineEditModule
    ],
    template: `
        <kbq-inline-edit
            [showActions]="showActions()"
            [overlayPanelClass]="'test-custom-inline-edit-panel'"
            (saved)="update()"
            (canceled)="cancel()"
            (modeChange)="onModeChange($event)"
        >
            @if (showLabel()) {
                <kbq-label>Label</kbq-label>
            }

            <div kbqInlineEditViewMode>
                @if (displayValue().length) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [(ngModel)]="value" />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestComponent extends BaseTestComponent {
    value = '';
    readonly currentMode = signal('view');
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal(this.value);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.value);
    }

    toggleLabelVisibility() {
        this.showLabel.update((state) => !state);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel = jest.fn();
}
@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqTextareaModule,
        KbqDropdownModule,
        KbqIconModule
    ],
    template: `
        <kbq-inline-edit [showActions]="showActions()" (saved)="update()">
            <kbq-dropdown #dropdown="kbqDropdown">
                <button kbq-dropdown-item>TEST</button>
            </kbq-dropdown>
            <i
                kbqInlineEditMenu
                kbq-icon-button="kbq-ellipsis-vertical_16"
                [kbqDropdownTriggerFor]="dropdown"
                [color]="'contrast-fade'"
            ></i>
            <div kbqInlineEditViewMode>
                @let viewValue = displayValue();
                @if (viewValue) {
                    <span>{{ viewValue }}</span>
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <textarea kbqTextarea [placeholder]="placeholder" [(ngModel)]="value"></textarea>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithMenu extends BaseTestComponent {
    value = '';
    readonly currentMode = signal('view');
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal(this.value);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.value);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel() {}
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqTextareaModule
    ],
    template: `
        <kbq-inline-edit
            [showActions]="showActions()"
            (saved)="update()"
            (canceled)="cancel()"
            (modeChange)="onModeChange($event)"
        >
            @if (showLabel()) {
                <kbq-label>Label</kbq-label>
            }

            <div kbqInlineEditViewMode>
                @if (displayValue().length) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <textarea kbqTextarea [placeholder]="placeholder" [(ngModel)]="value"></textarea>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithTextareaControl extends BaseTestComponent {
    value = '';
    readonly currentMode = signal('view');
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal(this.value);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.value);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel = jest.fn();
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqTextareaModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-inline-edit
            [showActions]="showActions()"
            (saved)="update()"
            (canceled)="cancel()"
            (modeChange)="onModeChange($event)"
        >
            @if (showLabel()) {
                <kbq-label>Label</kbq-label>
            }

            <div kbqInlineEditViewMode>
                @if (displayValue()) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <textarea kbqTextarea [placeholder]="placeholder" [formControl]="control"></textarea>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithValidatedControl extends BaseTestComponent {
    control = new FormControl('', Validators.required);
    readonly currentMode = signal('view');
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal(this.control.value);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.control.value);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel() {}
}

@Component({
    selector: 'name',
    imports: [FormsModule, KbqInputModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit [interactiveSelectors]="interactiveSelectors()" (modeChange)="onModeChange($event)">
            <div kbqInlineEditViewMode>
                <a data-testid="link" href="#">link</a>
                <span data-testid="text">plain text</span>
                <button data-testid="button" type="button">button</button>
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithClickableContent {
    readonly interactiveSelectors = signal<string[]>(['a', 'kbq-tag']);

    onModeChange(_event: 'edit' | 'view') {}
}

@Component({
    selector: 'name',
    imports: [FormsModule, KbqInputModule, KbqInlineEditModule, KbqTagsModule],
    template: `
        <kbq-inline-edit (modeChange)="onModeChange($event)">
            <div kbqInlineEditViewMode>
                <kbq-tag-list>
                    <kbq-tag value="critical">Critical</kbq-tag>
                    <kbq-tag value="high">High</kbq-tag>
                </kbq-tag-list>
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithTagContent {
    onModeChange(_event: 'edit' | 'view') {}
}

@Component({
    selector: 'name',
    imports: [FormsModule, KbqInputModule, KbqInlineEditModule, KbqTagsModule, KbqIconModule],
    template: `
        <kbq-inline-edit (modeChange)="onModeChange($event)">
            <i aria-label="Reset" kbqInlineEditMenu kbq-icon-button="kbq-undo_16" [color]="'contrast-fade'"></i>
            <kbq-label>
                Tags
                <i aria-label="About" data-testid="label-action" kbq-icon-button="kbq-circle-info_16"></i>
            </kbq-label>

            <div kbqInlineEditViewMode>Critical</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithLabelAction {
    onModeChange(_event: 'edit' | 'view') {}
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqOptionModule,
        KbqSelectModule
    ],
    template: `
        <kbq-inline-edit
            [showActions]="showActions()"
            (saved)="update()"
            (canceled)="cancel()"
            (modeChange)="onModeChange($event)"
        >
            @if (showLabel()) {
                <kbq-label>Label</kbq-label>
            }

            <div kbqInlineEditViewMode>
                @if (displayValue().length) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select placeholder="Placeholder" [(ngModel)]="selected">
                    <kbq-cleaner />
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithSelect extends BaseTestComponent {
    value = '';
    readonly placeholder = 'Placeholder';
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly currentMode = signal('view');
    readonly displayValue = signal(this.value);
    readonly selected = model(this.options[0]);

    readonly showLabel = signal(false);

    constructor() {
        super();
    }

    update(): void {
        this.displayValue.set(this.value);
    }

    toggleLabelVisibility() {
        this.showLabel.update((state) => !state);
    }

    onModeChange($event: 'edit' | 'view') {
        this.currentMode.set($event);
    }

    cancel = jest.fn();
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqOptionModule,
        KbqSelectModule
    ],
    template: `
        <kbq-inline-edit #inlineEdit="kbqInlineEdit">
            <div kbqInlineEditViewMode>{{ selected() }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select placeholder="Placeholder" [(ngModel)]="selected" (selectionChange)="inlineEdit.commit()">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithSelectAutoCommit {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly selected = model(this.options[0]);
}

@Component({
    selector: 'name',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqOptionModule,
        KbqSelectModule
    ],
    template: `
        <kbq-inline-edit>
            <div kbqInlineEditViewMode>{{ selected().join(', ') }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select multiple placeholder="Placeholder" [(ngModel)]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithMultiSelect {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly selected = model([this.options[0]]);
}

@Component({
    selector: 'name',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInlineEditModule, KbqTextareaModule, KbqTooltipTrigger],
    template: `
        <kbq-inline-edit showActions [validationTooltip]="validationTooltip()" (saved)="update()">
            <div kbqInlineEditViewMode>{{ control.value }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <textarea kbqTextarea [formControl]="control"></textarea>
                <span data-testid="projected-tooltip" kbqTooltip="Extra info">Extra</span>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithDynamicValidationTooltip {
    readonly control = new FormControl('', Validators.required);
    readonly validationTooltip = signal('');

    update() {}
}

@Component({
    selector: 'name',
    imports: [
        ReactiveFormsModule,
        KbqInputModule,
        KbqInlineEditModule
    ],
    template: `
        <kbq-inline-edit
            [showActions]="showActions()"
            (saved)="update()"
            (canceled)="cancel()"
            (modeChange)="onModeChange($event)"
        >
            <div kbqInlineEditViewMode>
                @if (displayValue()) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <form novalidate kbqInlineEditEditMode [formGroup]="form">
                <kbq-form-field>
                    <input kbqInput formControlName="firstName" />
                </kbq-form-field>
                <kbq-form-field>
                    <input kbqInput formControlName="lastName" />
                </kbq-form-field>
            </form>
        </kbq-inline-edit>
    `
})
export class TestWithMultipleFormFields extends BaseTestComponent {
    readonly placeholder = 'Placeholder';
    readonly displayValue = signal('');

    readonly form = new FormGroup({
        firstName: new FormControl('John', Validators.required),
        lastName: new FormControl('Doe', Validators.required)
    });

    update = jest.fn();
    cancel = jest.fn();

    onModeChange(_$event: 'edit' | 'view') {}
}

@Component({
    selector: 'name',
    imports: [FormsModule, KbqInputModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit aria-label="Assignee">
            <div kbqInlineEditViewMode>John</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithAriaLabel {}

@Component({
    selector: 'name',
    imports: [FormsModule, KbqInputModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit disabled>
            <div kbqInlineEditViewMode>John</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestDisabled {}

@Component({
    selector: 'name',
    imports: [FormsModule, KbqInputModule, KbqInlineEditModule, KbqTagsModule],
    template: `
        <kbq-inline-edit>
            <div kbqInlineEditViewMode>First</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput />
            </kbq-form-field>
        </kbq-inline-edit>

        <kbq-inline-edit>
            <div kbqInlineEditViewMode>
                <kbq-tag-list>
                    <kbq-tag value="critical">Critical</kbq-tag>
                </kbq-tag-list>
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithTwoFields {}

@Component({
    selector: 'name',
    imports: [FormsModule, KbqInputModule, KbqInlineEditModule, KbqTagsModule],
    template: `
        <kbq-inline-edit>
            <div kbqInlineEditViewMode>
                @if (loaded()) {
                    <kbq-tag-list>
                        <kbq-tag value="critical">Critical</kbq-tag>
                    </kbq-tag-list>
                } @else {
                    <span kbqInlineEditPlaceholder>Not set</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
export class TestWithLateContent {
    readonly loaded = signal(false);
}

@Component({
    selector: 'name',
    imports: [FormsModule, KbqInputModule, KbqInlineEditModule],
    template: `
        <a href="#">
            <kbq-inline-edit (modeChange)="onModeChange($event)">
                <div kbqInlineEditViewMode><span data-testid="text">value</span></div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput />
                </kbq-form-field>
            </kbq-inline-edit>
        </a>
    `
})
export class TestWithInteractiveAncestor {
    onModeChange(_event: 'edit' | 'view') {}
}

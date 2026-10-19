import { FocusOrigin } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
    Component,
    effect,
    ElementRef,
    ErrorHandler,
    EventEmitter,
    inject,
    Injectable,
    Injector,
    NgModule,
    Provider,
    signal,
    Type,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed, inject as testingInject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    createKeyboardEvent,
    createMouseEvent,
    dispatchEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    ENTER,
    ESCAPE,
    KBQ_ANIMATIONS_CONFIG,
    KBQ_WINDOW,
    KbqComponentColors,
    ruRULocaleData,
    TAB
} from '@koobiq/components/core';
import { KbqDropdownItem, KbqDropdownModule } from '@koobiq/components/dropdown';
import { axe } from 'jest-axe';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import { KbqModalComponent } from './modal.component';
import { KbqModalModule } from './modal.module';
import { KbqModalService } from './modal.service';
import { IModalOptionsForService, MODAL_ANIMATE_DURATION, ModalSize } from './modal.type';

const ANIMATION_DURATION = MODAL_ANIMATE_DURATION * 2;

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

describe('KbqModal', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe('created by service', () => {
        let fixture: ComponentFixture<ModalByServiceComponent>;
        let buttonElement: HTMLButtonElement;

        let modalService: KbqModalService;
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
            vi.useFakeTimers();
            TestBed.configureTestingModule({
                imports: [ModalTestModule]
            }).compileComponents();
        });

        beforeEach(
            testingInject([KbqModalService, OverlayContainer], (ms: KbqModalService, oc: OverlayContainer) => {
                modalService = ms;
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
            })
        );

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(ModalByServiceComponent);
            buttonElement = <HTMLButtonElement>fixture.debugElement.nativeElement.querySelector('button');
        });

        afterEach(async () => {
            // wait all openModals to be closed to clean up the ModalManager as it is globally static
            modalService.closeAll();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION * 2);
        });

        it('should trigger afterOpen and have the correct openModals length', async () => {
            const spy = vi.fn();
            const modalRef = modalService.create();

            modalRef.afterOpen.subscribe(spy);

            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(modalService.openModals.indexOf(modalRef)).toBeGreaterThan(-1);
            expect(modalService.openModals.length).toBe(1);
        });

        // The emitter passed in the options used to *become* instance.kbqAfterOpen through
        // `Object.assign`, so a single emitter served both subscriptions. It is mirrored now.
        it('should mirror the open event onto the kbqAfterOpen emitter passed in the options', async () => {
            const spy = vi.fn();
            const kbqAfterOpen = new EventEmitter<void>();
            const modalRef = modalService.create({ kbqAfterOpen });

            kbqAfterOpen.subscribe(spy);

            expect(kbqAfterOpen).not.toBe(modalRef.getInstance().kbqAfterOpen);

            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        // Both elements scroll, so both have to be driven by the custom scrollbar: a native one takes
        // layout width the moment it appears and shifts everything it narrows.
        const expectCustomScrollbars = () => {
            ['.kbq-modal-wrap', '.kbq-modal-body'].forEach((selector) => {
                const { classList } = overlayContainerElement.querySelector(selector)!;

                expect(classList).toContain('kbq-scrollbar-viewport');
                expect(classList).toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');
            });
        };

        it('renders the custom scrollbar on every scrolling element', async () => {
            modalService.create({ kbqContent: 'Test content' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expectCustomScrollbars();
        });

        it('renders the custom scrollbar on every scrolling element of a confirm modal', async () => {
            modalService.confirm({ kbqContent: 'Test content' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expectCustomScrollbars();
        });

        it('should fire onClick events', async () => {
            const spy = vi.fn();
            const onClickEmitter = new EventEmitter<void>();

            onClickEmitter.subscribe(spy);

            modalService.create({
                kbqContent: TestModalContentComponent,
                kbqFooter: [
                    {
                        label: 'Test label',
                        type: 'primary',
                        onClick: () => {
                            onClickEmitter.emit();
                        }
                    }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(spy).not.toHaveBeenCalled();

            const button = overlayContainerElement.querySelector('button.kbq-primary') as HTMLButtonElement;

            button.click();

            fixture.detectChanges();
            expect(spy).toHaveBeenCalled();
        });

        it('should trigger both afterClose/kbqAfterClose and have the correct openModals length', async () => {
            const spy = vi.fn();
            const kbqAfterClose = new EventEmitter<void>();
            const modalRef = modalService.create({ kbqAfterClose });

            modalRef.afterClose.subscribe(spy);
            kbqAfterClose.subscribe(spy);

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            modalRef.close();
            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(modalService.openModals.indexOf(modalRef)).toBe(-1);
            expect(modalService.openModals.length).toBe(0);
        });

        it('should return/receive with/without result data', async () => {
            const spy = vi.fn();
            const modalRef = modalService.success();

            modalRef.afterClose.subscribe(spy);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            modalRef.destroy();
            expect(spy).not.toHaveBeenCalled();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledWith(undefined);
        });

        it('should return/receive with result data', async () => {
            const result = { data: 'Fake Error' };
            const spy = vi.fn();
            const modalRef = modalService.delete();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            modalRef.destroy(result);
            modalRef.afterClose.subscribe(spy);
            expect(spy).not.toHaveBeenCalled();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledWith(result);
        });

        it('should close all opened modals (include non-service modals)', async () => {
            const spy = vi.fn();
            const modalMethods = ['create', 'delete', 'success'];
            const uniqueId = (name: string) => `__${name}_ID_SUFFIX__`;
            const queryOverlayElement = (name: string) =>
                overlayContainerElement.querySelector(`.${uniqueId(name)}`) as HTMLElement;

            modalService.afterAllClose.subscribe(spy);

            fixture.componentInstance.nonServiceModalVisible = true; // Show non-service modal
            modalMethods.forEach((method) => modalService[method]({ kbqWrapClassName: uniqueId(method) })); // Service modals

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            // Cover non-service modal for later checking
            modalMethods.concat('NON_SERVICE').forEach((method) => {
                expect(queryOverlayElement(method).style.display).not.toBe('none');
            });
            expect(modalService.openModals.length).toBe(4);

            modalService.closeAll();
            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalled();
            expect(modalService.openModals.length).toBe(0);
        });

        it('should give the close button an accessible name', async () => {
            // The close button lives in the header, which is rendered only for a titled modal.
            modalService.create({ kbqClosable: true, kbqTitle: 'Title' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const closeButton = overlayContainerElement.querySelector('.kbq-modal-close')!;

            // The button holds an icon only, so without this it has no accessible name at all.
            expect(closeButton.getAttribute('aria-label')).toBe(ruRULocaleData.a11y.close);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should modal not be registered twice', async () => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            (modalService as any).modalControl.registerModal(modalRef);
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(modalService.openModals.length).toBe(1);
        });

        it('should trigger kbqOkClick/kbqCancelClick', () => {
            const spyOk = vi.fn();
            const spyCancel = vi.fn();
            const modalRef: KbqModalRef = modalService.create({
                kbqOkClick: spyOk,
                kbqCancelClick: spyCancel
            });

            fixture.detectChanges();

            modalRef.triggerOk();
            expect(spyOk).toHaveBeenCalled();

            modalRef.triggerCancel();
            expect(spyCancel).toHaveBeenCalled();
        });

        it('should process loading flag', async () => {
            const isLoading = true;
            const modalRef = modalService.create({
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: 'primary',
                        loading: () => isLoading
                    }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-progress').length).toBe(1);
        });

        it('should process show flag', async () => {
            const isShown = false;
            const modalRef = modalService.create({
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: KbqComponentColors.Theme,
                        show: () => isShown
                    }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer .kbq-button').length).toBe(0);
        });

        it('should process disable flag', async () => {
            const isDisabled = true;
            const modalRef = modalService.create({
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: KbqComponentColors.Theme,
                        disabled: () => isDisabled
                    }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('[disabled]').length).toBe(1);
        });

        it('should called function on hotkey ctrl+enter. kbqFooter is array ', async () => {
            const spyOk = vi.fn();
            const modalRef = modalService.create({
                kbqContent: TestModalContentComponent,
                kbqFooter: [
                    {
                        label: 'Test label',
                        type: 'primary',
                        kbqModalMainAction: true,
                        onClick: spyOk
                    }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const event = document.createEvent('KeyboardEvent') as any;

            event.initKeyboardEvent('keydown', true, true, window, 0, 0, 0, '', false);

            Object.defineProperties(event, {
                keyCode: { get: () => ENTER },
                ctrlKey: { get: () => true }
            });

            modalRef.getElement().dispatchEvent(event);

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            expect(spyOk).toHaveBeenCalled();
        });

        it('should mark only the footer buttons whose kbqModalMainAction is true for ctrl+enter', async () => {
            const secondary = vi.fn();
            const main = vi.fn();
            const modalRef = modalService.create({
                kbqFooter: [
                    { label: 'Secondary', type: 'primary', kbqModalMainAction: false, onClick: secondary },
                    { label: 'Main', type: 'primary', kbqModalMainAction: true, onClick: main }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const [secondaryButton, mainButton] = modalRef.getElement().querySelectorAll('.kbq-modal-footer button');
            const event = createKeyboardEvent('keydown', ENTER);

            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(modalRef.getElement(), event);
            fixture.detectChanges();

            expect(main).toHaveBeenCalledTimes(1);
            expect(secondary).not.toHaveBeenCalled();
            expect(secondaryButton.hasAttribute('kbq-modal-main-action')).toBe(false);
            expect(mainButton.hasAttribute('kbq-modal-main-action')).toBe(true);

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should mark only the footer buttons whose autoFocus is true for the initial focus', async () => {
            const modalRef = modalService.create({
                kbqFooter: [
                    { label: 'First', type: 'primary', autoFocus: false },
                    { label: 'Second', type: 'primary', autoFocus: true }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const [first, second] = modalRef.getElement().querySelectorAll('.kbq-modal-footer button');

            expect(document.activeElement).toBe(second);
            expect(first.hasAttribute('autofocus')).toBe(false);
            expect(second.hasAttribute('autofocus')).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });

        // The input and the output used to be one property, so binding both silently lost the
        // output: Angular subscribed to the default emitter and the input then replaced it.
        it('should let kbqOkClick decide the close and report that kbqOnOk cannot also be bound', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const emitted = vi.fn();
            const modalRef: KbqModalRef = modalService.create({ kbqOkClick: () => false });

            modalRef.getInstance().kbqOnOk.subscribe(emitted);
            fixture.detectChanges();

            modalRef.triggerOk();

            expect(emitted).not.toHaveBeenCalled();
            expect(modalRef.getInstance().kbqVisible()).toBe(true);
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('[kbqOkClick]'));

            warn.mockRestore();
        });

        it('should emit kbqOnOk and close when no kbqOkClick is bound', () => {
            const emitted = vi.fn();
            const modalRef: KbqModalRef = modalService.create();

            modalRef.getInstance().kbqOnOk.subscribe(emitted);
            fixture.detectChanges();

            modalRef.triggerOk();

            expect(emitted).toHaveBeenCalledTimes(1);
            expect(modalRef.getInstance().kbqVisible()).toBe(false);
        });

        it('should called function on hotkey ctrl+enter. modal type is confirm ', () => {
            const spyOk = vi.fn();
            const modalRef = modalService.success({
                kbqContent: 'Сохранить сделанные изменения?',
                kbqOkText: 'Сохранить',
                kbqCancelText: 'Отмена',
                kbqOkClick: spyOk
            });

            fixture.detectChanges();

            const event = document.createEvent('KeyboardEvent') as any;

            event.initKeyboardEvent('keydown', true, true, window, 0, 0, 0, '', false);

            Object.defineProperties(event, {
                keyCode: { get: () => ENTER },
                ctrlKey: { get: () => true }
            });

            modalRef.getElement().dispatchEvent(event);

            fixture.detectChanges();
            expect(spyOk).toHaveBeenCalled();
        });

        it('should show the footer, when kbqFooter is specified', async () => {
            const modalRef = modalService.create({
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: 'primary'
                    }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        });

        it('should show the footer, when kbqOkText is specified', async () => {
            const modalRef = modalService.create({
                kbqOkText: 'OK'
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        });

        it('should show the footer, when kbqCancelText is specified', async () => {
            const modalRef = modalService.create({
                kbqCancelText: 'OK'
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        });

        it('should not show the footer, when kbqOkText, kbqOkCancel and kbqFooter are not specified', async () => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(0);
        });

        it('should show only one mask at a time', async () => {
            fixture.componentInstance.nonServiceModalVisible = true; // Show non-service modal
            const secondModal = modalService.create();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            fixture.detectChanges();

            expect(document.querySelectorAll('.kbq-modal-mask').length).toEqual(1);

            secondModal.close();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            fixture.detectChanges();

            expect(document.querySelectorAll('.kbq-modal-mask').length).toEqual(1);
        });

        const openMaskClosableModal = async (): Promise<HTMLElement> => {
            const modalRef = modalService.create({ kbqMaskClosable: true });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            return modalRef.getElement().querySelector<HTMLElement>('.kbq-modal-wrap')!;
        };

        const clickMask = async (mask: HTMLElement, button: number) => {
            dispatchMouseEvent(mask, 'mousedown', 0, 0, createMouseEvent('mousedown', 0, 0, button));

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
        };

        it('should close on a primary button click on the mask', async () => {
            await clickMask(await openMaskClosableModal(), 0);

            expect(modalService.openModals.length).toBe(0);
        });

        // The sidepanel closes on the overlay backdrop's `click`, which the right button never fires.
        it('should not close on a right button click on the mask', async () => {
            await clickMask(await openMaskClosableModal(), 2);

            expect(modalService.openModals.length).toBe(1);
        });

        it('should process kbqPreventFocusRestoring flag set to true', async () => {
            expect(document.activeElement).not.toBe(buttonElement);

            buttonElement.focus();

            expect(document.activeElement).toBe(buttonElement);

            const modalRef = modalService.create({
                kbqRestoreFocus: false,
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: 'primary'
                    }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.activeElement).not.toBe(buttonElement);

            modalRef.close();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.activeElement).not.toBe(buttonElement);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should process kbqPreventFocusRestoring flag set to false', async () => {
            expect(document.activeElement).not.toBe(buttonElement);

            buttonElement.focus();

            expect(document.activeElement).toBe(buttonElement);

            const modalRef = modalService.create({
                kbqRestoreFocus: true,
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: 'primary'
                    }
                ]
            });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.activeElement).not.toBe(buttonElement);

            modalRef.close();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.activeElement).toBe(buttonElement);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should set focus inside modal when opened by dropdown', async () => {
            const fixtureComponent = TestBed.createComponent(ModalByServiceFromDropdownComponent);
            const buttonElement = fixtureComponent.debugElement.nativeElement.querySelector('button');

            fixtureComponent.detectChanges();

            expect(document.activeElement).not.toBe(buttonElement);

            buttonElement.click();
            fixtureComponent.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            const dropdownItems = fixtureComponent.debugElement
                .queryAll(By.directive(KbqDropdownItem))
                .map((debugElement) => debugElement.nativeElement as HTMLButtonElement);

            // Directly invoke showConfirm() to open the modal (simulating dropdown item click)
            // without triggering the dropdown's focus restoration to the trigger.
            fixtureComponent.componentInstance.showConfirm();
            fixtureComponent.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            const activeElement: HTMLButtonElement | null = document.activeElement as HTMLButtonElement;

            expect(activeElement).not.toBe(buttonElement);
            expect(dropdownItems.length).toBeGreaterThan(0);
            expect(activeElement).not.toBe(dropdownItems[0]);
            expect(activeElement).toBeTruthy();
            expect(activeElement.textContent?.trim()).toEqual(fixtureComponent.componentInstance.kbqOkText);
        });

        it('should restore focus on previous element on close with correct focus origin', async () => {
            const testFocusRestoreFor = async (origin: FocusOrigin) => {
                expect(document.activeElement).toBe(buttonElement);

                const modalRef = modalService.create({
                    kbqRestoreFocus: true,
                    kbqFooter: [{ label: 'button 1', type: 'primary' }]
                });

                fixture.detectChanges();

                expect(document.activeElement).not.toBe(buttonElement);

                modalRef.close();
                fixture.detectChanges();
                await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

                expect(document.activeElement).toBe(buttonElement);
                expect(document.activeElement?.classList).toContain(`cdk-${origin}-focused`);

                buttonElement.blur();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            };

            buttonElement.focus();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            await testFocusRestoreFor('program');

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(document, 'keydown', TAB);
            buttonElement.focus();
            await testFocusRestoreFor('keyboard');
        });

        it('should carry dialog semantics named by its title', async () => {
            modalService.create({ kbqTitle: 'Dialog title', kbqCaption: 'Dialog caption' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            expect(dialog.getAttribute('role')).toBe('dialog');
            expect(dialog.getAttribute('aria-modal')).toBe('true');
            expect(dialog.getAttribute('tabindex')).toBe('-1');

            const labelledBy = dialog.getAttribute('aria-labelledby')!;
            const describedBy = dialog.getAttribute('aria-describedby')!;

            expect(overlayContainerElement.querySelector(`#${labelledBy}`)!.textContent).toContain('Dialog title');
            expect(overlayContainerElement.querySelector(`#${describedBy}`)!.textContent).toContain('Dialog caption');
            expect(dialog.getAttribute('aria-label')).toBeNull();

            await vi.runOnlyPendingTimersAsync();
        });

        it('should fall back to kbqAriaLabel when the dialog has no title', async () => {
            modalService.create({ kbqContent: 'text', kbqAriaLabel: 'Named by option' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            expect(dialog.getAttribute('aria-labelledby')).toBeNull();
            expect(dialog.getAttribute('aria-label')).toBe('Named by option');

            await vi.runOnlyPendingTimersAsync();
        });

        it('should take the page behind the dialog out of the accessibility tree', async () => {
            fixture.detectChanges();

            const background = Array.from(document.body.children).find((child) =>
                child.contains(fixture.nativeElement)
            )!;

            expect(background.hasAttribute('inert')).toBe(false);

            const modalRef = modalService.create({ kbqContent: 'text' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(background.hasAttribute('inert')).toBe(true);
            // The overlays themselves stay reachable, dialogs and anything opened from them alike.
            expect(overlayContainerElement.hasAttribute('inert')).toBe(false);

            modalRef.close();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(background.hasAttribute('inert')).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should keep only the topmost dialog reachable when modals stack', async () => {
            const first = modalService.create({ kbqContent: 'first' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const second = modalService.create({ kbqContent: 'second' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(first.getElement().querySelector('[inert]')).toBeTruthy();
            expect(second.getElement().querySelector('[inert]')).toBeNull();

            second.close();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(first.getElement().querySelector('[inert]')).toBeNull();

            await vi.runOnlyPendingTimersAsync();
        });

        it('should move focus into a dialog that holds no button at all', async () => {
            buttonElement.focus();

            const modalRef = modalService.create({ kbqContent: 'text' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('button').length).toBe(0);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            expect(document.activeElement).toBe(dialog);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should trap focus on the dialog element itself', async () => {
            modalService.create({ kbqTitle: 'Trapped', kbqOkText: 'Ok' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            // The trap wraps the dialog, not the inner content wrapper, so the dialog element can
            // be the focus target for `kbqAutoFocus: 'dialog'` and still be inside the trap.
            expect(dialog.previousElementSibling!.classList).toContain('cdk-focus-trap-anchor');
            expect(dialog.nextElementSibling!.classList).toContain('cdk-focus-trap-anchor');

            await vi.runOnlyPendingTimersAsync();
        });

        it('should let cdkFocusInitial win over the first tabbable control', async () => {
            modalService.open({ kbqComponent: ModalWithFocusInitialComponent, kbqAriaLabel: 'Marked' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.activeElement).toBe(overlayContainerElement.querySelector('[data-testid="marked"]'));

            await vi.runOnlyPendingTimersAsync();
        });

        it('should focus the dialog itself when kbqAutoFocus is "dialog"', async () => {
            modalService.create({ kbqTitle: 'Long read', kbqContent: 'text', kbqAutoFocus: 'dialog' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.activeElement).toBe(overlayContainerElement.querySelector('.kbq-modal-container'));

            await vi.runOnlyPendingTimersAsync();
        });

        it('should leave focus alone when kbqAutoFocus is false', async () => {
            buttonElement.focus();

            modalService.create({ kbqTitle: 'Untouched', kbqAutoFocus: false });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.activeElement).toBe(buttonElement);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should honour kbqCloseByESC on the service path', async () => {
            const modalRef = modalService.create({ kbqTitle: 'Kept', kbqCloseByESC: false });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            dispatchKeyboardEvent(modalRef.getElement(), 'keydown', ESCAPE);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getInstance().kbqVisible()).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });

        // The builder used to defer Escape until `afterOpen`, on `overlayRef.keydownEvents()` and
        // bypassing the veto. The host listener cannot see the keystroke that opened the dialog —
        // that one lands on the trigger, outside the dialog — so the defer has nothing left to guard,
        // and Escape pressed while the dialog animates in closes it the same way as any other.
        it('should close on Escape pressed before the opening animation is over', async () => {
            const modalRef = modalService.create({ kbqTitle: 'Closing' });

            fixture.detectChanges();

            dispatchKeyboardEvent(modalRef.getElement(), 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(modalRef.getInstance().kbqVisible()).toBe(false);

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should leave an Escape a control inside the dialog consumed', async () => {
            const modalRef = modalService.create({ kbqTitle: 'Kept' });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const event = createKeyboardEvent('keydown', ESCAPE);

            event.preventDefault();
            dispatchEvent(modalRef.getElement(), event);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getInstance().kbqVisible()).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should route Escape through kbqCancelClick on the service path', async () => {
            const spyCancel = vi.fn();
            const modalRef = modalService.create({ kbqTitle: 'Cancellable', kbqCancelClick: spyCancel });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            dispatchKeyboardEvent(modalRef.getElement(), 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(spyCancel).toHaveBeenCalled();
            expect(modalRef.getInstance().kbqVisible()).toBe(false);

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should let a kbqCancelClick callback veto Escape', async () => {
            const modalRef = modalService.create({ kbqTitle: 'Vetoed', kbqCancelClick: () => false });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            dispatchKeyboardEvent(modalRef.getElement(), 'keydown', ESCAPE);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(modalRef.getInstance().kbqVisible()).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should build the dialog class list from the class name, the size and the animation', async () => {
            const modalRef = modalService.create({ kbqClassName: 'custom-modal', kbqSize: ModalSize.Small });

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            expect(dialog.classList).toContain('custom-modal');
            expect(dialog.classList).toContain('kbq-modal_small');
            expect(dialog.classList).not.toContain('zoom-enter');

            expect(modalRef).toBeTruthy();
            await vi.runOnlyPendingTimersAsync();
        });
    });

    // The dialog is rendered but never closed here: awaiting the leave animation would spend the
    // suite's whole budget, and the TestBed teardown disposes the overlay anyway.
    describe('axe', () => {
        let fixture: ComponentFixture<ModalByServiceComponent>;
        let modalService: KbqModalService;
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [ModalTestModule] });
            fixture = TestBed.createComponent(ModalByServiceComponent);
            modalService = TestBed.inject(KbqModalService);
            overlayContainer = TestBed.inject(OverlayContainer);
            overlayContainerElement = overlayContainer.getContainerElement();
        });

        afterEach(() => overlayContainer.ngOnDestroy());

        const render = (options: IModalOptionsForService) => {
            modalService.create(options);
            fixture.detectChanges();
        };

        it('should have no violations for a default dialog', async () => {
            render({
                kbqTitle: 'Default',
                kbqCaption: 'Caption',
                kbqContent: 'text',
                kbqOkText: 'Ok',
                kbqCancelText: 'Cancel'
            });

            expect(await axe(overlayContainerElement)).toHaveNoViolations();
        });

        it('should have no violations for an untitled dialog named by kbqAriaLabel', async () => {
            render({ kbqContent: 'text', kbqAriaLabel: 'Simple dialog' });

            expect(await axe(overlayContainerElement)).toHaveNoViolations();
        });

        it('should have no violations for a confirm dialog', async () => {
            modalService.confirm({ kbqContent: 'Sure?', kbqAriaLabel: 'Confirm', kbqOkText: 'Ok' });
            fixture.detectChanges();

            expect(await axe(overlayContainerElement)).toHaveNoViolations();
        });

        it('should have no violations for a custom dialog', async () => {
            modalService.open({ kbqComponent: TestModalContentComponent, kbqAriaLabel: 'Custom' });
            fixture.detectChanges();

            expect(await axe(overlayContainerElement)).toHaveNoViolations();
        });
    });

    describe('with dynamic injectors', () => {
        it('should report an error if custom parent injector not provided for feature service', async () => {
            const errorHandler = { handleError: vi.fn() };
            const fixture = createComponent(CustomComponent, [{ provide: ErrorHandler, useValue: errorHandler }]);

            fixture.componentInstance.modalService.open({ kbqComponent: CustomModalComponent });

            // The content component is created while the application ticks the modal's own view, so the DI failure
            // goes to the ErrorHandler rather than to the caller; TestBed then rejects `whenStable` with it.
            await expect(fixture.whenStable()).rejects.toThrow(/TestComponentLevelService/);
            expect(errorHandler.handleError).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('TestComponentLevelService') })
            );
        });

        it('should use custom parent injector when creating dynamic component', () => {
            const customInjectionTokenProvider: Provider = { provide: 'CUSTOM-TOKEN', useValue: 'CUSTOM-TOKEN-VALUE' };
            const fixture = createComponent(CustomComponent);
            const updatedInjector = Injector.create({
                parent: fixture.componentInstance.injector,
                providers: [customInjectionTokenProvider]
            });
            const modalRef = fixture.componentInstance.modalService.open({
                kbqComponent: CustomModalComponent,
                injector: updatedInjector
            });

            fixture.autoDetectChanges();
            expect(
                modalRef.getInstance().getContentComponentRef().injector.get(customInjectionTokenProvider.provide)
            ).toEqual(customInjectionTokenProvider.useValue);
            expect(fixture.componentInstance.injector.get(TestComponentLevelService)).toEqual(
                modalRef.getInstance().getContentComponentRef().injector.get(TestComponentLevelService)
            );
        });
    });

    describe('with manually composed content', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        const closeModal = async (fixture: ComponentFixture<unknown>, modalRef: KbqModalRef) => {
            modalRef.close();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION * 2);
        };

        it('should project the caption into the header, below the title', async () => {
            const fixture = createComponent(ModalWithCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const headerContent = document.querySelector('.kbq-modal-header > .kbq-modal-header-content')!;
            const title = headerContent.querySelector('.kbq-modal-title')!;
            const caption = headerContent.querySelector('.kbq-modal-caption')!;

            expect(title.textContent).toContain('Title');
            expect(caption.textContent).toContain('Caption');
            expect(title.nextElementSibling).toBe(caption);

            await closeModal(fixture, modalRef);
        });

        it.each([
            [undefined, 1],
            [true, 1],
            [false, 0]
        ])('should follow kbqClosable %s in the composed title', async (kbqClosable, closeButtons) => {
            const fixture = createComponent(ModalWithoutCaptionComponent);
            const modalRef = fixture.componentInstance.open(kbqClosable);

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.querySelectorAll('.kbq-modal-header .kbq-modal-close').length).toBe(closeButtons);

            await closeModal(fixture, modalRef);
        });

        it('should name and describe the dialog from the composed title and caption', async () => {
            const fixture = createComponent(ModalWithCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const dialog = document.querySelector('.kbq-modal-container')!;
            const labelledBy = dialog.getAttribute('aria-labelledby')!;
            const describedBy = dialog.getAttribute('aria-describedby')!;

            expect(document.querySelector(`#${labelledBy}`)!.textContent).toContain('Title');
            expect(document.querySelector(`#${describedBy}`)!.classList).toContain('kbq-modal-caption');
            expect(document.querySelector(`#${describedBy}`)!.textContent).toContain('Caption');

            await closeModal(fixture, modalRef);
        });

        it('should leave aria-describedby off a composed dialog with no caption', async () => {
            const fixture = createComponent(ModalWithoutCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.querySelector('.kbq-modal-container')!.getAttribute('aria-describedby')).toBeNull();

            await closeModal(fixture, modalRef);
        });

        it('should cast the top overflow shadow from the header holding the caption', async () => {
            const fixture = createComponent(ModalWithCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            const header = document.querySelector<HTMLElement>('.kbq-modal-header')!;

            expect(header.style.boxShadow).toBeFalsy();

            modalRef.getInstance().bodyOverflow.set({ top: true, bottom: false });
            fixture.detectChanges();

            expect(header.style.boxShadow).toBe('var(--kbq-shadow-overflow-normal-bottom)');

            await closeModal(fixture, modalRef);
        });
    });

    describe('with reduced motion', () => {
        // jsdom has no matchMedia at all, so the reduced-motion branch is unreachable without this.
        const reducedMotion: Provider = {
            provide: KBQ_WINDOW,
            useValue: { ...window, matchMedia: () => ({ matches: true }) }
        };

        it('should not report the dialog open before its view exists', async () => {
            vi.useFakeTimers();

            // Deliberately no detectChanges: `create()` has to run before the first change
            // detection, which is what it does on the imperative path in an application. The
            // zoneless auto-detection is scheduled, so it does not run before `open()` either.
            TestBed.configureTestingModule({ imports: [ModalOpenerComponent], providers: [reducedMotion] });

            const fixture = TestBed.createComponent(ModalOpenerComponent);

            let bodyAtAfterOpen: Element | null | undefined;

            fixture.componentInstance
                .open()
                .afterOpen.subscribe(() => (bodyAtAfterOpen = document.querySelector('.kbq-modal-body')));

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            // There is no animation to wait for under reduced motion, but settling synchronously
            // reported the dialog open before its template had rendered — so the scrollbar flash
            // hanging off afterOpen, and anything a consumer does there, found nothing to act on.
            expect(bodyAtAfterOpen).toBeTruthy();

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('with animations disabled', () => {
        let fixture: ComponentFixture<ModalOpenerComponent>;

        beforeEach(() => {
            vi.useFakeTimers();

            TestBed.configureTestingModule({
                imports: [ModalOpenerComponent],
                providers: [{ provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } }]
            });

            fixture = TestBed.createComponent(ModalOpenerComponent);
        });

        it('should open and close without waiting for the animation', async () => {
            const opened = vi.fn();
            const closed = vi.fn();
            const modalRef = fixture.componentInstance.open();

            modalRef.afterOpen.subscribe(opened);
            modalRef.afterClose.subscribe(closed);

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1);

            expect(opened).toHaveBeenCalledTimes(1);
            expect(document.querySelector('.kbq-modal-container')!.classList).not.toContain('zoom-enter');

            modalRef.close();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1);

            expect(closed).toHaveBeenCalledTimes(1);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should hand the layer over to a covering dialog and back at once, without a fade', async () => {
            fixture.componentInstance.open();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1);

            const covering = fixture.componentInstance.open();

            fixture.detectChanges();

            // The covered dialog stops painting its layer right away, so the two never overlap.
            let masks = Array.from(document.querySelectorAll('.kbq-modal-mask'));

            expect(masks.length).toBe(1);
            masks.forEach((mask) => expect(mask.className).not.toMatch(/fade-/));

            await vi.advanceTimersByTimeAsync(1);
            covering.close();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1);
            fixture.detectChanges();

            masks = Array.from(document.querySelectorAll('.kbq-modal-mask'));

            expect(masks.length).toBe(1);
            masks.forEach((mask) => expect(mask.className).not.toMatch(/fade-/));

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('with animations disabled below the root injector', () => {
        it('should hand the layer over to a covering dialog at once', async () => {
            vi.useFakeTimers();
            TestBed.configureTestingModule({ imports: [ModalOpenerWithoutMotion] });

            const fixture = TestBed.createComponent(ModalOpenerWithoutMotion);

            fixture.componentInstance.open();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1);

            fixture.componentInstance.open();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1);
            fixture.detectChanges();

            expect(document.querySelectorAll('.kbq-modal-mask').length).toBe(1);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('KbqModalService providedIn root', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        it('should inject KbqModalService without importing KbqModalModule', () => {
            expect(TestBed.inject(KbqModalService)).toBeTruthy();
        });

        it('should track openModals for modals created without KbqModalModule', async () => {
            const fixture = createComponent(ModalWithoutModuleComponent);
            const rootService = TestBed.inject(KbqModalService);

            fixture.componentInstance.modal.create();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(rootService.openModals.length).toBe(1);
        });

        it('should emit afterAllClose when modal created without KbqModalModule is closed', async () => {
            const fixture = createComponent(ModalWithoutModuleComponent);
            const spy = vi.fn();

            TestBed.inject(KbqModalService).afterAllClose.subscribe(spy);

            const ref = fixture.componentInstance.modal.create();

            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            ref.close();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('declarative path', () => {
        let fixture: ComponentFixture<DeclarativeModalComponent>;
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
            vi.useFakeTimers();
            TestBed.configureTestingModule({ imports: [DeclarativeModalComponent] });
            fixture = TestBed.createComponent(DeclarativeModalComponent);
            overlayContainer = TestBed.inject(OverlayContainer);
            overlayContainerElement = overlayContainer.getContainerElement();
        });

        afterEach(() => overlayContainer.ngOnDestroy());

        const open = async () => {
            fixture.detectChanges();
            fixture.componentInstance.visible = true;
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            fixture.detectChanges();
        };

        const query = <T extends Element>(selector: string) => overlayContainerElement.querySelector<T>(selector)!;

        it('should close on the close button', async () => {
            await open();

            query<HTMLButtonElement>('.kbq-modal-close').click();
            fixture.detectChanges();

            expect(fixture.componentInstance.visible).toBe(false);
            expect(fixture.componentInstance.cancelCount).toBe(1);

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should close on a click on the mask', async () => {
            await open();

            dispatchMouseEvent(query('.kbq-modal-wrap'), 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.visible).toBe(false);

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should close on the predefined OK button', async () => {
            await open();

            const [ok] = Array.from(query('.kbq-modal-footer').querySelectorAll('button'));

            ok.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.visible).toBe(false);
            expect(fixture.componentInstance.okCount).toBe(1);

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should close on Escape and emit kbqOnCancel first', async () => {
            await open();

            dispatchKeyboardEvent(query('.kbq-modal-container'), 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(fixture.componentInstance.cancelCount).toBe(1);
            expect(fixture.componentInstance.visible).toBe(false);

            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should ignore Escape when kbqCloseByESC is false', async () => {
            fixture.componentInstance.closeByESC = false;
            await open();

            dispatchKeyboardEvent(query('.kbq-modal-container'), 'keydown', ESCAPE);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(fixture.componentInstance.visible).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should move focus into the dialog and back to the trigger', async () => {
            fixture.detectChanges();

            const trigger = fixture.componentInstance.trigger().nativeElement;

            trigger.focus();
            expect(document.activeElement).toBe(trigger);

            fixture.componentInstance.visible = true;
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            fixture.detectChanges();

            expect(document.activeElement).not.toBe(trigger);
            expect(query('.kbq-modal-container').contains(document.activeElement)).toBe(true);

            fixture.componentInstance.visible = false;
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(document.activeElement).toBe(trigger);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('lifecycle', () => {
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [ModalOpenerHostComponent, NeverOpenedModalComponent]
            });
            overlayContainer = TestBed.inject(OverlayContainer);
            overlayContainerElement = overlayContainer.getContainerElement();
        });

        afterEach(() => overlayContainer.ngOnDestroy());

        it('should tear the dialog down with the component that opened it', async () => {
            vi.useFakeTimers();

            const fixture = TestBed.createComponent(ModalOpenerHostComponent);

            fixture.detectChanges();
            fixture.componentInstance.opener()!.open();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);

            expect(overlayContainerElement.querySelector('.kbq-modal-container')).toBeTruthy();
            expect(document.body.style.overflow).toBe('hidden');

            fixture.componentInstance.showOpener = false;
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-modal-container')).toBeNull();
            expect(document.body.style.overflow).toBe('');

            await vi.runOnlyPendingTimersAsync();
        });

        it('should release a modal that was never opened when its host is destroyed', () => {
            const fixture = TestBed.createComponent(NeverOpenedModalComponent);
            const control = TestBed.inject(KbqModalControlService);

            fixture.detectChanges();

            const modal = fixture.debugElement.query(By.directive(KbqModalComponent)).componentInstance;

            expect(control.hasRegistered(modal)).toBe(true);

            fixture.destroy();

            expect(control.hasRegistered(modal)).toBe(false);
        });
    });

    describe('called from an effect', () => {
        let fixture: ComponentFixture<ModalDrivenByEffectsComponent>;
        let modal: KbqModalComponent;
        let overlayContainer: OverlayContainer;

        const settle = async () => {
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(ANIMATION_DURATION);
            fixture.detectChanges();
        };

        beforeEach(async () => {
            vi.useFakeTimers();
            TestBed.configureTestingModule({ imports: [ModalDrivenByEffectsComponent] });
            overlayContainer = TestBed.inject(OverlayContainer);
            fixture = TestBed.createComponent(ModalDrivenByEffectsComponent);
            await settle();
            modal = fixture.componentInstance.modal();
        });

        afterEach(async () => {
            TestBed.inject(KbqModalService).closeAll();
            await settle();
            overlayContainer.ngOnDestroy();
        });

        it('should not make an effect that creates a dialog create another one', async () => {
            fixture.componentInstance.wantCreated.set(true);
            await settle();

            expect(fixture.componentInstance.runs.create).toBe(1);

            fixture.componentInstance.created!.close();
            await settle();

            expect(fixture.componentInstance.runs.create).toBe(1);
        });

        it('should not make an effect that opens a dialog run again when the user closes it', async () => {
            fixture.componentInstance.wantOpen.set(true);
            await settle();

            expect(modal.kbqVisible()).toBe(true);

            dispatchKeyboardEvent(
                overlayContainer.getContainerElement().querySelector('.kbq-modal-container')!,
                'keydown',
                ESCAPE
            );
            await settle();

            expect(modal.kbqVisible()).toBe(false);
            expect(fixture.componentInstance.runs.open).toBe(1);
        });

        it('should stay openable when an effect closes it', async () => {
            fixture.componentInstance.wantClosed.set(true);
            await settle();

            modal.open();
            await settle();

            expect(modal.kbqVisible()).toBe(true);
            expect(fixture.componentInstance.runs.close).toBe(1);
        });

        it('should stay openable when an effect cancels it', async () => {
            fixture.componentInstance.wantCancelled.set(true);
            await settle();

            modal.open();
            await settle();

            expect(modal.kbqVisible()).toBe(true);
            expect(fixture.componentInstance.runs.cancel).toBe(1);
        });
    });
});

@Injectable()
class TestComponentLevelService {
    action() {
        return true;
    }
}

@Component({
    selector: 'custom-modal-component',
    imports: [KbqModalModule],
    template: `
        <button (click)="componentLevelService.action()">Button</button>
    `
})
export class CustomModalComponent {
    componentLevelService = inject(TestComponentLevelService);
    injector = inject(Injector);
}

@Component({
    selector: 'custom-component',
    imports: [KbqModalModule, KbqButtonModule],
    template: `
        <button kbq-button (click)="open()">Button</button>
    `,
    providers: [
        TestComponentLevelService
    ]
})
export class CustomComponent {
    modalService = inject(KbqModalService);
    injector = inject(Injector);

    open() {
        return this.modalService.open({
            kbqComponent: CustomModalComponent,
            injector: this.injector
        });
    }
}

@Component({
    template: `
        Modal Content
    `
})
class TestModalContentComponent {}

@Component({
    template: `
        <button>Before</button>
        <button cdkFocusInitial data-testid="marked">Marked</button>
    `
})
class ModalWithFocusInitialComponent {}

@Component({
    selector: 'modal-with-caption-content',
    imports: [KbqModalModule],
    template: `
        <kbq-modal-title>
            Title
            <kbq-modal-caption>Caption</kbq-modal-caption>
        </kbq-modal-title>

        <kbq-modal-body>Body</kbq-modal-body>
    `
})
class ModalWithCaptionContentComponent {}

@Component({
    selector: 'modal-with-caption',
    imports: [KbqModalModule],
    template: ``
})
class ModalWithCaptionComponent {
    private readonly modalService = inject(KbqModalService);

    open(): KbqModalRef {
        return this.modalService.open({ kbqComponent: ModalWithCaptionContentComponent });
    }
}

@Component({
    selector: 'modal-without-caption-content',
    imports: [KbqModalModule],
    template: `
        <kbq-modal-title>Title</kbq-modal-title>

        <kbq-modal-body>Body</kbq-modal-body>
    `
})
class ModalWithoutCaptionContentComponent {}

@Component({
    selector: 'modal-without-caption',
    imports: [KbqModalModule],
    template: ``
})
class ModalWithoutCaptionComponent {
    private readonly modalService = inject(KbqModalService);

    open(kbqClosable?: boolean): KbqModalRef {
        return this.modalService.open({ kbqComponent: ModalWithoutCaptionContentComponent, kbqClosable });
    }
}

@Component({
    selector: 'kbq-modal-by-service',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <kbq-modal kbqWrapClassName="__NON_SERVICE_ID_SUFFIX__" [(kbqVisible)]="nonServiceModalVisible" />
        <button kbq-button>focusable button</button>
    `,
    // Testing for service with parent service
    providers: [KbqModalControlService]
})
class ModalByServiceComponent {
    nonServiceModalVisible = false;
}

@Component({
    selector: 'kbq-modal-by-service-from-dropdown',
    imports: [KbqModalModule, KbqDropdownModule, KbqButtonModule],
    template: `
        <kbq-modal kbqWrapClassName="__NON_SERVICE_ID_SUFFIX__" [(kbqVisible)]="nonServiceModalVisible" />
        <button class="template-button" kbq-button [kbqDropdownTriggerFor]="dropdown">Open modal from dropdown</button>
        <kbq-dropdown #dropdown>
            <ng-template kbqDropdownContent>
                <button kbq-dropdown-item (click)="showConfirm()">open Component Modal</button>
            </ng-template>
        </kbq-dropdown>
    `,
    providers: [KbqModalControlService]
})
class ModalByServiceFromDropdownComponent {
    modalControlService = inject(KbqModalControlService);
    modalService = inject(KbqModalService);

    nonServiceModalVisible = false;
    kbqOkText = 'Save';

    showConfirm() {
        this.modalService.success({
            kbqSize: ModalSize.Small,
            kbqRestoreFocus: false,
            kbqMaskClosable: true,
            kbqContent: 'Save all?',
            kbqOkText: this.kbqOkText,
            kbqCancelText: 'Cancel'
        });
    }
}

@Component({
    selector: 'kbq-modal-no-module',
    // Intentionally does NOT import KbqModalModule
    imports: [],
    template: ``
})
class ModalWithoutModuleComponent {
    readonly modal = inject(KbqModalService);
}

@Component({
    selector: 'modal-driven-by-effects',
    imports: [KbqModalModule],
    template: `
        <kbq-modal [kbqTitle]="'Declarative title'" [(kbqVisible)]="visible">Declarative content</kbq-modal>
    `
})
class ModalDrivenByEffectsComponent {
    readonly modal = viewChild.required(KbqModalComponent);
    readonly wantCreated = signal(false);
    readonly wantOpen = signal(false);
    readonly wantClosed = signal(false);
    readonly wantCancelled = signal(false);
    readonly runs = { create: 0, open: 0, close: 0, cancel: 0 };

    visible = false;
    created?: KbqModalRef;

    private readonly modalService = inject(KbqModalService);

    constructor() {
        effect(() => {
            if (!this.wantCreated() || this.runs.create >= 5) return;

            this.runs.create++;
            this.created = this.modalService.create({ kbqContent: 'Created content' });
        });

        effect(() => {
            if (!this.wantOpen()) return;

            this.runs.open++;
            this.modal().open();
        });

        effect(() => {
            if (!this.wantClosed()) return;

            this.runs.close++;
            this.modal().close();
        });

        effect(() => {
            if (!this.wantCancelled()) return;

            this.runs.cancel++;
            this.modal().triggerCancel();
        });
    }
}

@Component({
    selector: 'declarative-modal',
    imports: [KbqModalModule, KbqButtonModule],
    template: `
        <button #trigger kbq-button (click)="visible = true">Open</button>
        <kbq-modal
            [kbqCancelText]="'Cancel'"
            [kbqCloseByESC]="closeByESC"
            [kbqMask]="true"
            [kbqMaskClosable]="true"
            [kbqOkText]="'Ok'"
            [kbqTitle]="'Declarative title'"
            [(kbqVisible)]="visible"
            (kbqOnCancel)="cancelCount = cancelCount + 1"
            (kbqOnOk)="okCount = okCount + 1"
        >
            Declarative content
        </kbq-modal>
    `
})
class DeclarativeModalComponent {
    readonly trigger = viewChild.required('trigger', { read: ElementRef });

    visible = false;
    closeByESC = true;
    cancelCount = 0;
    okCount = 0;
}

@Component({
    selector: 'modal-opener',
    imports: [],
    template: ``
})
class ModalOpenerComponent {
    private readonly modalService = inject(KbqModalService);
    private readonly injector = inject(Injector);

    open(): KbqModalRef {
        return this.modalService.create({ injector: this.injector, kbqContent: 'content' });
    }
}

/** Turns motion off for its own subtree only, as a feature module or a lazy route would. */
@Component({
    selector: 'modal-opener-without-motion',
    template: ``,
    providers: [{ provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } }]
})
class ModalOpenerWithoutMotion extends ModalOpenerComponent {}

@Component({
    selector: 'modal-opener-host',
    imports: [ModalOpenerComponent],
    template: `
        @if (showOpener) {
            <modal-opener />
        }
    `
})
class ModalOpenerHostComponent {
    readonly opener = viewChild(ModalOpenerComponent);

    showOpener = true;
}

@Component({
    selector: 'never-opened-modal',
    imports: [KbqModalModule],
    template: `
        <kbq-modal [kbqTitle]="'Never shown'" />
    `
})
class NeverOpenedModalComponent {}

const TEST_DIRECTIVES = [
    ModalByServiceComponent,
    ModalByServiceFromDropdownComponent,
    TestModalContentComponent
];

@NgModule({
    imports: [
        KbqModalModule,
        KbqButtonModule,
        KbqDropdownModule,
        ...TEST_DIRECTIVES
    ],
    exports: TEST_DIRECTIVES
})
class ModalTestModule {}

import { FocusOrigin } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Injectable,
    Injector,
    NgModule,
    Provider,
    Type,
    viewChild
} from '@angular/core';
import {
    ComponentFixture,
    discardPeriodicTasks,
    fakeAsync,
    flush,
    TestBed,
    inject as testingInject,
    tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    ENTER,
    ESCAPE,
    KBQ_WINDOW,
    ruRULocaleData,
    TAB,
    ThemePalette
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
    TestBed.configureTestingModule({ imports: [component, NoopAnimationsModule], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

describe('KbqModal', () => {
    describe('created by service', () => {
        let fixture: ComponentFixture<ModalByServiceComponent>;
        let buttonElement: HTMLButtonElement;

        let modalService: KbqModalService;
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
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

        afterEach(fakeAsync(() => {
            // wait all openModals to be closed to clean up the ModalManager as it is globally static
            modalService.closeAll();
            fixture.detectChanges();
            tick(ANIMATION_DURATION * 2);
        }));

        it('should trigger afterOpen and have the correct openModals length', fakeAsync(() => {
            const spy = jest.fn();
            const modalRef = modalService.create();

            modalRef.afterOpen.subscribe(spy);

            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(modalService.openModals.indexOf(modalRef)).toBeGreaterThan(-1);
            expect(modalService.openModals.length).toBe(1);
        }));

        // The emitter passed in the options used to *become* instance.kbqAfterOpen through
        // `Object.assign`, so a single emitter served both subscriptions. It is mirrored now.
        it('should mirror the open event onto the kbqAfterOpen emitter passed in the options', fakeAsync(() => {
            const spy = jest.fn();
            const kbqAfterOpen = new EventEmitter<void>();
            const modalRef = modalService.create({ kbqAfterOpen });

            kbqAfterOpen.subscribe(spy);

            expect(kbqAfterOpen).not.toBe(modalRef.getInstance().kbqAfterOpen);

            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledTimes(1);
        }));

        it('renders the custom scrollbar on the body', fakeAsync(() => {
            modalService.create({ kbqContent: 'Test content' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const body = overlayContainerElement.querySelector('.kbq-modal-body')!;

            expect(body.classList).toContain('kbq-scrollbar-viewport');
            expect(body.classList).toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');

            discardPeriodicTasks();
        }));

        it('should fire onClick events', fakeAsync(() => {
            const spy = jest.fn();
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
            tick(ANIMATION_DURATION);
            expect(spy).not.toHaveBeenCalled();

            const button = overlayContainerElement.querySelector('button.kbq-primary') as HTMLButtonElement;

            button.click();

            fixture.detectChanges();
            expect(spy).toHaveBeenCalled();
        }));

        it('should trigger both afterClose/kbqAfterClose and have the correct openModals length', fakeAsync(() => {
            const spy = jest.fn();
            const kbqAfterClose = new EventEmitter<void>();
            const modalRef = modalService.create({ kbqAfterClose });

            modalRef.afterClose.subscribe(spy);
            kbqAfterClose.subscribe(spy);

            fixture.detectChanges();
            tick(ANIMATION_DURATION);
            modalRef.close();
            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(modalService.openModals.indexOf(modalRef)).toBe(-1);
            expect(modalService.openModals.length).toBe(0);
        }));

        it('should return/receive with/without result data', fakeAsync(() => {
            const spy = jest.fn();
            const modalRef = modalService.success();

            modalRef.afterClose.subscribe(spy);
            fixture.detectChanges();
            tick(ANIMATION_DURATION);
            modalRef.destroy();
            expect(spy).not.toHaveBeenCalled();
            tick(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledWith(undefined);
        }));

        it('should return/receive with result data', fakeAsync(() => {
            const result = { data: 'Fake Error' };
            const spy = jest.fn();
            const modalRef = modalService.delete();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);
            modalRef.destroy(result);
            modalRef.afterClose.subscribe(spy);
            expect(spy).not.toHaveBeenCalled();
            tick(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledWith(result);
        }));

        it('should close all opened modals (include non-service modals)', fakeAsync(() => {
            const spy = jest.fn();
            const modalMethods = ['create', 'delete', 'success'];
            const uniqueId = (name: string) => `__${name}_ID_SUFFIX__`;
            const queryOverlayElement = (name: string) =>
                overlayContainerElement.querySelector(`.${uniqueId(name)}`) as HTMLElement;

            modalService.afterAllClose.subscribe(spy);

            fixture.componentInstance.nonServiceModalVisible = true; // Show non-service modal
            modalMethods.forEach((method) => modalService[method]({ kbqWrapClassName: uniqueId(method) })); // Service modals

            fixture.detectChanges();
            tick(ANIMATION_DURATION);
            // Cover non-service modal for later checking
            modalMethods.concat('NON_SERVICE').forEach((method) => {
                expect(queryOverlayElement(method).style.display).not.toBe('none');
            });
            expect(modalService.openModals.length).toBe(4);

            modalService.closeAll();
            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();
            tick(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalled();
            expect(modalService.openModals.length).toBe(0);
        }));

        it('should give the close button an accessible name', fakeAsync(() => {
            // The close button lives in the header, which is rendered only for a titled modal.
            modalService.create({ kbqClosable: true, kbqTitle: 'Title' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const closeButton = overlayContainerElement.querySelector('.kbq-modal-close')!;

            // The button holds an icon only, so without this it has no accessible name at all.
            expect(closeButton.getAttribute('aria-label')).toBe(ruRULocaleData.a11y.close);

            flush();
        }));

        it('should modal not be registered twice', fakeAsync(() => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            (modalService as any).modalControl.registerModal(modalRef);
            tick(ANIMATION_DURATION);
            expect(modalService.openModals.length).toBe(1);
        }));

        it('should trigger kbqOnOk/kbqOnCancel', () => {
            const spyOk = jest.fn();
            const spyCancel = jest.fn();
            const modalRef: KbqModalRef = modalService.create({
                kbqOnOk: spyOk,
                kbqOnCancel: spyCancel
            });

            fixture.detectChanges();

            modalRef.triggerOk();
            expect(spyOk).toHaveBeenCalled();

            modalRef.triggerCancel();
            expect(spyCancel).toHaveBeenCalled();
        });

        it('should process loading flag', fakeAsync(() => {
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
            tick(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-progress').length).toBe(1);
        }));

        it('should process show flag', fakeAsync(() => {
            const isShown = false;
            const modalRef = modalService.create({
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: ThemePalette.Primary,
                        show: () => isShown
                    }
                ]
            });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-primary').length).toBe(0);
        }));

        it('should process disable flag', fakeAsync(() => {
            const isDisabled = true;
            const modalRef = modalService.create({
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: ThemePalette.Primary,
                        disabled: () => isDisabled
                    }
                ]
            });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('[disabled]').length).toBe(1);
        }));

        it('should called function on hotkey ctrl+enter. kbqFooter is array ', fakeAsync(() => {
            const spyOk = jest.fn();
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
            tick(ANIMATION_DURATION);

            const event = document.createEvent('KeyboardEvent') as any;

            event.initKeyboardEvent('keydown', true, true, window, 0, 0, 0, '', false);

            Object.defineProperties(event, {
                keyCode: { get: () => ENTER },
                ctrlKey: { get: () => true }
            });

            modalRef.getElement().dispatchEvent(event);

            fixture.detectChanges();
            tick(ANIMATION_DURATION);
            expect(spyOk).toHaveBeenCalled();
        }));

        it('should called function on hotkey ctrl+enter. modal type is confirm ', () => {
            const spyOk = jest.fn();
            const modalRef = modalService.success({
                kbqContent: 'Сохранить сделанные изменения?',
                kbqOkText: 'Сохранить',
                kbqCancelText: 'Отмена',
                kbqOnOk: spyOk
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

        it('should show the footer, when kbqFooter is specified', fakeAsync(() => {
            const modalRef = modalService.create({
                kbqFooter: [
                    {
                        label: 'button 1',
                        type: 'primary'
                    }
                ]
            });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        }));

        it('should show the footer, when kbqOkText is specified', fakeAsync(() => {
            const modalRef = modalService.create({
                kbqOkText: 'OK'
            });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        }));

        it('should show the footer, when kbqCancelText is specified', fakeAsync(() => {
            const modalRef = modalService.create({
                kbqCancelText: 'OK'
            });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        }));

        it('should not show the footer, when kbqOkText, kbqOkCancel and kbqFooter are not specified', fakeAsync(() => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(0);
        }));

        it('should show only one mask at a time', fakeAsync(() => {
            fixture.componentInstance.nonServiceModalVisible = true; // Show non-service modal
            const secondModal = modalService.create();

            fixture.detectChanges();
            // The scrollbar's animation-frame loop prevents `flush()` from draining the queue.
            tick(ANIMATION_DURATION);
            fixture.detectChanges();

            expect(document.querySelectorAll('.kbq-modal-mask').length).toEqual(1);

            secondModal.close();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);
            fixture.detectChanges();

            expect(document.querySelectorAll('.kbq-modal-mask').length).toEqual(1);

            discardPeriodicTasks();
        }));

        it('should process kbqPreventFocusRestoring flag set to true', fakeAsync(() => {
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
            tick(ANIMATION_DURATION);

            expect(document.activeElement).not.toBe(buttonElement);

            modalRef.close();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(document.activeElement).not.toBe(buttonElement);

            flush();
        }));

        it('should process kbqPreventFocusRestoring flag set to false', fakeAsync(() => {
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
            tick(ANIMATION_DURATION);

            expect(document.activeElement).not.toBe(buttonElement);

            modalRef.close();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(document.activeElement).toBe(buttonElement);

            flush();
        }));

        it('should set focus inside modal when opened by dropdown', fakeAsync(() => {
            const fixtureComponent = TestBed.createComponent(ModalByServiceFromDropdownComponent);
            const buttonElement = fixtureComponent.debugElement.nativeElement.querySelector('button');

            fixtureComponent.detectChanges();

            expect(document.activeElement).not.toBe(buttonElement);

            buttonElement.click();
            fixtureComponent.detectChanges();
            tick();

            const dropdownItems = fixtureComponent.debugElement
                .queryAll(By.directive(KbqDropdownItem))
                .map((debugElement) => debugElement.nativeElement as HTMLButtonElement);

            // Directly invoke showConfirm() to open the modal (simulating dropdown item click)
            // without triggering the dropdown's focus restoration to the trigger.
            fixtureComponent.componentInstance.showConfirm();
            fixtureComponent.detectChanges();
            tick();

            const activeElement: HTMLButtonElement | null = document.activeElement as HTMLButtonElement;

            expect(activeElement).not.toBe(buttonElement);
            expect(dropdownItems.length).toBeGreaterThan(0);
            expect(activeElement).not.toBe(dropdownItems[0]);
            expect(activeElement).toBeTruthy();
            expect(activeElement.textContent?.trim()).toEqual(fixtureComponent.componentInstance.kbqOkText);
        }));

        it('should restore focus on previous element on close with correct focus origin', fakeAsync(() => {
            const testFocusRestoreFor = (origin: FocusOrigin) => {
                expect(document.activeElement).toBe(buttonElement);

                const modalRef = modalService.create({
                    kbqRestoreFocus: true,
                    kbqFooter: [{ label: 'button 1', type: 'primary' }]
                });

                fixture.detectChanges();

                expect(document.activeElement).not.toBe(buttonElement);

                modalRef.close();
                fixture.detectChanges();
                // The scrollbar's animation-frame loop prevents `flush()` from draining the queue.
                tick(ANIMATION_DURATION);

                expect(document.activeElement).toBe(buttonElement);
                expect(document.activeElement?.classList).toContain(`cdk-${origin}-focused`);

                buttonElement.blur();
                fixture.detectChanges();
                flush();
            };

            buttonElement.focus();
            fixture.detectChanges();
            flush();

            testFocusRestoreFor('program');

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(document, 'keydown', TAB);
            buttonElement.focus();
            testFocusRestoreFor('keyboard');

            discardPeriodicTasks();
        }));

        it('should carry dialog semantics named by its title', fakeAsync(() => {
            modalService.create({ kbqTitle: 'Dialog title', kbqCaption: 'Dialog caption' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            expect(dialog.getAttribute('role')).toBe('dialog');
            expect(dialog.getAttribute('aria-modal')).toBe('true');
            expect(dialog.getAttribute('tabindex')).toBe('-1');

            const labelledBy = dialog.getAttribute('aria-labelledby')!;
            const describedBy = dialog.getAttribute('aria-describedby')!;

            expect(overlayContainerElement.querySelector(`#${labelledBy}`)!.textContent).toContain('Dialog title');
            expect(overlayContainerElement.querySelector(`#${describedBy}`)!.textContent).toContain('Dialog caption');
            expect(dialog.getAttribute('aria-label')).toBeNull();

            flush();
        }));

        it('should fall back to kbqAriaLabel when the dialog has no title', fakeAsync(() => {
            modalService.create({ kbqContent: 'text', kbqAriaLabel: 'Named by option' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            expect(dialog.getAttribute('aria-labelledby')).toBeNull();
            expect(dialog.getAttribute('aria-label')).toBe('Named by option');

            flush();
        }));

        it('should take the page behind the dialog out of the accessibility tree', fakeAsync(() => {
            fixture.detectChanges();

            const background = Array.from(document.body.children).find((child) =>
                child.contains(fixture.nativeElement)
            )!;

            expect(background.hasAttribute('inert')).toBe(false);

            const modalRef = modalService.create({ kbqContent: 'text' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(background.hasAttribute('inert')).toBe(true);
            // The overlays themselves stay reachable, dialogs and anything opened from them alike.
            expect(overlayContainerElement.hasAttribute('inert')).toBe(false);

            modalRef.close();
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(background.hasAttribute('inert')).toBe(false);

            flush();
        }));

        it('should keep only the topmost dialog reachable when modals stack', fakeAsync(() => {
            const first = modalService.create({ kbqContent: 'first' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const second = modalService.create({ kbqContent: 'second' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(first.getElement().querySelector('[inert]')).toBeTruthy();
            expect(second.getElement().querySelector('[inert]')).toBeNull();

            second.close();
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(first.getElement().querySelector('[inert]')).toBeNull();

            flush();
            discardPeriodicTasks();
        }));

        it('should move focus into a dialog that holds no button at all', fakeAsync(() => {
            buttonElement.focus();

            const modalRef = modalService.create({ kbqContent: 'text' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getElement().querySelectorAll('button').length).toBe(0);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            expect(document.activeElement).toBe(dialog);

            flush();
        }));

        it('should trap focus on the dialog element itself', fakeAsync(() => {
            modalService.create({ kbqTitle: 'Trapped', kbqOkText: 'Ok' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            // The trap wraps the dialog, not the inner content wrapper, so the dialog element can
            // be the focus target for `kbqAutoFocus: 'dialog'` and still be inside the trap.
            expect(dialog.previousElementSibling!.classList).toContain('cdk-focus-trap-anchor');
            expect(dialog.nextElementSibling!.classList).toContain('cdk-focus-trap-anchor');

            flush();
        }));

        it('should focus the dialog itself when kbqAutoFocus is "dialog"', fakeAsync(() => {
            modalService.create({ kbqTitle: 'Long read', kbqContent: 'text', kbqAutoFocus: 'dialog' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(document.activeElement).toBe(overlayContainerElement.querySelector('.kbq-modal-container'));

            flush();
        }));

        it('should leave focus alone when kbqAutoFocus is false', fakeAsync(() => {
            buttonElement.focus();

            modalService.create({ kbqTitle: 'Untouched', kbqAutoFocus: false });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(document.activeElement).toBe(buttonElement);

            flush();
        }));

        it('should honour kbqCloseByESC on the service path', fakeAsync(() => {
            const modalRef = modalService.create({ kbqTitle: 'Kept', kbqCloseByESC: false });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            dispatchKeyboardEvent(modalRef.getElement(), 'keydown', ESCAPE);
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getInstance().kbqVisible).toBe(true);

            flush();
        }));

        it('should route Escape through kbqOnCancel on the service path', fakeAsync(() => {
            const spyCancel = jest.fn();
            const modalRef = modalService.create({ kbqTitle: 'Cancellable', kbqOnCancel: spyCancel });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            dispatchKeyboardEvent(modalRef.getElement(), 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(spyCancel).toHaveBeenCalled();
            expect(modalRef.getInstance().kbqVisible).toBe(false);

            tick(ANIMATION_DURATION);
            flush();
        }));

        it('should let a kbqOnCancel callback veto Escape', fakeAsync(() => {
            const modalRef = modalService.create({ kbqTitle: 'Vetoed', kbqOnCancel: () => false });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            dispatchKeyboardEvent(modalRef.getElement(), 'keydown', ESCAPE);
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(modalRef.getInstance().kbqVisible).toBe(true);

            flush();
        }));

        it('should build the dialog class list from the class name, the size and the animation', fakeAsync(() => {
            const modalRef = modalService.create({ kbqClassName: 'custom-modal', kbqSize: ModalSize.Small });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const dialog = overlayContainerElement.querySelector('.kbq-modal-container')!;

            expect(dialog.classList).toContain('custom-modal');
            expect(dialog.classList).toContain('kbq-modal_small');
            expect(dialog.classList).not.toContain('zoom-enter');

            expect(modalRef).toBeTruthy();
            flush();
        }));
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

        const expectNoViolations = async (options: IModalOptionsForService) => {
            modalService.create(options);
            fixture.detectChanges();

            expect(await axe(overlayContainerElement)).toHaveNoViolations();
        };

        it('should have no violations for a default dialog', async () => {
            await expectNoViolations({
                kbqTitle: 'Default',
                kbqCaption: 'Caption',
                kbqContent: 'text',
                kbqOkText: 'Ok',
                kbqCancelText: 'Cancel'
            });
        });

        it('should have no violations for an untitled dialog named by kbqAriaLabel', async () => {
            await expectNoViolations({ kbqContent: 'text', kbqAriaLabel: 'Simple dialog' });
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
        it('should throw error if custom parent injector not provided for feature service', () => {
            const fixture = createComponent(CustomComponent);

            try {
                fixture.componentInstance.modalService.open({
                    kbqComponent: CustomModalComponent
                });
            } catch (error) {
                expect(error.message.includes('NullInjectorError')).toBeTruthy();
            }
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
        const closeModal = (fixture: ComponentFixture<unknown>, modalRef: KbqModalRef) => {
            modalRef.close();
            fixture.detectChanges();
            tick(ANIMATION_DURATION * 2);
        };

        it('should project the caption into the header, below the title', fakeAsync(() => {
            const fixture = createComponent(ModalWithCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const headerContent = document.querySelector('.kbq-modal-header > .kbq-modal-header-content')!;
            const title = headerContent.querySelector('.kbq-modal-title')!;
            const caption = headerContent.querySelector('.kbq-modal-caption')!;

            expect(title.textContent).toContain('Title');
            expect(caption.textContent).toContain('Caption');
            expect(title.nextElementSibling).toBe(caption);

            closeModal(fixture, modalRef);
        }));

        it('should name and describe the dialog from the composed title and caption', fakeAsync(() => {
            const fixture = createComponent(ModalWithCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const dialog = document.querySelector('.kbq-modal-container')!;
            const labelledBy = dialog.getAttribute('aria-labelledby')!;
            const describedBy = dialog.getAttribute('aria-describedby')!;

            expect(document.querySelector(`#${labelledBy}`)!.textContent).toContain('Title');
            expect(document.querySelector(`#${describedBy}`)!.classList).toContain('kbq-modal-caption');
            expect(document.querySelector(`#${describedBy}`)!.textContent).toContain('Caption');

            closeModal(fixture, modalRef);
        }));

        it('should leave aria-describedby off a composed dialog with no caption', fakeAsync(() => {
            const fixture = createComponent(ModalWithoutCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(document.querySelector('.kbq-modal-container')!.getAttribute('aria-describedby')).toBeNull();

            closeModal(fixture, modalRef);
        }));

        it('should cast the top overflow shadow from the header holding the caption', fakeAsync(() => {
            const fixture = createComponent(ModalWithCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            const header = document.querySelector<HTMLElement>('.kbq-modal-header')!;

            expect(header.style.boxShadow).toBeFalsy();

            modalRef.getInstance().bodyOverflow.set({ top: true, bottom: false });
            fixture.detectChanges();

            expect(header.style.boxShadow).toBe('var(--kbq-shadow-overflow-normal-bottom)');

            closeModal(fixture, modalRef);
        }));
    });

    describe('with reduced motion', () => {
        // jsdom has no matchMedia at all, so the reduced-motion branch is unreachable without this.
        const reducedMotion: Provider = {
            provide: KBQ_WINDOW,
            useValue: { ...window, matchMedia: () => ({ matches: true }) }
        };

        it('should not report the dialog open before its view exists', fakeAsync(() => {
            // Deliberately no autoDetectChanges: `create()` has to run before the first change
            // detection, which is what it does on the imperative path in an application.
            TestBed.configureTestingModule({ imports: [ModalOpenerComponent], providers: [reducedMotion] });

            const fixture = TestBed.createComponent(ModalOpenerComponent);

            let bodyAtAfterOpen: Element | null | undefined;

            fixture.componentInstance
                .open()
                .afterOpen.subscribe(() => (bodyAtAfterOpen = document.querySelector('.kbq-modal-body')));

            tick(ANIMATION_DURATION);
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            // There is no animation to wait for under reduced motion, but settling synchronously
            // reported the dialog open before its template had rendered — so the scrollbar flash
            // hanging off afterOpen, and anything a consumer does there, found nothing to act on.
            expect(bodyAtAfterOpen).toBeTruthy();

            flush();
        }));
    });

    describe('KbqModalService providedIn root', () => {
        it('should inject KbqModalService without importing KbqModalModule', () => {
            expect(TestBed.inject(KbqModalService)).toBeTruthy();
        });

        it('should track openModals for modals created without KbqModalModule', fakeAsync(() => {
            const fixture = createComponent(ModalWithoutModuleComponent);
            const rootService = TestBed.inject(KbqModalService);

            fixture.componentInstance.modal.create();
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(rootService.openModals.length).toBe(1);
        }));

        it('should emit afterAllClose when modal created without KbqModalModule is closed', fakeAsync(() => {
            const fixture = createComponent(ModalWithoutModuleComponent);
            const spy = jest.fn();

            TestBed.inject(KbqModalService).afterAllClose.subscribe(spy);

            const ref = fixture.componentInstance.modal.create();

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            ref.close();
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(spy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('declarative path', () => {
        let fixture: ComponentFixture<DeclarativeModalComponent>;
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [DeclarativeModalComponent, NoopAnimationsModule] });
            fixture = TestBed.createComponent(DeclarativeModalComponent);
            overlayContainer = TestBed.inject(OverlayContainer);
            overlayContainerElement = overlayContainer.getContainerElement();
        });

        afterEach(() => overlayContainer.ngOnDestroy());

        const open = () => {
            fixture.detectChanges();
            fixture.componentInstance.visible = true;
            fixture.detectChanges();
            tick(ANIMATION_DURATION);
            fixture.detectChanges();
        };

        const query = <T extends Element>(selector: string) => overlayContainerElement.querySelector<T>(selector)!;

        it('should close on the close button', fakeAsync(() => {
            open();

            query<HTMLButtonElement>('.kbq-modal-close').click();
            fixture.detectChanges();

            expect(fixture.componentInstance.visible).toBe(false);
            expect(fixture.componentInstance.cancelCount).toBe(1);

            tick(ANIMATION_DURATION);
            flush();
        }));

        it('should close on a click on the mask', fakeAsync(() => {
            open();

            dispatchMouseEvent(query('.kbq-modal-wrap'), 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.visible).toBe(false);

            tick(ANIMATION_DURATION);
            flush();
        }));

        it('should close on the predefined OK button', fakeAsync(() => {
            open();

            const [ok] = Array.from(query('.kbq-modal-footer').querySelectorAll('button'));

            ok.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.visible).toBe(false);
            expect(fixture.componentInstance.okCount).toBe(1);

            tick(ANIMATION_DURATION);
            flush();
        }));

        it('should close on Escape and run kbqOnCancel first', fakeAsync(() => {
            open();

            dispatchKeyboardEvent(query('.kbq-modal-container'), 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(fixture.componentInstance.cancelCount).toBe(1);
            expect(fixture.componentInstance.visible).toBe(false);

            tick(ANIMATION_DURATION);
            flush();
        }));

        it('should ignore Escape when kbqCloseByESC is false', fakeAsync(() => {
            fixture.componentInstance.closeByESC = false;
            open();

            dispatchKeyboardEvent(query('.kbq-modal-container'), 'keydown', ESCAPE);
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(fixture.componentInstance.visible).toBe(true);

            flush();
        }));

        it('should move focus into the dialog and back to the trigger', fakeAsync(() => {
            fixture.detectChanges();

            const trigger = fixture.componentInstance.trigger().nativeElement;

            trigger.focus();
            expect(document.activeElement).toBe(trigger);

            fixture.componentInstance.visible = true;
            fixture.detectChanges();
            tick(ANIMATION_DURATION);
            fixture.detectChanges();

            expect(document.activeElement).not.toBe(trigger);
            expect(query('.kbq-modal-container').contains(document.activeElement)).toBe(true);

            fixture.componentInstance.visible = false;
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(document.activeElement).toBe(trigger);

            flush();
        }));
    });

    describe('lifecycle', () => {
        let overlayContainer: OverlayContainer;
        let overlayContainerElement: HTMLElement;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [ModalOpenerHostComponent, NeverOpenedModalComponent, NoopAnimationsModule]
            });
            overlayContainer = TestBed.inject(OverlayContainer);
            overlayContainerElement = overlayContainer.getContainerElement();
        });

        afterEach(() => overlayContainer.ngOnDestroy());

        it('should tear the dialog down with the component that opened it', fakeAsync(() => {
            const fixture = TestBed.createComponent(ModalOpenerHostComponent);

            fixture.detectChanges();
            fixture.componentInstance.opener()!.open();
            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expect(overlayContainerElement.querySelector('.kbq-modal-container')).toBeTruthy();
            expect(document.body.style.overflow).toBe('hidden');

            fixture.componentInstance.showOpener = false;
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-modal-container')).toBeNull();
            expect(document.body.style.overflow).toBe('');

            flush();
        }));

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

    open(): KbqModalRef {
        return this.modalService.open({ kbqComponent: ModalWithoutCaptionContentComponent });
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
        NoopAnimationsModule,
        ...TEST_DIRECTIVES
    ],
    exports: TEST_DIRECTIVES
})
class ModalTestModule {}

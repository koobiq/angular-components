import { FocusOrigin } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
    Component,
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
import { KbqButtonModule } from '@koobiq/components/button';
import {
    createMouseEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    ENTER,
    ESCAPE,
    KbqComponentColors,
    ruRULocaleData,
    TAB,
    ThemePalette
} from '@koobiq/components/core';
import { KbqDropdownItem, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import { KbqModalComponent } from './modal.component';
import { KbqModalModule } from './modal.module';
import { KbqModalService } from './modal.service';
import { MODAL_ANIMATE_DURATION, ModalSize, OnClickCallback } from './modal.type';

const ANIMATION_DURATION = MODAL_ANIMATE_DURATION * 2;

const animationEnd = () => new Promise((resolve) => setTimeout(resolve, MODAL_ANIMATE_DURATION));

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });
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

        it('should trigger both afterOpen/kbqAfterOpen and have the correct openModals length', fakeAsync(() => {
            const spy = vi.fn();
            const kbqAfterOpen = new EventEmitter<void>();
            const modalRef = modalService.create({ kbqAfterOpen });

            modalRef.afterOpen.subscribe(spy);
            kbqAfterOpen.subscribe(spy);

            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(ANIMATION_DURATION);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(modalService.openModals.indexOf(modalRef)).toBeGreaterThan(-1);
            expect(modalService.openModals.length).toBe(1);
        }));

        // Both elements scroll, so both have to be driven by the custom scrollbar: a native one takes
        // layout width the moment it appears and shifts everything it narrows.
        const expectCustomScrollbars = () => {
            ['.kbq-modal-wrap', '.kbq-modal-body'].forEach((selector) => {
                const { classList } = overlayContainerElement.querySelector(selector)!;

                expect(classList).toContain('kbq-scrollbar-viewport');
                expect(classList).toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');
            });
        };

        it('renders the custom scrollbar on every scrolling element', fakeAsync(() => {
            modalService.create({ kbqContent: 'Test content' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expectCustomScrollbars();

            discardPeriodicTasks();
        }));

        it('renders the custom scrollbar on every scrolling element of a confirm modal', fakeAsync(() => {
            modalService.confirm({ kbqContent: 'Test content' });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            expectCustomScrollbars();

            discardPeriodicTasks();
        }));

        it('should fire onClick events', fakeAsync(() => {
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
            tick(ANIMATION_DURATION);
            expect(spy).not.toHaveBeenCalled();

            const button = overlayContainerElement.querySelector('button.kbq-primary') as HTMLButtonElement;

            button.click();

            fixture.detectChanges();
            expect(spy).toHaveBeenCalled();
        }));

        it('should trigger both afterClose/kbqAfterClose and have the correct openModals length', fakeAsync(() => {
            const spy = vi.fn();
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
            const spy = vi.fn();
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
            const spy = vi.fn();
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
            const spy = vi.fn();
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

        it('should trigger nzOnOk/nzOnCancel', () => {
            const spyOk = vi.fn();
            const spyCancel = vi.fn();
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
            const spyOk = vi.fn();
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

        const openMaskClosableModal = (): HTMLElement => {
            const modalRef = modalService.create({ kbqMaskClosable: true });

            fixture.detectChanges();
            tick(ANIMATION_DURATION);

            return modalRef.getElement().querySelector<HTMLElement>('.kbq-modal-wrap')!;
        };

        const clickMask = (mask: HTMLElement, button: number) => {
            dispatchMouseEvent(mask, 'mousedown', 0, 0, createMouseEvent('mousedown', 0, 0, button));

            fixture.detectChanges();
            tick(ANIMATION_DURATION);
        };

        it('should close on a primary button click on the mask', fakeAsync(() => {
            clickMask(openMaskClosableModal(), 0);

            expect(modalService.openModals.length).toBe(0);

            discardPeriodicTasks();
        }));

        // The sidepanel closes on the overlay backdrop's `click`, which the right button never fires.
        it('should not close on a right button click on the mask', fakeAsync(() => {
            clickMask(openMaskClosableModal(), 2);

            expect(modalService.openModals.length).toBe(1);

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

    describe('declared in a template', () => {
        // One input per modal, so a member fed from the wrong input stays at its default.
        const boundInputs: [keyof KbqModalComponent, unknown][] = [
            ['kbqModalType', 'confirm'],
            ['kbqComponent', TestModalContentComponent],
            ['kbqContent', 'Content'],
            ['kbqFooter', 'Footer'],
            ['kbqWidth', 320],
            ['kbqSize', ModalSize.Large],
            ['kbqWrapClassName', 'wrap-class'],
            ['kbqClassName', 'container-class'],
            ['kbqStyle', { width: '1px' }],
            ['kbqTitle', 'Title'],
            ['kbqCaption', 'Caption'],
            ['kbqCloseByESC', false],
            ['kbqClosable', false],
            ['kbqMask', false],
            ['kbqMaskClosable', true],
            ['kbqMaskStyle', { opacity: '0' }],
            ['kbqBodyStyle', { padding: '0' }],
            ['kbqOkText', 'OK'],
            ['kbqOkType', KbqComponentColors.Theme],
            ['kbqRestoreFocus', false],
            ['kbqOkLoading', true],
            ['kbqOnOk', () => false],
            ['kbqCancelText', 'Cancel'],
            ['kbqCancelLoading', true],
            ['kbqOnCancel', () => false],
            ['kbqGetContainer', document.createElement('div')]
        ];

        it.each(boundInputs)('should hand a bound %s over to its member', async (name, value) => {
            const fixture = TestBed.createComponent(KbqModalComponent);

            fixture.componentRef.setInput(name, value);
            await fixture.whenStable();

            expect(fixture.componentInstance[name]).toBe(value);
        });

        it('should open and close through [(kbqVisible)]', async () => {
            const fixture = TestBed.createComponent(ModalInTemplate);
            const host = fixture.componentInstance;

            await fixture.whenStable();

            const modal = host.modal();
            const wrap = modal.getElement().querySelector<HTMLElement>('.kbq-modal-wrap')!;

            expect(wrap.style.display).toBe('none');

            host.visible.set(true);
            await fixture.whenStable();

            expect(modal.kbqVisible).toBe(true);
            expect(wrap.style.display).toBe('');

            await animationEnd();
            expect(host.afterOpen).toHaveBeenCalled();
            host.beforeClose.mockClear();
            host.afterClose.mockClear();

            dispatchKeyboardEvent(modal.getElement(), 'keydown', ESCAPE);

            expect(host.visible()).toBe(false);
            expect(host.beforeClose).toHaveBeenCalled();

            await fixture.whenStable();
            await animationEnd();
            await fixture.whenStable();

            expect(host.afterClose).toHaveBeenCalled();
            expect(wrap.style.display).toBe('none');
        });

        it('should emit kbqOnOk and kbqOnCancel when no callback is bound', async () => {
            const fixture = TestBed.createComponent(ModalInTemplate);
            const host = fixture.componentInstance;

            host.visible.set(true);
            await fixture.whenStable();

            const [ok, cancel] = Array.from(host.modal().getKbqFooter().querySelectorAll('button'));

            ok.click();
            cancel.click();

            expect(host.ok).toHaveBeenCalledTimes(1);
            expect(host.cancel).toHaveBeenCalledTimes(1);
            expect(host.visible()).toBe(true);
        });

        it('should call a bound kbqOnOk callback instead of emitting, and close', async () => {
            const fixture = TestBed.createComponent(ModalInTemplate);
            const host = fixture.componentInstance;
            const callback = vi.fn();

            host.okCallback.set(callback);
            host.visible.set(true);
            await fixture.whenStable();

            host.modal().getKbqFooter().querySelector('button')!.click();

            expect(callback).toHaveBeenCalled();
            expect(host.ok).not.toHaveBeenCalled();
            expect(host.visible()).toBe(false);

            await fixture.whenStable();
            await animationEnd();
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

        it('should drop the close button of the title once kbqClosable is cleared', async () => {
            const fixture = createComponent(ModalWithCaptionComponent);
            const modalRef = fixture.componentInstance.open();

            await fixture.whenStable();

            expect(modalRef.getElement().querySelector('.kbq-modal-header .kbq-modal-close')).not.toBeNull();

            modalRef.getInstance().kbqClosable = false;
            await fixture.whenStable();

            expect(modalRef.getElement().querySelector('.kbq-modal-header .kbq-modal-close')).toBeNull();

            await animationEnd();
        });
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
            const spy = vi.fn();

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
    selector: 'modal-in-template',
    imports: [KbqModalModule],
    template: `
        <kbq-modal
            kbqTitle="Title"
            kbqOkText="OK"
            kbqCancelText="Cancel"
            [kbqOnOk]="okCallback()"
            [(kbqVisible)]="visible"
            (kbqAfterOpen)="afterOpen()"
            (kbqBeforeClose)="beforeClose()"
            (kbqAfterClose)="afterClose()"
            (kbqOnOk)="ok()"
            (kbqOnCancel)="cancel()"
        >
            Content
        </kbq-modal>
    `
})
class ModalInTemplate {
    readonly modal = viewChild.required(KbqModalComponent);
    readonly visible = signal(false);
    readonly okCallback = signal<OnClickCallback<unknown> | undefined>(undefined);
    readonly afterOpen = vi.fn();
    readonly beforeClose = vi.fn();
    readonly afterClose = vi.fn();
    readonly ok = vi.fn();
    readonly cancel = vi.fn();
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

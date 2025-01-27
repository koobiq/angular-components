import { FocusOrigin } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, EventEmitter, Injectable, Injector, NgModule, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ENTER, TAB } from '@koobiq/cdk/keycodes';
import { dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import { KbqModalModule } from './modal.module';
import { KbqModalService } from './modal.service';

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

        beforeEach(inject([KbqModalService, OverlayContainer], (ms: KbqModalService, oc: OverlayContainer) => {
            modalService = ms;
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }));

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
            tick(1000);
        }));

        it('should trigger both afterOpen/kbqAfterOpen and have the correct openModals length', fakeAsync(() => {
            const spy = jest.fn();
            const kbqAfterOpen = new EventEmitter<void>();
            const modalRef = modalService.create({ kbqAfterOpen });

            modalRef.afterOpen.subscribe(spy);
            kbqAfterOpen.subscribe(spy);

            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(600);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(modalService.openModals.indexOf(modalRef)).toBeGreaterThan(-1);
            expect(modalService.openModals.length).toBe(1);
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
            tick(600);
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
            tick(600);
            modalRef.close();
            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(600);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(modalService.openModals.indexOf(modalRef)).toBe(-1);
            expect(modalService.openModals.length).toBe(0);
        }));

        it('should return/receive with/without result data', fakeAsync(() => {
            const spy = jest.fn();
            const modalRef = modalService.success();

            modalRef.afterClose.subscribe(spy);
            fixture.detectChanges();
            tick(600);
            modalRef.destroy();
            expect(spy).not.toHaveBeenCalled();
            tick(600);
            expect(spy).toHaveBeenCalledWith(undefined);
        }));

        it('should return/receive with result data', fakeAsync(() => {
            const result = { data: 'Fake Error' };
            const spy = jest.fn();
            const modalRef = modalService.delete();

            fixture.detectChanges();
            tick(600);
            modalRef.destroy(result);
            modalRef.afterClose.subscribe(spy);
            expect(spy).not.toHaveBeenCalled();
            tick(600);
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
            tick(600);
            // Cover non-service modal for later checking
            modalMethods.concat('NON_SERVICE').forEach((method) => {
                expect(queryOverlayElement(method).style.display).not.toBe('none');
            });
            expect(modalService.openModals.length).toBe(4);

            modalService.closeAll();
            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();
            tick(600);
            expect(spy).toHaveBeenCalled();
            expect(modalService.openModals.length).toBe(0);
        }));

        it('should modal not be registered twice', fakeAsync(() => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            (modalService as any).modalControl.registerModal(modalRef);
            tick(600);
            expect(modalService.openModals.length).toBe(1);
        }));

        it('should trigger nzOnOk/nzOnCancel', () => {
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
            tick(600);

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
            tick(600);

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
            tick(600);

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
            tick(600);

            const event = document.createEvent('KeyboardEvent') as any;
            event.initKeyboardEvent('keydown', true, true, window, 0, 0, 0, '', false);

            Object.defineProperties(event, {
                keyCode: { get: () => ENTER },
                ctrlKey: { get: () => true }
            });

            modalRef.getElement().dispatchEvent(event);

            fixture.detectChanges();
            tick(600);
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
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        }));

        it('should show the footer, when kbqOkText is specified', fakeAsync(() => {
            const modalRef = modalService.create({
                kbqOkText: 'OK'
            });

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        }));

        it('should show the footer, when kbqCancelText is specified', fakeAsync(() => {
            const modalRef = modalService.create({
                kbqCancelText: 'OK'
            });

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(1);
        }));

        it('should not show the footer, when kbqOkText, kbqOkCancel and kbqFooter are not specified', fakeAsync(() => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.kbq-modal-footer').length).toBe(0);
        }));

        it('should show only one mask at a time', fakeAsync(() => {
            fixture.componentInstance.nonServiceModalVisible = true; // Show non-service modal
            const secondModal = modalService.create();

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(document.querySelectorAll('.kbq-modal-mask').length).toEqual(1);

            secondModal.close();

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(document.querySelectorAll('.kbq-modal-mask').length).toEqual(1);
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
            tick(600);

            expect(document.activeElement).not.toBe(buttonElement);

            modalRef.close();

            fixture.detectChanges();
            tick(600);

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
            tick(600);

            expect(document.activeElement).not.toBe(buttonElement);

            modalRef.close();

            fixture.detectChanges();
            tick(600);

            expect(document.activeElement).toBe(buttonElement);

            flush();
        }));

        it('should restore focus on previous element on close with correct focus origin', fakeAsync(() => {
            const testFocusRestoreFor = (origin: FocusOrigin) => {
                expect(document.activeElement).toBe(buttonElement);
                expect(document.activeElement?.classList).toContain(`cdk-${origin}-focused`);

                const modalRef = modalService.create({
                    kbqRestoreFocus: true,
                    kbqFooter: [{ label: 'button 1', type: 'primary' }]
                });

                fixture.detectChanges();
                tick(600);

                expect(document.activeElement).not.toBe(buttonElement);
                expect(document.activeElement?.classList).toContain(`cdk-${origin}-focused`);

                modalRef.close();
                fixture.detectChanges();
                flush();

                expect(document.activeElement).toBe(buttonElement);
                expect(document.activeElement?.classList).toContain(`cdk-${origin}-focused`);

                buttonElement.blur();
                fixture.detectChanges();
            };

            expect(document.activeElement).not.toBe(buttonElement);
            buttonElement.focus();
            fixture.detectChanges();
            flush();

            testFocusRestoreFor('program');

            // Simulate focus via keyboard.
            dispatchKeyboardEvent(document, 'keydown', TAB);
            buttonElement.focus();
            testFocusRestoreFor('keyboard');

            flush();
        }));
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
});

@Injectable()
class TestComponentLevelService {
    action() {
        return true;
    }
}

@Component({
    standalone: true,
    selector: 'custom-modal-component',
    imports: [KbqModalModule],
    template: `
        <button (click)="componentLevelService.action()">Button</button>
    `
})
export class CustomModalComponent {
    constructor(
        public componentLevelService: TestComponentLevelService,
        public injector: Injector
    ) {}
}

@Component({
    standalone: true,
    selector: 'custom-component',
    providers: [
        TestComponentLevelService
    ],
    imports: [KbqModalModule, KbqButtonModule],
    template: `
        <button (click)="open()" kbq-button>Button</button>
    `
})
export class CustomComponent {
    constructor(
        public modalService: KbqModalService,
        public injector: Injector
    ) {}

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
    selector: 'kbq-modal-by-service',
    template: `
        <kbq-modal [(kbqVisible)]="nonServiceModalVisible" kbqWrapClassName="__NON_SERVICE_ID_SUFFIX__" />
        <button kbq-button>focusable button</button>
    `,
    // Testing for service with parent service
    providers: [KbqModalControlService]
})
class ModalByServiceComponent {
    nonServiceModalVisible = false;

    constructor(_modalControlService: KbqModalControlService) {}
}

const TEST_DIRECTIVES = [
    ModalByServiceComponent,
    TestModalContentComponent
];

@NgModule({
    imports: [
        KbqModalModule,
        KbqButtonModule,
        KbqDropdownModule,
        NoopAnimationsModule
    ],
    exports: TEST_DIRECTIVES,
    declarations: TEST_DIRECTIVES
})
class ModalTestModule {}

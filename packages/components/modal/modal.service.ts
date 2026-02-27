import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, InjectionToken, Injector } from '@angular/core';
import { ESCAPE } from '@koobiq/cdk/keycodes';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import { KbqModalComponent } from './modal.component';
import { ConfirmType, IModalOptionsForService, ModalOptions } from './modal.type';

/** Injection token that can be used to access the data that was passed in to a modal. */
export const KBQ_MODAL_DATA = new InjectionToken<unknown>('KbqModalData');

/**
 * A builder used for managing service creating modals
 * @docs-private
 */
export class ModalBuilderForService {
    // Modal ComponentRef, "null" means it has been destroyed
    private modalRef: ComponentRef<KbqModalComponent> | null;
    private overlayRef: OverlayRef;

    constructor(
        private readonly overlay: Overlay,
        readonly options: IModalOptionsForService = {},
        private readonly injector: Injector
    ) {
        this.createModal();

        if (!('kbqGetContainer' in options)) {
            options.kbqGetContainer = undefined;
        }

        this.changeProps(options);

        // Defers ESC handling until the modal is fully open, avoiding premature close during the opening animation.
        this.modalRef!.instance.kbqAfterOpen.pipe(
            switchMap(() => this.overlayRef.keydownEvents()),
            filter((event: KeyboardEvent) => {
                return !!(event.keyCode === ESCAPE && options.kbqCloseByESC);
            })
        ).subscribe(() => this.getInstance()?.handleCloseResult('cancel', () => true));

        this.modalRef!.instance.open();
        this.modalRef!.instance.kbqAfterClose.subscribe(() => this.destroyModal());
    }

    getInstance(): KbqModalComponent | null {
        return this.modalRef && this.modalRef.instance;
    }

    destroyModal(): void {
        if (this.modalRef) {
            this.overlayRef.dispose();
            this.modalRef = null;
        }
    }

    private changeProps(options: ModalOptions): void {
        if (this.modalRef) {
            // here not limit user's inputs at runtime
            Object.assign(this.modalRef.instance, options);
        }
    }

    // Create component to ApplicationRef
    private createModal(): void {
        this.overlayRef = this.overlay.create();
        this.overlayRef.hostElement.classList.add('kbq-modal-overlay');

        this.modalRef = this.overlayRef.attach(new ComponentPortal(KbqModalComponent, undefined, this.injector));
    }
}

@Injectable()
export class KbqModalService {
    // Track of the current close modals (we assume invisible is close this time)
    get openModals(): KbqModalRef[] {
        return this.modalControl.openModals;
    }

    get afterAllClose(): Observable<void> {
        return this.modalControl.afterAllClose.asObservable();
    }

    constructor(
        private readonly overlay: Overlay,
        private readonly modalControl: KbqModalControlService,
        private injector: Injector
    ) {}

    // Closes all of the currently-open dialogs
    closeAll(): void {
        this.modalControl.closeAll();
    }

    create<C, R = unknown>(options: IModalOptionsForService<C> = {}): KbqModalRef<C, R> {
        if (typeof options.kbqOnCancel !== 'function') {
            // Leave an empty function to close this modal by default
            options.kbqOnCancel = () => {};
        }

        if (typeof options.kbqOnOk !== 'function') {
            // Leave an empty function to close this modal by default
            options.kbqOnOk = () => {};
        }

        if (!('kbqCloseByESC' in options)) {
            options.kbqCloseByESC = true;
        }

        // Remove the Cancel button if the user not specify a Cancel button
        if (!('kbqCancelText' in options)) {
            options.kbqCancelText = undefined;
        }

        // Remove the Ok button if the user not specify an Ok button
        if (!('kbqOkText' in options)) {
            options.kbqOkText = undefined;
        }

        // Remove the footer if the user not specify a footer
        if (!('kbqFooter' in options)) {
            options.kbqFooter = undefined;
        }

        const injector = Injector.create({
            parent: options.injector || this.injector,
            providers: [{ provide: KBQ_MODAL_DATA, useValue: options.data }]
        });

        return new ModalBuilderForService(this.overlay, options, injector).getInstance()!;
    }

    confirm<C, R = unknown>(
        options: IModalOptionsForService<C> = {},
        confirmType: ConfirmType = 'confirm'
    ): KbqModalRef<C, R> {
        if ('kbqFooter' in options) {
            // eslint-disable-next-line no-console
            console.warn(`The Confirm-Modal doesn't support "kbqFooter", this property will be ignored.`);
        }

        // NOTE: only support function currently by calling confirm()
        if (typeof options.kbqOnOk !== 'function') {
            // Leave an empty function to close this modal by default
            options.kbqOnOk = () => {};
        }

        options.kbqModalType = 'confirm';
        options.kbqClassName = `kbq-confirm kbq-confirm-${confirmType} ${options.kbqClassName || ''}`;

        return this.create<C, R>(options);
    }

    open<C, R = unknown>(options: IModalOptionsForService<C> = {}): KbqModalRef<C, R> {
        options.kbqModalType = 'custom';

        return this.create<C, R>(options);
    }

    success<C, R = unknown>(options: IModalOptionsForService<C> = {}): KbqModalRef<C, R> {
        return this.confirm<C, R>(options, 'success');
    }

    delete<C, R = unknown>(options: IModalOptionsForService<C> = {}): KbqModalRef<C, R> {
        return this.confirm<C, R>(options, 'warn');
    }
}

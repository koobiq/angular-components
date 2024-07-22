import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable } from '@angular/core';
import { ESCAPE } from '@koobiq/cdk/keycodes';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { KbqModalControlService } from './modal-control.service';
import { KbqModalRef } from './modal-ref.class';
import { KbqModalComponent } from './modal.component';
import { ConfirmType, IModalOptionsForService, ModalOptions } from './modal.type';

// A builder used for managing service creating modals
export class ModalBuilderForService {
    // Modal ComponentRef, "null" means it has been destroyed
    private modalRef: ComponentRef<KbqModalComponent> | null;
    private overlayRef: OverlayRef;

    constructor(
        private overlay: Overlay,
        options: IModalOptionsForService = {}
    ) {
        this.createModal();

        if (!('kbqGetContainer' in options)) {
            options.kbqGetContainer = undefined;
        }

        this.changeProps(options);
        this.modalRef!.instance.open();
        this.modalRef!.instance.kbqAfterClose.subscribe(() => this.destroyModal());

        this.overlayRef
            .keydownEvents()
            .pipe(
                filter((event: KeyboardEvent) => {
                    // tslint:disable-next-line:deprecation replacement .key isn't supported in Edge
                    return !!(event.keyCode === ESCAPE && options.kbqCloseByESC);
                })
            )
            .subscribe(() => this.getInstance()?.handleCloseResult('cancel', () => true));
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
        this.modalRef = this.overlayRef.attach(new ComponentPortal(KbqModalComponent));
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
        private overlay: Overlay,
        private modalControl: KbqModalControlService
    ) {}

    // Closes all of the currently-open dialogs
    closeAll(): void {
        this.modalControl.closeAll();
    }

    create<T>(options: IModalOptionsForService<T> = {}): KbqModalRef<T> {
        if (typeof options.kbqOnCancel !== 'function') {
            // Leave a empty function to close this modal by default
            // tslint:disable-next-line
            options.kbqOnCancel = () => {};
        }

        if (!('kbqCloseByESC' in options)) {
            options.kbqCloseByESC = true;
        }
        // Remove the Cancel button if the user not specify a Cancel button
        if (!('kbqCancelText' in options)) {
            options.kbqCancelText = undefined;
        }
        // Remove the Ok button if the user not specify a Ok button
        if (!('kbqOkText' in options)) {
            options.kbqOkText = undefined;
        }
        // Remove the footer if the user not specify a footer
        if (!('kbqFooter' in options)) {
            options.kbqFooter = undefined;
        }

        return new ModalBuilderForService(this.overlay, options).getInstance()!;
    }

    confirm<T>(options: IModalOptionsForService<T> = {}, confirmType: ConfirmType = 'confirm'): KbqModalRef<T> {
        if ('kbqFooter' in options) {
            console.warn(`The Confirm-Modal doesn't support "kbqFooter", this property will be ignored.`);
        }

        // NOTE: only support function currently by calling confirm()
        if (typeof options.kbqOnOk !== 'function') {
            // Leave a empty function to close this modal by default
            // tslint:disable-next-line
            options.kbqOnOk = () => {};
        }

        options.kbqModalType = 'confirm';
        options.kbqClassName = `kbq-confirm kbq-confirm-${confirmType} ${options.kbqClassName || ''}`;

        return this.create(options);
    }

    open<T>(options: IModalOptionsForService<T> = {}): KbqModalRef<T> {
        options.kbqModalType = 'custom';

        return this.create(options);
    }

    success<T>(options: IModalOptionsForService<T> = {}): KbqModalRef<T> {
        return this.simpleConfirm(options, 'success');
    }

    // tslint:disable-next-line: no-reserved-keywords
    delete<T>(options: IModalOptionsForService<T> = {}): KbqModalRef<T> {
        return this.simpleConfirm(options, 'warn');
    }

    private simpleConfirm<T>(options: IModalOptionsForService<T> = {}, confirmType: ConfirmType): KbqModalRef<T> {
        return this.confirm(options, confirmType);
    }
}

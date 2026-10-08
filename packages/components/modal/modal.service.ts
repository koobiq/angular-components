import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, DestroyRef, inject, Injectable, InjectionToken, Injector, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
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
    private detachFromOpener?: () => void;

    constructor(
        private readonly overlay: Overlay,
        readonly options: IModalOptionsForService = {},
        private readonly injector: Injector,
        /** Lifetime of the caller. The dialog is destroyed with it. */
        openerDestroyRef: DestroyRef | null = null
    ) {
        this.createModal();

        if (!('kbqGetContainer' in options)) {
            options.kbqGetContainer = undefined;
        }

        this.changeProps(options);

        // Nobody owns the builder, so without this the dialog outlives whatever opened it: it stays
        // painted over the next view, `afterClose` never emits, and the body scroll lock is kept.
        this.detachFromOpener = openerDestroyRef?.onDestroy(() => this.destroyModal());

        this.modalRef!.instance.open();
        this.modalRef!.instance.kbqAfterClose.subscribe(() => this.destroyModal());
    }

    getInstance(): KbqModalComponent | null {
        return this.modalRef && this.modalRef.instance;
    }

    destroyModal(): void {
        if (this.modalRef) {
            this.detachFromOpener?.();
            this.detachFromOpener = undefined;
            this.overlayRef.dispose();
            this.modalRef = null;
        }
    }

    private changeProps(options: ModalOptions): void {
        if (!this.modalRef) return;

        const { kbqAfterOpen, kbqAfterClose, ...inputs } = options;

        // here not limit user's inputs at runtime
        Object.assign(this.modalRef.instance, inputs);

        // The two emitters are the dialog's own outputs. Mirroring them keeps `afterOpen`/
        // `afterClose` on the returned ref working, and keeps the overlay teardown from hanging off
        // an emitter the caller owns and can complete.
        if (kbqAfterOpen) {
            this.modalRef.instance.kbqAfterOpen.subscribe(() => kbqAfterOpen.emit());
        }

        if (kbqAfterClose) {
            this.modalRef.instance.kbqAfterClose.subscribe((result) => kbqAfterClose.emit(result));
        }
    }

    // Create component to ApplicationRef
    private createModal(): void {
        // Second line of defence behind the `DestroyRef` above: a router navigation disposes the
        // overlay even when the dialog was opened from a longer-lived injector.
        this.overlayRef = this.overlay.create(new OverlayConfig({ disposeOnNavigation: true }));
        this.overlayRef.hostElement.classList.add('kbq-modal-overlay');

        this.modalRef = this.overlayRef.attach(new ComponentPortal(KbqModalComponent, undefined, this.injector));
    }
}

@Injectable({ providedIn: 'root' })
export class KbqModalService {
    private readonly overlay = inject(Overlay);
    private readonly modalControl = inject(KbqModalControlService);
    private injector = inject(Injector);

    // Track of the current close modals (we assume invisible is close this time)
    get openModals(): KbqModalRef[] {
        return this.modalControl.openModals;
    }

    get afterAllClose(): Observable<void> {
        return this.modalControl.afterAllClose.asObservable();
    }

    // Closes all of the currently-open dialogs
    closeAll(): void {
        this.modalControl.closeAll();
    }

    /**
     * Opens a dialog. Its lifetime is bound to `options.injector` — the caller's injector when one
     * is passed, the root environment injector otherwise — so destroying the opener closes it.
     */
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

        const parentInjector = options.injector || this.injector;
        const injector = Injector.create({
            parent: parentInjector,
            providers: [{ provide: KBQ_MODAL_DATA, useValue: options.data }]
        });

        // Read from the caller's injector, not the derived one: `Injector.create` provides a
        // `DestroyRef` of its own, and nothing ever destroys that.
        const openerDestroyRef = parentInjector.get(DestroyRef, null);

        return new ModalBuilderForService(this.overlay, options, injector, openerDestroyRef).getInstance()!;
    }

    confirm<C, R = unknown>(
        options: IModalOptionsForService<C> = {},
        confirmType: ConfirmType = 'confirm'
    ): KbqModalRef<C, R> {
        if ('kbqFooter' in options && isDevMode()) {
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

    /** Opens a confirm dialog styled for a destructive action — the `warn` confirm type. */
    delete<C, R = unknown>(options: IModalOptionsForService<C> = {}): KbqModalRef<C, R> {
        return this.confirm<C, R>(options, 'warn');
    }
}

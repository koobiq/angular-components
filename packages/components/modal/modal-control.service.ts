import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { KbqModalRef } from './modal-ref.class';
import { KbqModalComponent } from './modal.component';
import { MODAL_ANIMATE_DURATION } from './modal.type';

interface IRegisteredMeta {
    modalRef: KbqModalRef;
    afterOpenSubscription: Subscription;
    afterCloseSubscription: Subscription;
}

@Injectable()
export class KbqModalControlService {
    // Track singleton afterAllClose through over the injection tree
    get afterAllClose(): Subject<void> {
        return this.parentService ? this.parentService.afterAllClose : this.rootAfterAllClose;
    }

    // Track singleton openModals array through over the injection tree
    get openModals(): KbqModalRef[] {
        return this.parentService ? this.parentService.openModals : this.rootOpenModals;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private rootOpenModals: KbqModalRef[] = this.parentService ? null : [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private rootAfterAllClose: Subject<void> = this.parentService ? null : new Subject<void>();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private rootRegisteredMetaMap: Map<KbqModalRef, IRegisteredMeta> = this.parentService ? null : new Map();

    // Registered modal for later usage
    private get registeredMetaMap(): Map<KbqModalRef, IRegisteredMeta> {
        return this.parentService ? this.parentService.registeredMetaMap : this.rootRegisteredMetaMap;
    }

    constructor(@Optional() @SkipSelf() private parentService: KbqModalControlService) {}

    // Register a modal to listen its open/close
    registerModal(modalRef: KbqModalRef): void {
        if (!this.hasRegistered(modalRef)) {
            const afterOpenSubscription = modalRef.afterOpen.subscribe(() => this.openModals.push(modalRef));
            const afterCloseSubscription = modalRef.afterClose.subscribe(() => this.removeOpenModal(modalRef));

            this.registeredMetaMap.set(modalRef, { modalRef, afterOpenSubscription, afterCloseSubscription });

            this.handleMultipleMasks(modalRef);
        }
    }

    hasRegistered(modalRef: KbqModalRef): boolean {
        return this.registeredMetaMap.has(modalRef);
    }

    // Close all registered opened modals
    closeAll(): void {
        let i = this.openModals.length;

        while (i--) {
            this.openModals[i].close();
        }
    }

    private removeOpenModal(modalRef: KbqModalRef): void {
        const index = this.openModals.indexOf(modalRef);

        if (index > -1) {
            this.openModals.splice(index, 1);

            if (!this.openModals.length) {
                this.afterAllClose.next();
            }
        }
    }

    private handleMultipleMasks(modalRef: KbqModalRef) {
        const modals = Array.from(this.registeredMetaMap.values()).map((v) => v.modalRef) as KbqModalComponent[];

        if (modals.filter((modal) => modal.kbqVisible).length > 1) {
            const visibleModalsWithMask = modals
                .splice(0, modals.length - 1)
                .filter((modal) => modal.kbqVisible && modal.kbqMask);

            // Trigger leave animation on other masks, then disable them after animation completes
            visibleModalsWithMask.forEach((modal) => {
                setTimeout(() => {
                    modal.getInstance().animateMaskTo(null);
                    modal.getInstance().kbqMask = false;
                    modal.markForCheck();
                }, MODAL_ANIMATE_DURATION);

                modal.getInstance().animateMaskTo('leave');
                modal.markForCheck();
            });

            // On close, restore other masks with enter animation, then reset animation state after it completes
            modalRef.beforeClose.subscribe(() => {
                visibleModalsWithMask.forEach((modal) => {
                    setTimeout(() => {
                        modalRef.getInstance().animateMaskTo(null);
                        modalRef.getInstance().kbqMask = false;
                        modal.getInstance().animateMaskTo(null);
                        modal.markForCheck();
                    }, MODAL_ANIMATE_DURATION);

                    modalRef.getInstance().animateMaskTo('leave');
                    modal.getInstance().kbqMask = true;
                    modal.getInstance().animateMaskTo('enter');

                    modal.markForCheck();
                });
            });
        }
    }
}

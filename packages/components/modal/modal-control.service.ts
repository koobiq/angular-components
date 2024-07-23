import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { KbqModalComponent } from '.';
import { KbqModalRef } from './modal-ref.class';

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
            const otherModals = modals
                .splice(0, modals.length - 1)
                .filter((modal) => modal.kbqVisible && modal.kbqMask);

            // hide other masks
            setTimeout(() => {
                otherModals.forEach((modal) => {
                    modal.getInstance().kbqMask = false;
                    modal.markForCheck();
                });
            });

            // show other masks on close
            modalRef.afterClose.subscribe(() => {
                otherModals.forEach((modal) => {
                    modal.getInstance().kbqMask = true;
                    modal.markForCheck();
                });
            });
        }
    }
}

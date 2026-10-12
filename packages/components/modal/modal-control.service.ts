import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { KbqModalRef } from './modal-ref.class';
import { KbqModalComponent } from './modal.component';
import { MODAL_ANIMATE_DURATION } from './modal.type';

interface IRegisteredMeta {
    modalRef: KbqModalRef;
    afterOpenSubscription: Subscription;
    afterCloseSubscription: Subscription;
    beforeCloseSubscription?: Subscription;
}

@Injectable({ providedIn: 'root' })
export class KbqModalControlService {
    private parentService = inject(KbqModalControlService, { optional: true, skipSelf: true });
    private readonly document = inject(DOCUMENT);

    // Track singleton afterAllClose through over the injection tree
    get afterAllClose(): Subject<void> {
        return this.parentService ? this.parentService.afterAllClose : this.rootAfterAllClose;
    }

    // Track singleton openModals array through over the injection tree
    get openModals(): KbqModalRef[] {
        return this.parentService ? this.parentService.openModals : this.rootOpenModals;
    }

    /**
     * Dialogs currently shown, in the order they were shown. Unlike `openModals` this is updated
     * synchronously, before the opening animation, so the body scroll lock and the stacking rules
     * do not lag 300ms behind the dialog they describe.
     */
    get visibleModals(): Signal<readonly KbqModalRef[]> {
        return this.parentService ? this.parentService.visibleModals : this.rootVisibleModals;
    }

    /** The dialog on top of the stack, i.e. the only one assistive technology should reach. */
    get topVisibleModal(): Signal<KbqModalRef | null> {
        return this.parentService ? this.parentService.topVisibleModal : this.rootTopVisibleModal;
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private rootVisibleModals: WritableSignal<KbqModalRef[]> = this.parentService ? null : signal<KbqModalRef[]>([]);

    // Lazy, so the copy a child-level service never reads costs nothing.
    private readonly rootTopVisibleModal: Signal<KbqModalRef | null> = computed(() => {
        const modals = this.visibleModals();

        return modals.length ? modals[modals.length - 1] : null;
    });

    /** Elements this service took out of the accessibility tree while a dialog is shown. */
    private inertedElements: Element[] = [];

    // Registered modal for later usage
    private get registeredMetaMap(): Map<KbqModalRef, IRegisteredMeta> {
        return this.parentService ? this.parentService.registeredMetaMap : this.rootRegisteredMetaMap;
    }

    // Register a modal to listen its open/close
    registerModal(modalRef: KbqModalRef): void {
        if (!this.hasRegistered(modalRef)) {
            const afterOpenSubscription = modalRef.afterOpen.subscribe(() => this.openModals.push(modalRef));
            const afterCloseSubscription = modalRef.afterClose.subscribe(() => this.removeOpenModal(modalRef));

            this.registeredMetaMap.set(modalRef, { modalRef, afterOpenSubscription, afterCloseSubscription });

            this.handleMultipleMasks(modalRef);
        }
    }

    /**
     * Releases everything the registry holds for a dialog, whether or not it was ever shown.
     * `removeOpenModal` only ever runs for a dialog that reached `afterOpen`, so a dialog created
     * and destroyed without being shown — the normal life of a `<kbq-modal>` in a template nobody
     * triggers — would otherwise stay in the root-level map forever.
     */
    deregisterModal(modalRef: KbqModalRef): void {
        this.setVisible(modalRef, false);
        this.removeOpenModal(modalRef);
    }

    /** Records whether a dialog is shown, synchronously with the visibility change itself. */
    setVisible(modalRef: KbqModalRef, visible: boolean): void {
        if (this.parentService) {
            this.parentService.setVisible(modalRef, visible);

            return;
        }

        const modals = this.rootVisibleModals();
        const index = modals.indexOf(modalRef);

        if (visible) {
            if (index > -1) return;

            this.rootVisibleModals.set([...modals, modalRef]);
        } else {
            if (index === -1) return;

            this.rootVisibleModals.set(modals.filter((modal) => modal !== modalRef));
        }

        this.syncBackgroundInert();
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

    /**
     * Takes the page behind the dialog out of the accessibility tree and the tab order.
     *
     * `aria-modal="true"` is enough for modern screen readers, but it is advisory: `inert` is what
     * actually stops the virtual cursor and the pointer from reaching the page underneath. Only
     * body children that do not contain a shown dialog are marked, so every overlay — the dialogs
     * themselves, dropdowns opened inside them, toasts — stays reachable, and so do live regions.
     */
    private syncBackgroundInert(): void {
        const visible = this.rootVisibleModals();

        if (visible.length) {
            const modalElements = visible.map((modal) => modal.getElement()).filter(Boolean);

            for (const child of Array.from(this.document.body.children)) {
                if (this.inertedElements.includes(child) || child.hasAttribute('inert')) continue;
                if (child.hasAttribute('aria-live') || child.querySelector('[aria-live]')) continue;
                if (modalElements.some((element) => child.contains(element))) continue;

                child.setAttribute('inert', '');
                this.inertedElements.push(child);
            }
        } else {
            this.inertedElements.forEach((element) => element.removeAttribute('inert'));
            this.inertedElements = [];
        }
    }

    private removeOpenModal(modalRef: KbqModalRef): void {
        const index = this.openModals.indexOf(modalRef);

        if (index > -1) {
            this.openModals.splice(index, 1);
        }

        this.unregister(modalRef);

        if (index > -1 && !this.openModals.length) {
            this.afterAllClose.next();
        }
    }

    private unregister(modalRef: KbqModalRef): void {
        const meta = this.registeredMetaMap.get(modalRef);

        if (!meta) return;

        meta.afterOpenSubscription.unsubscribe();
        meta.afterCloseSubscription.unsubscribe();
        meta.beforeCloseSubscription?.unsubscribe();

        this.registeredMetaMap.delete(modalRef);
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
            const beforeCloseSubscription = modalRef.beforeClose.subscribe(() => {
                // Invariant with respect to the loop below — the dialog being closed is the same
                // one every time round.
                setTimeout(() => {
                    modalRef.getInstance().animateMaskTo(null);
                    modalRef.getInstance().kbqMask = false;
                }, MODAL_ANIMATE_DURATION);

                modalRef.getInstance().animateMaskTo('leave');

                visibleModalsWithMask.forEach((modal) => {
                    setTimeout(() => {
                        modal.getInstance().animateMaskTo(null);
                        modal.markForCheck();
                    }, MODAL_ANIMATE_DURATION);

                    modal.getInstance().kbqMask = true;
                    modal.getInstance().animateMaskTo('enter');

                    modal.markForCheck();
                });
            });

            const meta = this.registeredMetaMap.get(modalRef);

            // The closure captures a set of sibling dialogs, so it has to die with the registration.
            if (meta) meta.beforeCloseSubscription = beforeCloseSubscription;
        }
    }
}

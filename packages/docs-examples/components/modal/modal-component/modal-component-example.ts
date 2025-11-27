import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';

@Component({
    selector: 'custom-modal',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <kbq-modal-title>{{ title }}</kbq-modal-title>

        <kbq-modal-body>{{ subtitle }}</kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="'contrast'" (click)="destroyModal('save')">Save</button>
            <button kbq-button autofocus (click)="destroyModal('close')">Close</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    private readonly modalRef = inject(KbqModalRef);

    @Input() title: string;
    @Input() subtitle: string;

    destroyModal(action: 'save' | 'close') {
        this.modalRef.destroy(action);
    }
}

/**
 * @title Modal component
 */
@Component({
    selector: 'modal-component-example',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button (click)="openModal()">Open Modal</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponentExample {
    private readonly modalService = inject(KbqModalService);

    modalRef: KbqModalRef<CustomModalComponent, 'save' | 'close'>;

    openModal(): void {
        this.modalRef = this.modalService.open({
            kbqComponent: CustomModalComponent,
            kbqComponentParams: {
                title: 'DoS attack',
                subtitle:
                    'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.'
            }
        });

        this.modalRef.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');
        });

        this.modalRef.afterClose.subscribe((action) => {
            console.log(`[afterClose] emitted, chosen action: ${action}`);
        });
    }
}

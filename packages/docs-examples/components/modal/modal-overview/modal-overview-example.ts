import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Modal
 */
@Component({
    selector: 'modal-overview-example',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button (click)="showConfirmModal()">Open Confirm Modal</button>

        <button kbq-button (click)="showSuccessModal()">Open Success Modal</button>

        <button kbq-button (click)="showDeleteModal()">Open Delete Modal</button>
    `,
    styles: [
        `
            :host {
                display: flex;
                flex-direction: column;
                width: 200px;
            }

            button:not(:last-child) {
                margin-bottom: var(--kbq-size-m);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalOverviewExample {
    private readonly modalService = inject(KbqModalService);

    showConfirmModal(): void {
        this.modalService.confirm({
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('Save'),
            kbqOnCancel: () => console.log('Cancel')
        });
    }

    showSuccessModal(): void {
        this.modalService.success({
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: 'All changes are saved!',
            kbqOkText: 'ОК',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('OK'),
            kbqOnCancel: () => console.log('Cancel')
        });
    }

    showDeleteModal(): void {
        this.modalService.delete({
            kbqContent:
                'The tasks, policies and tags associated with the customer will be deleted too. Delete selected customer?',
            kbqOkText: 'Delete',
            kbqCancelText: 'Cancel',
            kbqWidth: '480px',
            kbqMaskClosable: true,
            kbqOnOk: () => console.log('Delete'),
            kbqOnCancel: () => console.log('Cancel')
        });
    }
}

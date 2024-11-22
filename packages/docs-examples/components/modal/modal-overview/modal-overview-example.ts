import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Modal
 */
@Component({
    standalone: true,
    selector: 'modal-overview-example',
    imports: [KbqButtonModule],
    template: `
        <div class="layout-column" style="width: 200px">
            <button (click)="showConfirmModal()" style="margin-bottom: 16px" kbq-button>Open Confirm Modal</button>

            <button (click)="showSuccessModal()" style="margin-bottom: 16px" kbq-button>Open Success Modal</button>

            <button (click)="showDeleteModal()" kbq-button>Open Delete Modal</button>
        </div>
    `
})
export class ModalOverviewExample {
    constructor(private modalService: KbqModalService) {}

    showConfirmModal() {
        this.modalService.confirm({
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('OK')
        });
    }

    showSuccessModal() {
        this.modalService.success({
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: 'All changes are saved!',
            kbqOkText: 'ОК',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('OK')
        });
    }

    showDeleteModal() {
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

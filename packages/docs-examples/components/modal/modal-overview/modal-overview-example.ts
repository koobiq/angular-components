import { Component, ViewEncapsulation } from '@angular/core';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Basic Modal
 */
@Component({
    selector: 'modal-overview-example',
    templateUrl: 'modal-overview-example.html',
    styleUrls: ['modal-overview-example.css'],
    encapsulation: ViewEncapsulation.None
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
            kbqOnOk: () => console.info('OK')
        });
    }

    showSuccessModal() {
        this.modalService.success({
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: 'All changes are saved!',
            kbqOkText: 'ОК',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.info('OK')
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
            kbqOnOk: () => console.info('Delete'),
            kbqOnCancel: () => console.info('Cancel')
        });
    }
}

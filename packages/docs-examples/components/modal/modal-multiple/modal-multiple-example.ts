import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Modal multiple
 */
@Component({
    standalone: true,
    selector: 'modal-multiple-example',
    imports: [KbqButtonModule],
    template: `
        <button (click)="showConfirmModal()" kbq-button>Open two modals</button>
    `
})
export class ModalMultipleExample {
    // use modalService to prevent multiple overlaid masks
    constructor(private modalService: KbqModalService) {}

    showConfirmModal() {
        this.modalService.confirm({
            kbqSize: ModalSize.Medium,
            kbqBodyStyle: { height: '120px' },
            kbqMaskClosable: true,
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('OK')
        });

        this.showSuccessModal();
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
}

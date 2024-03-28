// tslint:disable:no-console
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';


/**
 * @title Multiple Modal
 */
@Component({
    selector: 'modal-multiple-example',
    templateUrl: 'modal-multiple-example.html',
    styleUrls: ['modal-multiple-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ModalMultipleExample {
    // use modalService to prevent multiple overlaid masks
    constructor(private modalService: KbqModalService) {}

    showConfirmModal() {
        this.modalService.confirm({
            kbqSize: ModalSize.Medium,
            kbqBodyStyle: { height: '120px' },
            kbqMaskClosable: true,
            kbqContent   : 'Save changes?',
            kbqOkText    : 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk      : () => console.log('OK')
        });

        this.showSuccessModal();
    }

    showSuccessModal() {
        this.modalService.success({
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent   : 'All changes are saved!',
            kbqOkText    : 'ОК',
            kbqCancelText: 'Cancel',
            kbqOnOk      : () => console.log('OK')
        });
    }
}

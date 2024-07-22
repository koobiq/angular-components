// tslint:disable:no-console
import { Component, ViewEncapsulation } from '@angular/core';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Sizes Modal
 */
@Component({
    selector: 'modal-sizes-example',
    templateUrl: 'modal-sizes-example.html',
    styleUrls: ['modal-sizes-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ModalSizesExample {
    constructor(private modalService: KbqModalService) {}

    showSmallModal() {
        this.modalService.confirm({
            kbqSize: ModalSize.Small,
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('OK')
        });
    }

    showDefaultModal() {
        this.modalService.confirm({
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('OK')
        });
    }

    showLargeModal() {
        this.modalService.confirm({
            kbqSize: ModalSize.Large,
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('Delete'),
            kbqOnCancel: () => console.log('Cancel')
        });
    }

    showCustomModal() {
        this.modalService.confirm({
            kbqWidth: '600px',
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('Delete'),
            kbqOnCancel: () => console.log('Cancel')
        });
    }
}

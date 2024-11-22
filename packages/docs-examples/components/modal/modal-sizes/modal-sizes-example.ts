import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Modal sizes
 */
@Component({
    standalone: true,
    selector: 'modal-sizes-example',
    imports: [KbqButtonModule],
    template: `
        <div class="layout-column" style="width: 200px">
            <button (click)="showSmallModal()" style="margin-bottom: 16px" kbq-button>Small</button>

            <button (click)="showDefaultModal()" style="margin-bottom: 16px" kbq-button>Medium</button>

            <button (click)="showLargeModal()" style="margin-bottom: 16px" kbq-button>Large</button>

            <button (click)="showCustomModal()" kbq-button>Custom width</button>
        </div>
    `
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

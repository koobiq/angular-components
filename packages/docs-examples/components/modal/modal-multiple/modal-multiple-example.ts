import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Modal multiple
 */
@Component({
    standalone: true,
    selector: 'modal-multiple-example',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button (click)="showConfirmModal()">Open two modals</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalMultipleExample {
    private readonly modalService = inject(KbqModalService);

    showConfirmModal(): void {
        this.modalService.confirm({
            kbqSize: ModalSize.Medium,
            kbqBodyStyle: { height: '120px' },
            kbqMaskClosable: true,
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('Save'),
            kbqOnCancel: () => console.log('Cancel')
        });

        this.showSuccessModal();
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
}

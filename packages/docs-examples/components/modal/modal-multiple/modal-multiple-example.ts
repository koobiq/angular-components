import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectExampleText } from './l10n';

/**
 * @title Modal multiple
 */
@Component({
    selector: 'modal-multiple-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="showConfirmModal()">{{ text().openTwoModals }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalMultipleExample {
    protected readonly text = injectExampleText();

    private readonly modalService = inject(KbqModalService);

    showConfirmModal(): void {
        this.modalService.confirm({
            kbqAriaLabel: this.text().saveChangesAria,
            kbqSize: ModalSize.Medium,
            kbqBodyStyle: { height: '120px' },
            kbqMaskClosable: true,
            kbqContent: this.text().saveChangesContent,
            kbqOkText: this.text().save,
            kbqCancelText: this.text().cancel,
            kbqOkClick: () => console.log('Save'),
            kbqCancelClick: () => console.log('Cancel')
        });

        this.showSuccessModal();
    }

    showSuccessModal(): void {
        this.modalService.success({
            kbqAriaLabel: this.text().changesSaved,
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: this.text().allChangesSaved,
            kbqOkText: this.text().ok,
            kbqCancelText: this.text().cancel,
            kbqOkClick: () => console.log('OK'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }
}

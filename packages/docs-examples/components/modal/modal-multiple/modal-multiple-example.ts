import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Modal multiple
 */
@Component({
    selector: 'modal-multiple-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="showConfirmModal()">{{ t().openTwoModals }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalMultipleExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly modalService = inject(KbqModalService);

    showConfirmModal(): void {
        this.modalService.confirm({
            kbqAriaLabel: this.t().saveChangesAria,
            kbqSize: ModalSize.Medium,
            kbqBodyStyle: { height: '120px' },
            kbqMaskClosable: true,
            kbqContent: this.t().saveChangesContent,
            kbqOkText: this.t().save,
            kbqCancelText: this.t().cancel,
            kbqOkClick: () => console.log('Save'),
            kbqCancelClick: () => console.log('Cancel')
        });

        this.showSuccessModal();
    }

    showSuccessModal(): void {
        this.modalService.success({
            kbqAriaLabel: this.t().changesSaved,
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: this.t().allChangesSaved,
            kbqOkText: this.t().ok,
            kbqCancelText: this.t().cancel,
            kbqOkClick: () => console.log('OK'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }
}

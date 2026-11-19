import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Modal
 */
@Component({
    selector: 'modal-overview-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button type="button" (click)="showConfirmModal()">{{ t().openConfirmModal }}</button>
        <button kbq-button type="button" (click)="showSuccessModal()">{{ t().openSuccessModal }}</button>
        <button kbq-button type="button" (click)="showDeleteModal()">{{ t().openDeleteModal }}</button>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            width: 200px;
        }

        button:not(:last-child) {
            margin-bottom: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalOverviewExample {
    private readonly modalService = inject(KbqModalService);

    protected readonly t = injectTranslation(TRANSLATIONS);

    showConfirmModal(): void {
        this.modalService.confirm({
            kbqAriaLabel: this.t().saveChangesAria,
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: this.t().saveChangesContent,
            kbqOkText: this.t().save,
            kbqCancelText: this.t().cancel,
            kbqOkClick: () => console.log('Save'),
            kbqCancelClick: () => console.log('Cancel')
        });
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

    showDeleteModal(): void {
        this.modalService.delete({
            kbqAriaLabel: this.t().deleteCustomer,
            kbqContent: this.t().deleteContent,
            kbqOkText: this.t().delete,
            kbqCancelText: this.t().cancel,
            kbqWidth: '480px',
            kbqMaskClosable: true,
            kbqOkClick: () => console.log('Delete'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Modal
 */
@Component({
    selector: 'modal-overview-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="showConfirmModal()">{{ t().openConfirmModal }}</button>
        <button kbq-button (click)="showSuccessModal()">{{ t().openSuccessModal }}</button>
        <button kbq-button (click)="showDeleteModal()">{{ t().openDeleteModal }}</button>
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
export class ModalOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    private readonly modalService = inject(KbqModalService);

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

    constructor() {
        super(TRANSLATIONS);
    }
}

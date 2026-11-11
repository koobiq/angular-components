import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectExampleText } from './l10n';

/**
 * @title Modal
 */
@Component({
    selector: 'modal-overview-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="showConfirmModal()">{{ text().openConfirmModal }}</button>
        <button kbq-button (click)="showSuccessModal()">{{ text().openSuccessModal }}</button>
        <button kbq-button (click)="showDeleteModal()">{{ text().openDeleteModal }}</button>
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
    protected readonly text = injectExampleText();

    private readonly modalService = inject(KbqModalService);

    showConfirmModal(): void {
        this.modalService.confirm({
            kbqAriaLabel: this.text().saveChangesAria,
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: this.text().saveChangesContent,
            kbqOkText: this.text().save,
            kbqCancelText: this.text().cancel,
            kbqOkClick: () => console.log('Save'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }

    showSuccessModal(): void {
        this.modalService.success({
            kbqAriaLabel: this.text().changesSaved,
            kbqSize: ModalSize.Small,
            kbqMaskClosable: true,
            kbqContent: this.text().allChangesSaved,
            kbqOkText: 'ОК',
            kbqCancelText: this.text().cancel,
            kbqOkClick: () => console.log('OK'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }

    showDeleteModal(): void {
        this.modalService.delete({
            kbqAriaLabel: this.text().deleteCustomer,
            kbqContent:
                'The tasks, policies and tags associated with the customer will be deleted too. Delete selected customer?',
            kbqOkText: this.text().delete,
            kbqCancelText: this.text().cancel,
            kbqWidth: '480px',
            kbqMaskClosable: true,
            kbqOkClick: () => console.log('Delete'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }
}

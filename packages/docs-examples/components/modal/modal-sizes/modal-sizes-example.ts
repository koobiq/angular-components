import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectExampleText } from '../l10n';

/**
 * @title Modal sizes
 */
@Component({
    selector: 'modal-sizes-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="showModal(modalSize.Small)">Small</button>
        <button kbq-button (click)="showModal(modalSize.Medium)">Medium</button>
        <button kbq-button (click)="showModal(modalSize.Large)">Large</button>
        <button kbq-button (click)="showCustomModal()">Custom width</button>
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
export class ModalSizesExample {
    protected readonly text = injectExampleText();

    private readonly modalService = inject(KbqModalService);

    readonly modalSize = ModalSize;

    showModal(kbqSize: ModalSize): void {
        this.modalService.confirm({
            kbqAriaLabel: this.text().saveChangesAria,
            kbqSize,
            kbqContent: this.text().saveChangesContent,
            kbqOkText: this.text().save,
            kbqCancelText: this.text().cancel,
            kbqOkClick: () => console.log('Save'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }

    showCustomModal(): void {
        this.modalService.confirm({
            kbqAriaLabel: this.text().saveChangesAria,
            kbqWidth: '600px',
            kbqContent: this.text().saveChangesContent,
            kbqOkText: this.text().save,
            kbqCancelText: this.text().cancel,
            kbqOkClick: () => console.log('Save'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly modalService = inject(KbqModalService);

    readonly modalSize = ModalSize;

    showModal(kbqSize: ModalSize): void {
        this.modalService.confirm({
            kbqAriaLabel: this.t().saveChangesAria,
            kbqSize,
            kbqContent: this.t().saveChangesContent,
            kbqOkText: this.t().save,
            kbqCancelText: this.t().cancel,
            kbqOkClick: () => console.log('Save'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }

    showCustomModal(): void {
        this.modalService.confirm({
            kbqAriaLabel: this.t().saveChangesAria,
            kbqWidth: '600px',
            kbqContent: this.t().saveChangesContent,
            kbqOkText: this.t().save,
            kbqCancelText: this.t().cancel,
            kbqOkClick: () => console.log('Save'),
            kbqCancelClick: () => console.log('Cancel')
        });
    }
}

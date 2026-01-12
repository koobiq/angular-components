import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalService, ModalSize } from '@koobiq/components/modal';

/**
 * @title Modal sizes
 */
@Component({
    selector: 'modal-sizes-example',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button (click)="showModal(modalSize.Small)">Small</button>

        <button kbq-button (click)="showModal(modalSize.Medium)">Medium</button>

        <button kbq-button (click)="showModal(modalSize.Large)">Large</button>

        <button kbq-button (click)="showCustomModal()">Custom width</button>
    `,
    styles: [
        `
            :host {
                display: flex;
                flex-direction: column;
                width: 200px;
            }

            button:not(:last-child) {
                margin-bottom: var(--kbq-size-m);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalSizesExample {
    private readonly modalService = inject(KbqModalService);

    readonly modalSize = ModalSize;

    showModal(kbqSize: ModalSize): void {
        this.modalService.confirm({
            kbqSize,
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('Save'),
            kbqOnCancel: () => console.log('Cancel')
        });
    }

    showCustomModal(): void {
        this.modalService.confirm({
            kbqWidth: '600px',
            kbqContent: 'Save changes?',
            kbqOkText: 'Save',
            kbqCancelText: 'Cancel',
            kbqOnOk: () => console.log('Save'),
            kbqOnCancel: () => console.log('Cancel')
        });
    }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalService, ModalSize } from '@koobiq/components/modal';

@Component({
    selector: 'custom-modal',
    template: `
        @for (item of items; track item) {
            <p>{{ item }}</p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);
}

/**
 * @title Modal scroll
 */
@Component({
    selector: 'modal-scroll-example',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button (click)="createLongModal()">Open Modal</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalScrollExample {
    private readonly modalService = inject(KbqModalService);

    createLongModal(): void {
        this.modalService.create({
            kbqSize: ModalSize.Small,
            kbqTitle: 'Modal Title',
            kbqContent: CustomModalComponent,
            kbqOkText: 'Yes',
            kbqCancelText: 'No',
            kbqOnOk: () => console.log('Yes'),
            kbqOnCancel: () => console.log('No')
        });
    }
}

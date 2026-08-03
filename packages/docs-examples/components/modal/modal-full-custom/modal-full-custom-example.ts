import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';

@Component({
    selector: 'custom-modal',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <kbq-modal-title>Fully custom modal</kbq-modal-title>

        <kbq-modal-body>
            @for (item of items; track item) {
                <p>{{ item }}</p>
            }
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="'contrast'" (click)="modalRef.close()">Save</button>
            <button kbq-button autofocus (click)="modalRef.close()">Close</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    protected readonly modalRef = inject(KbqModalRef);

    items = Array.from({ length: 30 }).map((_, i) => `Item #${i}`);
}

/**
 * @title Modal full custom
 */
@Component({
    selector: 'modal-full-custom-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openModal()">Open Modal</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalFullCustomExample {
    private readonly modalService = inject(KbqModalService);

    openModal(): void {
        this.modalService.open({
            kbqComponent: CustomModalComponent
        });
    }
}

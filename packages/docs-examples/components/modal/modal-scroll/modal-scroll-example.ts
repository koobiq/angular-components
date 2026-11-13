import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly items = Array.from({ length: 1000 }, (_, i) => 'Item #' + i);
}

/**
 * @title Modal scroll
 */
@Component({
    selector: 'modal-scroll-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="createLongModal()">{{ t().openModal }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalScrollExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly modalService = inject(KbqModalService);

    createLongModal(): void {
        this.modalService.create({
            kbqSize: ModalSize.Small,
            kbqTitle: 'Modal Title',
            kbqContent: CustomModalComponent,
            kbqOkText: 'Yes',
            kbqCancelText: 'No',
            kbqOkClick: () => console.log('Yes'),
            kbqCancelClick: () => console.log('No')
        });
    }
}

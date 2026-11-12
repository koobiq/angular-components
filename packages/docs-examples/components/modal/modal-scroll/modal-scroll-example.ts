import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

@Component({
    selector: 'custom-modal',
    template: `
        @for (item of items(); track item) {
            <p>{{ item }}</p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent extends BaseLocalizedExample<ExampleText> {
    readonly items = computed(() => Array.from({ length: 1000 }, (_, i) => 'Item #' + i));

    constructor() {
        super(TEXT);
    }
}

/**
 * @title Modal scroll
 */
@Component({
    selector: 'modal-scroll-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="createLongModal()">{{ text().openModal }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalScrollExample extends BaseLocalizedExample<ExampleText> {
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

    constructor() {
        super(TEXT);
    }
}

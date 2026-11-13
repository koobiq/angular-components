import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

@Component({
    selector: 'custom-modal',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <kbq-modal-title>
            {{ t().fullyCustomModal }}
            <kbq-modal-caption>{{ t().additionalContext }}</kbq-modal-caption>
        </kbq-modal-title>

        <kbq-modal-body>
            @for (item of items; track item) {
                <p>{{ item }}</p>
            }
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="'contrast'" (click)="modalRef.close()">{{ t().save }}</button>
            <button kbq-button autofocus (click)="modalRef.close()">{{ t().close }}</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly modalRef = inject(KbqModalRef);

    readonly items = Array.from({ length: 30 }, (_, i) => 'Item #' + i);
}

/**
 * @title Modal full custom
 */
@Component({
    selector: 'modal-full-custom-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openModal()">{{ t().openModal }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalFullCustomExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly modalService = inject(KbqModalService);

    openModal(): void {
        this.modalService.open({
            kbqComponent: CustomModalComponent
        });
    }
}

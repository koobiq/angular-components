import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { injectExampleText } from '../l10n';

@Component({
    selector: 'custom-modal',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <kbq-modal-title>
            {{ text().fullyCustomModal }}
            <kbq-modal-caption>{{ text().additionalContext }}</kbq-modal-caption>
        </kbq-modal-title>

        <kbq-modal-body>
            @for (item of items(); track item) {
                <p>{{ item }}</p>
            }
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="'contrast'" (click)="modalRef.close()">{{ text().save }}</button>
            <button kbq-button autofocus (click)="modalRef.close()">{{ text().close }}</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    protected readonly text = injectExampleText();

    protected readonly modalRef = inject(KbqModalRef);

    readonly items = computed(() => Array.from({ length: 30 }, (_, i) => this.text().itemN(i)));
}

/**
 * @title Modal full custom
 */
@Component({
    selector: 'modal-full-custom-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openModal()">{{ text().openModal }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalFullCustomExample {
    protected readonly text = injectExampleText();

    private readonly modalService = inject(KbqModalService);

    openModal(): void {
        this.modalService.open({
            kbqComponent: CustomModalComponent
        });
    }
}

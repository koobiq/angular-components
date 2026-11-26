import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptgroup } from '@koobiq/components/core';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { KbqTitleDirective } from '@koobiq/components/title';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

interface CustomModalData {
    title: string;
    subtitle: string;
}

@Component({
    selector: 'custom-modal',
    imports: [
        KbqModalModule,
        KbqButtonModule,
        KbqDivider,
        KbqDropdownModule,
        KbqIcon,
        KbqOptgroup,
        KbqTitleDirective
    ],
    template: `
        <kbq-modal-title>{{ data.title }}</kbq-modal-title>

        <kbq-modal-body>
            <div class="layout-margin-bottom-l">{{ data.subtitle }}</div>
            <button kbq-button type="button" [kbqDropdownTriggerFor]="appDropdown">
                dropdown
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            <kbq-dropdown #appDropdown="kbqDropdown">
                <button kbq-dropdown-item type="button">{{ t().textNormal }}</button>

                <button kbq-dropdown-item type="button">
                    <i kbq-icon="kbq-circle-info_16" color="contrast"></i>
                    {{ t().textNormal }}
                </button>

                <button kbq-dropdown-item type="button">
                    {{ t().textNormal }}
                    <div kbqDropdownItemCaption>{{ t().caption }}</div>
                </button>

                <button kbq-dropdown-item type="button">
                    <i kbq-icon="kbq-circle-info_16" color="contrast"></i>
                    {{ t().textNormal }}
                    <div kbqDropdownItemCaption>Caption</div>
                </button>

                <button kbq-dropdown-item type="button">
                    <i kbq-icon="kbq-circle-xs_16" color="contrast"></i>
                    {{ t().textNormal }}
                </button>

                <button kbq-dropdown-item kbq-title type="button">
                    {{ t().textNormal }} {{ t().textNormal }} {{ t().textNormal }} {{ t().textNormal }}
                    Normal and very long text
                </button>

                <kbq-divider />

                <div kbqDropdownGroupHeader>{{ t().header }}</div>

                <button disabled kbq-dropdown-item type="button">{{ t().disabled }}</button>

                <kbq-divider />

                <kbq-optgroup label="Subheading" />

                <button disabled kbq-dropdown-item type="button">
                    <i kbq-icon="kbq-circle-xs_16" color="contrast"></i>
                    Disabled with icon
                </button>

                <kbq-divider />

                <button kbq-dropdown-item type="button">{{ t().point2 }}</button>

                <button kbq-dropdown-item type="button">{{ t().point3 }}</button>

                <button kbq-dropdown-item type="button">{{ t().link }}</button>
            </kbq-dropdown>
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button type="button" color="contrast" (click)="destroyModal('save')">{{ t().save }}</button>
            <!-- eslint-disable-next-line @angular-eslint/template/no-autofocus -- the dialog moves the focus to the element marked autofocus when it opens -->
            <button kbq-button autofocus type="button" (click)="destroyModal('close')">{{ t().close }}</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    private readonly modalRef = inject(KbqModalRef);
    readonly data = inject<CustomModalData>(KBQ_MODAL_DATA);

    protected readonly t = injectTranslation(TRANSLATIONS);

    destroyModal(action: 'save' | 'close') {
        this.modalRef.destroy(action);
    }
}

/**
 * @title Modal component
 */
@Component({
    selector: 'modal-component-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button type="button" (click)="openModal()">{{ t().openModal }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponentExample {
    private readonly modalService = inject(KbqModalService);

    protected readonly t = injectTranslation(TRANSLATIONS);
    modalRef?: KbqModalRef<CustomModalComponent, 'save' | 'close'>;

    openModal(): void {
        this.modalRef = this.modalService.open<CustomModalComponent, 'save' | 'close'>({
            kbqComponent: CustomModalComponent,
            data: {
                title: this.t().dosTitle,
                subtitle: this.t().dosText
            } satisfies CustomModalData
        });

        this.modalRef.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');
        });

        this.modalRef.afterClose.subscribe((action) => {
            console.log(`[afterClose] emitted, chosen action: ${action}`);
        });
    }
}

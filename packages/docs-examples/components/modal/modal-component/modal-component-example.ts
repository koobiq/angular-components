import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptgroup } from '@koobiq/components/core';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { KbqTitleDirective } from '@koobiq/components/title';
import { injectExampleText } from '../l10n';

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
            <button kbq-button [kbqDropdownTriggerFor]="appDropdown">
                dropdown
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            <kbq-dropdown #appDropdown="kbqDropdown">
                <button kbq-dropdown-item>{{ text().textNormal }}</button>

                <button kbq-dropdown-item>
                    <i kbq-icon="kbq-circle-info_16" [color]="'contrast'"></i>
                    {{ text().textNormal }}
                </button>

                <button kbq-dropdown-item>
                    {{ text().textNormal }}
                    <div kbqDropdownItemCaption>{{ text().caption }}</div>
                </button>

                <button kbq-dropdown-item>
                    <i kbq-icon="kbq-circle-info_16" [color]="'contrast'"></i>
                    {{ text().textNormal }}
                    <div kbqDropdownItemCaption>Caption</div>
                </button>

                <button kbq-dropdown-item>
                    <i kbq-icon="kbq-circle-xs_16" [color]="'contrast'"></i>
                    {{ text().textNormal }}
                </button>

                <button kbq-dropdown-item kbq-title>
                    {{ text().textNormal }} {{ text().textNormal }} {{ text().textNormal }} {{ text().textNormal }}
                    Normal and very long text
                </button>

                <kbq-divider />

                <div kbqDropdownGroupHeader>{{ text().header }}</div>

                <button disabled kbq-dropdown-item>{{ text().disabled }}</button>

                <kbq-divider />

                <kbq-optgroup label="Subheading" />

                <button disabled kbq-dropdown-item>
                    <i kbq-icon="kbq-circle-xs_16" [color]="'contrast'"></i>
                    Disabled with icon
                </button>

                <kbq-divider />

                <button kbq-dropdown-item>{{ text().point2 }}</button>

                <button kbq-dropdown-item>{{ text().point3 }}</button>

                <button kbq-dropdown-item>{{ text().link }}</button>
            </kbq-dropdown>
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="'contrast'" (click)="destroyModal('save')">{{ text().save }}</button>
            <button kbq-button autofocus (click)="destroyModal('close')">{{ text().close }}</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    protected readonly text = injectExampleText();

    private readonly modalRef = inject(KbqModalRef);

    readonly data = inject<CustomModalData>(KBQ_MODAL_DATA);

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
        <button kbq-button (click)="openModal()">{{ text().openModal }}</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponentExample {
    protected readonly text = injectExampleText();

    private readonly modalService = inject(KbqModalService);

    modalRef: KbqModalRef<CustomModalComponent, 'save' | 'close'>;

    openModal(): void {
        this.modalRef = this.modalService.open<CustomModalComponent, 'save' | 'close'>({
            kbqComponent: CustomModalComponent,
            data: {
                title: this.text().dosTitle,
                subtitle: this.text().dosText
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

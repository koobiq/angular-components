import { ChangeDetectionStrategy, Component, inject, type TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { type KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { KbqSplitButton } from '@koobiq/components/split-button';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Modal template
 */
@Component({
    selector: 'modal-template-example',
    imports: [
        KbqButtonModule,
        KbqSplitButton,
        KbqIcon,
        KbqDropdownModule
    ],
    template: `
        <button kbq-button type="button" (click)="createModal(title, content, footer, sizes.Small)">
            {{ t().openModal }}
        </button>

        <ng-template #title>DoS attack</ng-template>

        <ng-template #content>
            {{ t().dosText }}

            <kbq-split-button class="layout-margin-top-m">
                <button kbq-button type="button" (click)="createModal(title, content, footer)">Open next modal</button>
                <button kbq-button type="button" [attr.aria-label]="t().moreOptions" [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>

            <kbq-dropdown #dropdown="kbqDropdown">
                <button kbq-dropdown-item type="button" (click)="createModal(title, content, footer, sizes.Small)">
                    {{ t().openSmallModal }}
                </button>
                <button kbq-dropdown-item type="button" (click)="createModal(title, content, footer, sizes.Medium)">
                    {{ t().openMediumModal }}
                </button>
                <button kbq-dropdown-item type="button" (click)="createModal(title, content, footer, sizes.Large)">
                    {{ t().openLargeModal }}
                </button>
            </kbq-dropdown>
        </ng-template>

        <ng-template #footer>
            <div class="layout-row flex-grow layout-align-space-between">
                <button kbq-button type="button" (click)="destroyModal()">Add. action</button>

                <div>
                    <button
                        type="button"
                        class="layout-margin-right-m"
                        kbq-button
                        kbq-modal-main-action
                        color="contrast"
                        (click)="destroyModal()"
                    >
                        Save
                    </button>
                    <button kbq-button type="button" (click)="destroyModal()">Cancel</button>
                </div>
            </div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalTemplateExample {
    private readonly modalService = inject(KbqModalService);

    protected readonly t = injectTranslation(TRANSLATIONS);
    modalRef?: KbqModalRef;
    sizes = ModalSize;

    createModal(
        kbqTitle: TemplateRef<object>,
        kbqContent: TemplateRef<object>,
        kbqFooter: TemplateRef<object>,
        size?: ModalSize
    ): void {
        this.modalRef = this.modalService.create({
            kbqTitle,
            kbqContent,
            kbqFooter,
            kbqMaskClosable: true,
            kbqSize: size,
            kbqOkClick: () => console.log('OK')
        });
    }

    destroyModal(): void {
        this.modalRef?.triggerOk();
    }
}

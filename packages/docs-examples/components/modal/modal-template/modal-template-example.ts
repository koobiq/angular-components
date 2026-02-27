import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqModalModule, KbqModalRef, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { KbqSplitButton } from '@koobiq/components/split-button';

/**
 * @title Modal template
 */
@Component({
    selector: 'modal-template-example',
    imports: [
        KbqModalModule,
        KbqButtonModule,
        KbqSplitButton,
        KbqIcon,
        KbqDropdownModule
    ],
    template: `
        <button kbq-button (click)="createModal(title, content, footer, sizes.Small)">Open Modal</button>

        <ng-template #title>DoS attack</ng-template>

        <ng-template #content>
            In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to
            make a machine or network resource unavailable to its intended users by temporarily or indefinitely
            disrupting services of a host connected to a network.

            <kbq-split-button class="layout-margin-top-m">
                <button kbq-button (click)="createModal(title, content, footer)">Open next modal</button>
                <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>

            <kbq-dropdown #dropdown="kbqDropdown">
                <button kbq-dropdown-item (click)="createModal(title, content, footer, sizes.Small)">
                    Open small modal
                </button>
                <button kbq-dropdown-item (click)="createModal(title, content, footer, sizes.Medium)">
                    Open medium modal
                </button>
                <button kbq-dropdown-item (click)="createModal(title, content, footer, sizes.Large)">
                    Open large modal
                </button>
            </kbq-dropdown>
        </ng-template>

        <ng-template #footer>
            <div class="layout-row flex-grow layout-align-space-between">
                <button kbq-button (click)="destroyModal()">Add. action</button>

                <div>
                    <button
                        class="layout-margin-right-m"
                        kbq-button
                        kbq-modal-main-action
                        [color]="'contrast'"
                        (click)="destroyModal()"
                    >
                        Save
                    </button>
                    <button kbq-button (click)="destroyModal()">Cancel</button>
                </div>
            </div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalTemplateExample {
    private readonly modalService = inject(KbqModalService);

    modalRef: KbqModalRef;
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
            kbqOnOk: () => console.log('OK')
        });
    }

    destroyModal(): void {
        this.modalRef.triggerOk();
    }
}

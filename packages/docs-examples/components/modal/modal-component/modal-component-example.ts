import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { KbqTitleModule } from '@koobiq/components/title';

@Component({
    standalone: true,
    selector: 'custom-modal',
    imports: [
        KbqModalModule,
        KbqButtonModule,
        KbqDividerModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqOptionModule,
        KbqTitleModule
    ],
    template: `
        <kbq-modal-title>{{ title }}</kbq-modal-title>

        <kbq-modal-body>
            <div class="layout-margin-bottom-l">{{ subtitle }}</div>
            <button kbq-button [kbqDropdownTriggerFor]="appDropdown">
                dropdown
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            <kbq-dropdown #appDropdown="kbqDropdown">
                <button kbq-dropdown-item>Text Normal</button>

                <button kbq-dropdown-item>
                    <i kbq-icon="kbq-circle-info_16" [color]="'contrast'"></i>
                    Text Normal
                </button>

                <button kbq-dropdown-item>
                    Text Normal
                    <div class="kbq-dropdown-item__caption">Caption</div>
                </button>

                <button kbq-dropdown-item>
                    <i kbq-icon="kbq-circle-info_16" [color]="'contrast'"></i>
                    Text Normal
                    <div class="kbq-dropdown-item__caption">Caption</div>
                </button>

                <button kbq-dropdown-item>
                    <i kbq-icon="kbq-circle-xs_16" [color]="'contrast'"></i>
                    Text Normal
                </button>

                <button kbq-dropdown-item kbq-title>
                    Text Normal and very long text Text Normal and very long text Text Normal and very long text Text
                    Normal and very long text
                </button>

                <kbq-divider />

                <div class="kbq-dropdown__group-header">Header</div>

                <button disabled kbq-dropdown-item>Disabled</button>

                <kbq-divider />

                <kbq-optgroup label="Subheading" />

                <button disabled kbq-dropdown-item>
                    <i kbq-icon="kbq-circle-xs_16" [color]="'contrast'"></i>
                    Disabled with icon
                </button>

                <kbq-divider />

                <button kbq-dropdown-item>Point 2</button>

                <button kbq-dropdown-item>Point 3</button>

                <button kbq-dropdown-item>Link</button>
            </kbq-dropdown>
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="'contrast'" (click)="destroyModal('save')">Save</button>
            <button kbq-button autofocus (click)="destroyModal('close')">Close</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    private readonly modalRef = inject(KbqModalRef);

    @Input() title: string;
    @Input() subtitle: string;

    destroyModal(action: 'save' | 'close') {
        this.modalRef.destroy(action);
    }
}

/**
 * @title Modal component
 */
@Component({
    standalone: true,
    selector: 'modal-component-example',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button (click)="openModal()">Open Modal</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponentExample {
    private readonly modalService = inject(KbqModalService);

    modalRef: KbqModalRef<CustomModalComponent, 'save' | 'close'>;

    openModal(): void {
        this.modalRef = this.modalService.open({
            kbqComponent: CustomModalComponent,
            kbqComponentParams: {
                title: 'DoS attack',
                subtitle:
                    'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.'
            }
        });

        this.modalRef.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');
        });

        this.modalRef.afterClose.subscribe((action) => {
            console.log(`[afterClose] emitted, chosen action: ${action}`);
        });
    }
}

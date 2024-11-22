import { Component, Input } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';

/**
 * @title Modal component
 */
@Component({
    standalone: true,
    selector: 'modal-component-example',
    imports: [KbqButtonModule],
    template: `
        <button (click)="openModal()" kbq-button>Open Modal</button>
    `
})
export class ModalComponentExample {
    modalRef: KbqModalRef<KbqModalCustomComponent, 'save' | 'close'>;

    constructor(private modalService: KbqModalService) {}

    openModal() {
        this.modalRef = this.modalService.open({
            kbqComponent: KbqModalCustomComponent,
            kbqComponentParams: {
                title: 'Title',
                subtitle: 'Subtitle'
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

@Component({
    standalone: true,
    selector: 'kbq-modal-full-custom-component',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <kbq-modal-title>Modal Title</kbq-modal-title>

        <kbq-modal-body>
            <h2>{{ title }}</h2>
            <h4>{{ subtitle }}</h4>
            <p>
                <span>Get Modal instance in component</span>
                <button [color]="'contrast'" (click)="destroyModal('close')" kbq-button>
                    destroy modal in the component
                </button>
            </p>
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button [color]="'contrast'" (click)="destroyModal('save')" kbq-button>Save</button>
            <button (click)="destroyModal('close')" kbq-button autofocus>Close</button>
        </div>
    `
})
export class KbqModalCustomComponent {
    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: KbqModalRef<KbqModalCustomComponent, 'save' | 'close'>) {}

    destroyModal(action: 'save' | 'close') {
        this.modal.destroy(action);
    }
}

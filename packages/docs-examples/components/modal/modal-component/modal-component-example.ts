// tslint:disable:no-console
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqModalRef, KbqModalService } from '@koobiq/components/modal';

/**
 * @title Component Modal
 */
@Component({
    selector: 'modal-component-example',
    templateUrl: 'modal-component-example.html',
    styleUrls: ['modal-component-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ModalComponentExample {
    componentModal: KbqModalRef;

    constructor(private modalService: KbqModalService) {}

    openModal() {
        this.componentModal = this.modalService.open({
            kbqComponent: KbqModalCustomComponent,
            kbqComponentParams: {
                title: 'Title',
                subtitle: 'Subtitle',
            },
        });

        this.componentModal.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');
        });

        this.componentModal.afterClose.subscribe((action: 'save' | 'close') => {
            console.log(`[afterClose] emitted, chosen action: ${action}`);
        });
    }
}

@Component({
    selector: 'kbq-modal-full-custom-component',
    template: `
        <kbq-modal-title>Modal Title</kbq-modal-title>

        <kbq-modal-body>
            <h2>{{ title }}</h2>
            <h4>{{ subtitle }}</h4>
            <p>
                <span>Get Modal instance in component</span>
                <button kbq-button [color]="'contrast'" (click)="destroyModal('close')">
                    destroy modal in the component
                </button>
            </p>
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="'contrast'" (click)="destroyModal('save')">Save</button>
            <button kbq-button autofocus (click)="destroyModal('close')">Close</button>
        </div>
    `,
})
export class KbqModalCustomComponent {
    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: KbqModalRef) {}

    destroyModal(action: 'save' | 'close') {
        this.modal.destroy(action);
    }
}

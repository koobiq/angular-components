import { Component, ViewEncapsulation } from '@angular/core';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

@Component({
    selector: 'kbq-long-component',
    template: `
        @for (item of longText; track item) {
            <p>{{ item }}</p>
        }
    `
})
export class KbqLongComponent {
    longText: any = [];

    constructor() {
        for (let i = 0; i < 50; i++) {
            this.longText.push(`text lint - ${i}`);
        }
    }
}

/**
 * @title Component Modal Scroll
 */
@Component({
    selector: 'modal-scroll-example',
    template: `
        <button
            (click)="createLongModal()"
            kbq-button
        >
            Open Modal
        </button>
    `,
    styleUrls: ['modal-scroll-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ModalScrollExample {
    constructor(private modalService: KbqModalService) {}

    createLongModal() {
        this.modalService.create({
            kbqSize: ModalSize.Small,
            kbqTitle: 'Modal Title',
            kbqContent: KbqLongComponent,
            kbqOkText: 'Yes',
            kbqCancelText: 'No'
        });
    }
}

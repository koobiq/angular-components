import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalService, ModalSize } from '@koobiq/components/modal';

@Component({
    standalone: true,
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
 * @title Modal scroll
 */
@Component({
    standalone: true,
    selector: 'modal-scroll-example',
    imports: [KbqButtonModule],
    template: `
        <button
            (click)="createLongModal()"
            kbq-button
        >
            Open Modal
        </button>
    `
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

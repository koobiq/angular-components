import { Component, Directive } from '@angular/core';
import { KbqModalComponent } from './modal.component';

@Component({
    selector: `[kbq-modal-title], kbq-modal-title, [kbqModalTitle]`,
    template: `
        <div class="kbq-modal-title" kbq-title>
            <ng-content />
        </div>

        @if (modal.kbqClosable) {
            <button
                class="kbq-modal-close kbq-button_transparent"
                [color]="'contrast'"
                (click)="modal.onClickCloseBtn()"
                kbq-button
            >
                <i [color]="modal.componentColors.Contrast" kbq-icon="kbq-xmark_16"></i>
            </button>
        }
    `,
    host: {
        class: 'kbq-modal-header',
        '[class.kbq-modal-header_closable]': 'modal.kbqClosable'
    }
})
export class KbqModalTitle {
    constructor(protected modal: KbqModalComponent) {}
}

@Directive({
    selector: `[kbq-modal-body], kbq-modal-body, [kbqModalBody]`,
    host: {
        class: 'kbq-modal-body'
    }
})
export class KbqModalBody {}

@Directive({
    selector: `[kbq-modal-footer], kbq-modal-footer, [kbqModalFooter]`,
    host: {
        class: 'kbq-modal-footer'
    }
})
export class KbqModalFooter {}

@Directive({
    selector: `[kbq-modal-main-action]`
})
export class KbqModalMainAction {}

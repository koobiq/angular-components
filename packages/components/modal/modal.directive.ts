import { Component, Directive } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleDirective } from '@koobiq/components/title';
import { KbqModalComponent } from './modal.component';

@Component({
    selector: `[kbq-modal-title], kbq-modal-title, [kbqModalTitle]`,
    imports: [
        KbqIconModule,
        KbqButtonModule,
        KbqTitleDirective
    ],
    template: `
        <div class="kbq-modal-title" kbq-title>
            <ng-content />
        </div>

        @if (modal.kbqClosable) {
            <button
                class="kbq-modal-close kbq-button_transparent"
                type="button"
                kbq-button
                [color]="'contrast'"
                (click)="modal.onClickCloseBtn()"
            >
                <i kbq-icon="kbq-xmark_16" [color]="modal.componentColors.Contrast"></i>
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

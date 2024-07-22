import { Component, Directive } from '@angular/core';

@Component({
    selector: `[kbq-modal-title], kbq-modal-title, [kbqModalTitle]`,
    template: `
        <div
            class="kbq-modal-title"
            kbq-title
        >
            <ng-content></ng-content>
        </div>
    `,
    host: {
        class: 'kbq-modal-header'
    }
})
export class KbqModalTitle {}

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

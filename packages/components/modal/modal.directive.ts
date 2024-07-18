import { Component, Directive } from '@angular/core';

@Component({
    selector: `[kbq-modal-title], kbq-modal-title, [mcModalTitle]`,
    template: `<div class="kbq-modal-title">
        <ng-content></ng-content>
    </div>`,
    host: {
        class: 'kbq-modal-header'
    }
})
export class KbqModalTitle {}

@Directive({
    selector: `[kbq-modal-body], kbq-modal-body, [mcModalBody]`,
    host: {
        class: 'kbq-modal-body'
    }
})
export class KbqModalBody {}

@Directive({
    selector: `[kbq-modal-footer], kbq-modal-footer, [mcModalFooter]`,
    host: {
        class: 'kbq-modal-footer'
    }
})
export class KbqModalFooter {}

@Directive({
    selector: `[kbq-modal-main-action]`
})
export class KbqModalMainAction {}

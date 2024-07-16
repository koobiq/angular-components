import { Directive } from '@angular/core';

@Directive({
    selector: `[kbq-modal-title], kbq-modal-title, [mcModalTitle]`,
    host: {
        class: 'kbq-modal-header kbq-modal-title'
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

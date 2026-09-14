import { Component, inject, Injectable } from '@angular/core';
import { KbqModalModule, KbqModalRef } from '@koobiq/components/modal';

/** Provided on the opener, so it is only reachable through the injector passed to `modalService.open`. */
@Injectable()
export class OpenerScopedService {
    readonly marker = 'opener-scoped';
}

/**
 * Modal content resolved through `createDynamicComponent`. It asserts both halves of that call: the
 * element injector (`KbqModalRef`, `OpenerScopedService`) and the environment injector it is created with.
 */
@Component({
    selector: 'check-modal-content',
    imports: [KbqModalModule],
    template: `
        <kbq-modal-title>modal</kbq-modal-title>
        <kbq-modal-body>
            <span id="modal-ref">{{ hasModalRef }}</span>
            <span id="modal-scoped">{{ scoped.marker }}</span>
        </kbq-modal-body>
    `
})
export class CheckModalContent {
    protected readonly scoped = inject(OpenerScopedService);
    protected readonly hasModalRef = inject(KbqModalRef) ? 'ref-ok' : 'ref-missing';
}

import { afterNextRender, Component, Directive, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqInjectNativeElement } from '@koobiq/components/core';
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
        '[class.kbq-modal-header_closable]': 'modal.kbqClosable',
        '[class.kbq-modal-body_top-overflow]': 'modal.bodyOverflow().top'
    }
})
export class KbqModalTitle {
    constructor(protected modal: KbqModalComponent) {}
}

/**
 * Scrollable body of a manually composed modal (`kbqComponent`). Publishes its scroll-shadow
 * state onto the modal instance so a sibling `KbqModalTitle`/`KbqModalFooter` can render the
 * matching shadow, since they have no direct template reference to this element.
 */
@Directive({
    selector: `[kbq-modal-body], kbq-modal-body, [kbqModalBody]`,
    host: {
        class: 'kbq-modal-body kbq-scrollbar',
        '(scroll)': 'checkOverflow()'
    }
})
export class KbqModalBody {
    private readonly modal = inject(KbqModalComponent);
    private readonly elementRef = kbqInjectNativeElement();

    constructor() {
        // The custom content component is created and initially change-detected before its view
        // is inserted into the modal's `bodyContainer` (see `KbqModalComponent.createDynamicComponent`
        // / `ngAfterViewInit`), so `ngAfterViewInit` here would still measure a detached, unlaid-out
        // element. `afterNextRender` waits for the view to actually be attached and painted.
        afterNextRender(() => this.checkOverflow());
    }

    /** @docs-private */
    protected checkOverflow() {
        const { scrollTop, offsetHeight, scrollHeight } = this.elementRef;

        this.modal.bodyOverflow.set({
            top: scrollTop > 0,
            bottom: scrollTop + offsetHeight < scrollHeight
        });
    }
}

@Directive({
    selector: `[kbq-modal-footer], kbq-modal-footer, [kbqModalFooter]`,
    host: {
        class: 'kbq-modal-footer',
        '[class.kbq-modal-body_bottom-overflow]': 'modal.bodyOverflow().bottom'
    }
})
export class KbqModalFooter {
    protected modal = inject(KbqModalComponent);
}

@Directive({
    selector: `[kbq-modal-main-action]`
})
export class KbqModalMainAction {}

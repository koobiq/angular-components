import { Component, Directive, effect, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqInjectA11yLocaleConfiguration, KbqOverflowShadowContainer } from '@koobiq/components/core';
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
                [attr.aria-label]="a11yLocaleConfiguration().close"
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
        '[style.box-shadow]': 'modal.bodyOverflow().top ? "var(--kbq-shadow-overflow-normal-bottom)" : null'
    }
})
export class KbqModalTitle {
    protected modal = inject(KbqModalComponent);

    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();
}

/**
 * Scrollable body of a manually composed modal (`kbqComponent`). Publishes its scroll-shadow
 * state onto the modal instance so a sibling `KbqModalTitle`/`KbqModalFooter` can render the
 * matching shadow, since they have no direct template reference to this element.
 */
@Directive({
    selector: `[kbq-modal-body], kbq-modal-body, [kbqModalBody]`,
    host: {
        class: 'kbq-modal-body kbq-scrollbar'
    },
    hostDirectives: [KbqOverflowShadowContainer]
})
export class KbqModalBody {
    private readonly modal = inject(KbqModalComponent);
    private readonly overflowContainer = inject(KbqOverflowShadowContainer);

    constructor() {
        effect(() => this.modal.bodyOverflow.set(this.overflowContainer.overflow()));
    }
}

@Directive({
    selector: `[kbq-modal-footer], kbq-modal-footer, [kbqModalFooter]`,
    host: {
        class: 'kbq-modal-footer',
        '[style.box-shadow]': 'modal.bodyOverflow().bottom ? "var(--kbq-shadow-overflow-normal-top)" : null'
    }
})
export class KbqModalFooter {
    protected modal = inject(KbqModalComponent);
}

@Directive({
    selector: `[kbq-modal-main-action]`
})
export class KbqModalMainAction {}

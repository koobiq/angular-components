import { ChangeDetectionStrategy, Component, Directive, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqInjectA11yLocaleConfiguration, KbqOverflowShadowContainer } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqTitleDirective } from '@koobiq/components/title';
import { KBQ_MODAL } from './modal.type';

@Component({
    selector: `[kbq-modal-title], kbq-modal-title, [kbqModalTitle]`,
    imports: [
        KbqIconModule,
        KbqButtonModule,
        KbqTitleDirective
    ],
    template: `
        <div class="kbq-modal-header-content">
            <div class="kbq-modal-title" kbq-title [attr.id]="modal.titleId">
                <ng-content />
            </div>

            <ng-content select="kbq-modal-caption, [kbq-modal-caption], [kbqModalCaption]" />
        </div>

        <!-- Outside the two-line clamp of the title, so actions next to the heading do not need
             to pierce encapsulation to escape it. -->
        <ng-content select="[kbqModalTitleActions]" />

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
        '[style.box-shadow]': 'modal.bodyOverflow().top ? "var(--kbq-shadow-overflow-normal-bottom)" : null'
    }
})
export class KbqModalTitle {
    protected modal = inject(KBQ_MODAL);

    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    constructor() {
        // Lets the dialog point `aria-labelledby` at this heading instead of going unnamed.
        this.modal.registerTitle();
    }
}

/**
 * Caption of a manually composed modal (`kbqComponent`). Projected into the header rendered by
 * `KbqModalTitle`, below the title, and clamped to two lines. The resulting markup matches the
 * header of a modal created via `KbqModalService.create`.
 */
@Component({
    selector: `[kbq-modal-caption], kbq-modal-caption, [kbqModalCaption]`,
    template: `
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-modal-caption',
        '[attr.id]': 'modal.captionId'
    },
    hostDirectives: [KbqTitleDirective]
})
export class KbqModalCaption {
    protected readonly modal = inject(KBQ_MODAL);

    constructor() {
        // Lets the dialog point `aria-describedby` at this caption; without it the composed path
        // renders a description no screen reader is told about.
        this.modal.registerCaption();
    }
}

/**
 * Scrollable body of a manually composed modal (`kbqComponent`). Publishes its scroll-shadow
 * state onto the modal instance so a sibling `KbqModalTitle`/`KbqModalFooter` can render the
 * matching shadow, since they have no direct template reference to this element.
 */
@Directive({
    selector: `[kbq-modal-body], kbq-modal-body, [kbqModalBody]`,
    host: {
        class: 'kbq-modal-body'
    },
    hostDirectives: [KbqOverflowShadowContainer, KbqScrollbarViewport]
})
export class KbqModalBody {
    private readonly modal = inject(KBQ_MODAL);
    private readonly overflowContainer = inject(KbqOverflowShadowContainer);
    private readonly scrollbarViewport = inject(KbqScrollbarViewport);

    constructor() {
        effect(() => this.modal.setBodyOverflow(this.overflowContainer.overflow()));

        this.modal.afterOpen.pipe(takeUntilDestroyed()).subscribe(() => this.scrollbarViewport.flashScrollIndicators());
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
    protected modal = inject(KBQ_MODAL);

    constructor() {
        // Without this the dialog cannot tell a composed footer from no footer at all, and would
        // add the no-footer bottom padding underneath one.
        this.modal.registerFooter();
    }
}

@Directive({
    selector: `[kbq-modal-main-action]`
})
export class KbqModalMainAction {}

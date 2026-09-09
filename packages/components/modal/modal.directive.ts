import { ChangeDetectionStrategy, Component, Directive, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqInjectA11yLocaleConfiguration, KbqOverflowShadowContainer } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
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
        <div class="kbq-modal-header-content">
            <div class="kbq-modal-title" kbq-title>
                <ng-content />
            </div>

            <ng-content select="kbq-modal-caption, [kbq-modal-caption], [kbqModalCaption]" />
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
        '[style.box-shadow]': 'modal.bodyOverflow().top ? "var(--kbq-shadow-overflow-normal-bottom)" : null'
    }
})
export class KbqModalTitle {
    protected readonly modal = inject(KbqModalComponent);

    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();
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
        class: 'kbq-modal-caption'
    },
    hostDirectives: [KbqTitleDirective]
})
export class KbqModalCaption {}

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
    private readonly modal = inject(KbqModalComponent);
    private readonly overflowContainer = inject(KbqOverflowShadowContainer);
    private readonly scrollbarViewport = inject(KbqScrollbarViewport);

    constructor() {
        effect(() => this.modal.bodyOverflow.set(this.overflowContainer.overflow()));

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
    protected modal = inject(KbqModalComponent);
}

@Directive({
    selector: `[kbq-modal-main-action]`
})
export class KbqModalMainAction {}

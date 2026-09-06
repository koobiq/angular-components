import {
    booleanAttribute,
    Component,
    Directive,
    effect,
    inject,
    Input,
    input,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqInjectA11yLocaleConfiguration, KbqOverflowShadowContainer } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqTitleDirective } from '@koobiq/components/title';
import { KbqSidepanelRef } from './sidepanel-ref';

/**
 * Button that will close the current sidepanel.
 */
@Directive({
    selector: 'button[kbq-sidepanel-close], button[kbqSidepanelClose]',
    host: {
        class: 'kbq-sidepanel-close',
        '(click)': 'sidepanelRef.close(sidepanelResult)'
    }
})
export class KbqSidepanelClose implements OnChanges {
    // `KbqSidepanelService.open()` passes an injector to both portal kinds, and
    // `CdkPortalOutlet.attachTemplatePortal()` forwards it to the embedded view, so the ref is always
    // reachable — including from a `<ng-template>` sidepanel.
    readonly sidepanelRef = inject(KbqSidepanelRef);

    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input('kbq-sidepanel-close') sidepanelResult: any;

    readonly kbqSidepanelClose = input<any>();

    ngOnChanges(changes: SimpleChanges) {
        const proxiedChange = changes.kbqSidepanelClose || changes.sidepanelResult;

        if (proxiedChange) {
            this.sidepanelResult = proxiedChange.currentValue;
        }
    }
}

/**
 * Header of a sidepanel.
 */
@Component({
    selector: 'kbq-sidepanel-header',
    imports: [
        KbqButtonModule,
        KbqSidepanelClose,
        KbqIconModule,
        KbqTitleDirective
    ],
    template: `
        <div class="kbq-sidepanel-title" kbq-title [attr.id]="titleId">
            <ng-content />
        </div>

        @if (closeable()) {
            <button
                kbq-button
                kbq-sidepanel-close
                type="button"
                [attr.aria-label]="a11yLocaleConfiguration().close"
                [color]="'contrast'"
                [kbqStyle]="'transparent'"
            >
                <i kbq-icon="kbq-xmark_16" [color]="'contrast'"></i>
            </button>
        }
    `,
    host: {
        class: 'kbq-sidepanel-header',
        '[class.kbq-sidepanel-header_truncate-text]': 'truncateText()',
        '[style.box-shadow]': 'sidepanelRef.bodyOverflow().top ? "var(--kbq-shadow-overflow-normal-bottom)" : null'
    }
})
export class KbqSidepanelHeader {
    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    /** Add button for close sidepanel. Default false */
    readonly closeable = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Enables text truncation. Default true */
    readonly truncateText = input<boolean, unknown>(true, { transform: booleanAttribute });

    /** @docs-private */
    protected sidepanelRef = inject(KbqSidepanelRef);

    /** Id of the title element, which is what names the sidepanel to assistive technology. */
    protected readonly titleId = `${this.sidepanelRef.id}-title`;

    constructor() {
        this.sidepanelRef.containerInstance.setAriaLabelledBy(this.titleId);
    }
}

/**
 * Scrollable content container of a sidepanel.
 */
@Directive({
    selector: 'kbq-sidepanel-body, [kbq-sidepanel-body], kbqSidepanelBody',
    host: {
        class: 'kbq-sidepanel-body'
    },
    hostDirectives: [KbqOverflowShadowContainer, KbqScrollbarViewport]
})
export class KbqSidepanelBody {
    private readonly sidepanelRef = inject(KbqSidepanelRef);
    private readonly overflowContainer = inject(KbqOverflowShadowContainer);
    private readonly scrollbarViewport = inject(KbqScrollbarViewport);

    constructor() {
        effect(() => this.sidepanelRef.bodyOverflow.set(this.overflowContainer.overflow()));

        this.sidepanelRef
            .afterOpened()
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.scrollbarViewport.flashScrollIndicators());
    }
}

/**
 * Footer of a sidepanel.
 */
@Directive({
    selector: 'kbq-sidepanel-footer, [kbq-sidepanel-footer], kbqSidepanelFooter',
    host: {
        class: 'kbq-sidepanel-footer',
        '[style.box-shadow]': 'sidepanelRef.bodyOverflow().bottom ? "var(--kbq-shadow-overflow-normal-top)" : null'
    }
})
export class KbqSidepanelFooter {
    /** @docs-private */
    protected sidepanelRef = inject(KbqSidepanelRef);
}

/**
 * Actions block of a sidepanel footer.
 */
@Directive({
    selector: 'kbq-sidepanel-actions, [kbq-sidepanel-actions], kbqSidepanelActions',
    host: {
        class: 'kbq-sidepanel-actions'
    }
})
export class KbqSidepanelActions {}

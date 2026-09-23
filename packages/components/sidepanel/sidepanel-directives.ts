import { booleanAttribute, Component, Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_A11Y_LOCALE_CONFIGURATION,
    KbqLocaleOverridesDirective,
    KbqOverflowShadowContainer
} from '@koobiq/components/core';
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
        // The camel-case spelling wins when a template binds both, as it did before.
        '(click)': 'sidepanelRef.close(kbqSidepanelClose() ?? sidepanelResult())'
    }
})
export class KbqSidepanelClose {
    // `CdkPortalOutlet.attachTemplatePortal()` forwards the portal injector to the embedded view, so the
    // ref is reachable from a `<ng-template>` sidepanel as well as from a component one.
    readonly sidepanelRef = inject(KbqSidepanelRef);

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);

    /** Value handed to `KbqSidepanelRef.close()`, under the hyphenated spelling of the selector. */
    readonly sidepanelResult = input<any>(undefined, { alias: 'kbq-sidepanel-close' });

    /** The same value, under the camel-case spelling. */
    readonly kbqSidepanelClose = input<any>();

    constructor() {
        // A button with no type submits the form it sits in, so closing a sidepanel from inside a form would
        // submit it too. A type the author set is left alone. The element carries its static attributes by
        // the time a directive is constructed, so this needs no lifecycle hook.
        if (!this.elementRef.nativeElement.hasAttribute('type')) {
            this.renderer.setAttribute(this.elementRef.nativeElement, 'type', 'button');
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
    },
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ]
})
export class KbqSidepanelHeader {
    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'a11y',
        KBQ_A11Y_LOCALE_CONFIGURATION
    );

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

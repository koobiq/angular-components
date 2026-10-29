import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsNextPageOutline } from '../services/page-outline';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextPageActions } from '../ui/page-actions';
import { DocsNextTocSheet } from './toc-sheet';

/**
 * Row over an article on a phone: "Copy" with its menu and "On this page" (Figma: Article, 66:32982). It scrolls away
 * with the page; only the header sticks.
 */
@Component({
    selector: 'docs-next-page-bar',
    imports: [KbqIconModule, KbqLinkModule, DocsNextPageActions, DocsNextTocSheet],
    template: `
        <docs-next-page-actions [source]="source()" />

        @if (withToc() && outline.items().length) {
            <button kbqLink pseudo class="docs-next-page-bar__toc" type="button" (click)="tocSheet().open()">
                <i kbq-icon="kbq-list_16"></i>
                {{ state.t('onThisPage') }}
            </button>
        }

        <docs-next-toc-sheet />
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l) var(--kbq-size-l) 0;
        }

        .docs-next-page-bar__toc {
            display: inline-flex;
            align-items: center;
            gap: var(--kbq-size-s);
            padding: 0;
            border: none;
            background: none;
            font-size: var(--kbq-typography-text-normal-font-size);
            line-height: var(--kbq-typography-text-normal-line-height);
            cursor: pointer;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextPageBar {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly outline = inject(DocsNextPageOutline);

    /** Element whose text "Copy" copies. */
    readonly source = input.required<HTMLElement>();
    readonly withToc = input(true);

    protected readonly tocSheet = viewChild.required(DocsNextTocSheet);
}

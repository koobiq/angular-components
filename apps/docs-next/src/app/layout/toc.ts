import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocsNextPageOutline } from '../services/page-outline';
import { DocsNextSiteState } from '../services/site-state';

/**
 * "On this page" (spec/components/page-toc.md): the two upper heading levels of the article, the visible one lit as
 * the page scrolls, and the address following it. It has no title: the first item stands on the line of the article
 * title and its "Expand" button (Figma: Scrollspy, 83:39987).
 */
@Component({
    selector: 'docs-next-toc',
    templateUrl: './toc.html',
    styleUrl: './toc.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-next-toc',
        '[class.docs-next-toc_empty]': '!items().length',
        role: 'navigation',
        '[attr.aria-label]': 'state.t("onThisPage")'
    }
})
export class DocsNextToc {
    protected readonly state = inject(DocsNextSiteState);
    private readonly outline = inject(DocsNextPageOutline);

    protected readonly items = this.outline.items;
    protected readonly activeId = this.outline.activeId;

    protected scrollTo(event: Event, id: string): void {
        event.preventDefault();
        this.outline.scrollTo(id);
    }
}

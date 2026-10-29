import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    viewChild
} from '@angular/core';
import { DocsNextToc } from '../layout/toc';
import { DocsNextPageBar } from '../mobile/page-bar';
import { DocsNextPageOutline } from '../services/page-outline';
import { DocsNextSiteState } from '../services/site-state';

/**
 * Column of an article with the table of contents to its right (Figma: Main, node 17:4929). Text pages keep about
 * 80 characters a line; wide ones, such as API tables, take the room (spec/text-width.md). With the contents
 * collapsed, the article stays as wide and centres in the free space.
 *
 * On a phone the contents move into the "On this page" sheet of the row over the article (Figma: Article, 66:32982).
 */
@Component({
    selector: 'docs-next-page-layout',
    imports: [DocsNextToc, DocsNextPageBar],
    template: `
        @if (state.isMobile() && withActions()) {
            <docs-next-page-bar class="docs-next-page-layout__bar" [source]="article" [withToc]="withToc()" />
        }
        <article #article class="docs-next-page-layout__article">
            <div class="docs-next-page-layout__column">
                <ng-content />
            </div>
        </article>
        @if (withToc() && !state.isMobile()) {
            <docs-next-toc class="docs-next-page-layout__toc" />
        }
    `,
    styles: `
        :host {
            display: flex;
            align-items: flex-start;
        }

        .docs-next-page-layout__article {
            flex: 1;
            min-width: 0;
            padding: 52px 64px 96px;
        }

        .docs-next-page-layout__column {
            max-width: var(--docs-next-text-width);
            margin: 0 auto;
        }

        :host(.docs-next-page-layout_wide) .docs-next-page-layout__column {
            max-width: var(--docs-next-wide-width);
        }

        @media (max-width: 719.98px) {
            :host {
                flex-direction: column;
                align-items: stretch;
            }

            .docs-next-page-layout__article {
                padding: var(--kbq-size-xxl) var(--kbq-size-l) var(--kbq-size-5xl);
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '[class.docs-next-page-layout_wide]': 'wide()' }
})
export class DocsNextPageLayout {
    protected readonly state = inject(DocsNextSiteState);

    readonly wide = input(false);
    readonly withToc = input(true);
    /** Whether the page has "Copy" and the other page actions; on a phone they sit in the row over the article. */
    readonly withActions = input(true);

    readonly article = viewChild.required<ElementRef<HTMLElement>>('article');

    constructor() {
        const outline = inject(DocsNextPageOutline);
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => destroyRef.onDestroy(outline.observe(this.article().nativeElement)));
    }
}

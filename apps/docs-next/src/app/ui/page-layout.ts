import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    InjectionToken,
    input,
    Signal,
    signal,
    viewChild
} from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { DocsNextToc } from '../layout/toc';
import { DocsNextPageBar } from '../mobile/page-bar';
import { DocsNextPageOutline } from '../services/page-outline';
import { DocsNextSiteState } from '../services/site-state';

/** Width of the article column, which the header of the article reads to show "Expand". */
export const DOCS_NEXT_ARTICLE_WIDTH = new InjectionToken<{ readonly canExpand: Signal<boolean> }>(
    'DOCS_NEXT_ARTICLE_WIDTH'
);

/**
 * Column of an article with the table of contents to its right (Figma: Main, node 17:4929). Text pages keep about
 * 80 characters a line; wide ones, such as the icons, take the room (spec/text-width.md). "Expand" in the header
 * of the article lifts the limit, and the article takes the whole width next to the contents; the button is there only
 * when the room is wider than the limit.
 *
 * On a phone the contents move into the "On this page" sheet of the row over the article (Figma: Article, 66:32982).
 */
@Component({
    selector: 'docs-next-page-layout',
    imports: [DocsNextToc, DocsNextPageBar],
    template: `
        @if (state.isMobile() && withActions()) {
            <docs-next-page-bar
                class="docs-next-page-layout__bar"
                [githubUrl]="githubUrl()"
                [source]="article"
                [withToc]="withToc()"
            />
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
            /* Figma: Page, 40px under the header, on the line of the side menu and the contents. */
            padding: 40px 64px 96px;
        }

        .docs-next-page-layout__column {
            max-width: var(--docs-next-text-width);
            margin: 0 auto;
        }

        :host(.docs-next-page-layout_wide) .docs-next-page-layout__column {
            max-width: var(--docs-next-wide-width);
        }

        :host(.docs-next-page-layout_expanded) .docs-next-page-layout__column {
            max-width: none;
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
    providers: [{ provide: DOCS_NEXT_ARTICLE_WIDTH, useExisting: DocsNextPageLayout }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.docs-next-page-layout_wide]': 'wide()',
        '[class.docs-next-page-layout_expanded]': 'state.articleExpanded() && !state.isMobile()'
    }
})
export class DocsNextPageLayout {
    protected readonly state = inject(DocsNextSiteState);

    readonly wide = input(false);
    readonly withToc = input(true);
    /** Whether the page has "Copy" and the other page actions; on a phone they sit in the row over the article. */
    readonly withActions = input(true);
    /** Source of a component, which the actions link on a phone. */
    readonly githubUrl = input<string>();

    readonly article = viewChild.required<ElementRef<HTMLElement>>('article');

    /** Whether the room for the text is wider than its limit, so that "Expand" changes something. */
    readonly canExpand = signal(false);

    constructor() {
        const outline = inject(DocsNextPageOutline);
        const destroyRef = inject(DestroyRef);
        const window = inject(KBQ_WINDOW);
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

        afterNextRender(() => {
            const article = this.article().nativeElement;
            // The article keeps its width in both modes, so its content box is the room the column can take.
            const observer = new ResizeObserver(([entry]) => {
                const limit = window
                    .getComputedStyle(host)
                    .getPropertyValue(this.wide() ? '--docs-next-wide-width' : '--docs-next-text-width');

                this.canExpand.set(entry.contentRect.width > parseFloat(limit));
            });

            observer.observe(article);
            destroyRef.onDestroy(outline.observe(article));
            destroyRef.onDestroy(() => observer.disconnect());
        });
    }
}

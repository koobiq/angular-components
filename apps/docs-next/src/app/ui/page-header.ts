import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextPageActions } from './page-actions';
import { DOCS_NEXT_ARTICLE_WIDTH } from './page-layout';

/**
 * Title of an article with its description and "Expand", then the row of the subsection tabs, projected, and the page
 * actions (Figma: Text Column, 83:39954). "Expand" shows only when the article has room to grow. On a phone the
 * actions move into the row over the article and the article always takes the screen.
 */
@Component({
    selector: 'docs-next-page-header',
    imports: [KbqButtonModule, KbqIconModule, DocsNextPageActions],
    template: `
        <div class="docs-next-page-header__title-row">
            <div class="docs-next-page-header__titles">
                <h1 class="docs-next-h1">{{ title() }}</h1>
                @if (lead(); as lead) {
                    <p class="docs-next-lead" [innerHTML]="lead"></p>
                }
            </div>
            @if (!state.isMobile() && articleWidth?.canExpand()) {
                <button
                    kbq-button
                    class="kbq-button-icon docs-next-page-header__expand"
                    color="contrast"
                    kbqStyle="transparent"
                    [attr.aria-label]="state.t('expandArticle')"
                    [attr.aria-pressed]="state.articleExpanded()"
                    (click)="state.articleExpanded.set(!state.articleExpanded())"
                >
                    <i
                        kbq-icon=""
                        [class]="state.articleExpanded() ? 'kbq-arrow-left-to-line_16' : 'kbq-arrow-right-to-line_16'"
                    ></i>
                </button>
            }
        </div>

        <div class="docs-next-page-header__bar">
            <ng-content />
            @if (!state.isMobile()) {
                <docs-next-page-actions
                    class="docs-next-page-header__actions"
                    [githubUrl]="githubUrl()"
                    [source]="source()"
                />
            }
        </div>
    `,
    styleUrl: './page-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextPageHeader {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly articleWidth = inject(DOCS_NEXT_ARTICLE_WIDTH, { optional: true });

    readonly title = input.required<string>();
    readonly lead = input<string | null>();
    /** Element whose text "Copy" copies. */
    readonly source = input.required<HTMLElement>();
    /** Source of a component; other pages have no GitHub button. */
    readonly githubUrl = input<string>();
}

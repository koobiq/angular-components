import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs/operators';
import { docsNextGetSection, docsNextGetSectionPages, docsNextIsAvailable } from '../data/sections';
import { docsNextFrameworkTitle } from '../data/site';
import { DocsNextContent } from '../services/content';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextContentBlocks } from '../ui/content-blocks';
import { DocsNextNotice } from '../ui/notice';
import { DocsNextPageActions } from '../ui/page-actions';
import { DocsNextPageLayout } from '../ui/page-layout';
import { docsNextPlaceholderArticle, docsNextSplitLead } from '../ui/placeholder';

/** A text page of a section: Development, Design, Patterns, Templates. */
@Component({
    selector: 'docs-next-article-page',
    imports: [DocsNextContentBlocks, DocsNextNotice, DocsNextPageActions, DocsNextPageLayout],
    template: `
        <docs-next-page-layout [wide]="sectionId() === 'templates'">
            @if (state.notice(); as notice) {
                <docs-next-notice [text]="notice" />
            }

            @if (page(); as page) {
                <div #source>
                    <header class="docs-next-page__header">
                        <div class="docs-next-page__title-row">
                            <h1 class="docs-next-h1">{{ page.title[state.locale()] }}</h1>
                            @if (!state.isMobile()) {
                                <docs-next-page-actions [source]="source" />
                            }
                        </div>
                        @if (article().lead; as lead) {
                            <p class="docs-next-lead" [innerHTML]="lead"></p>
                        }
                    </header>

                    @if (onlyFor(); as framework) {
                        <docs-next-notice [text]="state.t('onlyFor', { framework })" />
                    } @else if (article().blocks.length) {
                        <docs-next-content-blocks [blocks]="article().blocks" />
                    } @else {
                        <p class="docs-next-page__loading">{{ state.t('loading') }}</p>
                    }
                </div>
            } @else {
                <h1 class="docs-next-h1">{{ state.t('notFound') }}</h1>
            }
        </docs-next-page-layout>
    `,
    styleUrl: './page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextArticlePage {
    protected readonly state = inject(DocsNextSiteState);
    private readonly content = inject(DocsNextContent);
    private readonly params = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });

    protected readonly sectionId = computed(() => this.params().get('section'));
    protected readonly page = computed(() => {
        const section = docsNextGetSection(this.sectionId() ?? '');

        return section && docsNextGetSectionPages(section).find(({ id }) => id === this.params().get('page'));
    });

    /** A page opened directly from the other framework explains that it is not there (spec/context/stub-page.md). */
    protected readonly onlyFor = computed(() => {
        const page = this.page();

        return page?.framework && !docsNextIsAvailable(page, this.state.framework())
            ? docsNextFrameworkTitle(page.framework)
            : null;
    });

    private readonly blocks = toSignal(
        toObservable(computed(() => ({ id: this.page()?.id, locale: this.state.locale() }))).pipe(
            switchMap(({ id, locale }) =>
                this.content.load('pages', id ?? '', locale).pipe(
                    map((blocks) => blocks ?? docsNextPlaceholderArticle(locale, false)),
                    startWith([])
                )
            )
        ),
        { initialValue: [] }
    );

    protected readonly article = computed(() => docsNextSplitLead(this.blocks()));
}

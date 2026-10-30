import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { DOCS_NEXT_COMPONENT_TABS, DOCS_NEXT_COMPONENTS, docsNextComponentGithubUrl } from '../data/components';
import { docsNextFrameworkTitle } from '../data/site';
import { DocsNextContent } from '../services/content';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextApiPreview } from '../ui/api-preview';
import { DocsNextContentBlocks } from '../ui/content-blocks';
import { DocsNextNotice } from '../ui/notice';
import { DocsNextPageHeader } from '../ui/page-header';
import { DocsNextPageLayout } from '../ui/page-layout';
import { docsNextPlaceholderArticle, docsNextSplitLead } from '../ui/placeholder';
import { DocsNextStub } from '../ui/stub';

const TABS = DOCS_NEXT_COMPONENT_TABS;

/**
 * Page of a component: title, description, the subsections "Overview", "Content", "API" and "Examples" in one row
 * with the page actions (spec/components/component-page.md). A component missing in the selected framework shows the "coming
 * soon" stub on the same address.
 */
@Component({
    selector: 'docs-next-component-page',
    imports: [
        RouterLink,
        RouterLinkActive,
        KbqTabsModule,
        DocsNextApiPreview,
        DocsNextContentBlocks,
        DocsNextNotice,
        DocsNextPageHeader,
        DocsNextPageLayout,
        DocsNextStub
    ],
    templateUrl: './component-page.html',
    styleUrl: './page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextComponentPage {
    protected readonly state = inject(DocsNextSiteState);
    private readonly content = inject(DocsNextContent);
    private readonly params = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });

    protected readonly tabs = TABS;
    protected readonly tab = computed(() => this.params().get('tab') ?? 'overview');
    protected readonly component = computed(() =>
        DOCS_NEXT_COMPONENTS.find(({ id }) => id === this.params().get('id'))
    );
    protected readonly available = computed(() => !!this.component()?.[this.state.framework()]);
    protected readonly githubUrl = computed(() => {
        const component = this.component();

        return component && docsNextComponentGithubUrl(component, this.state.framework());
    });
    /** The framework the component exists for, named on the stub. */
    protected readonly otherFramework = computed(() =>
        docsNextFrameworkTitle(this.state.framework() === 'angular' ? 'react' : 'angular')
    );

    private readonly blocks = toSignal(
        toObservable(computed(() => ({ component: this.component(), locale: this.state.locale() }))).pipe(
            switchMap(({ component, locale }) =>
                component?.angular
                    ? this.content.load('components', component.id, locale).pipe(startWith(undefined))
                    : of(null)
            ),
            map((blocks) => (blocks === null ? docsNextPlaceholderArticle(this.state.locale(), true) : blocks))
        )
    );

    protected readonly loaded = computed(() => this.blocks() !== undefined);
    protected readonly article = computed(() => docsNextSplitLead(this.blocks() ?? []));
    /** React reads the shared Angular text until it has its own (spec/components/subsection-overview.md). */
    protected readonly sharedText = computed(
        () => this.state.framework() === 'react' && !!this.component()?.angular && this.blocks() !== null
    );

    protected readonly stubText = computed(() =>
        this.state.t('stubText', {
            name: this.component()?.title ?? '',
            framework: docsNextFrameworkTitle(this.state.framework()),
            other: this.otherFramework()
        })
    );

    protected tabTitle(tab: (typeof TABS)[number]): string {
        return this.state.t(tab);
    }
}

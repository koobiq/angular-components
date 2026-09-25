import { NgComponentOutlet } from '@angular/common';
import {
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Type,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet, UrlSegment } from '@angular/router';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { map } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
import {
    docsGetCategoryById,
    docsGetItemById,
    DocsStructureCategoryId,
    DocsStructureItem,
    DocsStructureItemId,
    DocsStructureItemTab
} from 'src/app/structure';
import { DocsDocStates } from '../../services/doc-states';
import { DocsPagePrefetch } from '../../services/page-resolver';
import { docsDevVersionPlaceholder, docsKoobiqVersion } from '../../version';
import { DocsApiPage } from '../api-page/api-page';
import { DocsApiEntryPoint } from '../api-page/api-page.types';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';
import { DocsComponentViewerWrapperComponent } from './component-viewer-wrapper';

// In local dev builds `docsKoobiqVersion` is the dev placeholder (no such git ref exists), so fall back to `main`.
const GITHUB_REPO_REF = docsKoobiqVersion === docsDevVersionPlaceholder ? 'main' : docsKoobiqVersion;

/** Base URL of the repository ref (release tag, or `main` in dev) used to link a doc item to its source directory. */
const GITHUB_REPO_TREE_URL = `https://github.com/koobiq/angular-components/tree/${GITHUB_REPO_REF}`;

@Component({
    selector: 'docs-component-viewer',
    imports: [
        KbqTabsModule,
        KbqLinkModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        DocsRegisterHeaderDirective,
        KbqIcon
    ],
    templateUrl: './component-viewer.template.html',
    styleUrls: ['./component-viewer.scss'],
    providers: [KbqSidepanelService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-component-viewer',
        '[attr.data-docsearch-category]': 'structureCategoryId'
    },
    hostDirectives: [KbqScrollbarViewport]
})
export class DocsComponentViewerComponent extends DocsLocaleState {
    protected readonly structureItemTab = DocsStructureItemTab;
    // Stays `null` for an unknown id: the redirect to /404 is async, so the template renders at
    // least once with nothing resolved and has to tolerate it.
    protected structureItem: DocsStructureItem | null = null;
    protected structureCategoryId: DocsStructureCategoryId;

    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly sidepanelService = inject(KbqSidepanelService);
    private readonly modalService = inject(KbqModalService);
    private readonly docStates = inject(DocsDocStates);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly pagePrefetch = inject(DocsPagePrefetch);

    constructor() {
        super();

        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (e.g. components, other).
        this.activatedRoute.url
            .pipe(
                map(([{ path: categoryId }, { path: id }]: UrlSegment[]) =>
                    docsGetItemById(<DocsStructureItemId>id, <DocsStructureCategoryId>categoryId)
                ),
                takeUntilDestroyed()
            )
            .subscribe((docItem) => {
                this.sidepanelService.closeAll();
                this.modalService.closeAll();

                if (!docItem) {
                    this.router.navigate(['/404']);

                    return;
                }

                this.structureItem = docItem;
                this.structureCategoryId = docsGetCategoryById(this.structureItem.categoryId!)!.id;
            });

        this.docStates.registerHeaderScrollContainer(this.elementRef.nativeElement);
    }

    /** Loads the page of a tab while the pointer is over its link or the focus is on it. */
    protected prefetchTab(tab: DocsStructureItemTab): void {
        if (this.structureItem) this.pagePrefetch.prefetch(this.structureItem.id, tab, this.locale());
    }

    /** Link to the item's source directory on GitHub, or `null` when the item has no known path. */
    protected get githubSourceUrl(): string | null {
        return this.structureItem?.path ? `${GITHUB_REPO_TREE_URL}/${this.structureItem.path}` : null;
    }
}

/** The overview and examples tabs: the page `docsPageResolver` compiled from MDX for the route. */
@Component({
    selector: 'docs-component-page',
    imports: [DocsComponentViewerWrapperComponent, NgComponentOutlet],
    template: `
        <docs-component-viewer-wrapper>
            <ng-container ngProjectAs="[docs-article]" [ngComponentOutlet]="page()" />
        </docs-component-viewer-wrapper>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-component-tab'
    }
})
export class DocsComponentPageComponent {
    private readonly wrapper = viewChild.required(DocsComponentViewerWrapperComponent);

    protected readonly page = toSignal(inject(ActivatedRoute).data.pipe(map(({ page }): Type<unknown> => page)), {
        requireSync: true
    });

    constructor() {
        // The page renders with the route, so its headings are in place once the view is: rebuild the anchors
        // for every page the route shows.
        afterRenderEffect(() => {
            this.page();
            this.wrapper().scrollToSelectedContentSection();
        });
    }
}

/** The API tab: the API of the entry point `docsApiPageResolver` loaded for the route. */
@Component({
    selector: 'docs-component-api-page',
    imports: [DocsComponentViewerWrapperComponent, DocsApiPage],
    template: `
        <docs-component-viewer-wrapper>
            <docs-api-page ngProjectAs="[docs-article]" [entryPoint]="entryPoint()" />
        </docs-component-viewer-wrapper>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-component-tab'
    }
})
export class DocsComponentApiPageComponent {
    private readonly wrapper = viewChild.required(DocsComponentViewerWrapperComponent);

    protected readonly entryPoint = toSignal(
        inject(ActivatedRoute).data.pipe(map(({ page }): DocsApiEntryPoint => page)),
        { requireSync: true }
    );

    constructor() {
        // The entries render with the route, so their headings are in place once the view is.
        afterRenderEffect(() => {
            this.entryPoint();
            this.wrapper().scrollToSelectedContentSection();
        });
    }
}

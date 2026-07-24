import { CdkScrollable } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    inject,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet, UrlSegment } from '@angular/router';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { filter } from 'rxjs';
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
import { docsDevVersionPlaceholder, docsKoobiqVersion } from '../../version';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { DocsExampleViewerComponent } from '../example-viewer/example-viewer';
import { DocsLiveExampleComponent } from '../live-example/docs-live-example';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';

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
        class: 'docs-component-viewer kbq-scrollbar',
        '[attr.data-docsearch-category]': 'structureCategoryId'
    },
    hostDirectives: [CdkScrollable]
})
export class DocsComponentViewerComponent extends DocsLocaleState {
    protected readonly structureItemTab = DocsStructureItemTab;
    protected structureItem: DocsStructureItem;
    protected structureCategoryId: DocsStructureCategoryId;

    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly sidepanelService = inject(KbqSidepanelService);
    private readonly modalService = inject(KbqModalService);
    private readonly docStates = inject(DocsDocStates);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

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

    /** Link to the item's source directory on GitHub, or `null` when the item has no known path. */
    protected get githubSourceUrl(): string | null {
        return this.structureItem.path ? `${GITHUB_REPO_TREE_URL}/${this.structureItem.path}` : null;
    }
}

@Directive()
export class DocsOverviewComponentBase extends DocsLocaleState {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    componentDocItem: DocsStructureItem | null = null;

    @ViewChild(DocsAnchorsComponent, { static: false }) private readonly anchors: DocsAnchorsComponent;

    constructor() {
        super();

        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (e.g. components, other).
        this.activatedRoute
            .parent!.url.pipe(
                map(([{ path: categoryId }, { path: id }]: UrlSegment[]) =>
                    docsGetItemById(<DocsStructureItemId>id, <DocsStructureCategoryId>categoryId)
                ),
                filter((p) => !!p),
                takeUntilDestroyed()
            )
            .subscribe((d) => (this.componentDocItem = d));

        // Should update the view after url change
        this.activatedRoute.url.pipe(takeUntilDestroyed()).subscribe(() => this.changeDetectorRef.markForCheck());
    }

    scrollToSelectedContentSection() {
        this.showView();

        this.anchors?.setScrollPosition();
    }

    showDocumentLostAlert() {
        this.showView();

        this.anchors?.setScrollPosition();
    }

    private showView() {
        // The page title/meta are owned centrally by `DocsTitleStrategy`; here we only flush the
        // view once the document content has rendered.
        this.changeDetectorRef.detectChanges();
    }
}

@Component({
    selector: 'docs-component-overview',
    imports: [
        DocsAnchorsComponent,
        DocsLiveExampleComponent,
        KbqDividerModule,
        KbqLinkModule
    ],
    templateUrl: './component-overview.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-component-overview'
    }
})
export class DocsComponentOverviewComponent extends DocsOverviewComponentBase {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/overviews/${this.componentDocItem.id}.${this.locale()}.html`;
    }
}

@Component({
    selector: 'docs-component-api',
    imports: [
        DocsAnchorsComponent,
        DocsLiveExampleComponent,
        KbqDividerModule,
        KbqLinkModule
    ],
    templateUrl: './component-overview.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-component-overview'
    }
})
export class DocsComponentApiComponent extends DocsOverviewComponentBase {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/api-docs/components-${this.componentDocItem.apiId}.html`;
    }
}

@Component({
    selector: 'docs-component-examples',
    imports: [
        DocsExampleViewerComponent,
        DocsAnchorsComponent
    ],
    template: `
        <div class="docs-component-viewer__article">
            <docs-example-viewer
                [documentUrl]="docItemUrl!"
                (contentRendered)="scrollToSelectedContentSection()"
                (contentRenderFailed)="showDocumentLostAlert()"
            />
        </div>

        <div class="docs-component-viewer__sticky-wrapper">
            <docs-anchors [headerSelectors]="'.docs-header-link'" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-component-overview'
    }
})
export class DocsComponentExamplesComponent extends DocsOverviewComponentBase {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/examples/examples.${this.componentDocItem.id}.${this.locale()}.html`;
    }
}

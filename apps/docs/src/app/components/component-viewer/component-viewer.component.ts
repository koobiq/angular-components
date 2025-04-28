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
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet, UrlSegment } from '@angular/router';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { filter } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocStates } from '../../services/doc-states';
import { DocItem, DocumentationItems } from '../../services/documentation-items';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { DocsExampleViewerComponent } from '../example-viewer/example-viewer';
import { DocsLiveExampleComponent } from '../live-example/docs-live-example';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';

@Component({
    standalone: true,
    imports: [
        KbqTabsModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        DocsRegisterHeaderDirective,

        // Prevents: "NullInjectorError: No provider for KbqModalService!"
        KbqModalModule
    ],
    providers: [KbqSidepanelService],
    hostDirectives: [CdkScrollable],
    selector: 'docs-component-viewer',
    templateUrl: './component-viewer.template.html',
    styleUrls: ['./component-viewer.scss'],
    host: {
        class: 'docs-component-viewer kbq-scrollbar',
        '[attr.data-docsearch-category]': 'docCategory'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsComponentViewerComponent extends DocsLocaleState {
    docItem: DocItem;
    docCategory: string;

    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly docItems = inject(DocumentationItems);
    private readonly sidepanelService = inject(KbqSidepanelService);
    private readonly modalService = inject(KbqModalService);
    private readonly docStates = inject(DocStates);
    private readonly elementRef = inject(ElementRef);

    constructor() {
        super();

        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (koobiq/cdk).
        this.activatedRoute.url
            .pipe(
                map(([{ path: section }, { path: id }]: UrlSegment[]) => this.docItems.getItemById(id, section)),
                takeUntilDestroyed()
            )
            .subscribe((docItem) => {
                this.sidepanelService.closeAll();
                this.modalService.closeAll();

                if (!docItem) {
                    this.router.navigate(['/404']);
                }

                this.docItem = docItem!;
                this.docCategory = this.docItems.getCategoryById(this.docItem.packageName!)!.id;
            });

        this.docStates.registerHeaderScrollContainer(this.elementRef.nativeElement);
    }
}

@Directive()
export class BaseOverviewComponent extends DocsLocaleState {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly docItems = inject(DocumentationItems);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly titleService = inject(Title);

    componentDocItem: DocItem | null = null;

    @ViewChild(DocsAnchorsComponent, { static: false }) private readonly anchors: DocsAnchorsComponent;

    constructor() {
        super();

        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (koobiq/cdk).
        this.activatedRoute
            .parent!.url.pipe(
                map(([{ path: section }, { path: id }]: UrlSegment[]) => this.docItems.getItemById(id, section)),
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
        const documentName = this.componentDocItem?.id;
        let title = 'Koobiq';

        if (documentName) {
            title = `${documentName.charAt(0).toUpperCase()}${documentName.slice(1)} \u00B7 ${title}`;
        }

        this.titleService.setTitle(title);

        this.changeDetectorRef.detectChanges();
    }
}

@Component({
    standalone: true,
    imports: [
        DocsAnchorsComponent,
        DocsLiveExampleComponent,
        KbqDividerModule,
        KbqLinkModule
    ],
    selector: 'docs-cdk-overview',
    templateUrl: './component-overview.template.html',
    host: {
        class: 'docs-component-overview'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsCdkOverviewComponent extends BaseOverviewComponent {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/cdk/${this.componentDocItem.id}.${this.locale()}.html`;
    }
}

@Component({
    standalone: true,
    imports: [
        DocsAnchorsComponent,
        DocsLiveExampleComponent,
        KbqDividerModule,
        KbqLinkModule
    ],
    selector: 'docs-component-overview',
    templateUrl: './component-overview.template.html',
    host: {
        class: 'docs-component-overview'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsComponentOverviewComponent extends BaseOverviewComponent {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/overviews/${this.componentDocItem.id}.${this.locale()}.html`;
    }
}

@Component({
    standalone: true,
    imports: [
        DocsAnchorsComponent,
        DocsLiveExampleComponent,
        KbqDividerModule,
        KbqLinkModule
    ],
    selector: 'docs-component-api',
    templateUrl: './component-overview.template.html',
    host: {
        class: 'docs-component-overview'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsComponentApiComponent extends BaseOverviewComponent {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/api-docs/components-${this.componentDocItem.apiId}.html`;
    }
}

@Component({
    standalone: true,
    imports: [
        DocsAnchorsComponent,
        DocsLiveExampleComponent,
        KbqDividerModule,
        KbqLinkModule
    ],
    selector: 'docs-cdk-api',
    templateUrl: './component-overview.template.html',
    host: {
        class: 'docs-component-overview'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsCdkApiComponent extends BaseOverviewComponent {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/api-docs/cdk-${this.componentDocItem.id}.html`;
    }
}

@Component({
    standalone: true,
    imports: [
        DocsExampleViewerComponent,
        DocsAnchorsComponent
    ],
    selector: 'docs-component-examples',
    template: `
        <docs-example-viewer
            [documentUrl]="docItemUrl"
            (contentRendered)="scrollToSelectedContentSection()"
            (contentRenderFailed)="showDocumentLostAlert()"
        />

        <div class="docs-component-viewer__sticky-wrapper">
            <docs-anchors [headerSelectors]="'.docs-header-link'" />
        </div>
    `,
    host: {
        class: 'docs-component-overview'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsComponentExamplesComponent extends BaseOverviewComponent {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/examples/examples.${this.componentDocItem.id}.${this.locale()}.html`;
    }
}

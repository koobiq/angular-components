import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationStart, Router, UrlSegment } from '@angular/router';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { Subject, filter } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AnchorsComponent } from '../anchors/anchors.component';
import { DocItem, DocumentationItems } from '../documentation-items';
import { DocStates } from '../doс-states';

@Component({
    selector: 'docs-component-viewer',
    templateUrl: './component-viewer.template.html',
    styleUrls: ['./component-viewer.scss'],
    host: {
        class: 'docs-component-viewer kbq-scrollbar'
    },
    encapsulation: ViewEncapsulation.None
})
export class ComponentViewerComponent extends CdkScrollable implements OnInit, OnDestroy {
    docItem: DocItem;
    docCategoryName: string;

    private destroyed: Subject<void> = new Subject();

    constructor(
        private routeActivated: ActivatedRoute,
        private router: Router,
        private docItems: DocumentationItems,
        private sidepanelService: KbqSidepanelService,
        private modalService: KbqModalService,
        private docStates: DocStates,

        elementRef: ElementRef<HTMLElement>,
        scrollDispatcher: ScrollDispatcher,
        ngZone: NgZone
    ) {
        super(elementRef, scrollDispatcher, ngZone);

        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (koobiq/cdk).
        this.routeActivated.url
            .pipe(
                map(([{ path: section }, { path: id }]: UrlSegment[]) => this.docItems.getItemById(id, section)),
                takeUntil(this.destroyed)
            )
            .subscribe((docItem) => {
                this.sidepanelService.closeAll();
                this.modalService.closeAll();

                if (!docItem) {
                    this.router.navigate(['/404']);
                }

                this.docItem = docItem;
                this.docCategoryName = this.docItems.getCategoryById(this.docItem.packageName).name;
            });

        this.docStates.registerHeaderScrollContainer(elementRef.nativeElement);
    }

    ngOnInit(): void {
        this.scrollDispatcher.register(this);
    }

    ngOnDestroy() {
        this.scrollDispatcher.deregister(this);
        this.destroyed.next();
    }
}

@Directive()
export class BaseOverviewComponent implements OnDestroy {
    readonly animationDone = new Subject<boolean>();

    animationState: 'fadeIn' | 'fadeOut' = 'fadeOut';

    currentUrl: string;
    routeSeparator: string = '/overview';
    documentLost: boolean = false;

    componentDocItem: DocItem;

    @ViewChild(AnchorsComponent, { static: false }) anchors: AnchorsComponent;

    get docItemUrl(): string {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/overviews/components/${this.componentDocItem.id}.html`;
    }

    private destroyed: Subject<void> = new Subject();

    constructor(
        protected routeActivated: ActivatedRoute,
        protected docItems: DocumentationItems,
        protected router: Router,
        protected changeDetectorRef: ChangeDetectorRef,
        protected titleService: Title
    ) {
        // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
        // parent route for the section (koobiq/cdk).
        this.routeActivated.parent.url
            .pipe(
                map(([{ path: section }, { path: id }]: UrlSegment[]) => this.docItems.getItemById(id, section)),
                filter((p) => !!p),
                takeUntil(this.destroyed)
            )
            .subscribe((d) => (this.componentDocItem = d));

        this.currentUrl = this.getRoute(router.url);

        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationStart),
                takeUntil(this.destroyed)
            )
            .subscribe((event: any) => {
                const rootUrl = this.getRoute(event.url);

                if (this.currentUrl !== rootUrl) {
                    this.currentUrl = rootUrl;
                }
            });

        this.animationDone.subscribe(() => this.resetAnimation());
    }

    getRoute(route: string): string {
        return route.split(this.routeSeparator)[0];
    }

    scrollToSelectedContentSection() {
        this.documentLost = false;
        this.showView();

        this.anchors?.setScrollPosition();
    }

    showDocumentLostAlert() {
        this.documentLost = true;
        this.showView();

        this.anchors?.setScrollPosition();
    }

    showView() {
        const documentName = this.componentDocItem.id;
        let title = 'Koobiq';

        if (documentName) {
            title = `${documentName.charAt(0).toUpperCase()}${documentName.slice(1)} \u00B7 ${title}`;
        }

        this.titleService.setTitle(title);

        this.startAnimation();
        this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy() {
        this.destroyed.next();
    }

    private startAnimation() {
        this.animationState = 'fadeOut';
    }

    private resetAnimation = () => {
        this.animationState = 'fadeIn';
    };
}

const animations = [
    trigger('fadeInOut', [
        state('fadeIn', style({ opacity: 1 })),
        state('fadeOut', style({ opacity: 0 })),
        transition('fadeOut => fadeIn', [animate('300ms')])
    ])

];

@Component({
    templateUrl: './component-overview.template.html',
    host: {
        class: 'component-overview',
        '[@fadeInOut]': 'animationState',
        '(@fadeInOut.done)': 'animationDone.next(true)'
    },
    animations,
    encapsulation: ViewEncapsulation.None
})
export class CdkOverviewComponent extends BaseOverviewComponent {
    get docItemUrl(): string {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/cdk/${this.componentDocItem.id}.html`;
    }

    constructor(
        routeActivated: ActivatedRoute,
        docItems: DocumentationItems,
        router: Router,
        ref: ChangeDetectorRef,
        titleService: Title
    ) {
        super(routeActivated, docItems, router, ref, titleService);
    }
}

@Component({
    templateUrl: './component-overview.template.html',
    host: {
        class: 'component-overview',
        '[@fadeInOut]': 'animationState',
        '(@fadeInOut.done)': 'animationDone.next(true)'
    },
    animations,
    encapsulation: ViewEncapsulation.None
})
export class ComponentOverviewComponent extends BaseOverviewComponent {
    get docItemUrl(): string {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/overviews/${this.componentDocItem.id}.html`;
    }

    constructor(
        routeActivated: ActivatedRoute,
        docItems: DocumentationItems,
        router: Router,
        ref: ChangeDetectorRef,
        titleService: Title
    ) {
        super(routeActivated, docItems, router, ref, titleService);
    }
}

@Component({
    templateUrl: './component-overview.template.html',
    host: {
        class: 'component-overview',
        '[@fadeInOut]': 'animationState',
        '(@fadeInOut.done)': 'animationDone.next(true)'
    },
    animations,
    encapsulation: ViewEncapsulation.None
})
export class ComponentApiComponent extends BaseOverviewComponent {
    get docItemUrl(): string {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/api-docs/components-${this.componentDocItem.apiId}.html`;
    }

    constructor(
        routeActivated: ActivatedRoute,
        docItems: DocumentationItems,
        router: Router,
        ref: ChangeDetectorRef,
        titleService: Title
    ) {
        super(routeActivated, docItems, router, ref, titleService);
    }
}

@Component({
    templateUrl: './component-overview.template.html',
    host: {
        class: 'component-overview',
        '[@fadeInOut]': 'animationState',
        '(@fadeInOut.done)': 'animationDone.next(true)'
    },
    animations,
    encapsulation: ViewEncapsulation.None
})
export class CdkApiComponent extends BaseOverviewComponent {
    get docItemUrl(): string {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/api-docs/cdk-${this.componentDocItem.id}.html`;
    }

    constructor(
        routeActivated: ActivatedRoute,
        docItems: DocumentationItems,
        router: Router,
        ref: ChangeDetectorRef,
        titleService: Title
    ) {
        super(routeActivated, docItems, router, ref, titleService);
    }
}

@Component({
    templateUrl: 'component-example.template.html',
    host: {
        class: 'component-overview',
        '[@fadeInOut]': 'animationState',
        '(@fadeInOut.done)': 'animationDone.next(true)'
    },
    animations,
    encapsulation: ViewEncapsulation.None
})
export class ComponentExamplesComponent extends BaseOverviewComponent {
    get docItemUrl(): string {
        if (!this.componentDocItem) {
            return null;
        }

        return `docs-content/examples/examples.${this.componentDocItem.id}.html`;
    }

    constructor(
        routeActivated: ActivatedRoute,
        docItems: DocumentationItems,
        router: Router,
        ref: ChangeDetectorRef,
        titleService: Title
    ) {
        super(routeActivated, docItems, router, ref, titleService);
    }
}

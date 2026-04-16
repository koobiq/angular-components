import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
    afterNextRender,
    ApplicationRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    inject,
    Injectable,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    Output,
    PLATFORM_ID,
    SecurityContext,
    signal,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { Observable, Subscription } from 'rxjs';
import { shareReplay, take, tap } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsLiveExampleViewerComponent } from '../live-example-viewer/docs-live-example-viewer';

@Injectable({ providedIn: 'root' })
export class DocsDocFetcher {
    private cache: Record<string, Observable<string>> = {};

    constructor(private http: HttpClient) {}

    fetchDocument(url: string): Observable<string> {
        if (this.cache[url]) {
            return this.cache[url];
        }

        const stream = this.http.get(url, { responseType: 'text' }).pipe(shareReplay(1));

        return stream.pipe(tap(() => (this.cache[url] = stream)));
    }
}

@Component({
    selector: 'docs-example-viewer',
    imports: [],
    template: `
        @if (documentContent()) {
            <div [innerHTML]="documentContent()"></div>
        } @else {
            {{ isRuLocale() ? 'Загрузка документа...' : 'Loading document...' }}
        }
    `,
    host: {
        class: 'docs-live-example kbq-markdown'
    }
})
export class DocsExampleViewerComponent extends DocsLocaleState implements OnDestroy {
    private portalHosts: DomPortalOutlet[] = [];
    private documentFetchSubscription: Subscription | undefined;
    private readonly window = inject(KBQ_WINDOW);

    /** The URL of the document to display. */
    @Input()
    set documentUrl(url: string) {
        if (!url) {
            return;
        }

        this.clearLiveExamples();
        this.fetchDocument(url);
    }

    @Output() readonly contentRendered = new EventEmitter<HTMLElement>();
    @Output() readonly contentRenderFailed = new EventEmitter<HTMLElement>();

    /** The document text. It should not be HTML encoded. */
    textContent: string | null = '';

    readonly documentContent = signal<SafeHtml | null>(null);

    private static initExampleViewer(exampleViewerComponent: DocsLiveExampleViewerComponent, example: string) {
        exampleViewerComponent.example = example;
    }

    constructor(
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private elementRef: ElementRef<HTMLElement>,
        private injector: Injector,
        private viewContainerRef: ViewContainerRef,
        private ngZone: NgZone,
        private domSanitizer: DomSanitizer,
        private docFetcher: DocsDocFetcher
    ) {
        super();
    }

    private readonly platformId = inject(PLATFORM_ID);

    ngOnDestroy() {
        this.clearLiveExamples();
        this.documentFetchSubscription?.unsubscribe();
    }

    /** Fetch a document by URL. */
    private fetchDocument(url: string) {
        this.documentFetchSubscription?.unsubscribe();

        this.documentFetchSubscription = this.docFetcher.fetchDocument(url).subscribe(
            (document) => this.updateDocument(document),
            (error) => this.showError(url, error)
        );
    }

    /**
     * Updates the displayed document.
     * @param rawDocument The raw document content to show.
     */
    private updateDocument(rawDocument: string) {
        // Replace all relative fragment URLs with absolute fragment URLs. e.g. "#my-section" becomes
        // "/components/button/api#my-section". This is necessary because otherwise these fragment
        // links would redirect to "/#my-section".
        rawDocument = rawDocument.replace(/href="#([^"]*)"/g, (_m: string, fragmentUrl: string) => {
            const absoluteUrl = `${this.window.location.pathname}#${fragmentUrl}`;

            return `href="${this.domSanitizer.sanitize(SecurityContext.URL, absoluteUrl)}"`;
        });

        this.documentContent.set(this.domSanitizer.bypassSecurityTrustHtml(rawDocument));

        if (isPlatformBrowser(this.platformId)) {
            afterNextRender(
                () => {
                    this.textContent = this.elementRef.nativeElement.textContent;
                    this.loadComponents('koobiq-docs-example', DocsLiveExampleViewerComponent);

                    this.ngZone.onStable
                        .pipe(take(1))
                        .subscribe(() => this.contentRendered.next(this.elementRef.nativeElement));
                },
                { injector: this.injector }
            );
        }
    }

    /** Show an error that occurred when fetching a document. */
    private showError(url: string, error: HttpErrorResponse) {
        console.error(error);
        const errorHtml = this.isRuLocale()
            ? `Не удалось загрузить документ: ${url}. Ошибка: ${error.statusText}. <a href="https://github.com/koobiq/angular-components/issues/new" class="kbq-markdown__a">Создать issue</a>`
            : `Failed to load document: ${url}. Error: ${error.statusText}. <a href="https://github.com/koobiq/angular-components/issues/new" class="kbq-markdown__a">Create issue</a>`;

        this.documentContent.set(this.domSanitizer.bypassSecurityTrustHtml(errorHtml));

        this.ngZone.onStable
            .pipe(take(1))
            .subscribe(() => this.contentRenderFailed.next(this.elementRef.nativeElement));
    }

    /** Instantiate a ExampleViewer for each example. */
    private loadComponents(componentName: string, componentClass: any) {
        const exampleElements = this.elementRef.nativeElement.querySelectorAll(`[${componentName}]`);

        exampleElements.forEach((element: Element) => {
            const example = element.getAttribute(componentName);

            const portalHost = new DomPortalOutlet(element, this.componentFactoryResolver, this.appRef, this.injector);
            const examplePortal = new ComponentPortal(componentClass, this.viewContainerRef);
            const exampleViewer = portalHost.attach(examplePortal);
            const exampleViewerComponent = exampleViewer.instance as DocsLiveExampleViewerComponent;

            if (example !== null) {
                DocsExampleViewerComponent.initExampleViewer(exampleViewerComponent, example);
            }

            this.portalHosts.push(portalHost);
        });
    }

    private clearLiveExamples() {
        this.portalHosts.forEach((h) => h.dispose());
        this.portalHosts = [];
    }
}

import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
    ApplicationRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    Injectable,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    Output,
    SecurityContext,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqToastModule } from '@koobiq/components/toast';
import { Observable, Subscription } from 'rxjs';
import { shareReplay, take, tap } from 'rxjs/operators';
import { DocsLiveExampleViewerComponent } from '../live-example-viewer/docs-live-example-viewer';

@Injectable({ providedIn: 'root' })
export class DocFetcher {
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
    standalone: true,
    imports: [KbqToastModule],
    selector: 'docs-example-viewer',
    template: `
        Loading document...
    `,
    host: {
        class: 'docs-live-example kbq-markdown'
    }
})
export class DocsExampleViewerComponent implements OnDestroy {
    private portalHosts: DomPortalOutlet[] = [];
    private documentFetchSubscription: Subscription | undefined;

    /** The URL of the document to display. */
    @Input()
    set documentUrl(url: string) {
        if (!url) {
            return;
        }

        this.fetchDocument(url);
    }

    @Output() contentRendered = new EventEmitter<void>();
    @Output() contentRenderFailed = new EventEmitter<void>();

    /** The document text. It should not be HTML encoded. */
    textContent = '';

    private static initExampleViewer(exampleViewerComponent: DocsLiveExampleViewerComponent, example: string) {
        exampleViewerComponent.example = example;
    }

    constructor(
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private elementRef: ElementRef,
        private injector: Injector,
        private viewContainerRef: ViewContainerRef,
        private ngZone: NgZone,
        private domSanitizer: DomSanitizer,
        private docFetcher: DocFetcher
    ) {}

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
            const absoluteUrl = `${location.pathname}#${fragmentUrl}`;
            return `href="${this.domSanitizer.sanitize(SecurityContext.URL, absoluteUrl)}"`;
        });

        this.elementRef.nativeElement.innerHTML = rawDocument;
        this.textContent = this.elementRef.nativeElement.textContent;

        this.loadComponents('koobiq-docs-example', DocsLiveExampleViewerComponent);

        // Resolving and creating components dynamically in Angular happens synchronously, but since
        // we want to emit the output if the components are actually rendered completely, we wait
        // until the Angular zone becomes stable.
        this.ngZone.onStable.pipe(take(1)).subscribe(() => this.contentRendered.next(this.elementRef.nativeElement));
    }

    /** Show an error that occurred when fetching a document. */
    private showError(url: string, error: HttpErrorResponse) {
        console.error(error);
        this.elementRef.nativeElement.innerHtml = `Failed to load document: ${url}. Error: ${error.statusText}. <a href="https://github.com/koobiq/angular-components/issues/new" class="kbq-markdown__a">Create issue</a>`;

        this.ngZone.onStable
            .pipe(take(1))
            .subscribe(() => this.contentRenderFailed.next(this.elementRef.nativeElement));
    }

    /** Instantiate a ExampleViewer for each example. */
    private loadComponents(componentName: string, componentClass: any) {
        const exampleElements = this.elementRef.nativeElement.querySelectorAll(`[${componentName}]`);

        [...exampleElements].forEach((element: Element) => {
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

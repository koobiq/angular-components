import { CdkPortal, ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
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
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { shareReplay, take, tap } from 'rxjs/operators';
import { DocsLiveExampleViewer } from '../docs-live-example-viewer/docs-live-example-viewer';

@Injectable({ providedIn: 'root' })
export class DocExampleFetcher {
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
    selector: 'doc-example-viewer',
    template: `
        Loading document...
        <ng-template
            cdkPortal
            let-htmlContent
            let-contentToCopy="textContent"
        >
            <copy-button [contentToCopy]="contentToCopy" />
            <div [outerHTML]="htmlContent"></div>
        </ng-template>
    `,
    host: {
        class: 'docs-live-example'
    }
})
export class DocExampleViewer implements OnDestroy {
    @ViewChild(CdkPortal) copyableCodeTemplate: CdkPortal;
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

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** The document text. It should not be HTML encoded. */
    textContent = '';
    private portalHosts: DomPortalOutlet[] = [];
    private documentFetchSubscription: Subscription;

    constructor(
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private elementRef: ElementRef,
        private injector: Injector,
        private viewContainerRef: ViewContainerRef,
        private ngZone: NgZone,
        private domSanitizer: DomSanitizer,
        private docFetcher: DocExampleFetcher
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

        this.nativeElement.innerHTML = rawDocument;
        this.textContent = this.nativeElement.textContent || '';

        this.loadComponents('koobiq-docs-example', DocsLiveExampleViewer);

        // Resolving and creating components dynamically in Angular happens synchronously, but since
        // we want to emit the output if the components are actually rendered completely, we wait
        // until the Angular zone becomes stable.
        this.ngZone.onStable.pipe(take(1)).subscribe(() => this.contentRendered.next());
    }

    /** Show an error that occurred when fetching a document. */
    private showError(url: string, error: HttpErrorResponse) {
        console.error(error);
        this.nativeElement.innerText = `Failed to load document: ${url}. Error: ${error.statusText}`;

        this.ngZone.onStable.pipe(take(1)).subscribe(() => this.contentRenderFailed.next());
    }

    /** Instantiate a ExampleViewer for each example. */
    private loadComponents(componentName: string, componentClass: any) {
        this.nativeElement.querySelectorAll(`[${componentName}]`).forEach((element: Element) => {
            const portalHost = new DomPortalOutlet(element, this.componentFactoryResolver, this.appRef, this.injector);
            const examplePortal: ComponentPortal<any> = new ComponentPortal(componentClass, this.viewContainerRef);
            const exampleViewer = portalHost.attach(examplePortal);
            // todo проверить, что достается из атрибута ?
            (exampleViewer.instance as DocsLiveExampleViewer).example = element.getAttribute(componentName);

            this.portalHosts.push(portalHost);
        });
    }

    private clearLiveExamples() {
        this.portalHosts.forEach((h) => h.dispose());
        this.portalHosts = [];
    }
}

import { CdkPortal, ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
    ApplicationRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
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

@Component({
    selector: 'docs-live-example',
    template: `
        Loading document...
        <ng-template cdkPortal let-htmlContent let-contentToCopy="textContent">
            <kbq-code-block [files]="[{ content: contentToCopy }]" filled lineNumbers />
        </ng-template>
        <ng-template #codeSnippet cdkPortal let-htmlContent>
            <span class="kbq-mono-normal" [innerHTML]="htmlContent" kbq-code-snippet kbqTooltip="Скопировать"></span>
        </ng-template>
    `,
    host: {
        class: 'docs-live-example kbq-markdown'
    }
})
export class DocsLiveExample implements OnDestroy {
    @ViewChild(CdkPortal) codeTemplate: CdkPortal;
    @ViewChild('codeSnippet', { read: CdkPortal }) codeSnippetTemplate: CdkPortal;
    /** The URL of the document to display. */
    @Input()
    set documentUrl(url: string) {
        if (!url) {
            return;
        }

        this.getDocument(url);
    }

    @Output() contentRendered = new EventEmitter<void>();
    @Output() contentRenderFailed = new EventEmitter<void>();

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** The document text. It should not be HTML encoded. */
    textContent = '';

    private cache: Record<string, Observable<string>> = {};

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
        private http: HttpClient
    ) {}

    ngOnDestroy() {
        this.clearLiveExamples();
        this.documentFetchSubscription?.unsubscribe();
    }

    private fetchDocument(url: string): Observable<string> {
        if (this.cache[url]) {
            return this.cache[url];
        }

        const stream = this.http.get(url, { responseType: 'text' }).pipe(shareReplay(1));

        return stream.pipe(tap(() => (this.cache[url] = stream)));
    }

    /** Fetch a document by URL. */
    private getDocument(url: string) {
        this.documentFetchSubscription?.unsubscribe();

        this.documentFetchSubscription = this.fetchDocument(url).subscribe({
            next: (document) => this.updateDocument(document),
            error: (error) => this.showError(url, error)
        });
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
        this.initCodeBlocks();
        this.initCodeSnippets();

        // Resolving and creating components dynamically in Angular happens synchronously, but since
        // we want to emit the output if the components are actually rendered completely, we wait
        // until the Angular zone becomes stable.
        this.ngZone.onStable.pipe(take(1)).subscribe(() => this.contentRendered.next());
    }

    /** Show an error that occurred when fetching a document. */
    private showError(url: string, error: HttpErrorResponse) {
        console.error(error);
        this.nativeElement.innerHTML = `Failed to load document: ${url}. Error: ${error.statusText}. <a href="https://github.com/koobiq/angular-components/issues/new" class="kbq-markdown__a">Create issue</a>`;

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

    private initCodeBlocks() {
        const markDownClass = 'kbq-markdown__pre';

        this.nativeElement.querySelectorAll(`.${markDownClass}`).forEach((element: Element) => {
            const { outerHTML, textContent } = element;
            element.innerHTML = '';

            const portalHost = new DomPortalOutlet(element, this.componentFactoryResolver, this.appRef, this.injector);

            this.codeTemplate.attach(portalHost, { $implicit: outerHTML, textContent });

            this.portalHosts.push(portalHost);

            element.classList.replace(markDownClass, 'kbq-docs-pre');
        });
    }

    private initCodeSnippets() {
        const selector = 'kbq-code-snippet';
        this.nativeElement.querySelectorAll(`[${selector}]`).forEach((element: Element) => {
            const { innerHTML, textContent } = element;
            element.innerHTML = '';

            const portalHost = new DomPortalOutlet(element, this.componentFactoryResolver, this.appRef, this.injector);
            this.codeSnippetTemplate.attach(portalHost, { $implicit: innerHTML, textContent });
            this.portalHosts.push(portalHost);
        });
    }

    private clearLiveExamples() {
        this.portalHosts.forEach((h) => h.dispose());
        this.portalHosts = [];
    }
}

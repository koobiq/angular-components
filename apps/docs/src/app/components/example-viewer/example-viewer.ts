import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
    afterNextRender,
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    Output,
    PLATFORM_ID,
    signal,
    Type,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsDocumentLoader } from '../../services/document-loader';
import { DocsLiveExampleViewerComponent } from '../live-example-viewer/docs-live-example-viewer';
import { docsBuildDocumentErrorHtml, docsRewriteFragmentUrls } from '../live-example/markdown-content';

@Component({
    selector: 'docs-example-viewer',
    imports: [],
    template: `
        @if (documentContent()) {
            <div [innerHTML]="documentContent()"></div>
        } @else {
            {{ t('loadingDocument') }}
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-live-example kbq-markdown'
    }
})
export class DocsExampleViewerComponent extends DocsLocaleState implements OnDestroy {
    private appRef = inject(ApplicationRef);
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private injector = inject(Injector);
    private viewContainerRef = inject(ViewContainerRef);
    private ngZone = inject(NgZone);
    private domSanitizer = inject(DomSanitizer);

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
        this.getDocument(url);
    }

    @Output() readonly contentRendered = new EventEmitter<HTMLElement>();
    @Output() readonly contentRenderFailed = new EventEmitter<HTMLElement>();

    /** The document text. It should not be HTML encoded. */
    textContent: string | null = '';

    readonly documentContent = signal<SafeHtml | null>(null);

    private static initExampleViewer(exampleViewerComponent: DocsLiveExampleViewerComponent, example: string) {
        exampleViewerComponent.example = example;
    }

    private readonly documentLoader = inject(DocsDocumentLoader);
    private readonly platformId = inject(PLATFORM_ID);

    ngOnDestroy() {
        this.clearLiveExamples();
        this.documentFetchSubscription?.unsubscribe();
    }

    /** Fetch a document by URL. */
    private getDocument(url: string) {
        this.documentFetchSubscription?.unsubscribe();

        this.documentFetchSubscription = this.documentLoader.get(url).subscribe({
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
        rawDocument = docsRewriteFragmentUrls(rawDocument, this.domSanitizer, this.window.location.pathname);

        this.documentContent.set(this.domSanitizer.bypassSecurityTrustHtml(rawDocument));

        if (isPlatformBrowser(this.platformId)) {
            afterNextRender(
                () => {
                    this.textContent = this.elementRef.nativeElement.textContent;
                    this.loadComponents('koobiq-docs-example', DocsLiveExampleViewerComponent);

                    this.ngZone.onStable
                        .pipe(take(1))
                        .subscribe(() => this.contentRendered.emit(this.elementRef.nativeElement));
                },
                { injector: this.injector }
            );
        }
    }

    /** Show an error that occurred when fetching a document. */
    private showError(url: string, error: HttpErrorResponse) {
        console.error(error);

        const errorHtml = docsBuildDocumentErrorHtml(url, error.statusText, this.isRuLocale());

        this.documentContent.set(this.domSanitizer.bypassSecurityTrustHtml(errorHtml));

        this.ngZone.onStable
            .pipe(take(1))
            .subscribe(() => this.contentRenderFailed.emit(this.elementRef.nativeElement));
    }

    /** Instantiate a ExampleViewer for each example. */
    private loadComponents(componentName: string, componentClass: Type<DocsLiveExampleViewerComponent>) {
        const exampleElements = this.elementRef.nativeElement.querySelectorAll(`[${componentName}]`);

        exampleElements.forEach((element: Element) => {
            const example = element.getAttribute(componentName);

            const portalHost = new DomPortalOutlet(element, this.appRef, this.injector);
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

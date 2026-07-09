import { CdkPortal, ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
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
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsDocumentLoader } from '../../services/document-loader';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsLiveExampleViewerComponent } from '../live-example-viewer/docs-live-example-viewer';
import { docsBuildDocumentErrorHtml, docsRewriteFragmentUrls } from './markdown-content';

@Component({
    selector: 'docs-live-example',
    imports: [
        KbqCodeBlockModule,
        DocsCodeSnippetDirective,
        KbqToolTipModule,
        CdkPortal,
        KbqDividerModule,
        KbqLinkModule
    ],
    template: `
        @if (documentContent()) {
            <div [innerHTML]="documentContent()"></div>
        } @else {
            {{ isRuLocale() ? 'Загрузка документа...' : 'Loading document...' }}
        }
        <ng-template let-htmlContent let-contentToCopy="textContent" let-language="language" cdkPortal>
            <kbq-code-block filled [files]="[{ content: contentToCopy, language }]" />
        </ng-template>
        <ng-template #codeSnippet let-htmlContent cdkPortal>
            <span
                class="kbq-mono-normal"
                docsCodeSnippet
                [innerHTML]="htmlContent"
                [kbqTooltip]="isRuLocale() ? 'Скопировать' : 'Copy'"
            ></span>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-live-example kbq-markdown'
    }
})
export class DocsLiveExampleComponent extends DocsLocaleState implements OnDestroy {
    @ViewChild(CdkPortal) private readonly codeTemplate: CdkPortal;
    @ViewChild('codeSnippet', { read: CdkPortal }) private readonly codeSnippetTemplate: CdkPortal;
    /** The URL of the document to display. */
    @Input()
    set documentUrl(url: string) {
        if (!url) {
            return;
        }

        this.clearLiveExamples();
        this.getDocument(url);
    }

    @Output() readonly contentRendered = new EventEmitter<void>();
    @Output() readonly contentRenderFailed = new EventEmitter<void>();

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** The document text. It should not be HTML encoded. */
    textContent = '';

    readonly documentContent = signal<SafeHtml | null>(null);

    private portalHosts: DomPortalOutlet[] = [];
    private documentFetchSubscription: Subscription;

    private readonly platformId = inject(PLATFORM_ID);
    private readonly appRef = inject(ApplicationRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly ngZone = inject(NgZone);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly window = inject(KBQ_WINDOW);
    private readonly documentLoader = inject(DocsDocumentLoader);

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
        rawDocument = docsRewriteFragmentUrls(rawDocument, this.domSanitizer, this.window.location.pathname);

        this.documentContent.set(this.domSanitizer.bypassSecurityTrustHtml(rawDocument));

        if (isPlatformBrowser(this.platformId)) {
            // afterNextRender guarantees the [innerHTML] binding has been applied to the DOM
            // before we query for elements to attach portals to.
            afterNextRender(
                () => {
                    this.textContent = this.nativeElement.textContent || '';
                    this.loadComponents('koobiq-docs-example', DocsLiveExampleViewerComponent);
                    this.initCodeBlocks();
                    this.initCodeSnippets();

                    // Emit after dynamically created components have stabilised.
                    this.ngZone.onStable.pipe(take(1)).subscribe(() => this.contentRendered.emit());
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

        this.ngZone.onStable.pipe(take(1)).subscribe(() => this.contentRenderFailed.emit());
    }

    /** Instantiate a ExampleViewer for each example. */
    private loadComponents(componentName: string, componentClass: Type<DocsLiveExampleViewerComponent>) {
        this.nativeElement.querySelectorAll(`[${componentName}]`).forEach((element: Element) => {
            const portalHost = new DomPortalOutlet(element, this.appRef, this.injector);
            const examplePortal = new ComponentPortal(componentClass, this.viewContainerRef);
            const exampleViewer = portalHost.attach(examplePortal);

            // TODO: verify what is read from the attribute.
            exampleViewer.instance.example = element.getAttribute(componentName);

            this.portalHosts.push(portalHost);
        });
    }

    private initCodeBlocks() {
        const markDownClass = 'kbq-markdown__pre';

        this.nativeElement.querySelectorAll(`.${markDownClass}`).forEach((element: Element) => {
            const { outerHTML, textContent } = element;

            element.replaceChildren();

            const portalHost = new DomPortalOutlet(element, this.appRef, this.injector);

            this.codeTemplate.attach(portalHost, {
                $implicit: outerHTML,
                textContent,
                language: element.getAttribute('data-docs-code-language')
            });

            this.portalHosts.push(portalHost);

            element.classList.replace(markDownClass, 'kbq-docs-pre');
        });
    }

    private initCodeSnippets() {
        const selector = 'docsCodeSnippet';

        this.nativeElement.querySelectorAll(`[${selector}]`).forEach((element: Element) => {
            const { innerHTML, textContent } = element;

            element.replaceChildren();

            const portalHost = new DomPortalOutlet(element, this.appRef, this.injector);

            this.codeSnippetTemplate.attach(portalHost, { $implicit: innerHTML, textContent });
            this.portalHosts.push(portalHost);
        });
    }

    private clearLiveExamples() {
        this.portalHosts.forEach((h) => h.dispose());
        this.portalHosts = [];
    }
}

import { CdkPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
    afterNextRender,
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    NgZone,
    OnDestroy,
    output,
    PLATFORM_ID,
    signal,
    viewChild
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsDocumentLoader } from '../../services/document-loader';
import { DOCS_MARKDOWN_PRE_CLASS, docsBuildDocumentErrorHtml, docsRewriteFragmentUrls } from './markdown-content';

/** Renders an HTML document generated at build time, the API tab of `tools/api-gen`, with its code blocks. */
@Component({
    selector: 'docs-live-example',
    imports: [
        KbqCodeBlockModule,
        CdkPortal,
        KbqDividerModule,
        KbqLinkModule
    ],
    template: `
        @if (documentContent()) {
            <div [innerHTML]="documentContent()"></div>
        } @else {
            {{ t('loadingDocument') }}
        }
        <ng-template let-htmlContent let-contentToCopy="textContent" let-language="language" cdkPortal>
            <kbq-code-block filled [files]="[{ content: contentToCopy, language }]" />
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-live-example kbq-markdown'
    }
})
export class DocsLiveExampleComponent extends DocsLocaleState implements OnDestroy {
    private readonly codeTemplate = viewChild.required(CdkPortal);
    /** The URL of the document to display. */
    readonly documentUrl = input<string>();

    readonly contentRendered = output<void>();
    readonly contentRenderFailed = output<void>();

    get nativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    readonly documentContent = signal<SafeHtml | null>(null);

    private portalHosts: DomPortalOutlet[] = [];
    private documentFetchSubscription: Subscription;

    private readonly platformId = inject(PLATFORM_ID);
    private readonly appRef = inject(ApplicationRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly ngZone = inject(NgZone);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly window = inject(KBQ_WINDOW);
    private readonly documentLoader = inject(DocsDocumentLoader);

    constructor() {
        super();

        // Re-fetch whenever the URL input changes (replaces a side-effecting `@Input` setter).
        effect(() => {
            const url = this.documentUrl();

            if (!url) {
                return;
            }

            this.clearPortalHosts();
            this.getDocument(url);
        });
    }

    ngOnDestroy() {
        this.clearPortalHosts();
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
                    this.initCodeBlocks();

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

    private initCodeBlocks() {
        const markDownClass = DOCS_MARKDOWN_PRE_CLASS;

        this.nativeElement.querySelectorAll(`.${markDownClass}`).forEach((element: Element) => {
            const { outerHTML, textContent } = element;

            element.replaceChildren();

            const portalHost = new DomPortalOutlet(element, this.appRef, this.injector);

            this.codeTemplate().attach(portalHost, {
                $implicit: outerHTML,
                textContent,
                language: element.getAttribute('data-docs-code-language')
            });

            this.portalHosts.push(portalHost);

            element.classList.replace(markDownClass, 'kbq-docs-pre');
        });
    }

    private clearPortalHosts() {
        this.portalHosts.forEach((h) => h.dispose());
        this.portalHosts = [];
    }
}

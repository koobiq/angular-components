import { CdkPortal, ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
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
    Injector,
    Input,
    NgZone,
    OnDestroy,
    Output,
    PLATFORM_ID,
    SecurityContext,
    signal,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { Observable, Subscription } from 'rxjs';
import { shareReplay, take, tap } from 'rxjs/operators';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsLiveExampleViewerComponent } from '../live-example-viewer/docs-live-example-viewer';

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

    private cache: Record<string, Observable<string>> = {};

    private portalHosts: DomPortalOutlet[] = [];
    private documentFetchSubscription: Subscription;

    private readonly platformId = inject(PLATFORM_ID);
    private readonly appRef = inject(ApplicationRef);
    private readonly componentFactoryResolver = inject(ComponentFactoryResolver);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly viewContainerRef = inject(ViewContainerRef);
    private readonly ngZone = inject(NgZone);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly httpClient = inject(HttpClient);
    private readonly window = inject(KBQ_WINDOW);

    ngOnDestroy() {
        this.clearLiveExamples();
        this.documentFetchSubscription?.unsubscribe();
    }

    private fetchDocument(url: string): Observable<string> {
        if (this.cache[url]) {
            return this.cache[url];
        }

        const stream = this.httpClient.get(url, { responseType: 'text' }).pipe(shareReplay(1));

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
            const absoluteUrl = `${this.window.location.pathname}#${fragmentUrl}`;

            return `href="${this.domSanitizer.sanitize(SecurityContext.URL, absoluteUrl)}"`;
        });

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
                    this.ngZone.onStable.pipe(take(1)).subscribe(() => this.contentRendered.next());
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

        this.ngZone.onStable.pipe(take(1)).subscribe(() => this.contentRenderFailed.next());
    }

    /** Instantiate a ExampleViewer for each example. */
    private loadComponents(componentName: string, componentClass: any) {
        this.nativeElement.querySelectorAll(`[${componentName}]`).forEach((element: Element) => {
            const portalHost = new DomPortalOutlet(element, this.componentFactoryResolver, this.appRef, this.injector);
            const examplePortal: ComponentPortal<any> = new ComponentPortal(componentClass, this.viewContainerRef);
            const exampleViewer = portalHost.attach(examplePortal);

            // todo проверить, что достается из атрибута ?
            (exampleViewer.instance as DocsLiveExampleViewerComponent).example = element.getAttribute(componentName);

            this.portalHosts.push(portalHost);
        });
    }

    private initCodeBlocks() {
        const markDownClass = 'kbq-markdown__pre';

        this.nativeElement.querySelectorAll(`.${markDownClass}`).forEach((element: Element) => {
            const { outerHTML, textContent } = element;

            element.innerHTML = '';

            const portalHost = new DomPortalOutlet(element, this.componentFactoryResolver, this.appRef, this.injector);

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

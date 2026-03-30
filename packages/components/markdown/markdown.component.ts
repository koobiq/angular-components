import { FocusMonitor } from '@angular/cdk/a11y';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    inject,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
    Optional,
    Provider,
    signal,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkedOptions } from 'marked';
import { KbqMarkdownService } from './markdown.service';

/** List of options for `marked` library. */
export const KBQ_MARKDOWN_MARKED_OPTIONS = new InjectionToken<MarkedOptions>('KBQ_MARKDOWN_MARKED_OPTIONS');

/** Utility provider for `KBQ_MARKDOWN_MARKED_OPTIONS`. */
export const kbqMarkdownMarkedOptionsProvider = (options: MarkedOptions): Provider => ({
    provide: KBQ_MARKDOWN_MARKED_OPTIONS,
    useValue: options
});

/** Component which allows to convert `Markdown` into `HTML` */
@Component({
    selector: 'kbq-markdown',
    // no need format line with ng-content it's broke textContent for markdownService.parseToHtml()
    template: `
        <pre #contentWrapper class="kbq-markdown__input" ngPreserveWhitespaces><ng-content /></pre>
        <div #outputWrapper class="kbq-markdown__output" [innerHtml]="resultHtml()"></div>
    `,
    styleUrls: ['./markdown.scss', 'markdown-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-markdown'
    }
})
export class KbqMarkdown implements OnDestroy {
    @ViewChild('contentWrapper', { static: true }) private readonly contentWrapper: ElementRef<HTMLPreElement>;
    @ViewChild('outputWrapper', { static: true }) private readonly outputWrapper: ElementRef<HTMLDivElement>;

    protected resultHtml = signal<SafeHtml | null>(null);

    /** `Markdown` text. */
    @Input()
    get markdownText(): string | null {
        return this._markdownText;
    }

    set markdownText(value: string | null) {
        if (value && this.markdownText !== value) {
            this.resultHtml.set(this.getResultHTML(value));
        }

        this._markdownText = value;
    }

    private _markdownText: string | null = null;
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly links: HTMLAnchorElement[] = [];

    constructor(
        private readonly markdownService: KbqMarkdownService,
        private sanitizer: DomSanitizer,
        @Optional() @Inject(KBQ_MARKDOWN_MARKED_OPTIONS) private readonly markedOptions?: MarkedOptions | undefined
    ) {
        afterNextRender(() => {
            if (!this.markdownText && this.contentWrapper?.nativeElement.textContent) {
                this.resultHtml.set(this.getResultHTML(this.contentWrapper?.nativeElement.textContent));
            }
        });

        effect(() => {
            if (this.resultHtml()) {
                Promise.resolve().then(() => this.startMonitoringLinks());
            } else {
                this.stopMonitoringLinks();
            }
        });
    }

    ngOnDestroy(): void {
        this.stopMonitoringLinks();
    }

    private getResultHTML(markdown: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.markdownService.parseToHtml(markdown, this.markedOptions));
    }

    private startMonitoringLinks(): void {
        this.stopMonitoringLinks();
        this.outputWrapper.nativeElement.querySelectorAll<HTMLAnchorElement>('.kbq-markdown__a').forEach((link) => {
            this.links.push(link);
            this.focusMonitor.monitor(link, true);
        });
    }

    private stopMonitoringLinks(): void {
        this.links.forEach((link) => this.focusMonitor.stopMonitoring(link));
        this.links.length = 0;
    }
}

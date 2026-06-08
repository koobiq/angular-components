import { FocusMonitor } from '@angular/cdk/a11y';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    OnDestroy,
    Provider,
    signal,
    viewChild,
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-markdown'
    }
})
export class KbqMarkdown implements OnDestroy {
    private readonly markdownService = inject(KbqMarkdownService);
    private sanitizer = inject(DomSanitizer);
    private readonly markedOptions =
        inject<MarkedOptions | undefined>(KBQ_MARKDOWN_MARKED_OPTIONS, { optional: true }) ?? undefined;

    private readonly contentWrapper = viewChild.required<ElementRef<HTMLPreElement>>('contentWrapper');
    private readonly outputWrapper = viewChild.required<ElementRef<HTMLDivElement>>('outputWrapper');

    protected resultHtml = signal<SafeHtml | null>(null);

    /** `Markdown` text. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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

    constructor() {
        afterNextRender(() => {
            const contentWrapper = this.contentWrapper();

            if (!this.markdownText && contentWrapper?.nativeElement.textContent) {
                this.resultHtml.set(this.getResultHTML(contentWrapper?.nativeElement.textContent));
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
        this.outputWrapper()
            .nativeElement.querySelectorAll<HTMLAnchorElement>('.kbq-markdown__a')
            .forEach((link) => {
                this.links.push(link);
                this.focusMonitor.monitor(link, true);
            });
    }

    private stopMonitoringLinks(): void {
        this.links.forEach((link) => this.focusMonitor.stopMonitoring(link));
        this.links.length = 0;
    }
}

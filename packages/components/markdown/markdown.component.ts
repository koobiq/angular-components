import { FocusMonitor } from '@angular/cdk/a11y';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
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
    private readonly sanitizer = inject(DomSanitizer);
    private readonly markedOptions =
        inject<MarkedOptions | undefined>(KBQ_MARKDOWN_MARKED_OPTIONS, { optional: true }) ?? undefined;
    private readonly focusMonitor = inject(FocusMonitor);

    private readonly contentWrapper = viewChild.required<ElementRef<HTMLPreElement>>('contentWrapper');
    private readonly outputWrapper = viewChild.required<ElementRef<HTMLDivElement>>('outputWrapper');

    /** Text content projected into the component, read once it has been rendered. */
    private readonly projectedText = signal<string | null>(null);

    private readonly links: HTMLAnchorElement[] = [];

    /** `Markdown` text. Falls back to the projected content while it is empty. */
    readonly markdownText = input<string | null>(null);

    /** @docs-private */
    protected readonly resultHtml = computed<SafeHtml | null>(() => {
        const markdown = this.markdownText() || this.projectedText();

        return markdown ? this.getResultHTML(markdown) : null;
    });

    constructor() {
        afterNextRender(() => this.projectedText.set(this.contentWrapper().nativeElement.textContent));

        effect((onCleanup) => {
            if (!this.resultHtml()) {
                this.stopMonitoringLinks();

                return;
            }

            // The anchors only exist once the `[innerHtml]` binding has been applied, so the monitor is
            // attached a microtask later — and dropped again if the text changes or the view goes away
            // before that microtask runs.
            let cancelled = false;

            onCleanup(() => (cancelled = true));

            Promise.resolve().then(() => {
                if (!cancelled) {
                    this.startMonitoringLinks();
                }
            });
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

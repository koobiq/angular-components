import { FocusMonitor } from '@angular/cdk/a11y';
import { ContentObserver } from '@angular/cdk/observers';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
    private readonly contentObserver = inject(ContentObserver);
    private readonly destroyRef = inject(DestroyRef);

    private readonly contentWrapper = viewChild.required<ElementRef<HTMLPreElement>>('contentWrapper');
    private readonly outputWrapper = viewChild.required<ElementRef<HTMLDivElement>>('outputWrapper');

    /** Text content projected into the component, re-read after every render that changes it. */
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
        afterNextRender(() => {
            const host = this.contentWrapper().nativeElement;

            this.readProjectedText(host);

            // The projected content is a standing fallback, not a one-off snapshot: a `@if` that has not
            // resolved by the first render would otherwise freeze it at '' for the life of the component.
            this.contentObserver
                .observe(host)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.readProjectedText(host));
        });

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

    /** The content observer fires on any mutation, so only a real text change is worth a re-render. */
    private readProjectedText(host: HTMLElement): void {
        const text = host.textContent;

        if (text !== this.projectedText()) {
            this.projectedText.set(text);
        }
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

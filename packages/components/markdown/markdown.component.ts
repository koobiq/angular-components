import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    InjectionToken,
    Input,
    Optional,
    Provider,
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
    standalone: true,
    selector: 'kbq-markdown',
    styleUrls: ['./markdown.scss', 'markdown-tokens.scss'],
    // no need format line with ng-content it's broke textContent for markdownService.parseToHtml()
    template: `
        <pre #contentWrapper class="markdown-input" ngPreserveWhitespaces><ng-content /></pre>
        <div class="markdown-output" [innerHtml]="resultHtml"></div>
    `,
    host: {
        class: 'kbq-markdown',
        '[class.kbq-markdown_transparent]': 'transparent'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqMarkdown {
    @ViewChild('contentWrapper', { static: true }) private readonly contentWrapper: ElementRef;

    /** Whether to override default background with transparent. */
    @Input({ transform: booleanAttribute }) transparent: boolean = false;

    /** `Markdown` text. */
    @Input()
    get markdownText(): string | null {
        return this._markdownText;
    }

    set markdownText(value: string | null) {
        if (value && this.markdownText !== value) {
            this.resultHtml = this.getResultHTML(value);
        }

        this._markdownText = value;
    }

    private _markdownText: string | null = null;

    protected resultHtml: SafeHtml;

    constructor(
        private readonly markdownService: KbqMarkdownService,
        private readonly cdr: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        @Optional() @Inject(KBQ_MARKDOWN_MARKED_OPTIONS) private readonly markedOptions?: MarkedOptions | undefined
    ) {
        afterNextRender(() => {
            if (!this.markdownText && this.contentWrapper?.nativeElement.textContent) {
                this.resultHtml = this.getResultHTML(this.contentWrapper?.nativeElement.textContent);
                this.cdr.detectChanges();
            }
        });
    }

    private getResultHTML(markdown: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.markdownService.parseToHtml(markdown, this.markedOptions));
    }
}

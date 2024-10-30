import {
    afterNextRender,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqSafeHtmlPipe } from '@koobiq/components/core';
import { KbqMarkdownService } from './markdown.service';

/** Component which allows to convert `Markdown` into `HTML` */
@Component({
    standalone: true,
    imports: [KbqSafeHtmlPipe],
    selector: 'kbq-markdown',
    styleUrls: ['./markdown.scss', 'markdown-tokens.scss'],
    // no need format line with ng-content it's broke textContent for markdownService.parseToHtml()
    template: `
        <pre
            class="markdown-input"
            #contentWrapper
            ngPreserveWhitespaces
        ><ng-content /></pre>
        <div
            class="markdown-output"
            [innerHtml]="resultHtml | kbqSafeHtml"
        ></div>
    `,
    host: {
        class: 'kbq-markdown'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqMarkdown {
    @ViewChild('contentWrapper', { static: true }) private readonly contentWrapper: ElementRef;

    /** `Markdown` text. */
    @Input()
    get markdownText(): string | null {
        return this._markdownText;
    }

    set markdownText(value: string | null) {
        if (value && this.markdownText !== value) {
            this.resultHtml = this.markdownService.parseToHtml(value);
        }

        this._markdownText = value;
    }

    private _markdownText: string | null = null;

    protected resultHtml: string = '';

    constructor(
        private readonly markdownService: KbqMarkdownService,
        private readonly cdr: ChangeDetectorRef
    ) {
        afterNextRender(() => {
            if (!this.markdownText && this.contentWrapper?.nativeElement.textContent) {
                this.resultHtml = this.markdownService.parseToHtml(this.contentWrapper.nativeElement.textContent);
                this.cdr.detectChanges();
            }
        });
    }
}

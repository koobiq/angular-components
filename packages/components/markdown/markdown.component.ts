import {
    AfterContentChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KbqMarkdownService } from './markdown.service';

@Component({
    selector: 'kbq-markdown',
    styleUrls: ['./markdown.scss'],
    // no need format line with ng-content it's broke textContent for markdownService.parseToHtml()
    template: `
        <pre
            class="markdown-input"
            #contentWrapper
            ngPreserveWhitespaces
        ><ng-content></ng-content></pre>
        <div
            class="markdown-output"
            [innerHtml]="resultHtml"
        ></div>
    `,
    host: {
        class: 'kbq-markdown'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqMarkdown implements AfterContentChecked {
    @ViewChild('contentWrapper') contentWrapper: ElementRef;

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

    resultHtml: SafeHtml = '';

    constructor(
        private markdownService: KbqMarkdownService,
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef
    ) {}

    ngAfterContentChecked(): void {
        if (!this.markdownText && this.contentWrapper?.nativeElement.textContent) {
            this.resultHtml = this.getResultHTML(this.contentWrapper.nativeElement.textContent);
            this.cdr.detectChanges();
        }
    }

    private getResultHTML(value): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.markdownService.parseToHtml(value));
    }
}

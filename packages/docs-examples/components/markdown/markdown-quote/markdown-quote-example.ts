import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';

/**
 * @title Markdown quote
 */
@Component({
    selector: 'markdown-quote-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-quote-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownQuoteExample {}

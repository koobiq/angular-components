import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown quote
 */
@Component({
    selector: 'markdown-quote-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-quote-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownQuoteExample {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown quote
 */
@Component({
    imports: [KbqMarkdownModule],
    selector: 'markdown-quote-example',
    templateUrl: './markdown-quote-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownQuoteExample {}

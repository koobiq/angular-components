import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown quote
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-quote-example',
    templateUrl: './markdown-quote-example.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownQuoteExample {}

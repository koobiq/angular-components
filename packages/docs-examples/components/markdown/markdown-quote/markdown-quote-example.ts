import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectExampleText } from '../l10n';

/**
 * @title Markdown quote
 */
@Component({
    selector: 'markdown-quote-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-quote-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownQuoteExample {
    protected readonly text = injectExampleText();
}

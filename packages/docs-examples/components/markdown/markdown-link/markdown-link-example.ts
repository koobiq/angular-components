import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectExampleText } from '../l10n';

/**
 * @title Markdown link
 */
@Component({
    selector: 'markdown-link-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-link-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLinkExample {
    protected readonly text = injectExampleText();
}

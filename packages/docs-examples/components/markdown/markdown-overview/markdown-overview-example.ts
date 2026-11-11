import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectExampleText } from '../l10n';

/**
 * @title Markdown headers
 */
@Component({
    selector: 'markdown-overview-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownOverviewExample {
    protected readonly text = injectExampleText();
}

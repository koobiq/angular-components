import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectExampleText } from '../l10n';

/**
 * @title Markdown list
 */
@Component({
    selector: 'markdown-list-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-list-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownListExample {
    protected readonly text = injectExampleText();
}

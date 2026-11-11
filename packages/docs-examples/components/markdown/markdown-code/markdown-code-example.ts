import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectExampleText } from './l10n';

/**
 * @title Markdown code
 */
@Component({
    selector: 'markdown-code-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-code-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownCodeExample {
    protected readonly text = injectExampleText();
}

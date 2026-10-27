import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';

/**
 * @title Markdown code block
 */
@Component({
    selector: 'markdown-code-block-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-code-block-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownCodeBlockExample {}

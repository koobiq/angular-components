import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';

/**
 * @title Markdown line break
 */
@Component({
    selector: 'markdown-line-break-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-line-break-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLineBreakExample {}

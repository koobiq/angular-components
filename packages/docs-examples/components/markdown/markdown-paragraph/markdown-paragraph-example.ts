import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';

/**
 * @title Markdown paragraph
 */
@Component({
    selector: 'markdown-paragraph-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-paragraph-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownParagraphExample {}

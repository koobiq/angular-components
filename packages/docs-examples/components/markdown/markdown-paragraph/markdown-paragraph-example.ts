import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown paragraph
 */
@Component({
    imports: [KbqMarkdownModule],
    selector: 'markdown-paragraph-example',
    templateUrl: './markdown-paragraph-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownParagraphExample {}

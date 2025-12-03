import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown paragraph
 */
@Component({
    selector: 'markdown-paragraph-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-paragraph-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownParagraphExample {}

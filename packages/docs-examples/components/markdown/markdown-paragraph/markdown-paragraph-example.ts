import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown paragraph
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-paragraph-example',
    templateUrl: './markdown-paragraph-example.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownParagraphExample {}

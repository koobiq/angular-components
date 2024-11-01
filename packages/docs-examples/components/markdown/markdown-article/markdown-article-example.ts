import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown article
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-article-example',
    templateUrl: './markdown-article-example.html',
    styleUrl: './markdown-article-example.css',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownArticleExample {}

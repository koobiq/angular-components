import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown article
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-article-example',
    templateUrl: './markdown-article-example.html',
    styleUrls: ['./markdown-article-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownArticleExample {}

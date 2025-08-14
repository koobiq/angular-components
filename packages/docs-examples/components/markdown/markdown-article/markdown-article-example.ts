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
    styles: `
        :host ::ng-deep img[alt='image-with-custom-width'] {
            width: 50%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownArticleExample {}

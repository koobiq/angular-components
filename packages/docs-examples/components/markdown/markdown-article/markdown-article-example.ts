import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Markdown article
 */
@Component({
    selector: 'markdown-article-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-article-example.html',
    styles: `
        :host ::ng-deep img[alt='image-with-custom-width'] {
            width: 50%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownArticleExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Markdown link
 */
@Component({
    selector: 'markdown-link-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-link-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLinkExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}

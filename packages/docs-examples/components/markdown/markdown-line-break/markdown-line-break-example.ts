import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Markdown line break
 */
@Component({
    selector: 'markdown-line-break-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-line-break-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLineBreakExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}

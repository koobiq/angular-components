import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Markdown code
 */
@Component({
    selector: 'markdown-code-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-code-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownCodeExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}

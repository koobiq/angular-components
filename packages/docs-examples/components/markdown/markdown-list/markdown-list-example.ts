import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Markdown list
 */
@Component({
    selector: 'markdown-list-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-list-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownListExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}

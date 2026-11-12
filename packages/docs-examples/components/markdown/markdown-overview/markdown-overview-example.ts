import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Markdown headers
 */
@Component({
    selector: 'markdown-overview-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}

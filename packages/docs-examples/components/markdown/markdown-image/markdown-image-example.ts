import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Markdown image
 */
@Component({
    selector: 'markdown-image-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-image-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownImageExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Markdown headers
 */
@Component({
    selector: 'markdown-overview-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

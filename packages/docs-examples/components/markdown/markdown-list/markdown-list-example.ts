import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Markdown list
 */
@Component({
    selector: 'markdown-list-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-list-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownListExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

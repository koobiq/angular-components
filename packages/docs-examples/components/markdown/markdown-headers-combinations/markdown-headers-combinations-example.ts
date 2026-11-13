import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Markdown headers combinations
 */
@Component({
    selector: 'markdown-headers-combinations-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-headers-combinations-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownHeadersCombinationsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

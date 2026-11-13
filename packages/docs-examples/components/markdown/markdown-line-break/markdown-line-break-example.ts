import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Markdown line break
 */
@Component({
    selector: 'markdown-line-break-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-line-break-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLineBreakExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

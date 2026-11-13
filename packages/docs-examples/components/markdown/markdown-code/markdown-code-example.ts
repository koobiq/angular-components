import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Markdown code
 */
@Component({
    selector: 'markdown-code-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-code-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownCodeExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

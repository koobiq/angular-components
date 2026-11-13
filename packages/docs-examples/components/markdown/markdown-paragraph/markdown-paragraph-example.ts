import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Markdown paragraph
 */
@Component({
    selector: 'markdown-paragraph-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-paragraph-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownParagraphExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

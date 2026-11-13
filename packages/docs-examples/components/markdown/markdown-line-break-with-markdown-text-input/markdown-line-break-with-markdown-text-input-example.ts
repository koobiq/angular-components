import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown, kbqMarkdownMarkedOptionsProvider } from '@koobiq/components/markdown';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Markdown line break
 */
@Component({
    selector: 'markdown-line-break-with-markdown-text-input-example',
    imports: [KbqMarkdown],
    // prettier-ignore
    template: `
        <kbq-markdown [markdownText]="t().lineBreak" />
    `,
    providers: [kbqMarkdownMarkedOptionsProvider({ breaks: true })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLineBreakWithMarkdownTextInputExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}

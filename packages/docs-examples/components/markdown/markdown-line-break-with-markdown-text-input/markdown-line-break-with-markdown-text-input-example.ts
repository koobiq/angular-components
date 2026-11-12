import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown, kbqMarkdownMarkedOptionsProvider } from '@koobiq/components/markdown';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
export class MarkdownLineBreakWithMarkdownTextInputExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}

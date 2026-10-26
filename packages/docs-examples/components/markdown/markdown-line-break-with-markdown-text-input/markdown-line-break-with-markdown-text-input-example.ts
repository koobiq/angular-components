import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown, kbqMarkdownMarkedOptionsProvider } from '@koobiq/components/markdown';

/**
 * @title Markdown line break
 */
@Component({
    selector: 'markdown-line-break-with-markdown-text-input-example',
    imports: [KbqMarkdown],
    // prettier-ignore
    template: `
        <kbq-markdown markdownText="First line\nSecond line" />
    `,
    providers: [kbqMarkdownMarkedOptionsProvider({ breaks: true })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLineBreakWithMarkdownTextInputExample {}

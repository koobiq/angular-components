import { ChangeDetectionStrategy, Component } from '@angular/core';
import { kbqMarkdownMarkedOptionsProvider, KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown line break
 */
@Component({
    selector: 'markdown-line-break-with-markdown-text-input-example',
    imports: [KbqMarkdownModule],
    providers: [kbqMarkdownMarkedOptionsProvider({ breaks: true })],
    // prettier-ignore
    template: `
        <kbq-markdown markdownText="First line\nSecond line" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLineBreakWithMarkdownTextInputExample {}

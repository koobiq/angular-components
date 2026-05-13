import { ChangeDetectionStrategy, Component } from '@angular/core';
import { kbqMarkdownMarkedOptionsProvider, KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown line break
 */
@Component({
    selector: 'markdown-line-break-with-markdown-text-input-example',
    imports: [KbqMarkdownModule],
    // prettier-ignore
    template: `
        <kbq-markdown markdownText="First line\nSecond line" />
    `,
    providers: [kbqMarkdownMarkedOptionsProvider({ breaks: true })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLineBreakWithMarkdownTextInputExample {}

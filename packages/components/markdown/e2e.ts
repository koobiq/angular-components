import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown, kbqMarkdownMarkedOptionsProvider } from './markdown.component';

@Component({
    selector: 'e2e-markdown-line-break-with-markdown-text-input',
    imports: [KbqMarkdown],
    // prettier-ignore
    template: `
        <kbq-markdown markdownText="First line\nSecond line" />
    `,
    providers: [kbqMarkdownMarkedOptionsProvider({ breaks: true })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class MarkdownLineBreakWithMarkdownTextInput {}

@Component({
    selector: 'e2e-markdown-states',
    imports: [
        KbqMarkdown,
        MarkdownLineBreakWithMarkdownTextInput
    ],
    templateUrl: './e2e.html',
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            width: 500px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMarkdownStates'
    }
})
export class E2eMarkdownStates {}

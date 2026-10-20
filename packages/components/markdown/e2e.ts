import { ChangeDetectionStrategy, Component } from '@angular/core';
import { kbqMarkdownMarkedOptionsProvider } from './markdown.component';
import { KbqMarkdownModule } from './markdown.module';

@Component({
    selector: 'e2e-markdown-line-break-with-markdown-text-input',
    imports: [KbqMarkdownModule],
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
        KbqMarkdownModule,
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
